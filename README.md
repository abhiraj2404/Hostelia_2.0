# Hostelia - Multi-Tenant Hostel Management System

A full-stack, multi-tenant (SaaS) hostel management web application built for efficient administration of hostel operations including college onboarding, student management, fee tracking, mess management, transit records, complaints handling, announcements, and real-time notifications.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account (for file/image uploads)
- Resend account (for transactional emails)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.sample`:

   ```env
   # JWT Secret Key - Used for signing and verifying JWT tokens
   JWT_SECRET=your-secret-key-here

   # Database Connection
   MONGO_URI=mongodb://localhost:27017/hostelia

   # Server Port
   PORT=3000

   # Frontend URL for CORS (comma-separated for multiple origins)
   FRONTEND_URL=http://localhost:5173

   # Node Environment
   NODE_ENV=development

   # Email Configuration (Resend API)
   EMAIL_USER=your-sender@example.com
   EMAIL_PASS=re_your_resend_api_key

   # Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Optionally create a `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### Running Both Simultaneously

Open two terminals and run the backend and frontend servers in parallel, or use a process manager.

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite 7** - Build tool
- **Redux Toolkit** - State management (auth, complaints, dashboard, fees, users slices)
- **React Router v7** - Routing with route guards
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible component primitives (Dialog, Select, Dropdown, Avatar, etc.)
- **React Hook Form + Zod** - Form handling & validation
- **Recharts** - Dashboard analytics charts
- **Axios** - API client with interceptors
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend

- **Node.js** with Express 5 (ES Modules)
- **MongoDB** with Mongoose ODM
- **JWT** - Cookie-based authentication
- **Bcrypt** - Password hashing
- **Resend** - Transactional email service (OTP, reminders, credentials)
- **Cloudinary** - File/image uploads (memory storage + stream upload)
- **Multer** - Multipart form-data handling
- **Zod** - Request validation
- **Winston** - Structured logging with daily rotation

## Architecture

### Multi-Tenant Design

Hostelia follows a multi-tenant SaaS architecture:

- **College** is the top-level tenant — each college registers independently
- **Hostels** and **Messes** belong to a College
- **Users** (students, wardens, collegeAdmins) belong to a College
- All data is scoped by `collegeId` for tenant isolation

### User Roles

| Role           | Description                                       |
| -------------- | ------------------------------------------------- |
| `student`      | Default role. Can submit complaints, fees, transit |
| `warden`       | Manages a specific hostel. Max 2 per hostel        |
| `collegeAdmin` | Full access to all college data and management     |

### Authentication Flow

1. **College Registration** → Creates College + Hostels + Messes + Admin user
2. **Student Signup** → OTP email verification → Account creation + FeeSubmission record
3. **Login** → JWT token set as `httpOnly` cookie (7-day expiry)
4. **Warden Appointment** → Admin creates warden account, credentials emailed

## Features

- **College Onboarding** - SaaS-style college registration with hostels, messes, and admin setup
- **User Authentication** - JWT cookie-based login/signup with OTP email verification
- **Role-based Access** - Student, Warden, and CollegeAdmin roles with granular permissions
- **Dashboard & Analytics** - Role-specific dashboards with visual statistics (Recharts)
- **User Management** - CRUD operations for students and wardens
- **Warden Management** - Warden appointment with hostel assignment (max 2 per hostel)
- **Complaints System** - Submit, track, and resolve complaints with image uploads, comments, and dual-status verification
- **Mess Management** - Weekly menu CRUD per mess, meal feedback with ratings
- **Feedback System** - Student meal feedback collection with analytics
- **Transit Management** - Track student entry/exit with alternation validation
- **Announcements** - Post announcements with file attachments (images, PDFs, docs) and comments
- **Fee Management** - Hostel/mess fee document uploads, approval workflow, single & bulk email reminders
- **Real-time Notifications** - SSE-based push notifications with in-app notification center
- **Email Notifications** - Transactional emails via Resend (OTP, credentials, fee reminders, account deletion)
- **Contact System** - Public contact form with forwarding to college admins

## Project Structure

```
Hostelia_2.0/
├── backend/
│   ├── config/              # Database & Cloudinary configuration
│   │   ├── cloudinary.js    # Cloudinary setup, multer uploaders, upload helpers
│   │   └── database.js      # MongoDB connection
│   ├── controllers/         # Route handlers / business logic
│   │   ├── announcement.controller.js
│   │   ├── auth.controller.js
│   │   ├── college.controller.js
│   │   ├── contact.controller.js
│   │   ├── feeSubmission.controller.js
│   │   ├── hostel.controller.js
│   │   ├── mess.controller.js
│   │   ├── notification.controller.js
│   │   ├── problem.controller.js
│   │   ├── transit.controller.js
│   │   ├── user.controller.js
│   │   └── warden.controller.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.js           # JWT verification
│   │   ├── domainValidation.middleware.js  # Email domain ↔ college validation
│   │   ├── logger.js                    # Winston logger setup
│   │   ├── multerErrorHandler.js        # File upload error handling
│   │   └── roles.js                     # Role-based access & scoped filters
│   ├── models/               # Mongoose schemas
│   │   ├── announcement.model.js
│   │   ├── college.model.js
│   │   ├── feeSubmission.model.js
│   │   ├── feedback.model.js
│   │   ├── hostel.model.js
│   │   ├── menu.model.js
│   │   ├── mess.model.js
│   │   ├── notification.model.js
│   │   ├── otp.model.js
│   │   ├── problem.model.js
│   │   ├── transit.model.js
│   │   └── user.model.js
│   ├── routes/               # API route definitions
│   │   ├── index.js          # Main router aggregator
│   │   ├── announcement.routes.js
│   │   ├── auth.routes.js
│   │   ├── college.routes.js
│   │   ├── contact.routes.js
│   │   ├── feeSubmission.routes.js
│   │   ├── hostel.routes.js
│   │   ├── mess.routes.js
│   │   ├── notification.routes.js
│   │   ├── problem.routes.js
│   │   ├── transit.routes.js
│   │   ├── user.routes.js
│   │   └── warden.routes.js
│   ├── script/               # Utility scripts
│   │   ├── addAdmin.js       # Create admin user
│   │   ├── removeUser.js     # Remove user script
│   │   └── seedBH3Students.js  # Seed test students
│   ├── utils/                # Utility functions
│   │   ├── email-client.js   # Resend email client
│   │   └── notificationService.js  # SSE notification service
│   └── index.js              # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── announcements/   # Announcement components
│   │   │   ├── complaints/      # Complaint components
│   │   │   ├── dashboard/       # Dashboard widgets & charts
│   │   │   ├── fees/            # Fee management components
│   │   │   ├── home/            # Home page components
│   │   │   ├── layout/          # Layout (Sidebar, Footer)
│   │   │   ├── mess/            # Mess menu & feedback
│   │   │   ├── notifications/   # Notification center
│   │   │   ├── student-detail/  # Student detail view
│   │   │   ├── transit/         # Transit components
│   │   │   └── ui/              # Reusable UI primitives
│   │   ├── features/         # Redux slices
│   │   │   ├── auth/            # Authentication state
│   │   │   ├── complaints/      # Complaints state
│   │   │   ├── dashboard/       # Dashboard analytics state
│   │   │   ├── fees/            # Fee management state
│   │   │   └── users/           # User management state
│   │   ├── lib/              # API client & utilities
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Route definitions & guards
│   │   ├── store.ts          # Redux store configuration
│   │   ├── hooks.ts          # Typed Redux hooks
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Helper functions
│   └── package.json
│
├── docs/                     # Project documentation
│   ├── api_reference.md
│   ├── backend_documentation.md
│   └── frontend_documentation.md
│
└── .github/workflows/        # CI/CD pipelines
```

## API Endpoints

| Module         | Base Route            | Auth Required |
| -------------- | --------------------- | ------------- |
| Authentication | `/api/auth`           | No*           |
| Users          | `/api/user`           | Yes           |
| College        | `/api/college`        | No            |
| Hostels        | `/api/hostel`         | Yes           |
| Complaints     | `/api/problem`        | Yes           |
| Mess & Menu    | `/api/mess`           | Yes           |
| Transit        | `/api/transit`        | Yes           |
| Announcements  | `/api/announcement`   | Yes           |
| Fees           | `/api/fee`            | Yes           |
| Notifications  | `/api/notifications`  | Yes           |
| Wardens        | `/api/warden`         | Yes           |
| Contact        | `/api/contact`        | No            |

> \* Auth routes: login and OTP endpoints are public; logout requires auth.

## Frontend Routes

| Path                | Page                 | Access          |
| ------------------- | -------------------- | --------------- |
| `/`                 | Home                 | Public          |
| `/about`            | About                | Public          |
| `/contact`          | Contact              | Public          |
| `/login`            | Login                | Guests only     |
| `/signup`           | Signup               | Guests only     |
| `/dashboard`        | Dashboard            | Authenticated   |
| `/complaints`       | Complaints List      | Authenticated   |
| `/complaints/new`   | Create Complaint     | Students only   |
| `/complaints/:id`   | Complaint Detail     | Authenticated   |
| `/mess`             | Mess Menu & Feedback | Public          |
| `/announcements`    | Announcements        | Public          |
| `/announcements/:id`| Announcement Detail  | Public          |
| `/transit`          | Transit Records      | Public          |
| `/fees`             | Fee Management       | Authenticated   |
| `/users`            | User Management      | Authenticated   |
| `/student/:userId`  | Student Detail       | Authenticated   |
| `/college`          | College Management   | Authenticated   |

---

## Group 52 - Team Contributions

### Rohan Dubey

**Roll No:** S20230010207

- Dashboard & Analytics
- Authorization System

### Saurav Singh

**Roll No:** S20230010219

- User Management
- Warden Management
- Complaints Module

### Ashutosh Sinha

**Roll No:** S20230010027

- Mess Management
- Feedback System
- Transit Module

### Abhiraj Singh Chauhan

**Roll No:** S20230010002

- Announcements
- Fee Management
- Project Setup & Backend Architecture
- Email & Real-time Notification System

### C. Venkata Sivaji

**Roll No:** S20230010063

- Contact Page
- About Page
- Homepage

---

**Hostelia** - Simplifying hostel management for students and administrators.
