# PPIAQ Website Enhancement Implementation Guide

## Implemented Features

### 1. ✅ Enhanced Membership Registration
- **New Fields**: Phone Number, Student ID
- **Rubric Link Integration**: For UQ, QUT, Griffith, JCU students
  - Users must click the Rubric link before submitting registration
  - Link tracks completion status
  - Validation ensures link was clicked

**Location**: `app/auth/register/page.tsx`

### 2. ✅ Email Notifications (Brevo Integration)
- **Setup**:
  - API Key configured in `.env.local`
  - Library: `@sendinblue/client`
  - Service file: `lib/email/brevo.ts`

- **Notification Types**:
  1. **Membership Application - Pending**: Sent when user registers
  2. **Membership Approved**: Sent when admin approves membership
  3. **Membership Rejected**: Sent when admin rejects membership (includes reason)
  4. **Newsletter Subscription**: Sent when user subscribes to newsletter

- **Integrated APIs**:
  - `POST /api/auth/register` → Sends pending notification
  - `POST /api/admin/users/approve` → Sends approval notification
  - `POST /api/admin/users/reject` → Sends rejection notification
  - `POST /api/newsletter/subscribe` → Sends subscription confirmation

### 3. ✅ Admin Members Management Page
**Location**: `app/admin/members/page.tsx`

Features:
- View all members in a comprehensive table
- Filter by status (All, Pending, Approved, Rejected)
- Import CSV/Excel files with member data
  - Format: First Name, Last Name, Email, Phone Number, Student ID, Membership Type, Status, Date Joined
- Export member data as CSV or Excel
- Unreject members (change from rejected back to pending)
- Summary statistics

**Supported Import Formats**:
- CSV (.csv)
- Excel (.xlsx, .xls)

### 4. ✅ Admin Edit Member Page
**Location**: `app/admin/members/[id]/edit/page.tsx`

Features:
- Edit all member information:
  - Basic info (First/Last name, Email, Phone, Student ID, Birth Date)
  - Educational info (Nationality, Education Level, University, Major)
  - Membership info (Type, Status)
  - Rejection reason (if rejected)
- Real-time form validation
- Secure updates with admin authentication

### 5. ✅ Admin Features - Backend APIs

#### Import Members
- **Endpoint**: `POST /api/admin/users/import`
- **Input**: FormData with CSV/Excel file
- **Output**: Import results (imported, updated, skipped count + error details)

#### Export Members
- **Endpoint**: `GET /api/admin/users/export?format=csv|excel`
- **Output**: File download (CSV or Excel format)
- **Fields Exported**: All user data including education, membership, and audit information

#### Unreject User
- **Endpoint**: `POST /api/admin/users/unreject`
- **Input**: `{ userId: string }`
- **Action**: Changes status from rejected back to pending

#### Update User
- **Endpoint**: `PUT /api/admin/users/[id]`
- **Input**: User object with fields to update
- **Action**: Updates member information

### 6. ✅ Enhanced Database Schema
**File**: `lib/database/db.ts`

New Fields:
- `phoneNumber?: string`
- `studentId?: string`
- `dateJoined?: Date`

Updated Functions:
- `registerUser()` - Now accepts phoneNumber and studentId
- `unrejectUser()` - Change status back to pending
- `updateUser()` - Generic update function
- `getUserById()` - Fetch specific user

---

## Testing Instructions

### 1. Start the Development Server
```bash
npm run dev
```

Server will run on: `http://localhost:3000`

### 2. Test Email Notifications

Use the test endpoint to send test emails:

```bash
# Test Membership Pending Email
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership-pending",
    "email": "andikapramudya30@gmail.com"
  }'

# Test Membership Approved Email
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership-approved",
    "email": "andikapramudya30@gmail.com"
  }'

# Test Membership Rejected Email
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership-rejected",
    "email": "andikapramudya30@gmail.com"
  }'

# Test Newsletter Subscription Email
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "newsletter",
    "email": "andikapramudya30@gmail.com"
  }'
```

Or use the provided test script:

```bash
node scripts/test-emails.js
```

### 3. Test Admin Features

#### Access Admin Dashboard
- URL: `http://localhost:3000/admin/dashboard`
- Login with: `admin@ppiaq.org` / `Admin123!`

#### Access Members Management
- URL: `http://localhost:3000/admin/members`
- Features:
  - View all members
  - Filter by status
  - Upload CSV/Excel files
  - Export data
  - Edit members
  - Unreject members

#### Test Import
1. Go to `/admin/members`
2. Click "📤 Import CSV/Excel"
3. Select a CSV or Excel file with proper format
4. Review import results

Example CSV format:
```
First Name,Last Name,Email,Phone Number,Student ID,Membership Type,Status,Date Joined
Andika,Pramudya,andika@example.com,+61412345678,12345,ordinary,pending,2026-02-01
```

#### Test Export
1. Go to `/admin/members`
2. Click "📥 Export to CSV" or "📥 Export to Excel"
3. File will download with all member data

### 4. Test Membership Registration

#### New Fields
1. Go to `/auth/register`
2. Fill in all fields including:
   - Phone Number (new)
   - Student ID (new)
3. For UQ/QUT/Griffith/JCU students:
   - Select your university
   - Click the "Open Rubric Campus" button
   - After clicking, a checkmark will appear
   - System allows continuation

### 5. Test Admin Approval/Rejection

1. Access Admin Dashboard: `/admin/dashboard`
2. Go to "Pending" tab
3. Click on a pending member
4. Approve or Reject
5. Member receives email notification with status change

---

## Environment Variables

Make sure `.env.local` is configured:

```env
BREVO_API_KEY=your-brevo-api-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## File Structure

### New Files Created
```
app/
├── api/
│   ├── admin/users/
│   │   ├── unreject/route.ts      (Unreject user endpoint)
│   │   ├── [id]/route.ts          (Get/Update user endpoint)
│   │   ├── import/route.ts        (Import members endpoint)
│   │   └── export/route.ts        (Export members endpoint)
│   ├── test/
│   │   └── send-email/route.ts    (Test email endpoint)
├── admin/
│   └── members/
│       ├── page.tsx               (Members list page)
│       └── [id]/
│           └── edit/page.tsx      (Edit member page)

lib/
├── email/
│   └── brevo.ts                   (Brevo email service)

.env.local                          (Environment variables)

IMPLEMENTATION_GUIDE.md            (This file)
```

### Modified Files
```
lib/database/db.ts                 (Updated schema & functions)
app/auth/register/page.tsx         (Added phone, studentId, Rubric link)
app/api/auth/register/route.ts     (Added email notification)
app/api/admin/users/approve/route.ts (Added email notification)
app/api/admin/users/reject/route.ts  (Added email notification)
app/api/newsletter/subscribe/route.ts (Added email notification)
```

---

## API Summary

### Admin APIs (Protected)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/users?status=pending` | Get pending members |
| GET | `/api/admin/users?status=approved` | Get approved members |
| GET | `/api/admin/users?status=rejected` | Get rejected members |
| GET | `/api/admin/users/[id]` | Get member by ID |
| PUT | `/api/admin/users/[id]` | Update member |
| POST | `/api/admin/users/approve` | Approve member |
| POST | `/api/admin/users/reject` | Reject member |
| POST | `/api/admin/users/unreject` | Unreject member |
| POST | `/api/admin/users/import` | Import members |
| GET | `/api/admin/users/export` | Export members |

### Public APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new member |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |

### Test APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/test/send-email` | Send test email |

---

## Notes

- All email notifications use Brevo's transactional email API
- Admin pages are protected and require admin authentication
- Import/Export operations support CSV and Excel formats
- Rubric link detection is client-side (tracks click event)
- All timestamps are ISO format
- Password hashing uses bcryptjs
- Sessions use httpOnly cookies

---

## Support

For issues or questions about these features, please contact the development team.
