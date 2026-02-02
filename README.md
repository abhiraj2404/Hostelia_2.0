# Hostelia - Hostel Management System

A full-stack hostel management web application built for efficient administration of hostel operations including student management, fee tracking, mess management, transit records, complaints handling, and announcements.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

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
   JWT_SECRET=your-secret-key-here
   MONGO_URI=mongodb://localhost:27017/hostelia
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development

   # Email Configuration (for OTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

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

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### Running Both Simultaneously

Open two terminals and run the backend and frontend servers in parallel, or use a process manager.

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v7** - Routing
- **Tailwind CSS v4** - Styling
- **Shadcn/ui** (Radix UI) - Component library
- **React Hook Form + Zod** - Form handling & validation
- **Recharts** - Dashboard analytics charts
- **Axios** - API client

### Backend

- **Node.js** with Express 5
- **MongoDB** with Mongoose ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer/Resend** - Email services (OTP)
- **Cloudinary** - File/image uploads
- **Zod** - Request validation
- **Winston** - Logging

## Features

- **User Authentication** - JWT-based login/signup with OTP verification
- **Role-based Access** - Student, Warden, and Admin roles
- **Dashboard & Analytics** - Visual statistics and insights
- **User Management** - CRUD operations for students
- **Warden Management** - Warden assignment and management
- **Complaints System** - Submit, track, and resolve complaints
- **Mess Management** - Weekly menu display and editing
- **Feedback System** - Student feedback collection and analytics
- **Transit Management** - Track student check-in/check-out
- **Announcements** - Post and view hostel announcements with attachments
- **Fee Management** - Fee submission tracking with document uploads
- **Email Notifications** - OTP and real-time notification system

## Project Structure

```
Hostelia_FFSD_Project/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, logging, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── script/          # Utility scripts (seeding, admin setup)
│   ├── utils/           # Email client, notification service
│   └── index.js         # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Redux slices
│   │   ├── hooks.ts     # Custom React hooks
│   │   ├── lib/         # API client, utilities
│   │   ├── pages/       # Page components
│   │   ├── routes/      # Route definitions & guards
│   │   ├── store.ts     # Redux store configuration
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Helper functions
│   └── package.json
│
└── .github/workflows/   # CI/CD pipelines
```

## API Endpoints

| Module         | Base Route            |
| -------------- | --------------------- |
| Authentication | `/api/auth`           |
| Users          | `/api/user`           |
| Wardens        | `/api/warden`         |
| Complaints     | `/api/problem`        |
| Mess           | `/api/mess`           |
| Transit        | `/api/transit`        |
| Announcements  | `/api/announcement`   |
| Fees           | `/api/fee-submission` |
| Contact        | `/api/contact`        |
| Notifications  | `/api/notification`   |

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
