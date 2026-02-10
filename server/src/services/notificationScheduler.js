import pool from '../config/database.js';
import {
  sendDeadlineReminderNotification,
  sendDeadlineOverdueNotification,
  sendTrialSevenDayWarning,
  sendTrialTwoDayWarning,
  sendTrialExpiredEmail
} from './emailService.js';

// Check for upcoming and overdue deadlines
export const checkDeadlines = async () => {
  console.log(`[${new Date().toISOString()}] Running deadline check...`);

  try {
    const today = new Date();

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
        // Use INSERT ON CONFLICT DO NOTHING for dedup
        const insertResult = await pool.query(
          `INSERT INTO notifications (user_id, grievance_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            deadline.user_id,
            deadline.grievance_id,
            'deadline_reminder',
            `Deadline Reminder: ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            `Deadline for ${deadline.deadline_type} is ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}`,
            false
          ]
        );

        // Only send email if notification was actually inserted (not a duplicate)
        if (insertResult.rows.length > 0) {
          console.log(`Sending ${daysUntil}-day reminder for deadline ${deadline.deadline_id}`);
          await sendDeadlineReminderNotification(user, grievance, deadlineInfo, daysUntil);
        }
      }

      // Send overdue notification
      if (daysUntil < 0) {
        const insertResult = await pool.query(
          `INSERT INTO notifications (user_id, grievance_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            deadline.user_id,
            deadline.grievance_id,
            'deadline_overdue',
            'Deadline Overdue',
            `Deadline for ${deadline.deadline_type} is overdue`,
            false
          ]
        );

        if (insertResult.rows.length > 0) {
          console.log(`Sending overdue notification for deadline ${deadline.deadline_id}`);
          await sendDeadlineOverdueNotification(user, grievance, deadlineInfo);
        }
      }
    }

    console.log(`Deadline check complete.`);
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
};

// Check trial expirations and send reminders
export const checkTrialExpirations = async () => {
  console.log(`[${new Date().toISOString()}] Running trial expiration check...`);

  try {
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
      const now = new Date();
      const daysUntilExpiration = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));

      console.log(`User ${user.email}: ${daysUntilExpiration} days until trial expires`);

      // Trial has expired
      if (daysUntilExpiration <= 0) {
        // Update user status to expired
        await pool.query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          ['expired', user.id]
        );

        const insertResult = await pool.query(
          `INSERT INTO notifications (user_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            user.id,
            'trial_expired',
            'Trial Expired',
            'Your 30-day trial has expired. Contact us to activate your subscription.',
            false
          ]
        );

        if (insertResult.rows.length > 0) {
          console.log(`Trial expired for user ${user.email}`);
          await sendTrialExpiredEmail(user);
        }
      }
      // 2 days until expiration
      else if (daysUntilExpiration === 2) {
        const insertResult = await pool.query(
          `INSERT INTO notifications (user_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            user.id,
            'trial_reminder',
            'Trial Ending Soon',
            'Your trial ends in 2 days. Contact us to continue service.',
            false
          ]
        );

        if (insertResult.rows.length > 0) {
          console.log(`Sending 2-day trial warning to ${user.email}`);
          await sendTrialTwoDayWarning(user);
        }
      }
      // 7 days until expiration
      else if (daysUntilExpiration === 7) {
        const insertResult = await pool.query(
          `INSERT INTO notifications (user_id, notification_type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            user.id,
            'trial_reminder',
            'Trial Ending Soon',
            'Your trial ends in 7 days. Contact us to continue service.',
            false
          ]
        );

        if (insertResult.rows.length > 0) {
          console.log(`Sending 7-day trial warning to ${user.email}`);
          await sendTrialSevenDayWarning(user);
        }
      }
    }

    console.log(`Trial expiration check complete`);
  } catch (error) {
    console.error('Error checking trial expirations:', error);
  }
};

// Initialize cron jobs (local dev only)
export const initializeScheduler = () => {
  console.log('Initializing notification scheduler (local dev)...');

  // Dynamic import node-cron only for local dev
  import('node-cron').then((cronModule) => {
    const cron = cronModule.default;

    cron.schedule('*/5 * * * *', () => {
      console.log('Running development deadline check (every 5 minutes)...');
      checkDeadlines();
    });

    cron.schedule('*/10 * * * *', () => {
      console.log('Running development trial check (every 10 minutes)...');
      checkTrialExpirations();
    });

    console.log('Development scheduler: Deadlines every 5 min, Trials every 10 min');
  }).catch((err) => {
    console.warn('node-cron not available, skipping local scheduler:', err.message);
  });

  // Run immediately on startup
  setTimeout(checkDeadlines, 5000);
  setTimeout(checkTrialExpirations, 10000);
};

export default { initializeScheduler, checkDeadlines, checkTrialExpirations };
