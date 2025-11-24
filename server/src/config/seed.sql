-- Seed file for test accounts
-- Password for all accounts: password123
-- Hashed with bcrypt (10 rounds): $2b$10$KHE5jaDi9HlBEC8ynpQB2eczgi6mvnwRcFYlGvOU/UHXCPw8IPYDu

-- Delete existing test accounts if they exist
DELETE FROM users WHERE email IN ('employee@test.com', 'steward@test.com', 'rep@test.com');

-- Insert test accounts
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  employee_id,
  role,
  facility,
  craft,
  union_type,
  phone
) VALUES
(
  'employee@test.com',
  '$2b$10$KHE5jaDi9HlBEC8ynpQB2eczgi6mvnwRcFYlGvOU/UHXCPw8IPYDu',
  'John',
  'Employee',
  'TEST001',
  'employee',
  'Test Facility',
  'city_carrier',
  'nalc',
  '555-0001'
),
(
  'steward@test.com',
  '$2b$10$KHE5jaDi9HlBEC8ynpQB2eczgi6mvnwRcFYlGvOU/UHXCPw8IPYDu',
  'Jane',
  'Steward',
  'TEST002',
  'steward',
  'Test Facility',
  'city_carrier',
  'nalc',
  '555-0002'
),
(
  'rep@test.com',
  '$2b$10$KHE5jaDi9HlBEC8ynpQB2eczgi6mvnwRcFYlGvOU/UHXCPw8IPYDu',
  'Bob',
  'Representative',
  'TEST003',
  'representative',
  'Test Facility',
  'clerk',
  'apwu',
  '555-0003'
);

SELECT 'Test accounts created successfully!' as status;
SELECT email, role, craft, union_type FROM users WHERE email LIKE '%test.com' ORDER BY role;
