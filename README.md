# USPS Grievance Tracker

A Progressive Web Application for USPS employees and union stewards to track and manage workplace grievances through the formal grievance process.

## Overview

This application helps USPS employees and union stewards:
- Document and track workplace grievances
- Manage the multi-step grievance process (Informal Step A → Formal Step A → Step B → Arbitration)
- Store evidence and documentation
- Track deadlines and receive notifications
- Generate reports and analytics

## Quick Start

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.**

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Quick Setup

1. **Database Setup**
```bash
createdb usps_grievance_tracker
psql -U postgres -d usps_grievance_tracker -f server/src/config/database.sql
```

2. **Backend Setup**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials and JWT secret
npm run dev
```

3. **Frontend Setup** (in a new terminal)
```bash
cd client
npm install
npm run dev
```

4. **Access the app**
Open http://localhost:5173 in your browser

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database config & schema
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Authentication
│   │   ├── routes/         # API routes
│   │   └── index.js        # Server entry
│   ├── uploads/            # File uploads
│   └── package.json
│
└── README.md
```

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- date-fns for date handling

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- JWT authentication
- Multer for file uploads
- bcrypt for password hashing

## Current Progress

### ✅ Completed (Phase 1 - Foundation)
- Project structure and configuration
- Database schema with all tables
- User authentication system (JWT)
- Login and registration pages
- Protected routes
- API endpoints for auth and grievances
- File upload infrastructure

### 🚧 Next Steps
- Dashboard page with grievance list
- New grievance form
- Grievance detail view with timeline
- Common layout components
- Search and filter functionality

## Features

### User Management
- Role-based access (Employee, Steward, Representative)
- Secure JWT authentication
- User profiles with facility and craft information

### Grievance Tracking
- Create and manage grievances
- Multi-step process tracking
- Contract article violation tracking
- Witness and management documentation
- Steward assignment

### Documentation
- File upload support (photos, PDFs, documents)
- Document labeling and organization
- Secure file storage

### Timeline & Deadlines
- Visual timeline of grievance progression
- Automatic deadline calculation
- Notification system

### Analytics (Planned)
- Statistics dashboard
- Win/loss tracking
- Common violation analysis

## Database Schema

Key tables:
- `users` - User accounts and profiles
- `grievances` - Grievance cases
- `grievance_timeline` - Step-by-step history
- `deadlines` - Deadline tracking
- `documents` - File attachments
- `notes` - Case notes
- `notifications` - User notifications

See `server/src/config/database.sql` for complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user (protected)

### Grievances
- `GET /api/grievances` - List grievances (protected)
- `POST /api/grievances` - Create grievance (protected)
- `GET /api/grievances/:id` - Get grievance details (protected)
- `PATCH /api/grievances/:id/step` - Update step (protected)
- `POST /api/grievances/:id/notes` - Add note (protected)
- `GET /api/grievances/statistics` - Get stats (protected)

### Documents
- `POST /api/documents/:grievanceId` - Upload (protected)
- `GET /api/documents/:grievanceId` - List documents (protected)
- `DELETE /api/documents/:id` - Delete document (protected)

### Users
- `GET /api/users/stewards` - List stewards (protected)

## Development Roadmap

### Phase 1 (Week 1) ✅
- [x] User authentication
- [x] Database schema
- [x] Basic API structure
- [x] Login/Register pages

### Phase 2 (Week 2) 🚧
- [ ] Dashboard with grievance list
- [ ] New grievance form
- [ ] Grievance detail view
- [ ] File upload UI

### Phase 3 (Week 3)
- [ ] Timeline component
- [ ] Deadline notifications
- [ ] Search and filters
- [ ] Mobile responsiveness

### Phase 4 (Week 4)
- [ ] Analytics dashboard
- [ ] PDF export
- [ ] PWA features
- [ ] Offline support

## Contributing

This is a custom project for USPS union use. Contact the maintainer for contribution guidelines.

## License

MIT

## Support

For setup assistance, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).
