import cron from 'node-cron';
import pool from '../config/database.js';
import {
  sendDeadlineReminderNotification,
  sendDeadlineOverdueNotification,
  sendTrialSevenDayWarning,
  sendTrialTwoDayWarning,
  sendTrialExpiredEmail
} from './emailService.js';

// Track which notifications have been sent to avoid duplicates
const sentNotifications = new Set();

// Check for upcoming and overdue deadlines
const checkDeadlines = async () => {
  console.log(`[${new Date().toISOString()}] Running deadline check...`);

  try {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Get all active grievances with deadlines
    const result = await pool.query(
      `SELECT
        d.id as deadline_id,
        d.deadline_date,
        d.deadline_type,
        d.description,
        d.is_completed,
        g.id as grievance_id,
        g.grievance_number,
        g.grievant_name,
        g.violation_type,
        g.current_step,
        g.created_at,
        g.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.notification_preferences
       FROM deadlines d
       INNER JOIN grievances g ON d.grievance_id = g.id
       INNER JOIN users u ON g.user_id = u.id
       WHERE d.is_completed = FALSE
         AND g.status IN ('active', 'filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration')
       ORDER BY d.deadline_date ASC`,
      []
    );

    const deadlines = result.rows;

    console.log(`Found ${deadlines.length} active deadlines to check`);

    for (const deadline of deadlines) {
      const deadlineDate = new Date(deadline.deadline_date);
      const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      // Parse notification preferences
      let notificationPrefs = {
        email_enabled: true,
        deadline_reminders: true,
        reminder_days: [3, 1, 0]
      };

      if (deadline.notification_preferences) {
        try {
          notificationPrefs = { ...notificationPrefs, ...deadline.notification_preferences };
        } catch (e) {
          console.error('Error parsing notification preferences:', e);
        }
      }

      // Skip if email notifications disabled
      if (!notificationPrefs.email_enabled || !notificationPrefs.deadline_reminders) {
        continue;
      }

      const notificationKey = `${deadline.deadline_id}_${daysUntil}`;

      // Check if already sent this notification
      if (sentNotifications.has(notificationKey)) {
        continue;
      }

      const user = {
        first_name: deadline.first_name,
        last_name: deadline.last_name,
        email: deadline.email
      };

      const grievance = {
        id: deadline.grievance_id,
        grievance_number: deadline.grievance_number,
        grievant_name: deadline.grievant_name,
        violation_type: deadline.violation_type,
        current_step: deadline.current_step,
        created_at: deadline.created_at
      };

      const deadlineInfo = {
        deadline_type: deadline.deadline_type,
        deadline_date: deadline.deadline_date,
        description: deadline.description
      };

      // Send reminders based on user preferences
      if (notificationPrefs.reminder_days.includes(daysUntil) && daysUntil >= 0) {
        console.log(`Sending ${daysUntil}-day reminder for deadline ${deadline.deadline_id}`);
        await sendDeadlineReminderNotification(user, grievance, deadlineInfo, daysUntil);
        sentNotifications.add(notificationKey);

        // Log notification
        await pool.query(
          `INSERT INTO notifications (user_id, grievance_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            deadline.user_id,
            deadline.grievance_id,
            'deadline_reminder',
            `Deadline Reminder: ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            `Deadline for ${deadline.deadline_type} is ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}`,
            false
          ]
        );
      }

      // Send overdue notification
      if (daysUntil < 0 && !sentNotifications.has(`${deadline.deadline_id}_overdue`)) {
        console.log(`Sending overdue notification for deadline ${deadline.deadline_id}`);
        await sendDeadlineOverdueNotification(user, grievance, deadlineInfo);
        sentNotifications.add(`${deadline.deadline_id}_overdue`);

        // Log notification
        await pool.query(
          `INSERT INTO notifications (user_id, grievance_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            deadline.user_id,
            deadline.grievance_id,
            'deadline_overdue',
            'Deadline Overdue',
            `Deadline for ${deadline.deadline_type} is overdue`,
            false
          ]
        );
      }
    }

    // Clean up sent notifications older than 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Clear old entries from Set (in production, use Redis or database)
    if (sentNotifications.size > 1000) {
      sentNotifications.clear();
    }

    console.log(`Deadline check complete. Sent notifications count: ${sentNotifications.size}`);
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
};

// Check trial expirations and send reminders
const checkTrialExpirations = async () => {
  console.log(`[${new Date().toISOString()}] Running trial expiration check...`);

  try {
    const now = new Date();

    // Get all users on trial
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, trial_ends_at, subscription_status
       FROM users
       WHERE subscription_status = 'trial'
         AND trial_ends_at IS NOT NULL
       ORDER BY trial_ends_at ASC`,
      []
    );

    const trialUsers = result.rows;
    console.log(`Found ${trialUsers.length} users on trial`);

    for (const user of trialUsers) {
      const trialEndDate = new Date(user.trial_ends_at);
      const daysUntilExpiration = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));

      console.log(`User ${user.email}: ${daysUntilExpiration} days until trial expires`);

      // Trial has expired - mark as expired and send email
      if (daysUntilExpiration <= 0) {
        const notificationKey = `trial_expired_${user.id}`;

        if (!sentNotifications.has(notificationKey)) {
          console.log(`Trial expired for user ${user.email}, updating status and sending email`);

          // Update user status to expired
          await pool.query(
            'UPDATE users SET subscription_status = $1 WHERE id = $2',
            ['expired', user.id]
          );

          // Send expiration email
          await sendTrialExpiredEmail(user);
          sentNotifications.add(notificationKey);

          // Log notification in database
          await pool.query(
            `INSERT INTO notifications (user_id, notification_type, title, message, is_read)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              user.id,
              'trial_expired',
              'Trial Expired',
              'Your 30-day trial has expired. Contact us to activate your subscription.',
              false
            ]
          );
        }
      }
      // 2 days until expiration - send final warning
      else if (daysUntilExpiration === 2) {
        const notificationKey = `trial_2day_${user.id}`;

        if (!sentNotifications.has(notificationKey)) {
          console.log(`Sending 2-day trial warning to ${user.email}`);
          await sendTrialTwoDayWarning(user);
          sentNotifications.add(notificationKey);

          // Log notification
          await pool.query(
            `INSERT INTO notifications (user_id, notification_type, title, message, is_read)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              user.id,
              'trial_reminder',
              'Trial Ending Soon',
              'Your trial ends in 2 days. Contact us to continue service.',
              false
            ]
          );
        }
      }
      // 7 days until expiration - send first warning
      else if (daysUntilExpiration === 7) {
        const notificationKey = `trial_7day_${user.id}`;

        if (!sentNotifications.has(notificationKey)) {
          console.log(`Sending 7-day trial warning to ${user.email}`);
          await sendTrialSevenDayWarning(user);
          sentNotifications.add(notificationKey);

          // Log notification
          await pool.query(
            `INSERT INTO notifications (user_id, notification_type, title, message, is_read)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              user.id,
              'trial_reminder',
              'Trial Ending Soon',
              'Your trial ends in 7 days. Contact us to continue service.',
              false
            ]
          );
        }
      }
    }

    console.log(`Trial expiration check complete`);
  } catch (error) {
    console.error('Error checking trial expirations:', error);
  }
};

// Initialize cron jobs
export const initializeScheduler = () => {
  console.log('Initializing notification scheduler...');

  // Run deadline check daily at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('Running daily deadline check (8:00 AM)...');
    checkDeadlines();
  });

  // Also run at noon for same-day reminders
  cron.schedule('0 12 * * *', () => {
    console.log('Running midday deadline check (12:00 PM)...');
    checkDeadlines();
  });

  // NEW: Trial expiration check - run daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily trial expiration check (9:00 AM)...');
    checkTrialExpirations();
  });

  // For development: Run every 5 minutes
  if (process.env.NODE_ENV !== 'production') {
    cron.schedule('*/5 * * * *', () => {
      console.log('Running development deadline check (every 5 minutes)...');
      checkDeadlines();
    });

    // NEW: Check trials every 10 minutes in development
    cron.schedule('*/10 * * * *', () => {
      console.log('Running development trial check (every 10 minutes)...');
      checkTrialExpirations();
    });
  }

  console.log('Notification scheduler initialized successfully');
  console.log('Schedule: Deadlines at 8:00 AM and 12:00 PM, Trials at 9:00 AM');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode: Deadlines every 5 min, Trials every 10 min');
  }

  // Run immediately on startup
  setTimeout(checkDeadlines, 5000);
  setTimeout(checkTrialExpirations, 10000); // NEW: Check trials on startup
};

export default { initializeScheduler };
