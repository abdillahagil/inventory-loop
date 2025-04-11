import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const protect = async (req, res, next) => {
  let token;
  
  console.log('====== AUTH MIDDLEWARE - PROTECT ======');
  console.log('Auth headers:', req.headers.authorization ? 
    `${req.headers.authorization.substring(0, 20)}...` : 'No authorization header');
  
  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'Empty token');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully. User ID:', decoded.id);
      
      // Get user from token payload
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      console.log('User found in protect middleware:', req.user ? {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        location: req.user.location
      } : 'User not found');
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    console.log('No token found in request');
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('====== AUTH MIDDLEWARE - AUTHORIZE ======');
    console.log('Checking role authorization. Allowed roles:', roles);
    console.log('User role:', req.user?.role);
    
    if (!req.user) {
      console.log('No user found in request object');
      return res.status(401).json({ message: 'Not authorized, please login' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Role ${req.user.role} not included in allowed roles:`, roles);
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this resource`
      });
    }
    
    console.log('User authorized successfully');
    next();
  };
};

export { protect, authorize }; 