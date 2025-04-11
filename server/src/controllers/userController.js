import { User } from '../models/index.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    // Process users - for godownadmin users, add locationIds derived from location
    const processedUsers = users.map(user => {
      const userData = user.toJSON();
      
      // For godownadmin users with location data, prepare locationIds
      if (userData.role === 'godownadmin' && userData.location) {
        // locationIds will be populated on the client side by matching godown names
        userData.locationIds = [];
      }
      
      return userData;
    });
    
    res.json(processedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/SuperAdmin
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/SuperAdmin
const createUser = async (req, res) => {
  try {
    const { email, password, name, role, location, locationIds } = req.body;
    
    console.log('Create user request received:', {
      email,
      name,
      role,
      location,
      locationIds: locationIds || 'None provided'
    });
    
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      location
    });
    
    // Prepare response (without password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      location: user.location,
      isActive: user.isActive
    };
    
    // If this is a godownadmin user and locationIds were provided, include them in the response
    if (role === 'godownadmin' && locationIds) {
      userResponse.locationIds = locationIds;
    }
    
    console.log('User created successfully. Response:', userResponse);
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
const updateUser = async (req, res) => {
  try {
    const { email, password, name, role, location, isActive, locationIds } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the new email exists for a different user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Update user
    if (email) user.email = email;
    if (password) user.password = password;
    if (name) user.name = name;
    if (role) user.role = role;
    if (location !== undefined) user.location = location;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    // Prepare response (without password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      location: user.location,
      isActive: user.isActive
    };
    
    // If this is a godownadmin user and locationIds were provided, include them in the response
    if (role === 'godownadmin' && locationIds) {
      userResponse.locationIds = locationIds;
    }
    
    res.json(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser }; 