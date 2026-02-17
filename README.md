# TaskFlow - Real-Time Task Collaboration Platform

A full-stack Trello/Notion-style task management application with real-time collaboration, drag-and-drop, and team management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Zustand, @dnd-kit, Tailwind CSS, Socket.IO Client, Axios, Firebase Auth |
| **Backend** | Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.IO, Firebase Admin SDK, Zod |
| **DevOps** | Docker, Docker Compose, Jest |

## Features

- ✅ **Firebase Authentication**: Secure Google and Email/Password login.
- ✅ **Board CRUD**: Paginated and searchable board management.
- ✅ **Lists & Tasks**: Intuitive drag-and-drop reordering within and between lists.
- ✅ **Real-time Collaboration**: Instant updates across all clients using WebSockets (Socket.IO).
- ✅ **Granular Loading States**: Decoupled activity loading to prevent UI flickering and infinite loops.
- ✅ **Reactive Task Modal**: Real-time sync of task details and assignments without reopening.
- ✅ **Member Roles**: Role-based access control (Admin/Member/Viewer).
- ✅ **Activity History**: Detailed audit log of all board actions with rich metadata.
- ✅ **Optimistic UI**: Snappy interactions with reliable error rollback.

## Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/tmanas06/task-collaboration-platform
cd ask-collaboration-platform

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update Firebase configuration in frontend/src/config/firebase.ts
# and add service-account.json to backend/src/config/

docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Firebase Project (for Authentication)

### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` (Update `DATABASE_URL`)
4. Place your Firebase `service-account.json` in `backend/src/config/`
5. `npx prisma migrate dev`
6. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env`
4. Configure Firebase in `src/config/firebase.ts`
5. `npm run dev`

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 3001) |
| `CORS_ORIGIN` | Allowed origin for CORS (default: http://localhost:5173) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| ... | Other Firebase config variables |

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Firebase user with local database |
| GET | `/api/boards` | List boards (paginated) |
| GET | `/api/boards/:id` | Get board details |
| POST | `/api/boards/:id/members` | Add member to board |
| GET | `/api/boards/:id/activities` | Get board activity log |
| PUT | `/api/tasks/:id/move` | Move task (reorder/cross-list) |
| POST | `/api/tasks/:id/assign` | Assign user to task |

*See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.*

## Architecture Decisions

- **Zustand Store Selectors**: Used in modals to ensure data reactivity and prevent stale UI.
- **Granular Loading**: Introduced `isActivitiesLoading` to separate background data fetching from structural board loading, fixing infinite mount loops.
- **Socket.IO Rooms**: Scoped updates to specific boards for efficiency.
- **Prisma Transactions**: Ensures atomic operations when reordering tasks or lists.

## Recent Fixes
- 🛠 **Activity History**: Fixed missing descriptions and metadata for assignments and member changes.
- 🛠 **Infinite Loading Loop**: Resolved issue where activity refreshes would unmount the entire board.
- 🛠 **Task Modal Reactivity**: Fixed bug where assignments wouldn't show up immediately in the open modal.

---