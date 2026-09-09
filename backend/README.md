# LMS Backend API

Enterprise Learning Management System Backend built with Fastify, TypeScript, PostgreSQL, and Redis.

## Tech Stack

- **Framework**: Fastify (High-performance Node.js web framework)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma
- **Cache/Session Store**: Redis (Upstash/Redis Cloud)
- **Authentication**: JWT with device restriction
- **Password Hashing**: Argon2id
- **Logging**: Pino with BetterStack integration
- **API Documentation**: Swagger/OpenAPI
- **Email**: Resend

## Features

- **Authentication & Authorization**
  - Email/password registration with Argon2id hashing
  - JWT-based authentication with session management
  - Device restriction (configurable concurrent device limit per user)
  - Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
  - Device management and session revocation

- **Course Management**
  - Full CRUD operations for courses
  - Hierarchical structure: Course → Module → Lesson
  - Multiple lesson types: VIDEO, ARTICLE, QUIZ, ASSIGNMENT
  - Course metadata: levels, categories, pricing, status

- **Enrollment & Progress Tracking**
  - User enrollment management
  - Lesson-level progress tracking
  - Automatic course completion percentage calculation
  - Watch time tracking

- **Learning Roadmaps**
  - Curated learning paths
  - Sequential course dependencies
  - User progress tracking across roadmaps

- **Resources Management**
  - Course and lesson-level resource attachments
  - Multiple resource types: PDF, code, external links, recordings

- **Audit Logging**
  - Comprehensive activity logging
  - IP and user-agent tracking
  - Device session management

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── config/
│   │   ├── env.ts             # Environment variables
│   │   └── redis.ts           # Redis client configuration
│   ├── plugins/
│   │   ├── auth.ts            # Authentication plugin
│   │   ├── prisma.ts          # Prisma ORM plugin
│   │   ├── redis.ts           # Redis plugin
│   │   ├── resend.ts          # Email plugin
│   │   └── swagger.ts         # API documentation plugin
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── courses/           # Course management module
│   │   ├── progress/          # Progress tracking module
│   │   ├── roadmaps/          # Roadmap module
│   │   └── resources/         # Resources module
│   ├── utils/
│   │   ├── device.ts          # Device fingerprinting utilities
│   │   └── logger.ts          # Pino logger configuration
│   ├── app.ts                 # Fastify app configuration
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash or local)
- Resend API key (for email functionality)

### Setup Steps

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # PostgreSQL / Neon DB Connection Strings
   DATABASE_URL="postgresql://user:password@ep-cool-pool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://user:password@ep-cool-pool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

   # Server Configuration
   PORT=4000
   HOST="0.0.0.0"
   NODE_ENV="development"

   # Security & JWT Secrets
   JWT_SECRET="super-secret-jwt-key-replace-in-production"
   MAX_CONCURRENT_DEVICES_PER_USER=2

   # Redis Configuration
   REDIS_HOST="127.0.0.1"
   REDIS_PORT=6379
   REDIS_PASSWORD=""

   # Resend Transactional Email Key
   RESEND_API_KEY="re_123456789_abcdefghijklmnopqrstuvwxyz"
   EMAIL_FROM="LMS Admin <noreply@yourdomain.com>"

   # BetterStack (Optional - for log ingestion)
   BETTERSTACK_INGESTION_KEY=""
   BETTERSTACK_LOGS_URL="https://in.logs.betterstack.com"
   ```

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Push database schema**
   ```bash
   npm run prisma:push
   ```

6. **Seed the database (optional)**
   ```bash
   npm run prisma:seed
   ```
   
   This creates:
   - Admin user: `admin@lms.com` / `Admin123!`
   - Instructor user: `instructor@lms.com` / `Instructor123!`
   - Sample course with modules and lessons
   - Sample roadmap

## Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:4000` with hot-reload enabled.

### Production Mode
```bash
npm run build
npm start
```

## API Documentation

Once the server is running, access the interactive API documentation at:
```
http://localhost:4000/docs
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login with device tracking
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/devices` - List active devices
- `POST /api/v1/auth/devices/revoke` - Revoke device session

### Courses
- `GET /api/v1/courses` - List all courses (with pagination/filters)
- `GET /api/v1/courses/:slug` - Get course details
- `POST /api/v1/courses` - Create course (Instructor/Admin)
- `PUT /api/v1/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/v1/courses/:id` - Delete course (Instructor/Admin)
- `POST /api/v1/courses/:courseId/modules` - Create module (Instructor/Admin)
- `POST /api/v1/modules/:moduleId/lessons` - Create lesson (Instructor/Admin)

### Progress & Enrollment
- `POST /api/v1/courses/:courseId/enroll` - Enroll in course
- `POST /api/v1/lessons/:lessonId/progress` - Update lesson progress
- `GET /api/v1/courses/:courseId/progress` - Get course progress
- `GET /api/v1/enrollments` - Get user enrollments

### Roadmaps
- `GET /api/v1/roadmaps` - List all roadmaps
- `GET /api/v1/roadmaps/:slug` - Get roadmap details
- `POST /api/v1/roadmaps` - Create roadmap (Admin)
- `PUT /api/v1/roadmaps/:id` - Update roadmap (Admin)
- `POST /api/v1/roadmaps/:roadmapId/items` - Add item to roadmap (Admin)
- `POST /api/v1/roadmaps/:roadmapId/progress` - Update roadmap progress

### Resources
- `GET /api/v1/resources/courses/:courseId` - Get course resources
- `GET /api/v1/resources/lessons/:lessonId` - Get lesson resources
- `POST /api/v1/resources` - Create resource (Instructor/Admin)
- `PUT /api/v1/resources/:id` - Update resource (Instructor/Admin)
- `DELETE /api/v1/resources/:id` - Delete resource (Instructor/Admin)

### Health Check
- `GET /health` - Server health check

## Device Restriction Strategy

The system enforces a configurable limit on concurrent devices per user account (default: 2 devices).

### How It Works

1. **Device Fingerprinting**: Each login generates a device fingerprint using:
   - User-Agent string
   - IP address
   - Client-generated deviceId

2. **Session Storage**: Active sessions are stored in Redis with the key format:
   ```
   user:sessions:{userId}
   ```

3. **Login Flow**:
   - Check if device is already in active sessions
   - If yes: Refresh session and allow login
   - If no: Check if active session count < max devices
   - If at limit: Reject login with 409 Conflict error
   - Otherwise: Create new session

4. **Session Management**:
   - Users can view active devices via `/api/v1/auth/devices`
   - Users can revoke sessions via `/api/v1/auth/devices/revoke`
   - Sessions expire after 7 days (configurable TTL)

## Logging

The application uses Pino for structured logging. Logs can be shipped to BetterStack for centralized monitoring.

### Local Development
Logs are formatted with `pino-pretty` for readability.

### Production
Logs are shipped to BetterStack when `BETTERSTACK_INGESTION_KEY` is configured.

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:

- **User**: User accounts with roles and device limits
- **UserDevice**: Device tracking and session management
- **Course**: Course metadata and structure
- **Module**: Course modules
- **Lesson**: Individual lessons with content
- **Enrollment**: User course enrollments
- **LessonProgress**: Lesson-level progress tracking
- **Roadmap**: Learning paths
- **RoadmapItem**: Roadmap course dependencies
- **Resource**: Course/lesson attachments
- **ActivityLog**: Audit trail

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` as a template.
2. **JWT Secrets**: Use strong, randomly generated secrets in production.
3. **Password Hashing**: Argon2id is used for secure password hashing.
4. **Rate Limiting**: API endpoints are rate-limited to prevent abuse.
5. **CORS**: Configure CORS appropriately for your frontend domain.
6. **Database**: Use connection pooling and SSL in production.

## Performance Considerations

- **Connection Pooling**: Prisma uses connection pooling via PgBouncer (configured in DATABASE_URL)
- **Redis Caching**: Session data and frequently accessed data cached in Redis
- **Database Indexing**: Strategic indexes on high-query fields (userId, courseId, slug, etc.)
- **Pagination**: All list endpoints use cursor-based pagination
- **Lazy Loading**: Nested relations loaded only when needed

## Testing

To run tests (when implemented):
```bash
npm test
```

## Deployment

### Environment Variables for Production
Ensure all required environment variables are set:
- `DATABASE_URL` (with pgbouncer)
- `DIRECT_URL` (without pgbouncer)
- `JWT_SECRET` (strong random string)
- `REDIS_HOST` and `REDIS_PORT`
- `RESEND_API_KEY` (if using email)

### Recommended Deployment Platforms
- **Render**: Easy deployment with PostgreSQL and Redis add-ons
- **Railway**: Built-in PostgreSQL and Redis support
- **AWS**: Elastic Beanstalk or ECS with RDS and ElastiCache
- **DigitalOcean**: App Platform with managed databases

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL is accessible
- Ensure SSL mode is configured correctly

### Redis Connection Issues
- Verify Redis host and port
- Check if Redis is running
- Verify password if authentication is enabled

### Prisma Client Generation
```bash
npm run prisma:generate
```

### Reset Database (WARNING: Deletes all data)
```bash
npm run prisma:push -- --force-reset
npm run prisma:seed
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
