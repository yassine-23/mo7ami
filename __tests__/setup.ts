/**
 * Jest setup file for integration tests
 */

// Load environment variables
require('dotenv').config({ path: '.env' });

// Set test timeout
jest.setTimeout(60000);

// Mock console for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),  // Suppress console.log in tests
  debug: jest.fn(),
  info: jest.fn(),
};
