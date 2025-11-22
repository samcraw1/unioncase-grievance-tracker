## USPS Grievance Tracker - Setup Guide

This guide will help you set up and run the USPS Grievance Tracker application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

---

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

Open your PostgreSQL client (pgAdmin, psql, etc.) and run:

```sql
CREATE DATABASE usps_grievance_tracker;
```

### 1.2 Run Database Schema

Navigate to the server config directory and execute the schema:

```bash
cd server/src/config
psql -U postgres -d usps_grievance_tracker -f database.sql
```

Or copy the contents of `server/src/config/database.sql` and run it in your PostgreSQL client.

---

## Step 2: Backend Setup

### 2.1 Navigate to Server Directory

```bash
cd server
```

### 2.2 Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2.3 Configure Environment Variables

Edit the `.env` file with your settings:

```env
PORT=5000
NODE_ENV=development

# Database - UPDATE THESE
DB_HOST=localhost
DB_PORT=5432
DB_NAME=usps_grievance_tracker
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT - CHANGE THIS SECRET
JWT_SECRET=change_this_to_a_random_secure_string_in_production
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Important:** Change `DB_PASSWORD` and `JWT_SECRET` to secure values!

### 2.4 Install Dependencies

```bash
npm install
```

### 2.5 Create Uploads Directory

```bash
mkdir uploads
```

---

## Step 3: Frontend Setup

### 3.1 Navigate to Client Directory

Open a new terminal window and navigate to the client directory:

```bash
cd client
```

### 3.2 Create Environment File (Optional)

Create a `.env` file in the client directory if your backend runs on a different port:

```env
VITE_API_URL=http://localhost:5000/api
```

The default is `http://localhost:5000/api`, so this step is optional if you're using the default port.

### 3.3 Install Dependencies

```bash
npm install
```

---

## Step 4: Running the Application

You'll need **two terminal windows** open - one for the backend and one for the frontend.

### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
Database connected successfully
```

### Terminal 2: Start Frontend Development Server

```bash
cd client
npm run dev
```

You should see something like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 5: Access the Application

Open your web browser and navigate to:

```
http://localhost:5173
```

You should see the login page of the USPS Grievance Tracker!

---

## Creating Your First Account

1. Click **"Create an account"** on the login page
2. Fill in the registration form:
   - Email and password (min 6 characters)
   - First and last name
   - Employee ID (optional)
   - Role (Employee, Steward, or Representative)
   - Facility name
   - Craft (Carrier, Clerk, Maintenance, etc.)
   - Phone (optional)
3. Click **"Create Account"**
4. You'll be automatically logged in and redirected to the dashboard

---

## Current Features Implemented

### Phase 1 (MVP Backend & Auth)
- ✅ User authentication (JWT-based)
- ✅ User registration and login
- ✅ Protected routes
- ✅ Database schema with all tables
- ✅ Login and registration pages
- ✅ Authentication context

### Next Steps to Build

The following pages need to be created:

#### 1. Dashboard Page (`src/pages/DashboardPage.jsx`)
- Stats cards (active grievances, pending deadlines, etc.)
- Grievance list table
- Search and filter functionality

#### 2. New Grievance Page (`src/pages/NewGrievancePage.jsx`)
- Multi-section form for creating grievances
- Date pickers
- File upload capability
- Witness and steward selection

#### 3. Grievance Detail Page (`src/pages/GrievanceDetailPage.jsx`)
- Timeline visualization
- Document uploads
- Notes section
- Deadline tracking
- Status updates

#### 4. Common Components
- Layout (header, navigation)
- Status badges
- Date formatters
- Loading states
- Error handling

---

## Troubleshooting

### Database Connection Errors

If you see "database connection failed":

1. Verify PostgreSQL is running:
   ```bash
   # On macOS
   brew services list

   # On Linux
   sudo systemctl status postgresql
   ```

2. Check your `.env` file credentials match your PostgreSQL setup

3. Test connection manually:
   ```bash
   psql -U postgres -d usps_grievance_tracker
   ```

### Port Already in Use

If port 5000 or 5173 is already in use:

**Backend:** Change `PORT` in `server/.env`

**Frontend:** Vite will automatically try the next available port (5174, 5175, etc.)

### Module Not Found Errors

If you see "Cannot find module" errors:

```bash
# In the affected directory (client or server)
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

If you see CORS errors in the browser console:

1. Verify `CLIENT_URL` in `server/.env` matches your frontend URL
2. Restart the backend server after changing `.env` files

---

## Project Structure

```
USPS Grievance App/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Tailwind CSS
│   └── package.json
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # (Future) Database models
│   │   ├── routes/          # API routes
│   │   └── index.js         # Server entry point
│   ├── uploads/             # Uploaded files
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Grievances
- `GET /api/grievances` - Get all grievances (protected)
- `POST /api/grievances` - Create new grievance (protected)
- `GET /api/grievances/:id` - Get grievance details (protected)
- `PATCH /api/grievances/:id/step` - Update grievance step (protected)
- `POST /api/grievances/:id/notes` - Add note to grievance (protected)
- `GET /api/grievances/statistics` - Get user statistics (protected)

### Documents
- `POST /api/documents/:grievanceId` - Upload document (protected)
- `GET /api/documents/:grievanceId` - Get all documents for grievance (protected)
- `DELETE /api/documents/:id` - Delete document (protected)

### Users
- `GET /api/users/stewards` - Get list of stewards (protected)

---

## Next Development Tasks

1. **Build Dashboard Page**
   - Display stats cards
   - Show grievance list table
   - Add search/filter functionality

2. **Build New Grievance Form**
   - Multi-step form or single page form
   - Contract article dropdown
   - Violation type selection
   - File upload integration

3. **Build Grievance Detail Page**
   - Timeline component
   - Document viewer
   - Notes section
   - Deadline countdown widget

4. **Add Layout Components**
   - Header with navigation
   - Sidebar (optional)
   - User profile dropdown
   - Mobile navigation

5. **Implement File Upload on Frontend**
   - Drag-and-drop zone
   - File preview
   - Progress indicators

6. **Add Notifications System**
   - Email notifications
   - Push notifications
   - Deadline reminders

7. **Build Analytics Dashboard**
   - Charts and graphs
   - Statistics by violation type
   - Win/loss tracking

8. **PWA Features**
   - Service worker
   - Offline capability
   - Install prompt

---

## Need Help?

If you encounter any issues during setup, check:

1. Node.js and PostgreSQL versions
2. Environment variable configuration
3. Database connection and schema
4. Port availability
5. npm install completed without errors

---

## Ready to Continue Development?

The foundational structure is now in place. The next step is to build out the core pages:

1. Dashboard (grievance list and stats)
2. New Grievance Form
3. Grievance Detail View

Let me know which page you'd like to tackle first!
