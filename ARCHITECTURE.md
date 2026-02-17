# Architecture Documentation

## Overview

TaskFlow is a real-time task collaboration platform built with a 3-tier architecture: React SPA frontend, Express REST API backend, and PostgreSQL database, connected via HTTP REST and WebSocket (Socket.IO) protocols. Authentication is handled via **Firebase Authentication**.

## Frontend Architecture

```
src/
├── components/     # Reusable UI components grouped by feature
├── pages/          # Route-level page components
├── store/          # Zustand state management stores
├── services/       # API client and WebSocket service
├── hooks/          # Custom React hooks
└── types/          # TypeScript interfaces
```

### State Management (Zustand)
- **authStore**: User session, Firebase token management, and sync state.
- **boardStore**: Boards, lists, tasks CRUD with optimistic updates and real-time event handlers. Now includes `isActivitiesLoading` for granular background sync.
- **socketStore**: WebSocket connection state.

### Reactivity Strategy (Store Selectors)
To prevent "stale UI" bugs, complex components like `TaskModal` do not rely solely on props passed from parents. Instead, they use **Zustand selectors** to bind directly to the latest state of an entity in the store:
```typescript
const task = useBoardStore(state => 
    state.currentBoard?.lists
        .flatMap(l => l.tasks)
        .find(t => t.id === taskId)
);
```
This ensures that if a task is updated via WebSockets (e.g., a new assignee added by another user), the modal updates immediately without requiring a prop drilling refresh.

### Loading Strategy
The app distinguishes between **structural loading** (the board itself) and **metadata loading** (activity history). 
- `isLoading`: Used for the initial board fetch. Shows a full-screen spinner.
- `isActivitiesLoading`: Used for fetching the activity feed. Shows a local spinner within the activity panel.
This separation prevents the board from unmounting/remounting (and losing local state) during background refreshes.

## Backend Architecture

```
src/
├── controllers/    # HTTP request handlers (thin layer)
├── services/       # Business logic (thick layer)
├── routes/         # Express route definitions with validation
├── middleware/      # Auth (Firebase), error handling, validation
├── socket/         # WebSocket event handlers
├── prisma/         # Database client
└── types/          # TypeScript interfaces
```

### Separation of Concerns
- **Controllers**: Parse request, call service, send response.
- **Services**: All business logic, database queries, and socket emissions.
- **Middleware**: Handles Firebase ID Token verification and Zod validation.

### Position Management
Lists and tasks use integer `position` fields. Updates are atomic using Prisma transactions.

## Database Design

```
User ← BoardMember → Board
                        ↓
                       List
                        ↓
                       Task ← TaskAssignee → User
                        
Board ← Activity → User
```

- **UUIDs** for all primary keys.
- **Prisma ORM** for type-safe queries and migrations.

## Real-Time Sync Strategy

- **Socket.IO rooms**: Each board has a room `board:{boardId}`.
- **Event Mapping**: 
    - `task:created`, `task:updated`, `task:moved`, `task:deleted`
    - `list:created`, `list:updated`, `list:deleted`
    - `activity:created`
- **Deduplication**: Store handlers check for existing IDs to prevent double-rendering during optimistic updates.

## Security

| Measure | Implementation |
|---------|---------------|
| **Authentication** | Firebase ID Tokens (JWT) verified via `firebase-admin` |
| **Authorization** | Middleware verifies board membership before allowing any operation |
| **Input Validation** | Zod schemas enforced on all API inputs |
| **SQL Injection** | Prevented by Prisma parameterized queries |

## Trade-offs and Assumptions

| Decision | Trade-off |
|----------|-----------|
| **Firebase Auth** | Provides secure, scalable auth out-of-the-box but adds an external dependency. |
| **Optimistic UI** | Provides a snappy feel but requires careful rollback logic and "dupe" checking for socket events. |
| **Integer Positions** | Simple to implement but reordering can trigger multiple DB updates. In the future, fractional indexing could be used. |
| **Shared Board Room** | Simple but for extremely high-traffic boards, broadcast noise can increase. Scoping to specific fields might be needed. |

## Scalability Considerations

1. **Backend**: Stateless and can be scaled horizontally. Socket.IO needs a Redis adapter for multi-node setups.
2. **Database**: Connection pooling (PgBouncer) and read replicas for heavy read loads.
3. **Real-time**: Move to a dedicated pub/sub system if concurrent user counts exceed Socket.IO limits on a single node.
