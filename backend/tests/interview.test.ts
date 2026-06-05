import request from 'supertest';
import app from '../src/app';
import { testUser } from './setup';

let token: string;

beforeEach(async () => {
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send(testUser);

  token = registerRes.body.data.token;
});

describe('Interview API', () => {
  describe('POST /api/v1/interviews', () => {
    it('should start a new interview', async () => {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'coding',
          difficulty: 'intermediate',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.interview).toBeDefined();
      expect(res.body.data.interview.type).toBe('coding');
      expect(res.body.data.interview.difficulty).toBe('intermediate');
      expect(res.body.data.interview.status).toBe('in-progress');
      expect(res.body.data.interview.questions.length).toBeGreaterThan(0);
    });

    it('should reject invalid interview type', async () => {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid-type',
          difficulty: 'intermediate',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/interviews', () => {
    it('should return user interviews', async () => {
      await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'coding', difficulty: 'intermediate' });

      const res = await request(app)
        .get('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/interviews/:id', () => {
    it('should return interview by id', async () => {
      const createRes = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'coding', difficulty: 'intermediate' });

      const interviewId = createRes.body.data.interview._id;

      const res = await request(app)
        .get(`/api/v1/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.interview._id).toBe(interviewId);
    });
  });

  describe('POST /api/v1/interviews/:interviewId/answer', () => {
    it('should submit an answer', async () => {
      const createRes = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'coding', difficulty: 'intermediate' });

      const interview = createRes.body.data.interview;
      const questionId = interview.questions[0].questionId;

      const res = await request(app)
        .post(`/api/v1/interviews/${interview._id}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          questionId,
          answer: 'O(log n) because the search space is halved each iteration.',
          timeSpent: 45,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.feedback).toBeDefined();
      expect(res.body.data.feedback.score).toBeDefined();
    });

    it('should reject answer without questionId', async () => {
      const createRes = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'coding', difficulty: 'intermediate' });

      const res = await request(app)
        .post(`/api/v1/interviews/${createRes.body.data.interview._id}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({ answer: 'Some answer' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/interviews/:id/next', () => {
    it('should return next question', async () => {
      const createRes = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'coding', difficulty: 'intermediate' });

      const interviewId = createRes.body.data.interview._id;

      const res = await request(app)
        .get(`/api/v1/interviews/${interviewId}/next`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isComplete).toBe(false);
      expect(res.body.data.progress).toBeDefined();
    });
  });

  describe('POST /api/v1/interviews/:interviewId/complete', () => {
    it('should complete an interview', async () => {
      const createRes = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'coding', difficulty: 'intermediate' });

      const interview = createRes.body.data.interview;

      for (const question of interview.questions) {
        await request(app)
          .post(`/api/v1/interviews/${interview._id}/answer`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            questionId: question.questionId,
            answer: 'Sample answer for testing.',
            timeSpent: 30,
          });
      }

      const res = await request(app)
        .post(`/api/v1/interviews/${interview._id}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.interview.status).toBe('completed');
      expect(res.body.data.interview.overallScore).toBeDefined();
    });
  });
});
