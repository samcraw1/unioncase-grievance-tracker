# Union System Documentation

## Overview

The UnionCase grievance tracker now supports multiple USPS postal unions with proper craft-specific configurations. This system automatically determines which union a user belongs to based on their selected craft/position.

## Supported Unions

### 1. NALC (National Association of Letter Carriers)
- **Full Name**: National Association of Letter Carriers
- **Crafts**:
  - City Carrier
  - CCA (City Carrier Assistant)

### 2. APWU (American Postal Workers Union)
- **Full Name**: American Postal Workers Union
- **Crafts**:
  - Clerk
  - Maintenance
  - MVS (Motor Vehicle Service)

### 3. NRLCA (National Rural Letter Carriers Association)
- **Full Name**: National Rural Letter Carriers Association
- **Crafts**:
  - Rural Carrier
  - RCA (Rural Carrier Associate)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  role VARCHAR(20) NOT NULL,
  facility VARCHAR(255),
  craft VARCHAR(50),           -- New: Specific position
  union_type VARCHAR(50),      -- New: Auto-set based on craft
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT users_craft_check CHECK (craft IN (
    'city_carrier', 'cca',           -- NALC
    'rural_carrier', 'rca',          -- NRLCA
    'clerk', 'maintenance', 'mvs',   -- APWU
    'other'
  )),

  CONSTRAINT users_union_type_check CHECK (union_type IN ('nalc', 'apwu', 'nrlca'))
);
```

### Grievances Table
```sql
CREATE TABLE grievances (
  id SERIAL PRIMARY KEY,
  grievance_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  grievant_name VARCHAR(255) NOT NULL,
  facility VARCHAR(255) NOT NULL,
  craft VARCHAR(50),           -- Same craft values as users table
  incident_date DATE NOT NULL,
  -- ... other fields

  CONSTRAINT grievances_craft_check CHECK (craft IN (
    'city_carrier', 'cca',
    'rural_carrier', 'rca',
    'clerk', 'maintenance', 'mvs',
    'other'
  ))
);
```

## Backend Implementation

### Union Configuration (`server/src/utils/unionConfig.js`)

The backend utility provides:

**Functions**:
- `getUnionFromCraft(craft)` - Returns union type from craft
- `getUnionConfig(unionType)` - Returns full union configuration
- `getCraftLabel(craft)` - Returns human-readable craft name
- `getCraftsByUnion()` - Returns crafts grouped by union
- `isCraftValidForUnion(craft, unionType)` - Validates craft against union
- `getStepLabel(step, unionType)` - Returns union-specific step label
- `getTimeLimits(unionType)` - Returns union-specific time limits

**Configuration Example**:
```javascript
UNION_CONFIGS.nalc = {
  name: "NALC",
  fullName: "National Association of Letter Carriers",
  crafts: ['city_carrier', 'cca'],
  documents: [
    { id: 'm41', name: 'M-41 Handbook', url: '/docs/nalc/m41.pdf' },
    { id: 'elm', name: 'ELM', url: '/docs/nalc/elm.pdf' },
    // ...
  ],
  grievanceSteps: ['filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration'],
  stepLabels: {
    'filed': 'Filed',
    'informal_step_a': 'Informal Step A',
    // ...
  },
  terminology: {
    employee: 'Carrier',
    representative: 'Steward',
    chapter: 'Branch'
  },
  timeLimits: {
    informal_step_a: { days: 14, description: 'Discussion with supervisor' },
    formal_step_a: { days: 7, description: 'Formal written grievance' },
    // ...
  }
}
```

### Auto-Setting Union Type

In `authController.js`, when a user registers:

```javascript
import { getUnionFromCraft } from '../utils/unionConfig.js';

// During registration
const unionType = getUnionFromCraft(craft);  // Automatically determined

await pool.query(
  `INSERT INTO users (craft, union_type, ...) VALUES ($1, $2, ...)`,
  [craft, unionType, ...]
);
```

## Frontend Implementation

### Union Configuration (`client/src/utils/unionConfig.js`)

Provides the same functions as backend, plus:

**getCraftsGrouped()** - Returns craft options for grouped select:
```javascript
[
  {
    union: 'nalc',
    label: 'NALC - Letter Carriers',
    crafts: [
      { value: 'city_carrier', label: 'City Carrier' },
      { value: 'cca', label: 'CCA (City Carrier Assistant)' }
    ]
  },
  // ...
]
```

### Registration Page (`RegisterPage.jsx`)

Users select from a grouped dropdown:

```jsx
import { getCraftsGrouped } from '../utils/unionConfig';

<select name="craft" required>
  {getCraftsGrouped().map(group => (
    <optgroup key={group.union} label={group.label}>
      {group.crafts.map(craft => (
        <option key={craft.value} value={craft.value}>
          {craft.label}
        </option>
      ))}
    </optgroup>
  ))}
</select>
```

### New Grievance Page (`NewGrievancePage.jsx`)

Same grouped select implementation for craft selection.

## Migration Guide

### For Existing Databases

Run the migration script: `server/src/config/migrate_union_system.sql`

This script:
1. Adds `union_type` column to users table
2. Migrates existing craft data:
   - `carrier` → `city_carrier` (union_type: `nalc`)
   - `clerk` → `clerk` (union_type: `apwu`)
   - `maintenance` → `maintenance` (union_type: `apwu`)
   - `supervisor` → `other` (union_type: NULL)
3. Updates constraints to accept new craft values
4. Creates indexes for better performance

**To run migration**:
```bash
# Local development
psql -U your_user -d your_database -f server/src/config/migrate_union_system.sql

# Production (Railway)
# Run via Railway's database console or psql connection
```

### For New Deployments

Use the updated schema: `server/src/config/schema.sql`

This includes all new fields and constraints.

## Union-Specific Features

### Documents by Union

Each union has access to their specific contract documents:

```javascript
const config = getUnionConfig(user.unionType);
const documents = config.documents;  // Union-specific documents
```

### Grievance Steps

Different unions may have different grievance procedure steps:

```javascript
const config = getUnionConfig(user.unionType);
const steps = config.grievanceSteps;
const stepLabel = config.stepLabels['informal_step_a'];
```

### Time Limits

Each union has specific time limits for grievance steps:

```javascript
const timeLimits = getTimeLimits(user.unionType);
// {
//   informal_step_a: { days: 14, description: 'Discussion with supervisor' },
//   ...
// }
```

### Terminology

Union-specific terminology for UI:

```javascript
const config = getUnionConfig('nalc');
console.log(config.terminology.employee);  // "Carrier"
console.log(config.terminology.chapter);   // "Branch"

const config2 = getUnionConfig('apwu');
console.log(config2.terminology.employee);  // "Member"
console.log(config2.terminology.chapter);   // "Local"
```

## Testing

### Test User Registration

1. Register as City Carrier → Should auto-set union_type to 'nalc'
2. Register as Clerk → Should auto-set union_type to 'apwu'
3. Register as Rural Carrier → Should auto-set union_type to 'nrlca'

### Verify Database

```sql
-- Check user's union assignment
SELECT email, craft, union_type FROM users;

-- Verify grievances use new craft values
SELECT grievance_number, craft FROM grievances;
```

### Test Craft Selection

1. Registration page should show grouped dropdown with all unions
2. New grievance page should show grouped dropdown
3. Selecting a craft should work without errors
4. Backend should correctly identify union_type from craft

## Future Enhancements

### Potential Features

1. **Union-Specific Workflows**
   - Different approval processes per union
   - Union-specific forms or fields

2. **Union-Specific Reports**
   - Filter grievances by union
   - Union-specific analytics

3. **Multi-Union Support for Locals**
   - Some locals may represent multiple unions
   - Add local-level union configuration

4. **Union Documents Upload**
   - Allow admins to upload union-specific documents
   - Version control for contract updates

5. **Union-Specific Notifications**
   - Different notification templates per union
   - Union-specific email signatures

## Troubleshooting

### Common Issues

**Issue**: Users can't register
**Solution**: Check that craft values match the database constraint exactly (e.g., 'city_carrier' not 'carrier')

**Issue**: Union type is NULL
**Solution**: Ensure `getUnionFromCraft()` is being called in registration endpoint

**Issue**: Dropdown shows old craft values
**Solution**: Clear browser cache and ensure frontend is using `getCraftsGrouped()`

**Issue**: Migration fails
**Solution**: Check for existing data with old craft values, update manually if needed

### Debug Commands

```sql
-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass;

-- Find users with invalid craft values
SELECT * FROM users WHERE craft NOT IN (
  'city_carrier', 'cca', 'rural_carrier', 'rca',
  'clerk', 'maintenance', 'mvs', 'other'
);

-- Check union distribution
SELECT union_type, COUNT(*)
FROM users
GROUP BY union_type;
```

## API Response Examples

### Registration Response
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeId": "12345",
    "role": "employee",
    "facility": "Main Office",
    "craft": "city_carrier",
    "unionType": "nalc",
    "phone": "555-1234"
  }
}
```

### Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "craft": "clerk",
    "unionType": "apwu",
    ...
  }
}
```

---

**Last Updated**: 2025-11-23
**Version**: 2.0
**Status**: Production Ready
