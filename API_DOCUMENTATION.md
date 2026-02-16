# API Documentation

Base URL: `http://localhost:3001/api`

All authenticated endpoints require: `Authorization: Bearer <token>`

## Authentication

### POST /auth/signup
Create a new user account.

**Request:**
```json
{ "email": "user@example.com", "password": "password123", "name": "John Doe" }
```

**Response (201):**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe", "avatar": null, "createdAt": "2024-01-01T00:00:00Z" },
    "token": "jwt-token-here"
  }
}
```

### POST /auth/login
Authenticate an existing user.

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response (200):** Same format as signup.

### GET /auth/me
Get the currently authenticated user. Requires auth header.

**Response (200):**
```json
{ "data": { "id": "uuid", "email": "user@example.com", "name": "John Doe", "avatar": null, "createdAt": "..." } }
```

---

## Boards

### GET /boards
List all boards the user is a member of.

**Query params:** `page` (default 1), `limit` (default 10), `search` (optional)

**Response (200):**
```json
{
  "data": [{ "id": "uuid", "title": "My Board", "description": "...", "createdBy": {...}, "members": [...], "_count": { "lists": 3 } }],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

### POST /boards
Create a new board. Creator is automatically added as ADMIN.

**Request:**
```json
{ "title": "New Board", "description": "Optional description" }
```

### GET /boards/:id
Get a single board with all lists, tasks, and members.

### PUT /boards/:id
Update board title/description. **Requires ADMIN role.**

### DELETE /boards/:id
Delete a board and all related data. **Requires ADMIN role.**

### POST /boards/:id/members
Add a member by email. **Requires ADMIN role.**

**Request:**
```json
{ "email": "member@example.com", "role": "MEMBER" }
```

### DELETE /boards/:id/members/:userId
Remove a member. **Requires ADMIN role.** Cannot remove yourself.

### GET /boards/:id/activities
Get paginated activity log for the board.

**Query params:** `page` (default 1), `limit` (default 20)

---

## Lists

### POST /lists
Create a new list in a board. Position is auto-assigned.

**Request:**
```json
{ "title": "To Do", "boardId": "board-uuid" }
```

### PUT /lists/:id
Update list title or position.

**Request:**
```json
{ "title": "New Title" }
```

### DELETE /lists/:id
Delete a list and all its tasks. Positions of remaining lists are recalculated.

---

## Tasks

### POST /tasks
Create a new task. Position is auto-assigned.

**Request:**
```json
{ "title": "Fix bug", "listId": "list-uuid", "description": "Optional", "dueDate": "2024-12-31T00:00:00Z" }
```

### PUT /tasks/:id
Update task title, description, or due date.

**Request:**
```json
{ "title": "Updated title", "description": "New desc", "dueDate": null }
```

### PUT /tasks/:id/move
Move a task to a different list and/or position. Uses database transactions for atomic position updates.

**Request:**
```json
{ "listId": "target-list-uuid", "position": 2 }
```

### DELETE /tasks/:id
Delete a task. Positions of remaining tasks in the list are recalculated.

### POST /tasks/:id/assign
Assign a board member to a task.

**Request:**
```json
{ "userId": "user-uuid" }
```

### DELETE /tasks/:id/assign/:userId
Remove a user from a task.

---

## WebSocket Events

Connect to `http://localhost:3001` with `auth: { token }`.

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-board` | `boardId: string` | Join board room for real-time updates |
| `leave-board` | `boardId: string` | Leave board room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `task-created` | Task object with boardId | New task created |
| `task-updated` | Task object with boardId | Task was updated |
| `task-moved` | Task object with boardId | Task moved to different list/position |
| `task-deleted` | `{ boardId, listId, taskId }` | Task was deleted |
| `list-created` | List object | New list created |
| `list-updated` | List object | List was updated |
| `list-deleted` | `{ boardId, listId }` | List was deleted |
| `member-added` | Member object | New member added to board |

---

## Error Responses

All errors follow this format:
```json
{ "error": "Error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Not authenticated / invalid token |
| 403 | Not authorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |
