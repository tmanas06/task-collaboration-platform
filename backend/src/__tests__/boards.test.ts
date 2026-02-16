import request from 'supertest';
import { app } from '../server';

describe('Board Endpoints', () => {
    let token: string;
    let boardId: string;

    beforeAll(async () => {
        // Create a test user and get token
        const res = await request(app).post('/api/auth/signup').send({
            email: `board-test-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Board Tester',
        });
        token = res.body.data.token;
    });

    describe('POST /api/boards', () => {
        it('should create a new board', async () => {
            const res = await request(app)
                .post('/api/boards')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test Board', description: 'Test description' });

            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe('Test Board');
            expect(res.body.data.members).toHaveLength(1);
            expect(res.body.data.members[0].role).toBe('ADMIN');
            boardId = res.body.data.id;
        });

        it('should reject board without title', async () => {
            const res = await request(app)
                .post('/api/boards')
                .set('Authorization', `Bearer ${token}`)
                .send({ description: 'No title' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/boards', () => {
        it('should return boards for authenticated user', async () => {
            const res = await request(app)
                .get('/api/boards')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination).toBeDefined();
        });

        it('should support pagination', async () => {
            const res = await request(app)
                .get('/api/boards?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(5);
        });

        it('should support search', async () => {
            const res = await request(app)
                .get('/api/boards?search=Test')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/boards/:id', () => {
        it('should return board with lists and tasks', async () => {
            const res = await request(app)
                .get(`/api/boards/${boardId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(boardId);
            expect(res.body.data.lists).toBeInstanceOf(Array);
            expect(res.body.data.members).toBeInstanceOf(Array);
        });
    });

    describe('PUT /api/boards/:id', () => {
        it('should update board title', async () => {
            const res = await request(app)
                .put(`/api/boards/${boardId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Board Title' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated Board Title');
        });
    });

    describe('DELETE /api/boards/:id', () => {
        it('should delete board', async () => {
            const res = await request(app)
                .delete(`/api/boards/${boardId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
        });
    });
});
