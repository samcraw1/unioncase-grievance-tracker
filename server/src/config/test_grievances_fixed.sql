-- Insert test grievances for demo accounts (corrected for actual schema)

DO $$
DECLARE
    employee_id INT;
    steward_id INT;
    rep_id INT;
    grv1_id INT;
    grv2_id INT;
    grv3_id INT;
    grv4_id INT;
BEGIN
    -- Get user IDs
    SELECT id INTO employee_id FROM users WHERE email = 'employee@test.com';
    SELECT id INTO steward_id FROM users WHERE email = 'steward@test.com';
    SELECT id INTO rep_id FROM users WHERE email = 'rep@test.com';

    -- Grievance 1: New filed grievance
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, facility, craft,
        incident_date, contract_article, violation_type,
        brief_description, detailed_description,
        steward_assigned, current_step, status, created_at, updated_at
    ) VALUES (
        'GRV-2025-001',
        employee_id,
        'John Employee',
        'Brooklyn Main Post Office',
        'city_carrier',
        '2025-01-15',
        'Article 10',
        'Leave Violation',
        'Annual leave request denied without proper notice',
        'Supervisor denied annual leave request without proper notice, violating Article 10 of the contract. Request was submitted 30 days in advance as required. Employee needs leave for family emergency.',
        steward_id,
        'filed',
        'active',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ) RETURNING id INTO grv1_id;

    -- Grievance 2: At Informal Step A
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, facility, craft,
        incident_date, contract_article, violation_type,
        brief_description, detailed_description,
        steward_assigned, current_step, status, created_at, updated_at
    ) VALUES (
        'GRV-2025-002',
        employee_id,
        'John Employee',
        'Brooklyn Main Post Office',
        'city_carrier',
        '2025-01-10',
        'Article 8',
        'Hours of Work',
        'Forced overtime without proper notification',
        'Forced overtime on non-scheduled day without proper notification. Carrier was given less than 2 hours notice in violation of Article 8. Management claims emergency but did not follow proper procedures.',
        steward_id,
        'informal_step_a',
        'active',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '5 days'
    ) RETURNING id INTO grv2_id;

    -- Grievance 3: At Step B
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, facility, craft,
        incident_date, contract_article, violation_type,
        brief_description, detailed_description,
        management_representative, steward_assigned, current_step, status,
        created_at, updated_at
    ) VALUES (
        'GRV-2024-045',
        employee_id,
        'John Employee',
        'Brooklyn Main Post Office',
        'city_carrier',
        '2024-12-05',
        'Article 16',
        'Discipline',
        'Improper discipline - Letter of Warning',
        'Letter of Warning issued without proper investigation or opportunity to respond. Union representation was denied during the meeting. Management did not follow progressive discipline procedures outlined in Article 16.',
        'Supervisor Jane Smith',
        steward_id,
        'step_b',
        'active',
        NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '15 days'
    ) RETURNING id INTO grv3_id;

    -- Grievance 4: Resolved
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, facility, craft,
        incident_date, contract_article, violation_type,
        brief_description, detailed_description,
        steward_assigned, current_step, status,
        resolution_date, resolution_notes,
        created_at, updated_at
    ) VALUES (
        'GRV-2024-038',
        employee_id,
        'John Employee',
        'Brooklyn Main Post Office',
        'city_carrier',
        '2024-11-20',
        'Article 14',
        'Safety and Health',
        'Vehicle safety issue - faulty brakes',
        'Required to drive postal vehicle with faulty brakes. Management ignored multiple reports of brake problems. Safety hazard for carrier and public.',
        steward_id,
        'resolved',
        'resolved',
        NOW() - INTERVAL '40 days',
        'Management agreed to remedy. Vehicle was removed from service and repaired. Safety inspection process improved. Grievant received apology.',
        NOW() - INTERVAL '50 days',
        NOW() - INTERVAL '40 days'
    ) RETURNING id INTO grv4_id;

    -- Grievance 5: Denied
    INSERT INTO grievances (
        grievance_number, user_id, grievant_name, facility, craft,
        incident_date, contract_article, violation_type,
        brief_description, detailed_description,
        steward_assigned, current_step, status,
        resolution_date, resolution_notes,
        created_at, updated_at
    ) VALUES (
        'GRV-2024-042',
        employee_id,
        'John Employee',
        'Brooklyn Main Post Office',
        'city_carrier',
        '2024-12-01',
        'Article 8',
        'Hours of Work',
        'Schedule change without proper notice',
        'Schedule changed with less than 7 days notice as required by Article 8.',
        steward_id,
        'denied',
        'denied',
        NOW() - INTERVAL '25 days',
        'Management denied grievance. Claimed operational necessity.',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '25 days'
    );

    -- Add notes to grievances
    INSERT INTO notes (grievance_id, user_id, note_text, is_internal, created_at, updated_at)
    VALUES
        (grv1_id, steward_id, 'Initial grievance filed. Scheduling informal meeting with supervisor.', false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
        (grv2_id, steward_id, 'Informal Step A hearing held. Management denied citing emergency. Escalating to Formal Step A.', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
        (grv3_id, steward_id, 'Step B hearing scheduled for next week. Need to gather witness statements and review Article 16 precedents.', true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
        (grv4_id, steward_id, 'Successfully resolved. Management agreed to all remedies. Vehicle repaired and back in service.', false, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days');

    -- Add timeline entries
    INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes, created_at)
    VALUES
        (grv1_id, 'filed', (NOW() - INTERVAL '3 days')::date, employee_id, 'Grievance filed by employee', NOW() - INTERVAL '3 days'),
        (grv2_id, 'filed', (NOW() - INTERVAL '10 days')::date, employee_id, 'Grievance filed', NOW() - INTERVAL '10 days'),
        (grv2_id, 'informal_step_a', (NOW() - INTERVAL '5 days')::date, steward_id, 'Escalated to Informal Step A after initial denial', NOW() - INTERVAL '5 days'),
        (grv3_id, 'filed', (NOW() - INTERVAL '35 days')::date, employee_id, 'Grievance filed', NOW() - INTERVAL '35 days'),
        (grv3_id, 'formal_step_a', (NOW() - INTERVAL '28 days')::date, steward_id, 'Formal Step A hearing - denied', NOW() - INTERVAL '28 days'),
        (grv3_id, 'step_b', (NOW() - INTERVAL '15 days')::date, steward_id, 'Escalated to Step B', NOW() - INTERVAL '15 days'),
        (grv4_id, 'filed', (NOW() - INTERVAL '50 days')::date, employee_id, 'Grievance filed', NOW() - INTERVAL '50 days'),
        (grv4_id, 'resolved', (NOW() - INTERVAL '40 days')::date, steward_id, 'Resolved - Management agreed to remedy', NOW() - INTERVAL '40 days');

    -- Add deadlines for active grievances
    INSERT INTO deadlines (grievance_id, deadline_type, deadline_date, description, created_at)
    VALUES
        (grv1_id, 'step_deadline', (NOW() + INTERVAL '7 days')::date, 'Informal Step A response due', NOW()),
        (grv2_id, 'step_deadline', (NOW() + INTERVAL '5 days')::date, 'Formal Step A hearing date', NOW()),
        (grv3_id, 'step_deadline', (NOW() + INTERVAL '10 days')::date, 'Step B decision expected', NOW());

END $$;

SELECT 'Test grievances created successfully!' AS result;
