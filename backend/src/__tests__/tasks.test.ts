import request from 'supertest';
import { app } from '../server';

describe('Task Endpoints', () => {
    let token: string;
    let boardId: string;
    let listId1: string;
    let listId2: string;
    let taskId: string;

    beforeAll(async () => {
        // Create test user
        const userRes = await request(app).post('/api/auth/signup').send({
            email: `task-test-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Task Tester',
        });
        token = userRes.body.data.token;

        // Create board
        const boardRes = await request(app)
            .post('/api/boards')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Task Test Board' });
        boardId = boardRes.body.data.id;

        // Create two lists
        const list1Res = await request(app)
            .post('/api/lists')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'To Do', boardId });
        listId1 = list1Res.body.data.id;

        const list2Res = await request(app)
            .post('/api/lists')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'In Progress', boardId });
        listId2 = list2Res.body.data.id;
    });

    describe('POST /api/tasks', () => {
        it('should create a task in a list', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test Task', listId: listId1, description: 'A test task' });

            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe('Test Task');
            expect(res.body.data.position).toBe(0);
            taskId = res.body.data.id;
        });

        it('should auto-increment position', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Second Task', listId: listId1 });

            expect(res.status).toBe(201);
            expect(res.body.data.position).toBe(1);
        });
    });

    describe('PUT /api/tasks/:id', () => {
        it('should update task details', async () => {
            const res = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Task', description: 'Updated description' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated Task');
        });
    });

    describe('PUT /api/tasks/:id/move', () => {
        it('should move task to another list', async () => {
            const res = await request(app)
                .put(`/api/tasks/${taskId}/move`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listId: listId2, position: 0 });

            expect(res.status).toBe(200);
            expect(res.body.data.listId).toBe(listId2);
            expect(res.body.data.position).toBe(0);
        });

        it('should reorder tasks within the same list', async () => {
            // Create another task in list2
            const createRes = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Another Task', listId: listId2 });

            const newTaskId = createRes.body.data.id;

            // Move new task to position 0
            const moveRes = await request(app)
                .put(`/api/tasks/${newTaskId}/move`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listId: listId2, position: 0 });

            expect(moveRes.status).toBe(200);
            expect(moveRes.body.data.position).toBe(0);
        });
    });

    describe('POST /api/tasks/:id/assign', () => {
        it('should assign user to task', async () => {
            const userRes = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            const userId = userRes.body.data.id;

            const res = await request(app)
                .post(`/api/tasks/${taskId}/assign`)
                .set('Authorization', `Bearer ${token}`)
                .send({ userId });

            expect(res.status).toBe(200);
            expect(res.body.data.assignees).toHaveLength(1);
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('should delete a task', async () => {
            const res = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
        });
    });
});
