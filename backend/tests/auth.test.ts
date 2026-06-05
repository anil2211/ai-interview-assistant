import request from 'supertest';
import app from '../src/app';
import { testUser } from './setup';

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.username).toBe(testUser.username);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, password: 'weak' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const token = registerRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const token = registerRes.body.data.token;

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh token successfully', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const refreshToken = registerRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send reset token for valid email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.resetToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      const resetToken = forgotRes.body.data.resetToken;

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPass123!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPass123!',
        })
        .expect(200);

      expect(loginRes.body.success).toBe(true);
    });
  });
});
