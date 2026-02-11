-- Migration: Add tables for information requests, audit trail, case templates,
-- grievance collaborators, and push subscriptions
-- Run this against your PostgreSQL database

-- 1. Information Requests (NLRA Section 8(a)(5) tracking)
CREATE TABLE IF NOT EXISTS information_requests (
    id SERIAL PRIMARY KEY,
    grievance_id INTEGER NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    items_requested TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'partial', 'refused', 'overdue')),
    due_date DATE,
    response_date DATE,
    response_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_info_requests_grievance ON information_requests(grievance_id);
CREATE INDEX IF NOT EXISTS idx_info_requests_status ON information_requests(status);

-- 2. Audit Trail (immutable append-only log)
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);

-- 3. Case Templates
CREATE TABLE IF NOT EXISTS case_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contract_article VARCHAR(100) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    brief_description_template TEXT,
    detailed_description_template TEXT,
    is_system BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    union_type VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system templates
INSERT INTO case_templates (name, description, contract_article, violation_type, brief_description_template, detailed_description_template, is_system, union_type) VALUES
('Overtime Distribution', 'Overtime not distributed equitably per OTDL', 'Article 8 - Hours of Work', 'Overtime Distribution Violation', 'Overtime not equitably distributed on [DATE]', 'On [DATE], management at [FACILITY] failed to equitably distribute overtime in accordance with Article 8, Section 5 of the National Agreement. The Overtime Desired List (OTDL) was bypassed when [DESCRIPTION]. This is a continuing violation. The Union requests that the grievant be made whole for all overtime hours lost, including but not limited to payment at the overtime rate for [HOURS] hours.', true, 'nalc'),
('12/60 Hour Violation', 'Carrier worked over 12 hours in a day or 60 in a week', 'Article 8 - Hours of Work', '12/60 Hour Rule Violation', '12/60 hour rule violated on [DATE]', 'On [DATE], management at [FACILITY] violated Article 8, Section 5.G of the National Agreement by requiring/allowing the grievant to work in excess of 12 hours in a single day / 60 hours in a service week. The grievant worked [HOURS] hours. This is a continuing violation. The Union requests an additional 50% premium pay for all hours worked beyond the 12/60 limits, cease and desist, and that management be instructed on proper overtime procedures.', true, 'nalc'),
('Letter of Warning', 'Discipline issued without just cause', 'Article 16 - Discipline', 'Unwarranted Discipline - Letter of Warning', 'Unjust Letter of Warning issued on [DATE]', 'On [DATE], management at [FACILITY] issued the grievant a Letter of Warning for [REASON]. The Union contends this discipline was issued without just cause in violation of Article 16 of the National Agreement. [DETAILS]. The Union requests the Letter of Warning be rescinded and expunged from all records, and that the grievant be made whole for any losses suffered.', true, 'nalc'),
('NS Day Violation', 'Required to work on non-scheduled day improperly', 'Article 8 - Hours of Work', 'NS Day Violation', 'NS day scheduling violation on [DATE]', 'On [DATE], management at [FACILITY] violated Article 8 of the National Agreement by improperly scheduling/requiring the grievant to work on their non-scheduled day. [DETAILS]. Management failed to follow the proper procedures for non-scheduled day assignments. The Union requests the grievant be made whole and that management cease and desist from future violations.', true, 'nalc'),
('Route Seniority Bypass', 'Senior carrier bypassed for route assignment', 'Article 12 - Principles of Seniority', 'Seniority Bypass - Route Assignment', 'Seniority bypassed for route assignment on [DATE]', 'On [DATE], management at [FACILITY] violated Article 12, Section 3 of the National Agreement by failing to honor seniority in route assignments. The grievant, with a seniority date of [SENIORITY_DATE], was bypassed in favor of a junior carrier. [DETAILS]. The Union requests the grievant be assigned to the route in question and made whole for any losses.', true, 'nalc'),
('Safety Hazard', 'Unsafe working conditions or equipment', 'Article 14 - Safety and Health', 'Unsafe Working Conditions - Equipment', 'Unsafe conditions reported at [FACILITY] on [DATE]', 'On [DATE] at [FACILITY], the grievant encountered unsafe working conditions in violation of Article 14 of the National Agreement. Specifically, [DESCRIPTION]. Management was notified but failed to take corrective action. The Union requests immediate correction of the safety hazard, that the grievant be made whole for any injuries or losses, and that management comply with all applicable safety regulations.', true, 'nalc'),
('Annual Leave Denial', 'Annual leave request improperly denied', 'Article 10 - Leave', 'Annual Leave Denial', 'Annual leave improperly denied on [DATE]', 'On [DATE], management at [FACILITY] improperly denied the grievant''s request for annual leave in violation of Article 10 of the National Agreement. The grievant had submitted a timely request for leave on [LEAVE_DATE]. [DETAILS]. The Union requests the leave be approved and that the grievant be made whole for any losses suffered.', true, 'nalc'),
('Lunch Break Denial', 'M-41 lunch break not provided', 'Article 19 - Handbooks and Manuals', 'M-41 Violation - Lunch Break Denial', 'Lunch break denied on [DATE]', 'On [DATE], management at [FACILITY] violated the M-41 Handbook provisions incorporated by Article 19 of the National Agreement by failing to provide the grievant with their scheduled lunch break. [DETAILS]. The Union requests the grievant be compensated for the missed lunch period and that management cease and desist from future violations.', true, 'nalc'),
('Rural Schedule Violation', 'Improper scheduling of rural carrier', 'Article 8 - Hours of Work', 'Schedule Violation', 'Rural carrier schedule violation on [DATE]', 'On [DATE], management at [FACILITY] violated Article 8 of the National Agreement by improperly scheduling the grievant. [DETAILS]. The Union requests the grievant be made whole and that management follow proper scheduling procedures.', true, 'nrlca'),
('Rural Seniority Bypass', 'Senior rural carrier bypassed', 'Article 12 - Principles of Seniority', 'Seniority Bypass - Route Assignment', 'Rural carrier seniority bypassed on [DATE]', 'On [DATE], management at [FACILITY] violated Article 12 of the National Agreement by bypassing the grievant''s seniority in route assignments. [DETAILS]. The Union requests the grievant be assigned the route in question and made whole for any losses.', true, 'nrlca');

-- 4. Grievance Collaborators (sharing/collaboration)
CREATE TABLE IF NOT EXISTS grievance_collaborators (
    id SERIAL PRIMARY KEY,
    grievance_id INTEGER NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'lead')),
    added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grievance_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborators_grievance ON grievance_collaborators(grievance_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON grievance_collaborators(user_id);

-- 5. Push Subscriptions (for web push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
