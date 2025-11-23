# Hostel Management System (MERN) — Implementation Blueprint

This document is a complete blueprint to rebuild a full Hostel Management System. It is self-sufficient: using only this file, an engineer or AI can recreate the same product using React (or another frontend), Node/Express, and MongoDB (Mongoose). It covers features, roles, architecture, models, APIs, pages, state, configuration, data flows, and error handling.

Note on naming: “Complaints” are occasionally referred to as “Problems” in legacy code and seed scripts. In data models and APIs below, the canonical resource name is Complaint, with fields mapped from Problem where applicable (e.g., `problemTitle` → `title`).

## 1) Project Overview

A multi-role Hostel Management System for universities/colleges that digitizes and streamlines hostel operations.

- **Users/Roles**: Admin, Warden, Student
- **Core domains**: Hostels, Rooms, Allotments, Complaints, Fees/Invoices/Payments, Mess Menu, Attendance, Leaves, Visitors, Notices, Reports, File Uploads
- **Goals**:
  - Centralized occupancy management and room allocation
  - Track and resolve maintenance complaints
  - Generate and track invoices; process fee payments via payment gateways
  - Publish mess menus, notices; manage attendance and visitor logs
  - Provide dashboards and reports to admins/wardens

## 2) Key Features & Functionalities

- **Authentication & RBAC**: JWT-based auth with `admin`, `warden`, `student` roles; refresh token rotation; protected routes.
- **Student Portal**:
  - View dashboard: room assignment, notices, invoices, open complaints
  - Submit/view complaints with images; track status and messages
  - View mess menu; attendance history; request leave; manage visitors (pre-registration)
  - Pay invoices (Stripe/Razorpay placeholder)
- **Warden Portal**:
  - Manage complaints (triage → in_progress → resolved/rejected)
  - Room allocation and occupancy monitoring
  - Approve/reject leave requests; manage visitor logs
  - Publish/update mess menus and notices
  - Mark/bulk-mark attendance
- **Admin Portal**:
  - Manage hostels, rooms, users (create wardens/students)
  - Define fee plans; generate invoices; financial & operational dashboards
  - Global notices; reports export (CSV)
- **File Uploads**: Image/file uploads to cloud storage (Cloudinary suggested) for complaint images, notices, etc.
- **Search/Filter/Pagination**: Standardized across list endpoints.
- **Audit & Logs**: Timestamps for creation/updates; status transitions recorded.

## 3) Architecture Overview

- **Stack**: MERN
  - Frontend: React (Vite), React Router v6, Redux Toolkit, RTK Query, React Hook Form + Zod, Tailwind (or CSS-in-JS)
  - Backend: Node.js, Express.js, Mongoose, JWT, bcrypt, Cloudinary SDK, Stripe/Razorpay SDK
  - Database: MongoDB (Mongoose ODM)
- **Auth**: Access token (short-lived, Bearer in `Authorization`), Refresh token (httpOnly cookie), role-based middleware
- **Services**: RESTful API, optional webhooks for payments
- **Data flow**: Client → REST API → Mongoose Models → MongoDB → back to client via RTK Query

Suggested project structure (adapt to preference):

```text
hostel-management/
  backend/
    src/
      config/            # env, db connection, cloudinary, cors
      middleware/        # auth, rbac, error, validation
      models/            # mongoose schemas
      routes/            # express routers by domain
      controllers/       # request handlers
      services/          # domain logic, payment, uploads
      utils/             # helpers, pagination, response formatters
      index.js           # app bootstrap
    package.json
  frontend/
    src/
      app/               # store, providers
      routes/            # route elements, guards
      features/          # slices + components per domain (RTK/RTKQ)
      components/        # shared UI
      pages/             # page-level components
      services/          # rtk-query api definitions
      styles/            # tailwind.css or theme
      main.tsx           # entry
    index.html
    package.json
  .env.example
  README.md (this file)
```

## 4) Database Schema / Models (Mongoose)

Below are implementation-ready schema definitions. Adjust indexes as needed. All timestamps are UTC ISO strings. IDs are ObjectIds unless noted.

```js
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "warden", "student"],
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // bcrypt hash
    phone: String,
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    assignedRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

```js
// models/Hostel.js
const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hostel", hostelSchema);
```

```js
// models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    number: { type: String, required: true }, // e.g., "A-101"
    capacity: { type: Number, default: 2 },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true }
);

roomSchema.index({ hostelId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
```

```js
// models/Complaint.js  (maps legacy Problem fields)
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // problemTitle
    description: { type: String, required: true }, // problemDescription
    imageUrl: String, // problemImage
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentEmail: String, // optional, if legacy seeds used email as ID
    roomNo: String, // roomNo
    hostel: String, // hostel code/name
    category: {
      type: String,
      enum: ["electrical", "plumbing", "cleaning", "wifi", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "rejected"],
      default: "open",
    },
    studentStatus: {
      type: String,
      enum: ["active", "withdrawn"],
      default: "active",
    },
    timeCreated: { type: Date, default: () => new Date() },
    timeResolved: { type: Date },
    messages: [
      {
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["student", "warden", "admin"] },
        text: String,
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
```

```js
// models/FeePlan.js
const mongoose = require("mongoose");

const feePlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    frequency: {
      type: String,
      enum: ["monthly", "semester", "annual", "onetime"],
      required: true,
    },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeePlan", feePlanSchema);
```

```js
// models/Invoice.js
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "FeePlan" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    period: { type: String }, // e.g., 2025-01 or 2025-S1
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "open", "paid", "overdue", "void"],
      default: "open",
    },
    lineItems: [{ description: String, amount: Number }],
    gateway: { type: String, enum: ["stripe", "razorpay"] },
    gatewayInvoiceId: String,
  },
  { timestamps: true }
);

invoiceSchema.index({ studentId: 1, period: 1 }, { unique: false });

module.exports = mongoose.model("Invoice", invoiceSchema);
```

```js
// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created",
    },
    gateway: { type: String, enum: ["stripe", "razorpay"], required: true },
    gatewayPaymentId: String,
    gatewayOrderId: String, // Razorpay
    method: String,
    receipt: String,
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
```

```js
// models/MessMenu.js
const mongoose = require("mongoose");

const messMenuSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // or dayOfWeek
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    breakfast: [String],
    lunch: [String],
    snacks: [String],
    dinner: [String],
  },
  { timestamps: true }
);

messMenuSchema.index({ hostelId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MessMenu", messMenuSchema);
```

```js
// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    present: { type: Boolean, default: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // warden/admin
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
```

```js
// models/Leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
```

```js
// models/Visitor.js
const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    relation: String,
    idProof: String,
    inTime: { type: Date, required: true },
    outTime: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
```

```js
// models/Notice.js
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: {
      type: [String],
      enum: ["admin", "warden", "student"],
      default: ["student"],
    },
    attachments: [{ url: String, publicId: String, type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
```

```js
// models/FileUpload.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String, // Cloudinary
    type: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileUpload", fileSchema);
```

## 5) APIs & Backend Requests

### Conventions

- Base URL: `http://localhost:5000/api`
- Response success shape:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 123 }
}
```

- Error shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input.",
    "details": {},
    "fieldErrors": { "email": "Invalid email" }
  }
}
```

- Pagination & filter query params (applies to all list endpoints):
  - `page` (default 1), `limit` (default 20), `sortBy`, `sortOrder` (`asc|desc`)
  - Resource-specific filters (e.g., `status`, `hostelId`, `from`, `to`)
- Auth: `Authorization: Bearer <access_token>` where required; refresh with cookie.

### Auth

- POST `/auth/register` (admin creates users or public student self-register if enabled)

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Secret!23",
  "role": "student"
}
```

```json
{
  "success": true,
  "data": { "user": { "id": "...", "name": "Alice", "role": "student" } }
}
```

- POST `/auth/login`

```json
{ "email": "alice@example.com", "password": "Secret!23" }
```

```json
{
  "success": true,
  "data": { "accessToken": "...", "user": { "id": "...", "role": "student" } }
}
```

- POST `/auth/refresh` → returns new access token using httpOnly refresh cookie
- POST `/auth/logout` → clears refresh cookie
- POST `/auth/change-password` (auth)

### Users

- GET `/users` (admin) — list with filters `role`, `hostelId`
- POST `/users` (admin) — create user
- GET `/users/:id` (admin|self)
- PUT `/users/:id` (admin|self limited)
- DELETE `/users/:id` (admin)
- POST `/users/:id/assign-room` (admin|warden)
- POST `/users/:id/activate` or `/deactivate` (admin)

### Hostels & Rooms

- GET `/hostels` (admin|warden)
- POST `/hostels` (admin)
- GET `/hostels/:id`
- PUT `/hostels/:id` (admin)
- DELETE `/hostels/:id` (admin)

- GET `/hostels/:id/rooms` (admin|warden)
- POST `/hostels/:id/rooms` (admin|warden)
- GET `/rooms/:id`
- PUT `/rooms/:id` (admin|warden)
- DELETE `/rooms/:id` (admin)
- POST `/rooms/:id/allocate` (admin|warden) → `{ studentId }`
- POST `/rooms/:id/vacate` (admin|warden) → `{ studentId }`
- GET `/rooms/availability` (admin|warden) → query by `hostelId`, `capacity` etc.

### Complaints (Problems)

- GET `/complaints` (auth) — students see own by default; wardens see hostel; admins see all
  - Filters: `status`, `category`, `hostel`, `studentId`, `from`, `to`
- POST `/complaints` (student)

```json
{
  "title": "Broken fan",
  "description": "The fan in A-101 is not working.",
  "category": "electrical",
  "imageUrl": "https://...",
  "roomNo": "A-101",
  "hostel": "A"
}
```

- GET `/complaints/:id` (auth)
- PUT `/complaints/:id` (student can edit while `open`)
- POST `/complaints/:id/messages` (auth) → add message in thread
- POST `/complaints/:id/status` (warden|admin) → `{ status: 'in_progress'|'resolved'|'rejected' }`

### Fees, Invoices, Payments

- GET `/fee-plans` (admin|warden)
- POST `/fee-plans` (admin)
- PUT `/fee-plans/:id` (admin)
- DELETE `/fee-plans/:id` (admin)

- GET `/invoices` (auth) — students see own; admin sees all
- POST `/invoices` (admin) → create for a student or batch
- GET `/invoices/:id`
- POST `/invoices/:id/pay` (student) → creates gateway intent/session; returns gateway payload

```json
{
  "success": true,
  "data": {
    "gateway": "razorpay",
    "orderId": "order_ABC",
    "amount": 50000,
    "currency": "INR"
  }
}
```

- POST `/payments/webhook` (public) — verify signature; update Payment & Invoice
- GET `/payments/:id` (auth)

### Mess Menu

- GET `/mess-menu` (auth) — filters: `hostelId`, `date`
- POST `/mess-menu` (warden|admin)
- PUT `/mess-menu/:id` (warden|admin)
- DELETE `/mess-menu/:id` (admin)

### Attendance

- GET `/attendance` (auth) — filters: `studentId`, `from`, `to`
- POST `/attendance/mark` (warden|admin) → single or bulk

```json
{ "entries": [{ "studentId": "...", "date": "2025-11-04", "present": true }] }
```

### Leaves

- GET `/leaves` (auth)
- POST `/leaves` (student)
- PUT `/leaves/:id` (student while pending)
- POST `/leaves/:id/approve` (warden|admin)
- POST `/leaves/:id/reject` (warden|admin)

### Visitors

- GET `/visitors` (auth)
- POST `/visitors` (student) — pre-register visitor
- POST `/visitors/:id/check-in` (warden)
- POST `/visitors/:id/check-out` (warden)

### Notices

- GET `/notices` (auth) — filter by audience
- POST `/notices` (warden|admin)
- GET `/notices/:id`
- DELETE `/notices/:id` (admin)

### Uploads

- POST `/uploads` (auth) — server-side upload to Cloudinary; returns `{ url, publicId }`
- GET `/files/:id` (auth)
- DELETE `/files/:id` (auth)

### Reports

- GET `/reports/occupancy` (admin|warden)
- GET `/reports/complaints` (admin|warden)
- GET `/reports/finance` (admin)

## 6) Frontend Implementation Notes

### State Management

- Redux Toolkit slices per domain: `auth`, `users`, `hostels`, `rooms`, `complaints`, `fees`, `invoices`, `payments`, `mess`, `attendance`, `leaves`, `visitors`, `notices`.
- RTK Query services for API calls with base URL and auth header injection; automatic caching and invalidation.

### Routing & Guards

- React Router v6 with route-level guards:
  - `RequireAuth` checks access token; `RequireRole(['admin'])` for RBAC.
  - Refresh token flow: on 401, attempt `/auth/refresh`, then retry.

### Forms & Validation

- React Hook Form + Zod schemas; display field-level errors from server `fieldErrors` mapping.

### Conditional Rendering Rules

- Hide actions user cannot perform by role; disable edits on locked statuses (e.g., resolved complaints, approved leaves).
- Disable actions during loading or when invariants aren’t met (e.g., allocate room only if capacity available).

### UI Patterns

- Layout with persistent sidebar for role-specific navigation.
- Data tables with sort/filter/paginate; empty states; skeleton loading.
- Toasts and inline error banners for feedback.

## 7) Pages & Navigation

Below are canonical routes. Adjust exact paths as needed.

### Public

- `/login` — Email/password login; on success, set tokens and redirect by role.
- `/register` (optional) — Student self-register.

### Student

- `/student/dashboard` — cards for room, notices, invoices, open complaints.
- `/student/complaints` — list own complaints; filters; create button.
- `/student/complaints/new` — form with title, description, category, roomNo, hostel, image upload.
- `/student/complaints/:id` — detail, status timeline, messages thread.
- `/student/fees` — invoices list; pay action to gateway.
- `/student/attendance` — calendar/list view of presence.
- `/student/leaves` — list and request form; edit while pending.
- `/student/visitors` — pre-register visitors; status.
- `/student/notices` — list by audience.

### Warden

- `/warden/dashboard` — open complaints, occupancy, pending leaves.
- `/warden/complaints` — triage/update status; respond via messages.
- `/warden/rooms` — room availability; allocate/vacate.
- `/warden/attendance` — mark/bulk mark.
- `/warden/leaves` — approve/reject.
- `/warden/mess` — manage menu.
- `/warden/notices` — create/manage notices.
- `/warden/visitors` — check-in/out log.

### Admin

- `/admin/dashboard` — global KPIs: occupancy, complaints SLA, revenue.
- `/admin/hostels` — manage hostels.
- `/admin/rooms` — manage rooms.
- `/admin/users` — create wardens/students; activate/deactivate.
- `/admin/fees` — fee plans.
- `/admin/invoices` — batch generate; export.
- `/admin/notices` — global announcements.
- `/admin/reports` — occupancy/finance/complaints.

Each page uses RTK Query hooks to fetch data; mutations invalidate appropriate tags.

## 8) Environment Variables and Configuration

Create two files: `backend/.env` and `frontend/.env`.

### backend/.env

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostel_mgmt
APP_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Choose one payment gateway
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASS=strong-password
```

### frontend/.env

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

## 9) Setup & Installation Guide

### Prerequisites

- Node.js LTS (>=18), npm or yarn
- MongoDB running locally or remote Atlas URI

### Clone & Install

```bash
git clone <your_repo_url> hostel-management
cd hostel-management

# Backend
cd backend
npm install
cp .env.example .env   # or create as above

# Frontend
cd ../frontend
npm install
```

### Development

```bash
# Backend
cd backend
npm run dev            # e.g., nodemon src/index.js

# Frontend (new terminal)
cd frontend
npm run dev            # Vite at http://localhost:5173
```

### Production (example)

```bash
# Backend
cd backend
npm run build && npm run start

# Frontend
cd frontend
npm run build
npm run preview        # or serve build via reverse proxy
```

### Database Seeding

- To seed admin/complaints quickly, create a script (example aligns with legacy `seedData.js`):

```bash
node seedData.js       # inserts admin and/or complaints
```

If your legacy problem data uses `studentId` as email, migrate or map to `studentEmail` and backfill `studentId` from Users by email.

## 10) Error Handling & Edge Cases

- Centralized error middleware returns standardized error shape.
- Validation: request body validated via zod/yup or express-validator; return `fieldErrors`.
- Auth errors: 401 on missing/invalid token; 403 for role violations.
- Concurrency: room allocation checks capacity atomically; retry or report conflict.
- Idempotency: payment webhook handlers verify signatures and ignore duplicates by `gatewayPaymentId`.
- Files: on complaint deletion, optionally delete associated Cloudinary assets.
- Date ranges: validate `from <= to`; store UTC; render in user timezone client-side.
- Large lists: use pagination, server-side filtering, and indexes.

## 11) Data Flow Examples

### A) Complaint Lifecycle

1. Student submits complaint (open) with optional image upload → `POST /complaints`.
2. Warden triages → `POST /complaints/:id/status` to `in_progress`.
3. Warden/student exchange messages → `POST /complaints/:id/messages`.
4. Warden resolves → status `resolved`, set `timeResolved`.
5. Student can reopen (optional policy) or mark satisfied.

### B) Fee Payment Flow (Razorpay example)

1. Student opens invoice → hits `GET /invoices/:id`.
2. Student clicks pay → `POST /invoices/:id/pay` returns `{ orderId, amount }`.
3. Frontend invokes Razorpay checkout with provided keys.
4. On success, Razorpay posts webhook → `/payments/webhook` verifies signature.
5. Server marks `Payment` as `captured` and `Invoice` as `paid`; frontend refetches invoice via RTK Query.

## 12) Security, Auth & RBAC

- Access token short TTL; refresh token httpOnly + Secure in cookie; rotate on refresh.
- Passwords hashed with bcrypt (salt rounds 10+). Enforce strong policy.
- CORS: allow `APP_ORIGIN`; send credentials on refresh route.
- RBAC middleware sample:

```js
function requireAuth(req, res, next) {
  // verify access token, attach req.user
  next();
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res
        .status(403)
        .json({
          success: false,
          error: { code: "FORBIDDEN", message: "Insufficient role" },
        });
    next();
  };
}
```

## 13) Tech Stack & Libraries

- **Frontend**: React, Vite, React Router v6, Redux Toolkit, RTK Query, React Hook Form, Zod, Tailwind (or MUI/AntD)
- **Backend**: Node.js, Express, Mongoose, bcrypt, jsonwebtoken, cookie-parser, cors, multer, Cloudinary SDK, Stripe/Razorpay SDK
- **Tooling**: Nodemon, ESLint, Prettier, dotenv

## 14) Design Notes

- **Color scheme**: neutral slate with role accents
  - Primary: `#2563EB` (blue-600); Accent: `#16A34A` (green-600); Danger: `#DC2626`
  - Neutrals: slate-50..900; Background: `#0B1220` (dark) or `#F8FAFC` (light)
- **Typography**: Inter or Roboto; headings 600, body 400; 14–16px base
- **Components**: Card, Table, Modal/Drawer, Form, Tabs, Toast, EmptyState, Skeleton
- **Layout**: Responsive sidebar; mobile-first; consistent spacing scale (4/8)

## 15) Future Enhancements

- QR-based gate pass for visitors; scanned check-in/out
- PWA with offline caching for wardens to mark attendance without network
- SLA tracking for complaints; auto-escalation rules
- Multi-tenant for multiple campuses; custom domains
- SSO (SAML/OIDC) integration with university identity provider
- Data retention policies and archival

## 16) Re-creating in Another Stack

The same domain model and API contract can be implemented in any stack. Keep:

- The same resource names, fields, and endpoint shapes
- JWT auth, RBAC rules, pagination & filter semantics
- Error/success envelopes

If deviating, maintain the mapping table from legacy Problem → Complaint fields to avoid data loss.

## 17) Quick Start Checklist

- [ ] Create `backend/.env` and `frontend/.env` as above
- [ ] Run backend and frontend dev servers
- [ ] Seed admin user and sample complaints
- [ ] Login as admin, create hostel/rooms
- [ ] Create students and allocate rooms
- [ ] Submit and resolve a test complaint
- [ ] Create fee plan, generate invoice, test payment flow (sandbox)

---

Implementation note: legacy seeds named `Problem` can map to the `Complaint` schema above (`problemTitle`→`title`, `problemDescription`→`description`, `problemImage`→`imageUrl`, `studentId`→`studentEmail` or user `_id` if available, `roomNumber`→`roomNo`, status/category/time fields maintained). Ensure email-to-User lookup when migrating.
