-- Insert test grievances for demo accounts
-- Run this against Railway database to populate with sample data

-- Get user IDs (we know from seed.sql these emails exist)
DO $$
DECLARE
    employee_id INT;
    steward_id INT;
    rep_id INT;
BEGIN
    -- Get user IDs
    SELECT id INTO employee_id FROM users WHERE email = 'employee@test.com';
    SELECT id INTO steward_id FROM users WHERE email = 'steward@test.com';
    SELECT id INTO rep_id FROM users WHERE email = 'rep@test.com';

    -- Insert grievances with various statuses and steps

    -- Grievance 1: New grievance from employee (Step 1 - pending)
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        created_at, updated_at
    ) VALUES (
        'GRV-2025-001',
        employee_id,
        'John Employee',
        '2025-01-15',
        'Supervisor denied annual leave request without proper notice, violating Article 10 of the contract. Request was submitted 30 days in advance as required.',
        'Article 10 - Leave',
        'step_1',
        'pending',
        'Approval of annual leave for dates 02/15/2025 - 02/22/2025, and compensatory time for administrative error.',
        steward_id,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    );

    -- Grievance 2: Step 2 - in progress
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        step1_decision, step1_decision_date,
        created_at, updated_at
    ) VALUES (
        'GRV-2025-002',
        employee_id,
        'John Employee',
        '2025-01-10',
        'Forced overtime on non-scheduled day without proper notification. Carrier was given less than 2 hours notice in violation of Article 8.',
        'Article 8 - Hours of Work',
        'step_2',
        'in_progress',
        'Payment for overtime at penalty rate and guarantee this will not happen again.',
        steward_id,
        'Denied - Management claims emergency situation',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '5 days'
    );

    -- Grievance 3: Step 3 - in progress
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        step1_decision, step1_decision_date,
        step2_decision, step2_decision_date,
        created_at, updated_at
    ) VALUES (
        'GRV-2024-045',
        employee_id,
        'John Employee',
        '2024-12-05',
        'Improper discipline - Letter of Warning issued without proper investigation or opportunity to respond. Union representation was denied.',
        'Article 16 - Discipline',
        'step_3',
        'in_progress',
        'Removal of Letter of Warning from personnel file and expungement of all references to this incident.',
        steward_id,
        'Denied - Discipline upheld',
        NOW() - INTERVAL '25 days',
        'Denied - Management maintains position',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '15 days'
    );

    -- Grievance 4: Resolved - favorable
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        step1_decision, step1_decision_date,
        resolution_details, resolved_at,
        created_at, updated_at
    ) VALUES (
        'GRV-2024-038',
        employee_id,
        'John Employee',
        '2024-11-20',
        'Vehicle safety issue - Required to drive postal vehicle with faulty brakes. Management ignored multiple reports of brake problems.',
        'Article 14 - Safety and Health',
        'step_1',
        'resolved',
        'Immediate repair of vehicle and guarantee of safe working conditions.',
        steward_id,
        'Granted - Vehicle removed from service',
        NOW() - INTERVAL '45 days',
        'Management agreed to remedy. Vehicle was repaired and safety inspection process improved. Grievant received apology.',
        NOW() - INTERVAL '40 days',
        NOW() - INTERVAL '50 days',
        NOW() - INTERVAL '40 days'
    );

    -- Grievance 5: Withdrawn
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        created_at, updated_at
    ) VALUES (
        'GRV-2024-042',
        employee_id,
        'John Employee',
        '2024-12-01',
        'Schedule change without 7-day notice.',
        'Article 8 - Hours of Work',
        'step_1',
        'withdrawn',
        'Restore original schedule.',
        steward_id,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '28 days'
    );

    -- Add some grievances from other test users to show variety

    -- Grievance 6: From another employee, assigned to rep (Step 3)
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        step1_decision, step1_decision_date,
        step2_decision, step2_decision_date,
        created_at, updated_at
    ) VALUES (
        'GRV-2025-003',
        employee_id,
        'Jane Carrier',
        '2025-01-05',
        'Wrongful termination - Fired without just cause. Carrier was accused of time fraud but no evidence was provided. Union representation was present but not given adequate time to prepare defense.',
        'Article 16 - Discipline',
        'step_3',
        'in_progress',
        'Full reinstatement with back pay and benefits, removal of all disciplinary records.',
        rep_id,
        'Denied - Termination upheld',
        NOW() - INTERVAL '12 days',
        'Denied - Postmaster maintains decision',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '6 days'
    );

    -- Grievance 7: Work assignment grievance
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, issue_date, issue_description,
        article_section, current_step, status, desired_remedy, steward_assigned,
        created_at, updated_at
    ) VALUES (
        'GRV-2025-004',
        employee_id,
        'Bob Carrier',
        '2025-01-12',
        'Improper work assignment - Regular carrier assigned to auxiliary route without proper bid process. Senior carrier was denied opportunity to bid.',
        'Article 41 - Promotions',
        'step_1',
        'pending',
        'Award route to senior qualified carrier per contract provisions.',
        steward_id,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );

END $$;

-- Add some notes to the grievances
INSERT INTO notes (grievance_id, user_id, content, created_at, updated_at)
SELECT
    g.id,
    u.id,
    'Initial grievance filed. Waiting for Step 1 hearing date.',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2025-001' AND u.email = 'steward@test.com';

INSERT INTO notes (grievance_id, user_id, content, created_at, updated_at)
SELECT
    g.id,
    u.id,
    'Step 1 hearing held on 01/20/2025. Management denied grievance citing emergency operational needs. Escalating to Step 2.',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2025-002' AND u.email = 'steward@test.com';

INSERT INTO notes (grievance_id, user_id, content, created_at, updated_at)
SELECT
    g.id,
    u.id,
    'Step 2 hearing completed. Postmaster denied grievance. Preparing appeal to Step 3. Need to gather witness statements and review Article 16 precedents.',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2024-045' AND u.email = 'steward@test.com';

-- Add deadlines for active grievances
INSERT INTO deadlines (grievance_id, deadline_type, deadline_date, description, created_at, updated_at)
SELECT
    g.id,
    'step_deadline',
    NOW() + INTERVAL '7 days',
    'Step 1 response due',
    NOW(),
    NOW()
FROM grievances g
WHERE g.grievance_number = 'GRV-2025-001';

INSERT INTO deadlines (grievance_id, deadline_type, deadline_date, description, created_at, updated_at)
SELECT
    g.id,
    'step_deadline',
    NOW() + INTERVAL '5 days',
    'Step 2 decision expected',
    NOW(),
    NOW()
FROM grievances g
WHERE g.grievance_number = 'GRV-2025-002';

INSERT INTO deadlines (grievance_id, deadline_type, deadline_date, description, created_at, updated_at)
SELECT
    g.id,
    'step_deadline',
    NOW() + INTERVAL '10 days',
    'Step 3 appeal must be filed',
    NOW(),
    NOW()
FROM grievances g
WHERE g.grievance_number = 'GRV-2024-045';

-- Add timeline entries for grievances
INSERT INTO grievance_timeline (grievance_id, step, action, notes, handler_id, created_at)
SELECT
    g.id,
    'step_1',
    'filed',
    'Grievance filed by employee',
    u.id,
    NOW() - INTERVAL '3 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2025-001' AND u.email = 'employee@test.com';

INSERT INTO grievance_timeline (grievance_id, step, action, notes, handler_id, created_at)
SELECT
    g.id,
    'step_1',
    'filed',
    'Grievance filed by employee',
    u.id,
    NOW() - INTERVAL '10 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2025-002' AND u.email = 'employee@test.com';

INSERT INTO grievance_timeline (grievance_id, step, action, notes, handler_id, created_at)
SELECT
    g.id,
    'step_1',
    'denied',
    'Step 1 denied - Management claims emergency situation',
    u.id,
    NOW() - INTERVAL '5 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2025-002' AND u.email = 'steward@test.com';

INSERT INTO grievance_timeline (grievance_id, step, action, notes, handler_id, created_at)
SELECT
    g.id,
    'step_2',
    'escalated',
    'Escalated to Step 2 after Step 1 denial',
    u.id,
    NOW() - INTERVAL '5 days'
FROM grievances g, users u
WHERE g.grievance_number = 'GRV-2025-002' AND u.email = 'steward@test.com';

SELECT 'Test grievances inserted successfully!' AS result;
