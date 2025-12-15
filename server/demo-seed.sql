-- Demo Account and Cases for NALC Case Tracker
-- Password for demo user: demo123

-- Insert demo user (password: demo123)
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  employee_id,
  role,
  facility,
  craft,
  phone,
  trial_starts_at,
  trial_ends_at
) VALUES (
  'demo@carrier.com',
  '$2a$10$vI8aWBnW3fid.Lh/Cy9Zde.kM1RKLjKLcJGp2Ew4gT5xZh1w3DK8m', -- bcrypt hash of 'demo123'
  'John',
  'Carrier',
  'EMP12345',
  'employee',
  'Brooklyn Main Post Office',
  'city_carrier',
  '555-123-4567',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days'
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID
DO $$
DECLARE
  demo_user_id INTEGER;
  case_id INTEGER;
BEGIN
  SELECT id INTO demo_user_id FROM users WHERE email = 'demo@carrier.com';

  -- Case 1: Draft Status - Just created, not shared yet
  INSERT INTO grievances (
    user_id,
    grievance_number,
    grievant_name,
    grievant_employee_id,
    facility,
    craft,
    incident_date,
    incident_time,
    violation_type,
    contract_article,
    brief_description,
    detailed_description,
    management_representative,
    witnesses,
    current_step,
    status,
    created_at
  ) VALUES (
    demo_user_id,
    'GRVNC-2025-0001',
    'John Carrier',
    'EMP12345',
    'Brooklyn Main Post Office',
    'city_carrier',
    CURRENT_DATE - INTERVAL '2 days',
    '09:30:00',
    'Overtime Violation',
    'Article 8.5',
    'Overtime violation - OTDL not followed',
    'Management failed to follow the overtime desired list and forced junior carriers to work overtime while senior carriers on the OTDL were available. This is a clear violation of Article 8.5 of the NALC contract.',
    'Supervisor Jane Smith',
    ARRAY['Mike Johnson', 'Sarah Williams'],
    'draft',
    'active',
    CURRENT_DATE - INTERVAL '1 day'
  ) RETURNING id INTO case_id;

  -- Add timeline entry for draft case
  INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
  VALUES (case_id, 'draft', CURRENT_DATE - INTERVAL '1 day', demo_user_id, 'Case created as draft');

  -- Case 2: Preparing with Steward - Shared with steward
  INSERT INTO grievances (
    user_id,
    grievance_number,
    grievant_name,
    grievant_employee_id,
    facility,
    craft,
    incident_date,
    incident_time,
    violation_type,
    contract_article,
    brief_description,
    detailed_description,
    management_representative,
    current_step,
    status,
    created_at
  ) VALUES (
    demo_user_id,
    'GRVNC-2025-0002',
    'John Carrier',
    'EMP12345',
    'Brooklyn Main Post Office',
    'city_carrier',
    CURRENT_DATE - INTERVAL '5 days',
    '14:15:00',
    'Unjust Discipline',
    'Article 16',
    'Letter of Warning without proper investigation',
    'Received a Letter of Warning for alleged failure to follow instructions, but management did not provide proper investigative interview as required by Article 16.2. Weingarten rights were violated.',
    'Manager Robert Brown',
    'filed',
    'active',
    CURRENT_DATE - INTERVAL '3 days'
  ) RETURNING id INTO case_id;

  INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
  VALUES (case_id, 'filed', CURRENT_DATE - INTERVAL '3 days', demo_user_id, 'Shared with steward for review');

  -- Case 3: Step 1 - In progress
  INSERT INTO grievances (
    user_id,
    grievance_number,
    grievant_name,
    grievant_employee_id,
    facility,
    craft,
    incident_date,
    violation_type,
    contract_article,
    brief_description,
    detailed_description,
    current_step,
    status,
    created_at
  ) VALUES (
    demo_user_id,
    'GRVNC-2025-0003',
    'John Carrier',
    'EMP12345',
    'Brooklyn Main Post Office',
    'city_carrier',
    CURRENT_DATE - INTERVAL '15 days',
    'Route Evaluation',
    'Article 34',
    'Improper route evaluation causing excessive OT',
    'Route was improperly evaluated resulting in excessive overtime. Requesting proper count and evaluation per Article 34.1.',
    'informal_step_a',
    'active',
    CURRENT_DATE - INTERVAL '12 days'
  ) RETURNING id INTO case_id;

  INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
  VALUES (case_id, 'informal_step_a', CURRENT_DATE - INTERVAL '10 days', demo_user_id, 'Step 1 informal discussion scheduled');

  -- Case 4: Step 2 - Advanced stage
  INSERT INTO grievances (
    user_id,
    grievance_number,
    grievant_name,
    grievant_employee_id,
    facility,
    craft,
    incident_date,
    violation_type,
    contract_article,
    brief_description,
    detailed_description,
    current_step,
    status,
    created_at
  ) VALUES (
    demo_user_id,
    'GRVNC-2025-0004',
    'John Carrier',
    'EMP12345',
    'Brooklyn Main Post Office',
    'city_carrier',
    CURRENT_DATE - INTERVAL '45 days',
    'Safety Violation',
    'Article 14',
    'Required to work in unsafe weather conditions',
    'Management required carrier to work in unsafe conditions during extreme weather without proper equipment. Safety protocols were ignored.',
    'step_b',
    'active',
    CURRENT_DATE - INTERVAL '40 days'
  ) RETURNING id INTO case_id;

  INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
  VALUES (case_id, 'step_b', CURRENT_DATE - INTERVAL '20 days', demo_user_id, 'Escalated to Step 2 - awaiting response');

  -- Case 5: Closed - Successfully resolved
  INSERT INTO grievances (
    user_id,
    grievance_number,
    grievant_name,
    grievant_employee_id,
    facility,
    craft,
    incident_date,
    violation_type,
    contract_article,
    brief_description,
    detailed_description,
    current_step,
    status,
    created_at
  ) VALUES (
    demo_user_id,
    'GRVNC-2024-0099',
    'John Carrier',
    'EMP12345',
    'Brooklyn Main Post Office',
    'city_carrier',
    CURRENT_DATE - INTERVAL '90 days',
    'Leave Request',
    'Article 10',
    'Annual leave improperly denied',
    'Annual leave request was improperly denied despite being submitted within required timeframe and having adequate coverage available.',
    'resolved',
    'resolved',
    CURRENT_DATE - INTERVAL '85 days'
  ) RETURNING id INTO case_id;

  INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
  VALUES (case_id, 'resolved', CURRENT_DATE - INTERVAL '60 days', demo_user_id, 'Management granted leave request. Case resolved favorably.');

  -- Add a note to one of the cases
  SELECT id INTO case_id FROM grievances WHERE grievance_number = 'GRVNC-2025-0002';
  INSERT INTO notes (grievance_id, user_id, note_text)
  VALUES (case_id, demo_user_id, 'Met with steward today. We reviewed the contract language and prepared documentation for Step 1.');

END $$;
