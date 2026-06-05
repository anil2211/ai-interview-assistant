import { aiService } from '../src/services/AIService';

describe('AI Service', () => {
  describe('generateAnswer', () => {
    it('should generate an answer for a given question', async () => {
      const question = 'What is the time complexity of quicksort?';
      const context = { type: 'coding', difficulty: 'intermediate' };

      const answer = await aiService.generateAnswer(question, context);

      expect(answer).toBeDefined();
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });

    it('should handle different interview types', async () => {
      const testCases = [
        { type: 'devops', question: 'What is CI/CD?' },
        { type: 'system-design', question: 'Design a URL shortener' },
        { type: 'behavioral', question: 'Tell me about a challenge you faced' },
      ];

      for (const testCase of testCases) {
        const answer = await aiService.generateAnswer(testCase.question, {
          type: testCase.type,
          difficulty: 'beginner',
        });

        expect(answer).toBeDefined();
        expect(answer.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateFeedback', () => {
    it('should evaluate an answer and return scores', async () => {
      const question = 'What is the time complexity of binary search?';
      const userAnswer = 'O(log n) because the array is divided in half each time.';
      const modelAnswer = 'Binary search has a time complexity of O(log n) as it repeatedly divides the search interval in half.';

      const feedback = await aiService.generateFeedback(question, userAnswer, modelAnswer, {
        type: 'coding',
        difficulty: 'intermediate',
      });

      expect(feedback).toBeDefined();
      expect(feedback.score).toBeGreaterThanOrEqual(0);
      expect(feedback.score).toBeLessThanOrEqual(100);
      expect(feedback.strengths).toBeDefined();
      expect(Array.isArray(feedback.strengths)).toBe(true);
      expect(feedback.weaknesses).toBeDefined();
      expect(Array.isArray(feedback.weaknesses)).toBe(true);
      expect(feedback.technicalAccuracy).toBeGreaterThanOrEqual(0);
      expect(feedback.completeness).toBeGreaterThanOrEqual(0);
      expect(feedback.clarity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateFollowUpQuestions', () => {
    it('should generate follow-up questions', async () => {
      const question = 'What is polymorphism?';
      const answer = 'Polymorphism allows objects of different types to respond to the same interface.';

      const followUps = await aiService.generateFollowUpQuestions(question, answer, 3);

      expect(followUps).toBeDefined();
      expect(Array.isArray(followUps)).toBe(true);
      expect(followUps.length).toBe(3);
      followUps.forEach(q => {
        expect(typeof q).toBe('string');
        expect(q.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateStudyPlan', () => {
    it('should generate a study plan based on user profile', async () => {
      const profile = {
        profile: {
          experienceLevel: 'mid',
          techStack: ['React', 'Node.js', 'Python'],
          targetRoles: ['Senior Developer'],
        },
      };

      const weaknesses = ['System design', 'Data structures'];

      const plan = await aiService.generateStudyPlan(profile as any, weaknesses);

      expect(plan).toBeDefined();
      expect(plan.title).toBeDefined();
      expect(plan.description).toBeDefined();
      expect(plan.goals).toBeDefined();
      expect(Array.isArray(plan.goals)).toBe(true);
      expect(plan.topics).toBeDefined();
      expect(Array.isArray(plan.topics)).toBe(true);
    });
  });

  describe('generateModelAnswer', () => {
    it('should generate a model answer for a question', async () => {
      const question = 'Explain the CAP theorem.';
      const context = { type: 'system-design', difficulty: 'intermediate' };

      const answer = await aiService.generateModelAnswer(question, context);

      expect(answer).toBeDefined();
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });
  });

  describe('rate limiting', () => {
    it('should handle multiple requests without errors', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        aiService.generateAnswer(
          `Test question ${i}`,
          { type: 'coding', difficulty: 'beginner' }
        )
      );

      const results = await Promise.all(promises);
      results.forEach(answer => {
        expect(answer).toBeDefined();
        expect(typeof answer).toBe('string');
      });
    });
  });

  describe('caching', () => {
    it('should return cached results for identical requests', async () => {
      const question = 'What is a microservice?';
      const context = { type: 'devops', difficulty: 'beginner' };

      const firstResult = await aiService.generateAnswer(question, context);
      const secondResult = await aiService.generateAnswer(question, context);

      expect(firstResult).toBe(secondResult);
    });
  });
});
