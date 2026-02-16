import request from 'supertest';
import { app } from '../server';

// Note: These tests require a running database.
// For CI, use docker-compose to start PostgreSQL first.

describe('Auth Endpoints', () => {
    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
    };
    let token: string;

    describe('POST /api/auth/signup', () => {
        it('should create a new user and return token', async () => {
            const res = await request(app).post('/api/auth/signup').send(testUser);

            expect(res.status).toBe(201);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data.user.email).toBe(testUser.email);
            expect(res.body.data.user.name).toBe(testUser.name);
            expect(res.body.data.user).not.toHaveProperty('password');
            token = res.body.data.token;
        });

        it('should reject duplicate email', async () => {
            const res = await request(app).post('/api/auth/signup').send(testUser);
            expect(res.status).toBe(409);
        });

        it('should validate required fields', async () => {
            const res = await request(app).post('/api/auth/signup').send({
                email: 'invalid',
            });
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(testUser.email);
        });

        it('should reject invalid password', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: testUser.email,
                password: 'wrongpassword',
            });
            expect(res.status).toBe(401);
        });

        it('should reject non-existent user', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe(testUser.email);
        });

        it('should reject request without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
    });
});
