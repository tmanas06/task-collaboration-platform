# Architecture Documentation

## Overview

TaskFlow is a real-time task collaboration platform built with a 3-tier architecture: React SPA frontend, Express REST API backend, and PostgreSQL database, connected via HTTP REST and WebSocket (Socket.IO) protocols.

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
- **authStore**: User session, login/signup/logout, token persistence via localStorage
- **boardStore**: Boards, lists, tasks CRUD with optimistic updates and real-time event handlers
- **socketStore**: WebSocket connection state

### Data Flow
1. User action → Optimistic Zustand store update
2. Axios API call to backend
3. Backend processes request → returns response
4. Backend emits Socket.IO event to board room
5. All connected clients receive event → Zustand store confirms/corrects state

### Drag and Drop
Uses `@dnd-kit` with `DndContext` at the board level. Each list is a droppable zone. Each task is a sortable item. On drag end, the optimistic update moves the task in local state, then the API call persists to the database.

## Backend Architecture

```
src/
├── controllers/    # HTTP request handlers (thin layer)
├── services/       # Business logic (thick layer)
├── routes/         # Express route definitions with validation
├── middleware/      # Auth, error handling, validation
├── socket/         # WebSocket event handlers
├── prisma/         # Database client
└── types/          # TypeScript interfaces
```

### Separation of Concerns
- **Controllers**: Parse request, call service, send response. No business logic.
- **Services**: All business logic, database queries, authorization checks, activity logging.
- **Middleware**: Cross-cutting concerns (auth, validation, error handling).

### Position Management
Lists and tasks use integer `position` fields for ordering. When items are moved:
- **Same list**: Tasks between old and new position are shifted by ±1
- **Cross list**: Source list decrements positions after removed index; target list increments positions at/after insertion index
- All position updates use Prisma transactions for atomicity

## Database Design

```
User ← BoardMember → Board
                        ↓
                       List
                        ↓
                       Task ← TaskAssignee → User
                        
Board ← Activity → User
```

- **UUIDs** for all primary keys (no sequential IDs exposed)
- **Cascade deletes**: Deleting a board removes all lists, tasks, members, activities
- **Composite unique constraints**: `BoardMember(boardId, userId)`, `TaskAssignee(taskId, userId)`
- **Indexes**: Foreign keys, position fields, email, title, createdAt

## Real-Time Sync Strategy

- **Socket.IO rooms**: Each board has a room `board:{boardId}`
- **Server-side emit**: After successful database operations, the backend emits events to the board room
- **Client-side listeners**: `useSocket` hook registers handlers that update the Zustand store
- **Deduplication**: Handlers check if an entity already exists before adding (prevents duplicates from optimistic + socket updates)

## Security

| Measure | Implementation |
|---------|---------------|
| Authentication | JWT with 7-day expiry, Bearer token header |
| Password storage | Bcrypt with 10 salt rounds |
| Input validation | Zod schemas on all POST/PUT endpoints |
| SQL injection | Prevented by Prisma ORM parameterized queries |
| XSS | React auto-escapes rendered content |
| CORS | Configured to allow only the frontend origin |
| Authorization | Board membership verified on every operation; admin-only actions enforced |

## Trade-offs and Assumptions

| Decision | Trade-off |
|----------|-----------|
| Position as integer | Simple but requires batch updates when reordering. Could use fractional indexing for O(1) moves. |
| Optimistic UI | Better UX but requires rollback logic. Race conditions possible with multiple concurrent editors. |
| Socket.IO rooms per board | Scales well for moderate board counts. For thousands of concurrent boards, consider pub/sub with Redis adapter. |
| JWT in localStorage | Simple but vulnerable to XSS. Could use httpOnly cookies for better security. |
| No caching layer | Direct DB queries. For production, add Redis caching for frequently accessed boards. |
| Single database | Sufficient for moderate load. For scale, consider read replicas or connection pooling (PgBouncer). |

## Scalability Considerations

1. **Horizontal scaling**: Backend is stateless; Socket.IO can use Redis adapter for multi-instance deployments
2. **Database**: Add connection pooling, read replicas, and materialized views for activity feeds
3. **CDN**: Serve frontend static assets via CDN
4. **Rate limiting**: Add rate limiting middleware for API endpoints
5. **Background jobs**: Move activity logging to a message queue for write-heavy scenarios
