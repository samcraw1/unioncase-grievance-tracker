import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  // For development, use ethereal.email (fake SMTP)
  // For production, use Gmail or SendGrid

  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Development: Log emails to console instead of sending
  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true
  });
};

const transporter = createTransporter();

// USPS Email template wrapper
const emailTemplate = (content, grievanceNumber) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USPS Grievance Tracker Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #003366; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                USPS Grievance Tracker
              </h1>
              ${grievanceNumber ? `<p style="margin: 10px 0 0 0; color: #cccccc; font-size: 14px;">Case #${grievanceNumber}</p>` : ''}
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                This is an automated notification from the USPS Grievance Tracker.<br>
                <a href="${process.env.CLIENT_URL}/settings" style="color: #003366; text-decoration: none;">Manage notification preferences</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} USPS Grievance Tracker. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Email sending functions
export const sendNewGrievanceNotification = async (steward, grievance) => {
  const content = `
    <h2 style="color: #003366; margin: 0 0 20px 0;">New Grievance Assigned</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${steward.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      A new grievance has been filed and assigned to you for review.
    </p>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Grievance Details:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Grievant:</strong> ${grievance.grievant_name}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Facility:</strong> ${grievance.facility}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Violation Type:</strong> ${grievance.violation_type}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Filed:</strong> ${new Date(grievance.created_at).toLocaleDateString()}</p>
    </div>

    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 15px 0;">
      <strong>Brief Description:</strong><br>
      ${grievance.brief_description}
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/grievances/${grievance.id}"
         style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
        View Grievance Details
      </a>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Please review this case and take appropriate action as soon as possible.
    </p>
  `;

  const mailOptions = {
    from: `"USPS Grievance Tracker" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: steward.email,
    subject: `New Grievance Assigned: ${grievance.grievance_number}`,
    html: emailTemplate(content, grievance.grievance_number)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('New grievance notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending new grievance notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendDeadlineReminderNotification = async (user, grievance, deadline, daysUntil) => {
  const urgencyText = daysUntil === 0
    ? '<strong style="color: #dc3545;">TODAY</strong>'
    : daysUntil === 1
    ? '<strong style="color: #ffc107;">TOMORROW</strong>'
    : `in <strong>${daysUntil} days</strong>`;

  const content = `
    <h2 style="color: #dc3545; margin: 0 0 20px 0;">⚠️ Deadline Reminder</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      This is a reminder that a deadline for grievance <strong>${grievance.grievance_number}</strong> is approaching ${urgencyText}.
    </p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">Deadline Information:</p>
      <p style="margin: 5px 0; color: #856404;"><strong>Type:</strong> ${deadline.deadline_type.replace(/_/g, ' ').toUpperCase()}</p>
      <p style="margin: 5px 0; color: #856404;"><strong>Due Date:</strong> ${new Date(deadline.deadline_date).toLocaleDateString()}</p>
      <p style="margin: 5px 0; color: #856404;"><strong>Description:</strong> ${deadline.description}</p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Grievance Details:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Grievant:</strong> ${grievance.grievant_name}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Violation Type:</strong> ${grievance.violation_type}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Current Step:</strong> ${grievance.current_step.replace(/_/g, ' ').toUpperCase()}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/grievances/${grievance.id}"
         style="display: inline-block; background-color: #dc3545; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
        Take Action Now
      </a>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Please ensure all required actions are completed before the deadline.
    </p>
  `;

  const mailOptions = {
    from: `"USPS Grievance Tracker" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: `⚠️ Deadline ${urgencyText.replace(/<[^>]*>/g, '')} - ${grievance.grievance_number}`,
    html: emailTemplate(content, grievance.grievance_number)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Deadline reminder sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending deadline reminder:', error);
    return { success: false, error: error.message };
  }
};

export const sendDeadlineOverdueNotification = async (user, grievance, deadline) => {
  const content = `
    <h2 style="color: #dc3545; margin: 0 0 20px 0;">🚨 Deadline Overdue</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      <strong style="color: #dc3545;">A deadline for grievance ${grievance.grievance_number} has passed.</strong>
    </p>

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #721c24; font-weight: bold;">Overdue Deadline:</p>
      <p style="margin: 5px 0; color: #721c24;"><strong>Type:</strong> ${deadline.deadline_type.replace(/_/g, ' ').toUpperCase()}</p>
      <p style="margin: 5px 0; color: #721c24;"><strong>Was Due:</strong> ${new Date(deadline.deadline_date).toLocaleDateString()}</p>
      <p style="margin: 5px 0; color: #721c24;"><strong>Description:</strong> ${deadline.description}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/grievances/${grievance.id}"
         style="display: inline-block; background-color: #dc3545; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
        Review Grievance
      </a>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Please take immediate action to address this overdue item.
    </p>
  `;

  const mailOptions = {
    from: `"USPS Grievance Tracker" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: `🚨 OVERDUE: ${grievance.grievance_number} - Action Required`,
    html: emailTemplate(content, grievance.grievance_number)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Overdue notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending overdue notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendStatusUpdateNotification = async (user, grievance, oldStep, newStep) => {
  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px 0;">✅ Grievance Status Updated</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Grievance <strong>${grievance.grievance_number}</strong> has been updated to a new step in the process.
    </p>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #155724; font-weight: bold;">Status Change:</p>
      <p style="margin: 5px 0; color: #155724;">
        <strong>Previous:</strong> ${oldStep.replace(/_/g, ' ').toUpperCase()}
      </p>
      <p style="margin: 5px 0; color: #155724;">
        <strong>Current:</strong> ${newStep.replace(/_/g, ' ').toUpperCase()}
      </p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Grievance Details:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Grievant:</strong> ${grievance.grievant_name}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Violation Type:</strong> ${grievance.violation_type}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Facility:</strong> ${grievance.facility}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/grievances/${grievance.id}"
         style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
        View Details
      </a>
    </div>
  `;

  const mailOptions = {
    from: `"USPS Grievance Tracker" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: `Status Update: ${grievance.grievance_number}`,
    html: emailTemplate(content, grievance.grievance_number)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Status update notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending status update:', error);
    return { success: false, error: error.message };
  }
};

export const sendNewNoteNotification = async (user, grievance, note, author) => {
  const content = `
    <h2 style="color: #003366; margin: 0 0 20px 0;">💬 New Note Added</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      A new note has been added to grievance <strong>${grievance.grievance_number}</strong>.
    </p>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">
        Note from ${author.first_name} ${author.last_name}:
      </p>
      <p style="margin: 10px 0 0 0; color: #666; font-style: italic; line-height: 1.6;">
        "${note.note_text}"
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
        ${new Date(note.created_at).toLocaleString()}
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/grievances/${grievance.id}"
         style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
        View Grievance
      </a>
    </div>
  `;

  const mailOptions = {
    from: `"USPS Grievance Tracker" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: `New Note: ${grievance.grievance_number}`,
    html: emailTemplate(content, grievance.grievance_number)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('New note notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending note notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendGrievanceResolvedNotification = async (user, grievance, resolution) => {
  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px 0;">✅ Grievance Resolved</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Grievance <strong>${grievance.grievance_number}</strong> has been resolved.
    </p>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #155724; font-weight: bold;">Resolution Status:</p>
      <p style="margin: 5px 0; color: #155724;"><strong>Status:</strong> ${grievance.status.toUpperCase()}</p>
      <p style="margin: 5px 0; color: #155724;"><strong>Resolved:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Grievance Summary:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Grievant:</strong> ${grievance.grievant_name}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Violation Type:</strong> ${grievance.violation_type}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Filed:</strong> ${new Date(grievance.created_at).toLocaleDateString()}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/grievances/${grievance.id}"
         style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
        View Final Details
      </a>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Thank you for using the USPS Grievance Tracker.
    </p>
  `;

  const mailOptions = {
    from: `"USPS Grievance Tracker" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: `✅ Resolved: ${grievance.grievance_number}`,
    html: emailTemplate(content, grievance.grievance_number)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Resolution notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending resolution notification:', error);
    return { success: false, error: error.message };
  }
};

// Trial Welcome Email
export const sendTrialWelcomeEmail = async (user) => {
  const trialEndDate = new Date(user.trial_ends_at);

  const content = `
    <h2 style="color: #003366; margin: 0 0 20px 0;">Welcome to UnionCase!</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Thank you for registering with UnionCase, the comprehensive grievance tracking system for letter carriers.
    </p>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #155724; font-weight: bold;">Your 30-Day Free Trial</p>
      <p style="margin: 5px 0; color: #155724;">
        <strong>Trial Ends:</strong> ${trialEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p style="margin: 5px 0; color: #155724;">
        You have <strong>30 days</strong> to explore all features at no cost.
      </p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">What You Can Do:</p>
      <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
        <li style="margin: 5px 0;">File and track grievances</li>
        <li style="margin: 5px 0;">Set deadlines and receive automated reminders</li>
        <li style="margin: 5px 0;">Upload and organize documents</li>
        <li style="margin: 5px 0;">Collaborate with stewards and representatives</li>
        <li style="margin: 5px 0;">Generate PDF reports</li>
      </ul>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      We'll send you reminders as your trial period approaches its end. If you have any questions,
      reply to this email or contact us at ${process.env.SUPPORT_EMAIL || 'samcraw01@gmail.com'}.
    </p>
  `;

  const mailOptions = {
    from: `"UnionCase" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: 'Welcome to UnionCase - Your 30-Day Trial Starts Now',
    html: emailTemplate(content, null)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Trial welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending trial welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Trial 7-Day Warning Email
export const sendTrialSevenDayWarning = async (user) => {
  const trialEndDate = new Date(user.trial_ends_at);

  const content = `
    <h2 style="color: #ffc107; margin: 0 0 20px 0;">Your Trial Ends in 7 Days</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Your 30-day free trial of UnionCase will end in <strong>7 days</strong> on
      ${trialEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
    </p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">Continue Using UnionCase</p>
      <p style="margin: 5px 0; color: #856404;">
        To maintain uninterrupted access to your grievance data and all features, please contact us to activate your subscription.
      </p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Contact Information:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'samcraw01@gmail.com'}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || '501-580-6175'}</p>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Don't lose access to your important grievance records. Reach out today!
    </p>
  `;

  const mailOptions = {
    from: `"UnionCase" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: 'Trial Ending Soon - 7 Days Remaining',
    html: emailTemplate(content, null)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('7-day trial warning sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending 7-day trial warning:', error);
    return { success: false, error: error.message };
  }
};

// Trial 2-Day Warning Email
export const sendTrialTwoDayWarning = async (user) => {
  const trialEndDate = new Date(user.trial_ends_at);

  const content = `
    <h2 style="color: #dc3545; margin: 0 0 20px 0;">Final Reminder - Trial Ends in 2 Days</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      <strong>This is your final reminder.</strong> Your UnionCase trial will end in just <strong>2 days</strong> on
      ${trialEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
    </p>

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #721c24; font-weight: bold;">Action Required</p>
      <p style="margin: 5px 0; color: #721c24;">
        After your trial ends, you will lose access to your account until you activate a subscription.
      </p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Contact Us Immediately:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'samcraw01@gmail.com'}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || '501-580-6175'}</p>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Don't wait until it's too late. Contact us today to keep your grievance tracking active.
    </p>
  `;

  const mailOptions = {
    from: `"UnionCase" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: 'URGENT: Trial Ends in 2 Days - Action Required',
    html: emailTemplate(content, null)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('2-day trial warning sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending 2-day trial warning:', error);
    return { success: false, error: error.message };
  }
};

// Trial Expired Email
export const sendTrialExpiredEmail = async (user) => {
  const content = `
    <h2 style="color: #dc3545; margin: 0 0 20px 0;">Your Trial Has Expired</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hello ${user.first_name},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Your 30-day free trial of UnionCase has ended. Your account has been temporarily suspended.
    </p>

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #721c24; font-weight: bold;">Account Status: Suspended</p>
      <p style="margin: 5px 0; color: #721c24;">
        You will not be able to access your grievance data until you activate a paid subscription.
      </p>
    </div>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #155724; font-weight: bold;">Your Data is Safe</p>
      <p style="margin: 5px 0; color: #155724;">
        All your grievance records, documents, and notes are securely stored. Once you activate a subscription,
        you'll have immediate access to everything.
      </p>
    </div>

    <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Activate Your Subscription:</p>
      <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'samcraw01@gmail.com'}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || '501-580-6175'}</p>
    </div>

    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      We look forward to continuing to serve your grievance tracking needs.
    </p>
  `;

  const mailOptions = {
    from: `"UnionCase" <${process.env.SMTP_FROM || 'noreply@uspsgrievances.com'}>`,
    to: user.email,
    subject: 'Your UnionCase Trial Has Expired',
    html: emailTemplate(content, null)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Trial expired email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending trial expired email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendNewGrievanceNotification,
  sendDeadlineReminderNotification,
  sendDeadlineOverdueNotification,
  sendStatusUpdateNotification,
  sendNewNoteNotification,
  sendGrievanceResolvedNotification,
  sendTrialWelcomeEmail,
  sendTrialSevenDayWarning,
  sendTrialTwoDayWarning,
  sendTrialExpiredEmail
};
