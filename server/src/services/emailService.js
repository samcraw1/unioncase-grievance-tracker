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

export default {
  sendNewGrievanceNotification,
  sendDeadlineReminderNotification,
  sendDeadlineOverdueNotification,
  sendStatusUpdateNotification,
  sendNewNoteNotification,
  sendGrievanceResolvedNotification
};
