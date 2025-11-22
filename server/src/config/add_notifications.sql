-- Add notification preferences column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_enabled": true,
  "new_grievance": true,
  "deadline_reminders": true,
  "status_updates": true,
  "new_notes": true,
  "grievance_resolved": true,
  "reminder_days": [3, 1, 0]
}'::jsonb;

-- Add last_email_sent_at column to track email frequency
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP;

-- Update existing notifications table or create if doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grievance_id INTEGER REFERENCES grievances(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_grievance_id ON notifications(grievance_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_notification_prefs ON users USING GIN (notification_preferences);

-- Add comments
COMMENT ON COLUMN users.notification_preferences IS 'JSON object containing user email notification preferences';
COMMENT ON TABLE notifications IS 'In-app notifications for users about grievance updates';
COMMENT ON COLUMN notifications.notification_type IS 'Type of notification: new_grievance, deadline_reminder, deadline_overdue, status_update, new_note, grievance_resolved';
