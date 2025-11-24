# USPS Grievance Tracker - API Documentation

## Base URL

- **Development**: `http://localhost:5001/api`
- **Production**: `https://your-railway-app.railway.app/api`

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": {
    "message": "Error description",
    "details": [ ... ] // Optional validation errors
  }
}
```

---

## Authentication Endpoints

### Register User

Creates a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "employeeId": "EMP12345",
  "role": "employee",
  "facility": "Main Post Office",
  "craft": "city_carrier",
  "phone": "555-0123"
}
```

**Field Validations:**
- `email` (required): Valid email address
- `password` (required): Minimum 6 characters
- `firstName` (required): Not empty
- `lastName` (required): Not empty
- `role` (required): One of: `employee`, `steward`, `representative`
- `craft` (optional): One of: `city_carrier`, `cca`, `rural_carrier`, `rca`, `clerk`, `maintenance`, `mvs`, `other`
- `employeeId` (optional): Can be null
- `facility` (optional): String
- `phone` (optional): String

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeId": "EMP12345",
    "role": "employee",
    "facility": "Main Post Office",
    "craft": "city_carrier",
    "unionType": "nalc",
    "phone": "555-0123"
  }
}
```

**Error Responses:**
- `400`: Validation error or user already exists
- `500`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "craft": "city_carrier",
    "facility": "Main Post Office"
  }'
```

---

### Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeId": "EMP12345",
    "role": "employee",
    "facility": "Main Post Office",
    "craft": "city_carrier",
    "unionType": "nalc",
    "phone": "555-0123"
  }
}
```

**Error Responses:**
- `401`: Invalid email or password
- `400`: Validation error
- `500`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### Get Profile

Retrieves the authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Success Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "employeeId": "EMP12345",
  "role": "employee",
  "facility": "Main Post Office",
  "craft": "city_carrier",
  "unionType": "nalc",
  "phone": "555-0123",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Grievance Endpoints

### Create Grievance

Creates a new grievance.

**Endpoint:** `POST /grievances`

**Authentication:** Required

**Request Body:**
```json
{
  "grievantName": "John Doe",
  "grievantEmployeeId": "EMP12345",
  "facility": "Main Post Office",
  "craft": "city_carrier",
  "incidentDate": "2024-01-15",
  "incidentTime": "14:30:00",
  "contractArticle": "Article 8.5.D",
  "violationType": "Overtime Violation",
  "briefDescription": "Forced overtime without proper notice",
  "detailedDescription": "Management forced me to work overtime on 01/15/2024 without providing the required 12-hour notice as specified in Article 8.5.D of the contract.",
  "managementRepresentative": "Jane Smith, Supervisor",
  "witnesses": ["Bob Johnson", "Alice Williams"],
  "stewardAssigned": 2
}
```

**Field Validations:**
- `grievantName` (required): Not empty
- `facility` (required): Not empty
- `incidentDate` (required): Valid date (YYYY-MM-DD)
- `contractArticle` (required): Not empty
- `violationType` (required): Not empty
- `briefDescription` (required): Not empty
- `detailedDescription` (required): Not empty
- `incidentTime` (optional): Valid time (HH:mm:ss)
- `grievantEmployeeId` (optional): String
- `managementRepresentative` (optional): String
- `witnesses` (optional): Array of strings
- `stewardAssigned` (optional): User ID of steward

**Success Response (201):**
```json
{
  "message": "Grievance created successfully",
  "grievance": {
    "id": 123,
    "grievanceNumber": "GRVNC-2024-0001",
    "currentStep": "filed",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/grievances \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grievantName": "John Doe",
    "facility": "Main Post Office",
    "incidentDate": "2024-01-15",
    "contractArticle": "Article 8.5.D",
    "violationType": "Overtime Violation",
    "briefDescription": "Forced overtime without proper notice",
    "detailedDescription": "Management forced overtime without 12-hour notice."
  }'
```

---

### Get Grievances

Retrieves a list of grievances with optional filtering.

**Endpoint:** `GET /grievances`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `resolved`, `settled`, `denied`, `withdrawn`)
- `currentStep` (optional): Filter by step (`filed`, `informal_step_a`, `formal_step_a`, `step_b`, `arbitration`, `resolved`, `settled`, `denied`)
- `facility` (optional): Filter by facility name
- `limit` (optional, default: 50): Number of results per page
- `offset` (optional, default: 0): Offset for pagination

**Access Control:**
- **Employees**: Can only see their own grievances
- **Stewards**: Can see their own grievances and ones assigned to them
- **Representatives**: Can see all grievances

**Success Response (200):**
```json
{
  "grievances": [
    {
      "id": 123,
      "grievance_number": "GRVNC-2024-0001",
      "user_id": 1,
      "grievant_name": "John Doe",
      "grievant_employee_id": "EMP12345",
      "facility": "Main Post Office",
      "craft": "city_carrier",
      "incident_date": "2024-01-15",
      "incident_time": "14:30:00",
      "contract_article": "Article 8.5.D",
      "violation_type": "Overtime Violation",
      "brief_description": "Forced overtime without proper notice",
      "detailed_description": "Management forced overtime...",
      "management_representative": "Jane Smith, Supervisor",
      "witnesses": ["Bob Johnson", "Alice Williams"],
      "steward_assigned": 2,
      "current_step": "filed",
      "status": "active",
      "resolution_date": null,
      "resolution_notes": null,
      "settlement_amount": null,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "filed_by_name": "John Doe",
      "steward_name": "Jane Smith",
      "document_count": 3
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X GET "http://localhost:5001/api/grievances?status=active&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Grievance by ID

Retrieves detailed information about a specific grievance.

**Endpoint:** `GET /grievances/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Grievance ID

**Success Response (200):**
```json
{
  "id": 123,
  "grievance_number": "GRVNC-2024-0001",
  "user_id": 1,
  "grievant_name": "John Doe",
  "facility": "Main Post Office",
  "current_step": "filed",
  "status": "active",
  "filed_by_name": "John Doe",
  "filed_by_email": "user@example.com",
  "steward_name": "Jane Smith",
  "steward_email": "steward@example.com",
  "timeline": [
    {
      "id": 1,
      "step": "filed",
      "step_date": "2024-01-15",
      "handler_id": 1,
      "handler_name": "John Doe",
      "notes": "Grievance filed",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "deadlines": [
    {
      "id": 1,
      "deadline_type": "informal_step_a",
      "deadline_date": "2024-01-29",
      "description": "Informal Step A must be scheduled",
      "is_completed": false,
      "completed_date": null,
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "documents": [
    {
      "id": 1,
      "file_name": "evidence.pdf",
      "label": "Supporting Evidence",
      "uploaded_by_name": "John Doe",
      "created_at": "2024-01-15T11:00:00.000Z"
    }
  ],
  "notes": [
    {
      "id": 1,
      "note_text": "Spoke with management, they denied any wrongdoing",
      "is_internal": false,
      "author_name": "Jane Smith",
      "created_at": "2024-01-16T09:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Access denied
- `404`: Grievance not found
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/grievances/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update Grievance Step

Updates the current step of a grievance and adds a timeline entry.

**Endpoint:** `PATCH /grievances/:id/step`

**Authentication:** Required

**URL Parameters:**
- `id`: Grievance ID

**Request Body:**
```json
{
  "newStep": "informal_step_a",
  "notes": "Informal meeting scheduled for 01/20/2024"
}
```

**Valid Steps:**
- `filed`
- `informal_step_a`
- `formal_step_a`
- `step_b`
- `arbitration`
- `resolved`
- `settled`
- `denied`

**Success Response (200):**
```json
{
  "message": "Grievance step updated successfully",
  "grievance": {
    "id": 123,
    "grievance_number": "GRVNC-2024-0001",
    "current_step": "informal_step_a",
    "updated_at": "2024-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `404`: Grievance not found
- `500`: Server error

**cURL Example:**
```bash
curl -X PATCH http://localhost:5001/api/grievances/123/step \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newStep": "informal_step_a",
    "notes": "Informal meeting scheduled"
  }'
```

---

### Add Note to Grievance

Adds a note to a grievance.

**Endpoint:** `POST /grievances/:id/notes`

**Authentication:** Required

**URL Parameters:**
- `id`: Grievance ID

**Request Body:**
```json
{
  "noteText": "Spoke with management representative today",
  "isInternal": false
}
```

**Fields:**
- `noteText` (required): The note content
- `isInternal` (optional, default: false): Whether the note is internal (visible only to stewards/representatives)

**Success Response (201):**
```json
{
  "message": "Note added successfully",
  "note": {
    "id": 1,
    "grievance_id": 123,
    "user_id": 1,
    "note_text": "Spoke with management representative today",
    "is_internal": false,
    "created_at": "2024-01-16T09:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/grievances/123/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "noteText": "Spoke with management representative today",
    "isInternal": false
  }'
```

---

### Get Statistics

Retrieves grievance statistics for the authenticated user.

**Endpoint:** `GET /grievances/statistics`

**Authentication:** Required

**Success Response (200):**
```json
{
  "activeGrievances": 5,
  "resolvedGrievances": 12,
  "settledGrievances": 8,
  "totalGrievances": 25,
  "filedCount": 2,
  "stepBCount": 1,
  "pendingDeadlines": 3
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/grievances/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Export Grievance to PDF

Exports a grievance and all its details to a PDF file.

**Endpoint:** `GET /grievances/:id/export-pdf`

**Authentication:** Required

**URL Parameters:**
- `id`: Grievance ID

**Success Response (200):**
- Returns a PDF file for download
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Grievance_GRVNC-2024-0001_*.pdf"`

**Error Responses:**
- `401`: Not authenticated
- `404`: Grievance not found
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/grievances/123/export-pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output grievance.pdf
```

---

## Document Endpoints

### Upload Document

Uploads a document to a grievance.

**Endpoint:** `POST /documents/:grievanceId`

**Authentication:** Required

**URL Parameters:**
- `grievanceId`: Grievance ID

**Request:**
- Content-Type: `multipart/form-data`
- Form fields:
  - `file` (required): The file to upload
  - `label` (optional): A label for the document
  - `description` (optional): Description of the document

**File Restrictions:**
- Max size: 10MB (configurable via `MAX_FILE_SIZE` env variable)
- Allowed types: JPEG, JPG, PNG, PDF, DOC, DOCX, TXT

**Success Response (201):**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 1,
    "grievance_id": 123,
    "uploaded_by": 1,
    "file_name": "evidence.pdf",
    "file_path": "uploads/1234567890-evidence.pdf",
    "file_type": "application/pdf",
    "file_size": 102400,
    "label": "Supporting Evidence",
    "description": "Photos of the incident",
    "created_at": "2024-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: No file uploaded or invalid file type
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/documents/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "label=Supporting Evidence" \
  -F "description=Photos of the incident"
```

---

### Get Documents for Grievance

Retrieves all documents for a specific grievance.

**Endpoint:** `GET /documents/:grievanceId`

**Authentication:** Required

**URL Parameters:**
- `grievanceId`: Grievance ID

**Success Response (200):**
```json
{
  "documents": [
    {
      "id": 1,
      "grievance_id": 123,
      "uploaded_by": 1,
      "file_name": "evidence.pdf",
      "file_path": "uploads/1234567890-evidence.pdf",
      "file_type": "application/pdf",
      "file_size": 102400,
      "label": "Supporting Evidence",
      "description": "Photos of the incident",
      "uploaded_by_name": "John Doe",
      "created_at": "2024-01-16T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/documents/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Delete Document

Deletes a document. Users can only delete documents they uploaded.

**Endpoint:** `DELETE /documents/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Document ID

**Success Response (200):**
```json
{
  "message": "Document deleted successfully"
}
```

**Error Responses:**
- `401`: Not authenticated
- `404`: Document not found or unauthorized
- `500`: Server error

**cURL Example:**
```bash
curl -X DELETE http://localhost:5001/api/documents/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## User Endpoints

### Get Stewards

Retrieves a list of all stewards and representatives for assignment purposes.

**Endpoint:** `GET /users/stewards`

**Authentication:** Required

**Success Response (200):**
```json
{
  "stewards": [
    {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "steward@example.com",
      "facility": "Main Post Office"
    },
    {
      "id": 3,
      "first_name": "Bob",
      "last_name": "Johnson",
      "email": "rep@example.com",
      "facility": "Downtown Station"
    }
  ]
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/users/stewards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Notification Preferences

Retrieves the authenticated user's notification preferences.

**Endpoint:** `GET /users/me/preferences`

**Authentication:** Required

**Success Response (200):**
```json
{
  "preferences": {
    "email_enabled": true,
    "new_grievance": true,
    "deadline_reminders": true,
    "status_updates": true,
    "new_notes": true,
    "grievance_resolved": true,
    "reminder_days": [3, 1, 0]
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found
- `500`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/users/me/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update Notification Preferences

Updates the authenticated user's notification preferences.

**Endpoint:** `PUT /users/me/preferences`

**Authentication:** Required

**Request Body:**
```json
{
  "preferences": {
    "email_enabled": true,
    "new_grievance": true,
    "deadline_reminders": true,
    "status_updates": false,
    "new_notes": true,
    "grievance_resolved": true,
    "reminder_days": [7, 3, 1]
  }
}
```

**Success Response (200):**
```json
{
  "message": "Notification preferences updated successfully",
  "preferences": {
    "email_enabled": true,
    "new_grievance": true,
    "deadline_reminders": true,
    "status_updates": false,
    "new_notes": true,
    "grievance_resolved": true,
    "reminder_days": [7, 3, 1]
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**cURL Example:**
```bash
curl -X PUT http://localhost:5001/api/users/me/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "email_enabled": true,
      "deadline_reminders": true,
      "reminder_days": [7, 3, 1]
    }
  }'
```

---

## Health Check

### Server Health

Checks if the server is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5001/api/health
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API Endpoints**: 100 requests per 15 minutes per IP
- **Authentication Endpoints** (login/register): 5 requests per 15 minutes per IP

When rate limit is exceeded, the API returns:

**Response (429):**
```json
{
  "error": {
    "message": "Too many requests from this IP, please try again later."
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (access denied) |
| 404 | Not found |
| 429 | Too many requests (rate limit exceeded) |
| 500 | Internal server error |

---

## Data Models

### User Roles
- `employee`: Regular USPS employee
- `steward`: Union steward
- `representative`: Union representative

### Crafts
- `city_carrier`: City Carrier
- `cca`: City Carrier Assistant
- `rural_carrier`: Rural Carrier
- `rca`: Rural Carrier Associate
- `clerk`: Clerk
- `maintenance`: Maintenance
- `mvs`: Motor Vehicle Service
- `other`: Other

### Union Types
- `nalc`: National Association of Letter Carriers (City Carriers)
- `nrlca`: National Rural Letter Carriers Association (Rural Carriers)
- `apwu`: American Postal Workers Union (Clerks, Maintenance)

### Grievance Steps
- `filed`: Initial filing
- `informal_step_a`: Informal discussion with supervisor
- `formal_step_a`: Formal Step A hearing
- `step_b`: Step B hearing
- `arbitration`: Arbitration
- `resolved`: Grievance resolved
- `settled`: Settlement reached
- `denied`: Grievance denied

### Grievance Status
- `active`: Currently being processed
- `resolved`: Resolved in favor of employee
- `settled`: Settlement reached
- `denied`: Denied by management
- `withdrawn`: Withdrawn by employee

---

## Best Practices

1. **Always include the Authorization header** for protected endpoints
2. **Handle rate limiting** appropriately in your client application
3. **Use pagination** when fetching large lists of grievances
4. **Validate data client-side** before sending to reduce unnecessary API calls
5. **Store JWT tokens securely** (never in localStorage for production)
6. **Handle errors gracefully** and display user-friendly messages
7. **Use appropriate HTTP methods** (GET for retrieval, POST for creation, PATCH for updates, DELETE for deletion)

---

## Support

For API support or to report issues, please contact your system administrator or file an issue in the project repository.
