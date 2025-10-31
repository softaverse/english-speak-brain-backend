// Jest setup file
// Add any global test configurations here

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/englishbrain_test';
process.env.REDIS_URL = 'redis://localhost:6380';
process.env.OPENAI_API_KEY = 'test-key';
