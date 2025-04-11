// Test script to diagnose authentication issues
import { register } from './src/controllers/authController.js';

// Mock request and response
const mockReq = {
  body: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'superadmin'
  }
};

const mockRes = {
  status: (code) => {
    console.log(`Response status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('Response data:', data);
    return mockRes;
  }
};

// Test the register function
console.log('Testing register function with:', {
  ...mockReq.body,
  password: '[REDACTED]'
});

try {
  register(mockReq, mockRes)
    .then(() => console.log('Register function completed'))
    .catch(err => console.error('Register function failed:', err));
} catch (error) {
  console.error('Error testing register function:', error);
} 