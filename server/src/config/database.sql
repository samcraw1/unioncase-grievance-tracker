-- USPS Grievance Tracker Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'steward', 'representative')),
  facility VARCHAR(255),
  craft VARCHAR(50) CHECK (craft IN ('carrier', 'clerk', 'maintenance', 'supervisor', 'other')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id SERIAL PRIMARY KEY,
  grievance_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  grievant_name VARCHAR(255) NOT NULL,
  grievant_employee_id VARCHAR(50),
  facility VARCHAR(255) NOT NULL,
  craft VARCHAR(50),

  -- Incident details
  incident_date DATE NOT NULL,
  incident_time TIME,
  contract_article VARCHAR(100) NOT NULL,
  violation_type VARCHAR(100) NOT NULL,
  brief_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,

  -- Management and witnesses
  management_representative VARCHAR(255),
  witnesses TEXT[], -- Array of witness names
  steward_assigned INTEGER REFERENCES users(id),

  -- Process tracking
  current_step VARCHAR(50) NOT NULL DEFAULT 'filed'
    CHECK (current_step IN ('filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration', 'resolved', 'settled', 'denied')),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'settled', 'denied', 'withdrawn')),

  -- Outcome
  resolution_date DATE,
  resolution_notes TEXT,
  settlement_amount DECIMAL(10, 2),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grievance timeline/history table
CREATE TABLE IF NOT EXISTS grievance_timeline (
  id SERIAL PRIMARY KEY,
  grievance_id INTEGER REFERENCES grievances(id) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL,
  step_date DATE NOT NULL,
  handler_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
  id SERIAL PRIMARY KEY,
  grievance_id INTEGER REFERENCES grievances(id) ON DELETE CASCADE,
  deadline_type VARCHAR(100) NOT NULL,
  deadline_date DATE NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  grievance_id INTEGER REFERENCES grievances(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  label VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  grievance_id INTEGER REFERENCES grievances(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  note_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  grievance_id INTEGER REFERENCES grievances(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_grievances_user_id ON grievances(user_id);
CREATE INDEX idx_grievances_steward_assigned ON grievances(steward_assigned);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_current_step ON grievances(current_step);
CREATE INDEX idx_grievances_created_at ON grievances(created_at);
CREATE INDEX idx_timeline_grievance_id ON grievance_timeline(grievance_id);
CREATE INDEX idx_deadlines_grievance_id ON deadlines(grievance_id);
CREATE INDEX idx_deadlines_deadline_date ON deadlines(deadline_date);
CREATE INDEX idx_documents_grievance_id ON documents(grievance_id);
CREATE INDEX idx_notes_grievance_id ON notes(grievance_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON grievances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
