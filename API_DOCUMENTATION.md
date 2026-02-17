# API Documentation

Base URL: `http://localhost:3001/api`

All authenticated endpoints require: `Authorization: Bearer <Firebase_ID_Token>`

## Authentication

Authentication is managed via Firebase. The local backend uses the `/auth/sync` endpoint to link Firebase users with the local database.

### POST /auth/sync
Synchronize a Firebase authenticated user with the local application database. Should be called after every successful Firebase login/signup on the frontend.

**Headers:**
`Authorization: Bearer <Firebase_ID_Token>`

**Request:**
```json
{
  "name": "Full Name",
  "photoURL": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Full Name",
    "avatar": "...",
    "createdAt": "..."
  }
}
```

### GET /auth/me
Get the profile for the currently logged-in user.

---

## Boards

### GET /boards
List all boards for the current user. Supports `page`, `limit`, and `search`.

### POST /boards
Create a new board.

### GET /boards/:id
Get a full board including all lists, tasks, and members.

### GET /boards/:id/activities
Get the activity history for a board.

**Response Metadata (Example):**
Activity objects include `metadata` specific to the action:
- `TASK_ASSIGNED`: `{ "title": "Task A", "assignedUserName": "John" }`
- `LIST_UPDATED`: `{ "title": "In Progress" }`
- `MEMBER_ADDED`: `{ "memberName": "Jane" }`

---

## Lists

### POST /lists
Add a new list to a board.

### PUT /lists/:id
Rename a list or update its position.

### DELETE /lists/:id
Remove a list.

---

## Tasks

### POST /tasks
Create a new task.

### PUT /tasks/:id
Update title, description, or due date.

### PUT /tasks/:id/move
Move a task to a different list or change its position.

### POST /tasks/:id/assign
Assign a board member to a task.
**Body:** `{ "userId": "member-uuid" }`

### DELETE /tasks/:id/assign/:userId
Unassign a user from a task.

---

## WebSocket Events (Socket.IO)

Connect to the server and listen for real-time updates.

| Event | Payload |
|-------|---------|
| `task:created` | Full task object |
| `task:updated` | Full task object (includes `assignees`) |
| `task:moved` | Full task object (with new `listId`) |
| `task:deleted` | `{ "taskId": "..." }` |
| `activity:created` | Activity object |

---

## Error Handling

Standard HTTP status codes are used:
- `401 Unauthorized`: Missing or invalid Firebase token.
- `403 Forbidden`: User is not a member of the board.
- `404 Not Found`: Resource does not exist.
- `400 Bad Request`: Validation error (Zod).
