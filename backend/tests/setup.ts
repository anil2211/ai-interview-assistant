import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer: MongoMemoryServer;
let isConnected = false;

async function connect(): Promise<void> {
  if (isConnected) return;
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  isConnected = true;
}

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

export const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'TestPass123!',
};

export const testAdmin = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'AdminPass123!',
};

export const createTestUser = async () => {
  const User = mongoose.model('User');
  const user = new User(testUser);
  await user.save();
  return user;
};

export const createTestAdmin = async () => {
  const User = mongoose.model('User');
  const user = new User({ ...testAdmin, role: 'admin' });
  await user.save();
  return user;
};

export const createTestInterview = async (userId: string, type = 'coding', difficulty = 'intermediate') => {
  const Interview = mongoose.model('Interview');
  const interview = new Interview({
    userId,
    type,
    difficulty,
    status: 'in-progress',
    questions: [
      {
        questionId: new mongoose.Types.ObjectId(),
        question: 'What is the time complexity of binary search?',
        answer: 'O(log n)',
        aiGenerated: false,
      },
      {
        questionId: new mongoose.Types.ObjectId(),
        question: 'Explain the difference between REST and GraphQL',
        aiGenerated: true,
      },
    ],
    startedAt: new Date(),
  });
  await interview.save();
  return interview;
};
