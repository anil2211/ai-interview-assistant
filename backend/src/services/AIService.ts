import OpenAI from 'openai';
import { config } from '../config/env';
import { SYSTEM_PROMPTS, STUDY_PLAN_SYSTEM_PROMPT, LLM_MODELS, AI_TIMEOUT_MS, MAX_RETRY_ATTEMPTS, CACHE_TTL_SECONDS, ERROR_CODES, InterviewType } from '../utils/constants';
import { logger } from '../middleware/logger';
import { AppError } from '../middleware/errorHandler';
import { IUser, IStudyPlan } from '../types';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

class AIService {
  private client: OpenAI | null = null;
  private cache: Map<string, CacheEntry> = new Map();
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private rateLimitPerMinute: number = 30;

  constructor() {
    if (config.openaiApiKey) {
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
        timeout: AI_TIMEOUT_MS,
        maxRetries: MAX_RETRY_ATTEMPTS,
      });
    } else {
      logger.warn('OpenAI API key not configured. AI service will use mock responses.');
    }
  }

  private checkRateLimit(): void {
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    if (this.requestCount >= this.rateLimitPerMinute) {
      throw new AppError('AI service rate limit exceeded', 429, 'RATE_LIMIT');
    }
    this.requestCount++;
  }

  private getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    });
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  private async makeAIRequest(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    model: string = LLM_MODELS.GPT4_TURBO,
    temperature: number = 0.7,
    maxTokens: number = 1500
  ): Promise<string> {
    if (!this.client) {
      return this.generateMockResponse(messages);
    }

    this.checkRateLimit();

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError('AI service returned empty response', 500, ERROR_CODES.AI_SERVICE_ERROR);
      }

      logger.debug('AI request completed', {
        model,
        tokens: response.usage?.total_tokens,
      });

      return content;
    } catch (error: any) {
      logger.error('AI request failed:', error);

      if (error instanceof AppError) throw error;

      if (error.status === 429) {
        throw new AppError('AI service is currently overloaded. Please try again.', 429, ERROR_CODES.AI_SERVICE_ERROR);
      }

      if (error.status === 401) {
        throw new AppError('Invalid AI service credentials.', 500, ERROR_CODES.AI_SERVICE_ERROR);
      }

      return this.generateMockResponse(messages);
    }
  }

  private generateMockResponse(messages: { role: string; content: string }[]): string {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const systemMessage = messages[0]?.content || '';

    if (systemMessage.includes('interview')) {
      return `This is a comprehensive evaluation of your interview response.

Score: 75/100

Strengths:
- Good understanding of core concepts
- Clear communication style
- Practical approach to problem-solving

Areas for Improvement:
- Could provide more specific examples
- Consider discussing trade-offs
- Add more technical depth

Detailed Feedback:
Your answer demonstrates a solid foundation in the subject matter. The response was well-structured and showed practical understanding. To improve, focus on providing more concrete examples and discussing alternative approaches. Consider the trade-offs involved in different solutions.

Technical Accuracy: 78%
Completeness: 72%
Clarity: 80%
Relevance: 75%
Structure: 70%
Communication: 75%`;
    }

    if (systemMessage.includes('study plan')) {
      return JSON.stringify({
        title: 'Personalized Interview Preparation Plan',
        description: 'A comprehensive study plan tailored to your target role and experience level.',
        goals: ['Master core technical concepts', 'Practice system design', 'Improve behavioral responses'],
        topics: [
          { name: 'Data Structures & Algorithms', priority: 'high', status: 'not-started', resources: ['LeetCode', 'AlgoExpert'] },
          { name: 'System Design', priority: 'high', status: 'not-started', resources: ['Grokking System Design', 'YouTube'] },
          { name: 'Behavioral Interview Prep', priority: 'medium', status: 'not-started', resources: ['STAR Method Guide'] },
        ],
        schedule: [
          { date: new Date(Date.now() + 86400000).toISOString(), topic: 'Arrays & Hashing', duration: 120, completed: false },
          { date: new Date(Date.now() + 172800000).toISOString(), topic: 'Two Pointers', duration: 90, completed: false },
        ],
      });
    }

    if (lastMessage.toLowerCase().includes('follow')) {
      return JSON.stringify([
        'Can you explain how you would handle error cases in your solution?',
        'How does your approach scale with a larger dataset?',
        'What alternatives did you consider and why did you choose this approach?',
      ]);
    }

    return 'Based on the given context, here is a comprehensive response that addresses the key aspects of the question. The answer covers fundamental concepts, practical applications, and best practices.';
  }

  async generateAnswer(question: string, context: { type: string; difficulty: string; userProfile?: Partial<IUser> }): Promise<string> {
    const cacheKey = `answer:${question}:${context.type}:${context.difficulty}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const systemPrompt = SYSTEM_PROMPTS[context.type as InterviewType] || SYSTEM_PROMPTS.coding;

    const messages = [
      { role: 'system' as const, content: `${systemPrompt}\n\nGenerate a comprehensive, model-quality answer to the following interview question. The answer should be detailed, technically accurate, and demonstrate the level of expertise expected for a ${context.difficulty}-level position.` },
      { role: 'user' as const, content: question },
    ];

    const answer = await this.makeAIRequest(messages, LLM_MODELS.GPT4_TURBO, 0.5, 2000);
    this.setCache(cacheKey, answer);
    return answer;
  }

  async generateFeedback(
    question: string,
    userAnswer: string,
    modelAnswer: string,
    context: { type: string; difficulty: string }
  ): Promise<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    technicalAccuracy: number;
    completeness: number;
    clarity: number;
    relevance: number;
    structureScore: number;
    communicationScore: number;
    feedback: string;
  }> {
    const systemPrompt = SYSTEM_PROMPTS[context.type as InterviewType] || SYSTEM_PROMPTS.coding;

    const messages = [
      {
        role: 'system' as const,
        content: `${systemPrompt}\n\nEvaluate the candidate's answer against the model answer. Provide a detailed evaluation with scores (0-100) for each category. Return the evaluation in a structured format.`,
      },
      {
        role: 'user' as const,
        content: `Question: ${question}\n\nCandidate's Answer: ${userAnswer}\n\nModel Answer: ${modelAnswer}`,
      },
    ];

    const evaluationText = await this.makeAIRequest(messages, LLM_MODELS.GPT4_TURBO, 0.3, 2000);

    try {
      const scores = this.parseEvaluationScores(evaluationText);
      return scores;
    } catch {
      return this.generateDefaultFeedback();
    }
  }

  private parseEvaluationScores(text: string): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    technicalAccuracy: number;
    completeness: number;
    clarity: number;
    relevance: number;
    structureScore: number;
    communicationScore: number;
    feedback: string;
  } {
    const extractScore = (label: string): number => {
      const regex = new RegExp(`${label}[\\s:]*([0-9]+)`, 'i');
      const match = text.match(regex);
      return match ? Math.min(100, Math.max(0, parseInt(match[1], 10))) : 70;
    };

    const extractList = (label: string): string[] => {
      const regex = new RegExp(`${label}[\\s:]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
      const match = text.match(regex);
      if (!match) return [];
      return match[1]
        .split('\n')
        .map(s => s.replace(/^[-*]\s*/, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 5);
    };

    const score = extractScore('Score');
    const feedback = text.split('\n\n').slice(-1)[0] || text;

    return {
      score,
      strengths: extractList('Strengths'),
      weaknesses: extractList('Weaknesses'),
      suggestions: extractList('Suggestions'),
      technicalAccuracy: extractScore('Technical Accuracy'),
      completeness: extractScore('Completeness'),
      clarity: extractScore('Clarity'),
      relevance: extractScore('Relevance'),
      structureScore: extractScore('Structure'),
      communicationScore: extractScore('Communication'),
      feedback,
    };
  }

  private generateDefaultFeedback() {
    return {
      score: 70,
      strengths: ['Attempted to answer the question', 'Showed willingness to engage with the topic'],
      weaknesses: ['Response could be more detailed', 'Consider discussing specific technical aspects'],
      suggestions: ['Provide more concrete examples', 'Structure your answer with clear sections'],
      technicalAccuracy: 70,
      completeness: 65,
      clarity: 75,
      relevance: 70,
      structureScore: 65,
      communicationScore: 70,
      feedback: 'Your answer provides a reasonable starting point. To improve, focus on adding more technical depth and specific examples. Consider structuring your response to cover key concepts, practical applications, and potential trade-offs.',
    };
  }

  async generateFollowUpQuestions(question: string, answer: string, count: number = 3): Promise<string[]> {
    const cacheKey = `followup:${question}:${answer}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const messages = [
      {
        role: 'system' as const,
        content: `Generate ${count} relevant follow-up interview questions based on the original question and the candidate's answer. The questions should probe deeper into the topic and assess the candidate's depth of knowledge. Return the questions as a JSON array of strings.`,
      },
      {
        role: 'user' as const,
        content: `Original Question: ${question}\n\nCandidate's Answer: ${answer}`,
      },
    ];

    const result = await this.makeAIRequest(messages, LLM_MODELS.GPT3_5_TURBO, 0.8, 500);

    try {
      const questions = JSON.parse(result);
      if (Array.isArray(questions)) {
        this.setCache(cacheKey, questions.slice(0, count));
        return questions.slice(0, count);
      }
    } catch {
      // Fall through to default
    }

    const defaults = [
      'Can you elaborate on the specific implementation details of your approach?',
      'What alternative solutions exist and how would you choose between them?',
      'How would your solution handle edge cases or failure scenarios?',
    ];
    return defaults.slice(0, count);
  }

  async generateStudyPlan(
    userProfile: Partial<IUser>,
    weaknesses: string[],
    targetRole?: string
  ): Promise<Partial<IStudyPlan>> {
    const profileStr = JSON.stringify({
      experienceLevel: userProfile.profile?.experienceLevel,
      techStack: userProfile.profile?.techStack,
      targetRoles: userProfile.profile?.targetRoles,
      weaknesses,
      targetRole,
    });

    const messages = [
      { role: 'system' as const, content: STUDY_PLAN_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `Create a personalized interview preparation study plan based on the following profile and weaknesses:\n${profileStr}\n\nReturn the plan as a JSON object with: title, description, goals (array), topics (array of {name, priority, status, resources}), schedule (array of {date, topic, duration, completed}). Make it practical and achievable.`,
      },
    ];

    const result = await this.makeAIRequest(messages, LLM_MODELS.GPT4_TURBO, 0.7, 2000);

    try {
      const plan = JSON.parse(result);
      return {
        title: plan.title || 'Interview Preparation Plan',
        description: plan.description || 'Personalized study plan',
        goals: plan.goals || [],
        topics: plan.topics || [],
        schedule: plan.schedule || [],
      };
    } catch {
      return {
        title: 'Interview Preparation Plan',
        description: 'A comprehensive study plan to prepare for your upcoming interviews.',
        goals: ['Master core concepts', 'Practice with mock interviews', 'Build confidence'],
        topics: [
          { name: 'Core Technical Skills', priority: 'high', status: 'not-started', resources: ['Online courses', 'Practice platforms'] },
          { name: 'System Design', priority: 'high', status: 'not-started', resources: ['System design primers', 'Case studies'] },
          { name: 'Behavioral Preparation', priority: 'medium', status: 'not-started', resources: ['STAR method practice'] },
        ],
        schedule: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() + i * 86400000),
          topic: i % 2 === 0 ? 'Technical Practice' : 'Concept Review',
          duration: 120,
          completed: false,
        })),
      };
    }
  }

  async generateModelAnswer(question: string, context: { type: string; difficulty: string }): Promise<string> {
    return this.generateAnswer(question, context);
  }

  async transcribeAudio(audioBuffer: Buffer, language: string = 'en'): Promise<string> {
    if (!this.client) {
      logger.warn('OpenAI client not configured for transcription');
      return 'Transcription not available - API key not configured.';
    }

    try {
      const transcription = await this.client.audio.transcriptions.create({
        model: LLM_MODELS.WHISPER_1,
        file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
        language,
        response_format: 'text',
      });

      return transcription;
    } catch (error: any) {
      logger.error('Audio transcription failed:', error);
      throw new AppError('Failed to transcribe audio', 500, ERROR_CODES.SPEECH_SERVICE_ERROR);
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }
}

export const aiService = new AIService();
export default aiService;
