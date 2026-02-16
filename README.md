# TaskFlow - Real-Time Task Collaboration Platform

A full-stack Trello/Notion-style task management application with real-time collaboration, drag-and-drop, and team management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Zustand, @dnd-kit, Tailwind CSS, Socket.IO Client, Axios, React Router |
| **Backend** | Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.IO, JWT, Bcrypt, Zod |
| **DevOps** | Docker, Docker Compose, Jest |

## Features

- ✅ JWT authentication (signup/login)
- ✅ Board CRUD with search and pagination
- ✅ Lists with drag-and-drop reordering
- ✅ Tasks with drag-and-drop between lists
- ✅ Real-time updates via WebSockets
- ✅ Member management with role-based access (Admin/Member)
- ✅ Task assignment/unassignment
- ✅ Activity history tracking
- ✅ Optimistic UI updates with error rollback
- ✅ Responsive design
- ✅ Input validation with Zod
- ✅ Loading states and error handling throughout

## Quick Start with Docker

```bash
# Clone and navigate to the project
cd ask-collaboration-platform

# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL in .env if needed

npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://taskuser:taskpass@localhost:5432/task_collab` |
| `JWT_SECRET` | Secret for JWT signing | `super-secret-jwt-key-change-in-production` |
| `PORT` | Server port | `3001` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:3001` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/boards` | List boards (paginated, searchable) |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with lists and tasks |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/boards/:id/members` | Add member |
| DELETE | `/api/boards/:id/members/:userId` | Remove member |
| GET | `/api/boards/:id/activities` | Get activity history |
| POST | `/api/lists` | Create list |
| PUT | `/api/lists/:id` | Update list |
| DELETE | `/api/lists/:id` | Delete list |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/move` | Move task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/assign` | Assign user |
| DELETE | `/api/tasks/:id/assign/:userId` | Unassign user |

## Database Schema

```
User ──────┐
           ├── BoardMember ── Board
           ├── TaskAssignee ── Task ── List ── Board
           └── Activity ────────────────────── Board
```

- All IDs are UUIDs
- Cascade deletes on all foreign keys
- Indexes on frequently queried fields
- Position-based ordering for lists and tasks

## Architecture Decisions

- **Zustand** over Redux for simpler state management with less boilerplate
- **@dnd-kit** over react-beautiful-dnd for active maintenance and better TypeScript support
- **Prisma** over raw SQL for type-safe database access and migrations
- **Socket.IO rooms** for board-scoped real-time updates (only relevant users receive events)
- **Optimistic updates** for responsive UX with automatic rollback on errors
- **Zod** for runtime input validation matching TypeScript types

## Running Tests

```bash
cd backend
npm test
```

## Demo Credentials

After starting the app, create an account via the signup page. No seed data is included — create your own boards, lists, and tasks to test the full workflow.

## Future Improvements

- [ ] File attachments on tasks
- [ ] Task labels/tags
- [ ] Due date notifications
- [ ] Board templates
- [ ] Keyboard shortcuts
- [ ] Dark/light theme toggle
- [ ] Task comments
- [ ] Board archiving
# task-collaboration-platform
