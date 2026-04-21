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

### API Documentation (Swagger)

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api/docs.json`

Swagger docs are always enabled in this backend (no extra env toggle required).


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
- **Resend** - Transactional email services (OTP, reminders)
- **Cloudinary** - File/image uploads
- **GraphQL** - Alternative query API (`graphql-http`)
- **Swagger/OpenAPI** - Interactive API documentation
- **Zod** - Request validation
- **Winston** - Logging
- **Docker** - Containerized deployment

## Features

- **User Authentication** - JWT-based login/signup with OTP verification
- **Role-based Access** - Student, Warden, Admin, and Manager roles
- **Platform Manager Portal** - College approval/rejection, platform-wide analytics
- **Dashboard & Analytics** - Visual statistics and insights
- **User Management** - CRUD operations for students + bulk CSV upload
- **Warden Management** - Warden assignment and management
- **Complaints System** - Submit, track, and resolve complaints with dual-status verification
- **Mess Management** - Weekly menu display and editing
- **Feedback System** - Student feedback collection and analytics
- **Transit Management** - Track student check-in/check-out
- **Announcements** - Post and view hostel announcements with attachments
- **Fee Management** - Fee submission tracking with document uploads
- **Real-time Notifications** - SSE-based notification system
- **Email Notifications** - OTP, fee reminders, credential emails via Resend
- **GraphQL API** - Health check and user profile queries

## Project Structure

```
Hostelia_2.0/
├── backend/
│   ├── api-docs/        # OpenAPI 3.0.3 specification
│   ├── config/          # Database, Cloudinary, Swagger configuration
│   ├── controllers/     # Route handlers & business logic
│   ├── graphql/         # GraphQL schema and resolvers
│   ├── middleware/      # Auth, logging, roles, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── script/          # Utility scripts (seeding manager)
│   ├── utils/           # Email client, notification service
│   ├── Dockerfile       # Docker image definition
│   └── index.js         # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Redux slices
│   │   ├── hooks/       # Custom data-fetching hooks
│   │   ├── hooks.ts     # Typed Redux hooks
│   │   ├── lib/         # API client, utilities
│   │   ├── pages/       # Page components (including manager/)
│   │   ├── routes/      # Route definitions & guards
│   │   ├── store.ts     # Redux store configuration
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Helper functions
│   ├── Dockerfile       # Docker image definition
│   └── package.json
│
├── docs/                # Project documentation
├── docker-compose.yaml  # Full-stack Docker Compose
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
| Fees           | `/api/fee`            |
| Contact        | `/api/contact`        |
| Notifications  | `/api/notifications`  |
| Colleges       | `/api/college`        |
| Hostels        | `/api/hostel`         |
| Manager        | `/api/manager`        |
| GraphQL        | `/api/graphql`        |

## Documentation

Detailed documentation is available in the `docs/` directory:

| Document | Description |
| --- | --- |
| [API Reference](docs/api_reference.md) | Complete REST + GraphQL API documentation |
| [Backend Documentation](docs/backend_documentation.md) | Backend architecture, models, middleware |
| [Frontend Documentation](docs/frontend_documentation.md) | Frontend architecture, components, routing |
| [Deployment Guide](docs/deployment_guide.md) | Docker, CI/CD, VPS deployment, production checklist |
| [Swagger Guide](docs/swagger_presentation_guide.md) | Swagger/OpenAPI usage and presentation guide |

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
