# Content Platform

A full-stack Learning Management System (LMS) with course management, payment integration, and user authentication.

## Tech Stack

### Backend
- **Framework**: Fastify (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma
- **Authentication**: JWT with device fingerprinting
- **Payment**: Razorpay
- **Email**: Resend
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Management**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **State Management**: Zustand
- **Toast Notifications**: Sonner

## Features

### Backend
- User authentication with JWT
- Device management with concurrent device limits
- Course management (CRUD operations)
- Module and lesson management
- Progress tracking
- Roadmap-based learning paths
- Cohort management
- Resource management
- Razorpay payment integration
- Email notifications via Resend
- Swagger API documentation

### Frontend
- Modern, responsive UI with beautiful design
- Landing page with feature showcase
- User registration and login
- Device management dashboard
- Protected routes
- Real-time state management

## Project Structure

```
content-website/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── courses/       # Course management
│   │   │   ├── payments/      # Razorpay integration
│   │   │   ├── cohorts/       # Cohort management
│   │   │   ├── roadmaps/      # Learning roadmaps
│   │   │   ├── progress/      # Progress tracking
│   │   │   └── resources/     # Resource management
│   │   ├── plugins/           # Fastify plugins (Prisma, JWT, etc.)
│   │   ├── config/            # Configuration
│   │   └── utils/             # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and API client
│   │   └── stores/            # Zustand stores
│   ├── .env.local             # Environment variables
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon DB account)
- Razorpay account for payments
- Resend account for emails

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
DATABASE_URL=your_postgresql_database_url
DIRECT_URL=your_postgresql_direct_url
JWT_SECRET=your_jwt_secret
MAX_CONCURRENT_DEVICES_PER_USER=2
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
PORT=4000
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Seed the database:
```bash
npm run prisma:seed
```

6. Start the development server:
```bash
npm run dev
```

Backend will be available at http://localhost:4000
API documentation at http://localhost:4000/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:3000

## Default Credentials

After seeding the database, you can use these credentials:

**Admin User:**
- Email: `admin@lms.com`
- Password: `Admin123!`

**Instructor User:**
- Email: `instructor@lms.com`
- Password: `Instructor123!`

## API Documentation

The backend includes Swagger/OpenAPI documentation. Once the server is running, visit:
- http://localhost:4000/docs

### Key Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/devices` - Get active devices
- `POST /auth/devices/revoke` - Revoke device session

**Payments:**
- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment signature
- `GET /payments/:orderId` - Get payment details
- `GET /payments` - Get user payments

**Courses:**
- `GET /courses` - Get all courses
- `GET /courses/:slug` - Get course by slug
- `POST /courses` - Create course (Instructor/Admin)
- `PUT /courses/:id` - Update course (Instructor/Admin)
- `DELETE /courses/:id` - Delete course (Instructor/Admin)

## Postman Collection

A Postman collection is available at `backend/LMS-API-Collection.postman.json` with all API endpoints pre-configured.

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:
- User (with device limits)
- UserDevice (session management)
- Course
- Module
- Lesson
- Enrollment
- Payment (Razorpay integration)
- Cohort
- Roadmap
- Resource

## License

MIT
