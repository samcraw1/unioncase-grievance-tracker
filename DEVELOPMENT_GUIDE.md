# USPS Grievance Tracker - Development Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Local Development Setup](#local-development-setup)
5. [Database Development](#database-development)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Adding New Features](#adding-new-features)
9. [Code Style and Standards](#code-style-and-standards)
10. [Testing](#testing)
11. [Debugging](#debugging)
12. [Common Development Tasks](#common-development-tasks)
13. [Performance Optimization](#performance-optimization)
14. [Security Best Practices](#security-best-practices)
15. [Contribution Guidelines](#contribution-guidelines)

---

## Getting Started

### Prerequisites

Ensure you have installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Git**
- Code editor (VS Code recommended)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/usps-grievance-tracker.git
cd usps-grievance-tracker

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Set up environment variables (see below)
# Start database
# Run migrations
# Start development servers
```

---

## Project Structure

```
usps-grievance-tracker/
├── client/                    # Frontend React application
│   ├── public/               # Static files
│   │   ├── icons/           # PWA icons
│   │   └── manifest.json    # PWA manifest
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── DesktopSidebar.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   ├── InstallPrompt.jsx
│   │   │   ├── IOSInstallModal.jsx
│   │   │   └── PullToRefresh.jsx
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── NewGrievancePage.jsx
│   │   │   ├── GrievanceDetailPage.jsx
│   │   │   ├── ResourcesPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS config
│
├── server/                   # Backend Node.js/Express application
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── database.js  # Database connection
│   │   │   ├── schema.sql   # Database schema
│   │   │   ├── seed.js      # Seed data
│   │   │   └── initDb.js    # Database initialization
│   │   ├── controllers/     # Route controllers
│   │   │   ├── authController.js
│   │   │   └── grievanceController.js
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.js      # Authentication middleware
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js
│   │   │   ├── grievances.js
│   │   │   ├── users.js
│   │   │   └── documents.js
│   │   ├── services/        # Business logic services
│   │   │   ├── pdfService.js
│   │   │   ├── emailService.js
│   │   │   └── notificationScheduler.js
│   │   ├── utils/           # Utility functions
│   │   │   └── unionConfig.js
│   │   └── index.js         # Server entry point
│   ├── uploads/             # Uploaded files (not in git)
│   └── package.json
│
├── docs/                    # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── DEVELOPMENT_GUIDE.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## Technology Stack

### Frontend

- **React 19**: UI library
- **React Router 7**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **date-fns**: Date manipulation
- **Workbox**: Service worker for PWA

### Backend

- **Node.js**: Runtime environment
- **Express 5**: Web framework
- **PostgreSQL**: Database
- **pg**: PostgreSQL client for Node.js
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **PDFKit**: PDF generation
- **Nodemailer**: Email sending
- **express-validator**: Input validation
- **express-rate-limit**: Rate limiting
- **node-cron**: Job scheduling

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Auto-restart for development
- **Git**: Version control

---

## Local Development Setup

### 1. Environment Variables

**Backend (.env in /server):**

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/grievance_tracker

# Authentication
JWT_SECRET=your-dev-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=5001

# File Upload
MAX_FILE_SIZE=10485760

# Email (optional for local dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-dev-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=USPS Grievance Tracker Dev <dev@localhost>
```

**Frontend (.env in /client):**

```env
VITE_API_URL=http://localhost:5001/api
VITE_ENV=development
```

### 2. Database Setup

```bash
# Create database
createdb grievance_tracker

# Or using psql
psql -U postgres
CREATE DATABASE grievance_tracker;
\q

# Run schema
psql -U postgres -d grievance_tracker -f server/src/config/schema.sql

# (Optional) Seed with test data
cd server
npm run seed
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### 4. Verify Setup

- Backend: Visit http://localhost:5001/api/health
- Frontend: Visit http://localhost:5173
- Try registering a test account
- Create a test grievance

---

## Database Development

### Schema Modifications

When modifying the database schema:

1. **Edit schema.sql**
   ```sql
   -- Add new column
   ALTER TABLE grievances ADD COLUMN new_field VARCHAR(255);
   ```

2. **Create migration file** (for production)
   ```bash
   # server/src/config/migrations/002_add_new_field.sql
   ```

3. **Test locally**
   ```bash
   psql -U postgres -d grievance_tracker -f path/to/migration.sql
   ```

4. **Document changes** in commit message

### Database Queries

**Best Practices:**

1. **Use parameterized queries** (always!)
   ```javascript
   // Good
   await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

   // Bad - vulnerable to SQL injection
   await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
   ```

2. **Use transactions** for multi-step operations
   ```javascript
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     // ... multiple queries
     await client.query('COMMIT');
   } catch (error) {
     await client.query('ROLLBACK');
     throw error;
   } finally {
     client.release();
   }
   ```

3. **Add indexes** for frequently queried columns
   ```sql
   CREATE INDEX idx_grievances_user_id ON grievances(user_id);
   ```

### Seeding Data

Edit `server/src/config/seed.js` to add test data:

```javascript
// Add test users, grievances, etc.
const users = [
  {
    email: 'employee@test.com',
    password: 'password123',
    role: 'employee',
    // ...
  }
];
```

Run seeder:
```bash
cd server
npm run seed
```

---

## API Development

### Creating New Endpoints

#### 1. Define Route

**server/src/routes/example.js:**
```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getExamples, createExample } from '../controllers/exampleController.js';

const router = express.Router();

router.use(authenticate); // Require auth for all routes

router.get('/', getExamples);
router.post('/', createExample);

export default router;
```

#### 2. Create Controller

**server/src/controllers/exampleController.js:**
```javascript
import pool from '../config/database.js';

/**
 * Get all examples
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getExamples = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM examples');
    res.json({ examples: result.rows });
  } catch (error) {
    console.error('Get examples error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch examples' }
    });
  }
};

/**
 * Create new example
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createExample = async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      'INSERT INTO examples (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json({
      message: 'Example created successfully',
      example: result.rows[0]
    });
  } catch (error) {
    console.error('Create example error:', error);
    res.status(500).json({
      error: { message: 'Failed to create example' }
    });
  }
};
```

#### 3. Add Validation

```javascript
import { body } from 'express-validator';

const exampleValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
];

router.post('/', exampleValidation, createExample);
```

#### 4. Register Route

**server/src/index.js:**
```javascript
import exampleRoutes from './routes/example.js';
app.use('/api/examples', exampleRoutes);
```

#### 5. Test Endpoint

```bash
curl -X GET http://localhost:5001/api/examples \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Error Handling

Always use consistent error handling:

```javascript
try {
  // ... operation
  if (!resource) {
    return res.status(404).json({
      error: { message: 'Resource not found' }
    });
  }
  res.json({ resource });
} catch (error) {
  console.error('Error description:', error);
  res.status(500).json({
    error: { message: 'User-friendly error message' }
  });
}
```

---

## Frontend Development

### Creating New Components

#### Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ExampleComponent - Description of what this component does
 * @param {Object} props - Component props
 * @param {string} props.title - Title to display
 */
const ExampleComponent = ({ title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/examples');
      setData(response.data.examples);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {/* Component content */}
    </div>
  );
};

export default ExampleComponent;
```

### Making API Calls

**Best Practice - Create API utility:**

**client/src/utils/api.js:**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Usage in components:**
```javascript
import api from '../utils/api';

const fetchGrievances = async () => {
  try {
    const response = await api.get('/grievances');
    setGrievances(response.data.grievances);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Styling with Tailwind

```jsx
// Use consistent Tailwind patterns
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-6">
    Page Title
  </h1>

  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
    Action Button
  </button>

  <div className="bg-white rounded-lg shadow-md p-6">
    Card content
  </div>
</div>
```

### State Management

Use React Context for global state:

```jsx
// contexts/ExampleContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ExampleContext = createContext();

export const ExampleProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return (
    <ExampleContext.Provider value={{ state, updateState }}>
      {children}
    </ExampleContext.Provider>
  );
};

export const useExample = () => useContext(ExampleContext);
```

---

## Adding New Features

### Step-by-Step Process

1. **Plan the feature**
   - Write requirements
   - Design database changes if needed
   - Plan API endpoints
   - Sketch UI mockups

2. **Database changes**
   - Update schema.sql
   - Create migration if needed
   - Test locally

3. **Backend implementation**
   - Create/update routes
   - Add controllers
   - Add validation
   - Write tests
   - Document API endpoints

4. **Frontend implementation**
   - Create components
   - Add API calls
   - Implement UI
   - Add error handling
   - Test thoroughly

5. **Testing**
   - Unit tests
   - Integration tests
   - Manual testing
   - Edge cases

6. **Documentation**
   - Update API documentation
   - Update user guide
   - Add code comments
   - Update README if needed

7. **Code review**
   - Self-review
   - Create pull request
   - Address feedback

### Example: Adding a Comment System

**1. Database:**
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  grievance_id INTEGER REFERENCES grievances(id),
  user_id INTEGER REFERENCES users(id),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. Backend route:**
```javascript
router.post('/:id/comments',
  body('commentText').notEmpty(),
  addComment
);
```

**3. Frontend component:**
```jsx
const CommentForm = ({ grievanceId, onCommentAdded }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/grievances/${grievanceId}/comments`, {
      commentText: text
    });
    setText('');
    onCommentAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

## Code Style and Standards

### JavaScript/JSX Standards

```javascript
// Use ES6+ features
const result = items.map(item => item.value);

// Use destructuring
const { firstName, lastName } = user;

// Use arrow functions
const handleClick = () => {
  // ...
};

// Use template literals
const message = `Hello, ${name}!`;

// Use async/await instead of promises
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.jsx`)
- **Functions**: camelCase (`fetchData`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_SIZE`)
- **Files**: camelCase for utilities, PascalCase for components
- **Database**: snake_case (`user_id`, `created_at`)

### File Organization

```
// Group related imports
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Third-party imports
import axios from 'axios';
import { format } from 'date-fns';

// Local imports
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
```

### Comments and Documentation

```javascript
/**
 * Fetches grievances from the API with optional filtering
 * @param {Object} filters - Filter parameters
 * @param {string} filters.status - Status filter (active, resolved, etc.)
 * @param {number} filters.limit - Number of results to return
 * @returns {Promise<Array>} Array of grievance objects
 */
const fetchGrievances = async (filters = {}) => {
  // Implementation
};
```

---

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing documentation.

### Quick Test Examples

**Backend test:**
```javascript
describe('Auth Controller', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      // ...
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(userData.email);
  });
});
```

**Frontend test:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';

test('renders login form', () => {
  render(<LoginPage />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
```

---

## Debugging

### Backend Debugging

**1. Console logging:**
```javascript
console.log('Debug info:', { userId, grievanceId });
console.error('Error occurred:', error);
```

**2. VS Code debugger:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/server/src/index.js",
      "envFile": "${workspaceFolder}/server/.env"
    }
  ]
}
```

**3. Database queries:**
```javascript
const result = await pool.query(query, params);
console.log('Query result:', result.rows);
```

### Frontend Debugging

**1. React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state
- Track component re-renders

**2. Console logging:**
```javascript
console.log('Component rendered with props:', props);
useEffect(() => {
  console.log('Effect triggered, state:', state);
}, [state]);
```

**3. Network tab:**
- Inspect API requests/responses
- Check request headers and payloads
- Monitor response times

---

## Common Development Tasks

### Adding a New Database Table

1. Add to schema.sql
2. Create migration file
3. Run migration locally
4. Update seed data if needed
5. Create model/controller functions
6. Test thoroughly

### Adding a New Page

1. Create component in `client/src/pages/`
2. Add route in `App.jsx`
3. Add navigation link
4. Test routing
5. Add to mobile navigation if needed

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (careful!)
npm update

# Frontend
cd client && npm update

# Backend
cd server && npm update
```

### Running Database Migrations

```bash
# Development
psql -U postgres -d grievance_tracker -f migration.sql

# Production (Railway)
railway run psql $DATABASE_URL -f migration.sql
```

---

## Performance Optimization

### Backend Optimization

1. **Database indexing**
   ```sql
   CREATE INDEX idx_grievances_user_id ON grievances(user_id);
   ```

2. **Query optimization**
   ```javascript
   // Use LIMIT for large datasets
   const result = await pool.query(
     'SELECT * FROM grievances ORDER BY created_at DESC LIMIT $1',
     [50]
   );
   ```

3. **Caching** (future enhancement)
   ```javascript
   // Implement Redis caching for frequently accessed data
   ```

### Frontend Optimization

1. **Lazy loading**
   ```javascript
   const GrievanceDetail = React.lazy(() => import('./pages/GrievanceDetailPage'));
   ```

2. **Memoization**
   ```javascript
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
   const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
   ```

3. **Image optimization**
   ```javascript
   // Compress images before upload
   import imageCompression from 'browser-image-compression';
   const compressed = await imageCompression(file, options);
   ```

---

## Security Best Practices

1. **Never commit secrets**
   - Use .env files
   - Add .env to .gitignore

2. **Validate all inputs**
   ```javascript
   body('email').isEmail(),
   body('password').isLength({ min: 6 })
   ```

3. **Use parameterized queries**
   ```javascript
   pool.query('SELECT * FROM users WHERE id = $1', [id])
   ```

4. **Implement rate limiting**
   - Already configured in server/src/index.js

5. **Sanitize user input**
   - Use express-validator
   - Escape HTML in displayed content

6. **Secure file uploads**
   - Validate file types
   - Limit file sizes
   - Scan for malware (if possible)

---

## Contribution Guidelines

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

### Commit Message Format

```
feat: Add user notification preferences
fix: Resolve login redirect issue
docs: Update API documentation
refactor: Improve grievance query performance
test: Add tests for auth controller
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Self-review code
6. Create pull request
7. Address review feedback
8. Merge when approved

---

## Additional Resources

- **React Documentation**: https://react.dev
- **Express Documentation**: https://expressjs.com
- **PostgreSQL Documentation**: https://www.postgresql.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

**Happy coding!** If you have questions, check existing documentation or ask the team.
