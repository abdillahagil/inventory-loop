import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    
    // Support both username and email fields for backward compatibility
    let { email, username, password, name, role, location } = req.body;
    
    // If username is provided but email is not, use username as email
    if (!email && username) {
      email = username;
      console.log('Using username as email:', email);
    }
    
    console.log('Normalized values:', { 
      email, 
      username, 
      password: password ? '[REDACTED]' : undefined, 
      name, 
      role, 
      location 
    });
    
    // Validate request
    if (!email || !password || !name || !role) {
      console.log('Missing fields:', { 
        email: !email, 
        password: !password, 
        name: !name, 
        role: !role 
      });
      
      return res.status(400).json({ 
        message: 'Please provide email, password, name, and role' 
      });
    }
    
    // Check if email is already taken
    const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({ message: 'Email already taken' });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password, // will be hashed by model hooks
      name,
      role,
      location: location || null
    });
    
    // Return user with token
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    
    // Support both username and email fields
    let { email, username, password, userType } = req.body;
    
    // If username is provided but email is not, use username as email
    if (!email && username) {
      email = username;
      console.log('Using username as email:', email);
    }
    
    console.log('Normalized values:', { 
      email, 
      username, 
      password: password ? '[REDACTED]' : undefined, 
      userType 
    });
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Check for user
    const user = await User.findOne({ where: { email, role: userType } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled, please contact admin' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create response without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location
    };
    
    // Return user with token
    res.json({
      ...userResponse,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};

export { register, login, getMe }; 