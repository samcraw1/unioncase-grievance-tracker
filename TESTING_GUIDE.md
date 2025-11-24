# USPS Grievance Tracker - Testing Guide

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Environment Setup](#test-environment-setup)
4. [Backend Testing](#backend-testing)
5. [Frontend Testing](#frontend-testing)
6. [Integration Testing](#integration-testing)
7. [Manual Testing Procedures](#manual-testing-procedures)
8. [Test Data Management](#test-data-management)
9. [Continuous Integration](#continuous-integration)
10. [Common Issues and Solutions](#common-issues-and-solutions)

---

## Overview

This guide covers all aspects of testing the USPS Grievance Tracker application, from unit tests to end-to-end testing procedures.

### Testing Stack

**Backend:**
- Jest - Test framework
- Supertest - HTTP assertion library
- pg-mem - In-memory PostgreSQL for testing

**Frontend:**
- Vitest - Test framework (Vite-native)
- React Testing Library - Component testing
- Jest DOM - DOM matchers

---

## Testing Philosophy

### Testing Pyramid

```
       /\
      /E2E\      - Few, high-value end-to-end tests
     /------\
    /Integr.\   - Moderate integration tests
   /----------\
  /Unit Tests \  - Many fast unit tests
 /--------------\
```

### What to Test

1. **Critical Business Logic**
   - User authentication
   - Grievance creation and updates
   - Permission checks
   - Deadline calculations

2. **Edge Cases**
   - Empty data
   - Invalid inputs
   - Boundary conditions
   - Error scenarios

3. **User Workflows**
   - Complete grievance submission
   - Document upload
   - Status updates

### What NOT to Test

- Third-party libraries
- Framework internals
- Trivial getters/setters
- Static content

---

## Test Environment Setup

### Backend Test Environment

**Install dependencies:**
```bash
cd server
npm install --save-dev jest supertest @types/jest
```

**Configure Jest (package.json):**
```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/__tests__/**/*.test.js"]
  }
}
```

**Test database setup (.env.test):**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/grievance_tracker_test
JWT_SECRET=test-secret-key-for-testing-only
NODE_ENV=test
```

**Create test database:**
```bash
createdb grievance_tracker_test
psql -U postgres -d grievance_tracker_test -f server/src/config/schema.sql
```

### Frontend Test Environment

**Install dependencies:**
```bash
cd client
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configure Vitest (vite.config.js):**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

**Setup file (client/src/test/setup.js):**
```javascript
import '@testing-library/jest-dom';
```

**Add script to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Backend Testing

### Unit Tests

#### Testing Controllers

**server/src/__tests__/controllers/auth.test.js:**
```javascript
import request from 'supertest';
import app from '../../index.js';
import pool from '../../config/database.js';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Clear test database
    await pool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'employee',
        craft: 'city_carrier',
        facility: 'Main Office'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'employee'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'employee'
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: '12345',
          firstName: 'Test',
          lastName: 'User',
          role: 'employee'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

#### Testing Grievance Controllers

**server/src/__tests__/controllers/grievance.test.js:**
```javascript
import request from 'supertest';
import app from '../../index.js';
import pool from '../../config/database.js';

describe('Grievance Controller', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create test user and get auth token
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM grievances');

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'grievance@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'employee',
        craft: 'city_carrier',
        facility: 'Test Facility'
      });

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/grievances', () => {
    it('should create a new grievance', async () => {
      const grievanceData = {
        grievantName: 'Test User',
        facility: 'Test Facility',
        craft: 'city_carrier',
        incidentDate: '2024-01-15',
        contractArticle: 'Article 8.5.D',
        violationType: 'Overtime Violation',
        briefDescription: 'Forced OT without notice',
        detailedDescription: 'Management forced overtime without required 12-hour notice.'
      };

      const response = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(grievanceData);

      expect(response.status).toBe(201);
      expect(response.body.grievance).toHaveProperty('grievanceNumber');
      expect(response.body.grievance.currentStep).toBe('filed');
      expect(response.body.grievance.status).toBe('active');
    });

    it('should reject grievance without auth token', async () => {
      const response = await request(app)
        .post('/api/grievances')
        .send({ grievantName: 'Test' });

      expect(response.status).toBe(401);
    });

    it('should reject grievance with missing required fields', async () => {
      const response = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ grievantName: 'Test' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/grievances', () => {
    it('should get user grievances', async () => {
      const response = await request(app)
        .get('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('grievances');
      expect(Array.isArray(response.body.grievances)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should filter grievances by status', async () => {
      const response = await request(app)
        .get('/api/grievances?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.grievances.every(g => g.status === 'active')).toBe(true);
    });
  });

  describe('GET /api/grievances/:id', () => {
    it('should get grievance details', async () => {
      // First, get a grievance ID
      const listResponse = await request(app)
        .get('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`);

      const grievanceId = listResponse.body.grievances[0].id;

      const response = await request(app)
        .get(`/api/grievances/${grievanceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timeline');
      expect(response.body).toHaveProperty('deadlines');
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('notes');
    });

    it('should return 404 for non-existent grievance', async () => {
      const response = await request(app)
        .get('/api/grievances/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
```

### API Integration Tests

**server/src/__tests__/integration/grievanceFlow.test.js:**
```javascript
import request from 'supertest';
import app from '../../index.js';
import pool from '../../config/database.js';

describe('Complete Grievance Flow', () => {
  let authToken;
  let grievanceId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM grievances');

    // Register user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'flow@test.com',
        password: 'password123',
        firstName: 'Flow',
        lastName: 'Test',
        role: 'steward',
        craft: 'city_carrier',
        facility: 'Test Facility'
      });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should complete full grievance lifecycle', async () => {
    // 1. Create grievance
    const createResponse = await request(app)
      .post('/api/grievances')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        grievantName: 'Flow Test',
        facility: 'Test Facility',
        craft: 'city_carrier',
        incidentDate: '2024-01-15',
        contractArticle: 'Article 8',
        violationType: 'Test Violation',
        briefDescription: 'Test',
        detailedDescription: 'Full test description'
      });

    expect(createResponse.status).toBe(201);
    grievanceId = createResponse.body.grievance.id;

    // 2. Add note
    const noteResponse = await request(app)
      .post(`/api/grievances/${grievanceId}/notes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ noteText: 'Initial investigation note' });

    expect(noteResponse.status).toBe(201);

    // 3. Update step
    const updateResponse = await request(app)
      .patch(`/api/grievances/${grievanceId}/step`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        newStep: 'informal_step_a',
        notes: 'Meeting scheduled'
      });

    expect(updateResponse.status).toBe(200);

    // 4. Verify timeline
    const detailResponse = await request(app)
      .get(`/api/grievances/${grievanceId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.current_step).toBe('informal_step_a');
    expect(detailResponse.body.timeline.length).toBeGreaterThan(1);
    expect(detailResponse.body.notes.length).toBe(1);
  });
});
```

---

## Frontend Testing

### Component Tests

**client/src/__tests__/components/LoginPage.test.jsx:**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../../pages/LoginPage';
import * as api from '../../utils/api';

// Mock API
vi.mock('../../utils/api');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  it('renders login form', () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithRouter(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('calls login API on form submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { email: 'test@example.com' }
      }
    });

    api.default.post = mockLogin;

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('displays error message on failed login', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Invalid credentials' } } }
    });

    api.default.post = mockLogin;

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

**client/src/__tests__/components/GrievanceList.test.jsx:**
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../../pages/DashboardPage';
import * as api from '../../utils/api';

vi.mock('../../utils/api');

describe('DashboardPage', () => {
  it('displays loading state initially', () => {
    api.default.get = vi.fn(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays grievances after loading', async () => {
    const mockGrievances = [
      {
        id: 1,
        grievance_number: 'GRVNC-2024-0001',
        brief_description: 'Test grievance',
        current_step: 'filed',
        status: 'active'
      }
    ];

    api.default.get = vi.fn().mockResolvedValue({
      data: { grievances: mockGrievances, total: 1 }
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('GRVNC-2024-0001')).toBeInTheDocument();
      expect(screen.getByText('Test grievance')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    api.default.get = vi.fn().mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Integration Testing

### End-to-End Test Script

**Manual E2E test checklist:**

```
✓ User Registration
  - Navigate to /register
  - Fill in all required fields
  - Submit form
  - Verify redirect to dashboard
  - Verify user is logged in

✓ User Login
  - Navigate to /login
  - Enter credentials
  - Submit form
  - Verify redirect to dashboard
  - Verify token is stored

✓ Create Grievance
  - Navigate to /new-grievance
  - Fill in all required fields
  - Submit form
  - Verify success message
  - Verify grievance appears in list

✓ View Grievance Details
  - Click on grievance from list
  - Verify all details display correctly
  - Verify timeline shows initial entry
  - Verify deadlines are present

✓ Add Note
  - Open grievance details
  - Enter note text
  - Submit note
  - Verify note appears in list

✓ Upload Document
  - Open grievance details
  - Click upload button
  - Select file
  - Add label
  - Submit upload
  - Verify document appears in list

✓ Update Grievance Step
  - Open grievance details
  - Click update step
  - Select new step
  - Add notes
  - Submit update
  - Verify step updated
  - Verify timeline entry added

✓ Export to PDF
  - Open grievance details
  - Click "Export to PDF"
  - Verify PDF downloads
  - Verify PDF contains all information
```

---

## Manual Testing Procedures

### Fresh Installation Test

1. **Database Setup**
   ```bash
   createdb grievance_tracker_manual
   psql -U postgres -d grievance_tracker_manual -f schema.sql
   ```

2. **Start Servers**
   ```bash
   # Terminal 1
   cd server && npm run dev

   # Terminal 2
   cd client && npm run dev
   ```

3. **Registration Flow**
   - Open http://localhost:5173
   - Click "Register"
   - Fill form with valid data
   - Submit
   - Verify redirect to dashboard
   - Check database: `SELECT * FROM users;`

4. **Login Flow**
   - Logout
   - Click "Login"
   - Enter credentials
   - Verify login successful
   - Check token in localStorage

5. **Grievance Creation**
   - Click "New Grievance"
   - Fill all required fields
   - Submit
   - Verify grievance number generated
   - Check database: `SELECT * FROM grievances;`

6. **File Upload**
   - Open any grievance
   - Upload a test PDF
   - Verify file saved to uploads/
   - Check database: `SELECT * FROM documents;`

### Mobile Testing

1. **Responsive Design**
   - Open Chrome DevTools
   - Toggle device toolbar
   - Test on:
     - iPhone SE (375px)
     - iPhone 12 Pro (390px)
     - iPad (768px)
     - Desktop (1920px)

2. **PWA Installation**
   - Open on mobile device
   - Look for install prompt
   - Install app
   - Verify app works offline (basic functionality)
   - Test pull-to-refresh

3. **Touch Interactions**
   - Test all buttons are easily tappable (>44px)
   - Test form inputs on mobile keyboard
   - Test scrolling behavior

### Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performance Testing

1. **Lighthouse Audit**
   - Open Chrome DevTools
   - Run Lighthouse audit
   - Check scores:
     - Performance > 90
     - Accessibility > 95
     - Best Practices > 90
     - SEO > 90

2. **Load Testing**
   - Create 50+ test grievances
   - Test list pagination
   - Check query performance
   - Monitor memory usage

---

## Test Data Management

### Seed Data for Testing

**server/src/config/testSeed.js:**
```javascript
import pool from './database.js';
import bcrypt from 'bcryptjs';

export const seedTestData = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM users CASCADE');

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      { email: 'employee@test.com', role: 'employee', firstName: 'Test', lastName: 'Employee' },
      { email: 'steward@test.com', role: 'steward', firstName: 'Test', lastName: 'Steward' },
      { email: 'rep@test.com', role: 'representative', firstName: 'Test', lastName: 'Representative' }
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, facility, craft, union_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.email, passwordHash, user.firstName, user.lastName, user.role, 'Test Facility', 'city_carrier', 'nalc']
      );
    }

    await client.query('COMMIT');
    console.log('Test data seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding test data:', error);
  } finally {
    client.release();
  }
};
```

### Reset Test Database

```bash
# Drop and recreate test database
dropdb grievance_tracker_test
createdb grievance_tracker_test
psql -U postgres -d grievance_tracker_test -f server/src/config/schema.sql

# Seed test data
node server/src/config/testSeed.js
```

---

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/test.yml:**
```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: grievance_tracker_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd server && npm ci

      - name: Run database migrations
        run: psql postgresql://postgres:postgres@localhost:5432/grievance_tracker_test -f server/src/config/schema.sql

      - name: Run tests
        run: cd server && npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/grievance_tracker_test
          JWT_SECRET: test-secret-key

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd client && npm ci

      - name: Run tests
        run: cd client && npm test
```

---

## Common Issues and Solutions

### Test Database Connection Fails

**Problem:** Tests can't connect to PostgreSQL

**Solution:**
```bash
# Ensure PostgreSQL is running
pg_ctl status

# Check connection string
echo $DATABASE_URL

# Verify database exists
psql -l | grep grievance_tracker_test
```

### Tests Timeout

**Problem:** Tests hang or timeout

**Solution:**
```javascript
// Increase timeout in Jest
jest.setTimeout(10000);

// Ensure async operations complete
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

// Clean up after tests
afterEach(() => {
  cleanup();
});
```

### Flaky Tests

**Problem:** Tests pass sometimes, fail other times

**Solution:**
```javascript
// Avoid testing timing-dependent code
// Use waitFor instead of setTimeout

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Ensure proper cleanup
afterEach(() => {
  cleanup();
});
```

### Mock Data Issues

**Problem:** Tests fail due to stale mock data

**Solution:**
```javascript
beforeEach(async () => {
  // Clear database before each test
  await pool.query('DELETE FROM users CASCADE');
  await pool.query('DELETE FROM grievances CASCADE');
});
```

---

## Test Coverage Goals

Target coverage metrics:
- **Overall**: > 70%
- **Critical paths**: > 90%
- **Controllers**: > 80%
- **Components**: > 75%

Run coverage report:
```bash
# Backend
cd server && npm run test:coverage

# Frontend
cd client && npm run test:coverage
```

---

## Testing Checklist

Before merging code:
- [ ] All unit tests pass
- [ ] No failing integration tests
- [ ] Manual testing completed
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Code coverage maintained or improved
- [ ] No console errors in browser
- [ ] Mobile testing completed
- [ ] Cross-browser testing done

---

**Remember:** Good tests give you confidence to refactor and add features without breaking existing functionality!
