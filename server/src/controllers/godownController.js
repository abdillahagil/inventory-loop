import { Godown } from '../models/index.js';

// @desc    Get all godowns
// @route   GET /api/godowns
// @access  Private/SuperAdmin,GodownAdmin
const getGodowns = async (req, res) => {
  try {
    // Debug the user object completely
    console.log('========== USER DEBUG INFO ==========');
    console.log('User object:', JSON.stringify(req.user, null, 2));
    console.log('User headers:', req.headers);
    console.log('User role:', req.user.role);
    console.log('User location:', req.user.location);
    console.log('User ID:', req.user.id);
    console.log('======================================');
    
    // Determine if filtering is needed based on user role
    let godowns;
    
    console.log('Fetching godowns for role:', req.user.role);
    
    if (req.user.role === 'superadmin') {
      // Superadmin can see all godowns
      console.log('User is a superadmin, fetching all godowns');
      godowns = await Godown.findAll({
        order: [['createdAt', 'DESC']]
      });
    } else if (req.user.role === 'godownadmin') {
      // GodownAdmin should only see their assigned godowns
      console.log('User is a godownadmin, fetching assigned godowns');
      
      if (req.user.location) {
        // Parse the location string to get assigned godown names
        const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
        console.log('Assigned godown names:', assignedGodownNames);
        
        // Fetch only the godowns that match these names
        godowns = await Godown.findAll({
          where: {
            name: assignedGodownNames
          },
          order: [['createdAt', 'DESC']]
        });
        
        console.log(`Found ${godowns.length} godowns assigned to this user`);
      } else {
        console.log('GodownAdmin has no assigned locations');
        godowns = [];
      }
    } else {
      console.log(`User role ${req.user.role} not authorized to access godowns`);
      return res.status(403).json({ message: 'Not authorized to access godowns' });
    }
    
    // Log for debugging
    console.log(`Returning ${godowns?.length || 0} godowns for user ${req.user.name} (${req.user.role})`);
    
    res.json(godowns || []);
  } catch (error) {
    console.error('Get godowns error:', error);
    res.status(500).json({ message: 'Server error retrieving godowns' });
  }
};

// @desc    Get single godown by ID
// @route   GET /api/godowns/:id
// @access  Private/SuperAdmin,GodownAdmin
const getGodownById = async (req, res) => {
  try {
    const godown = await Godown.findByPk(req.params.id);
    
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }
    
    // Check permissions - godown admins can only view their assigned location
    if (req.user.role === 'godownadmin' && godown.location !== req.user.location) {
      return res.status(403).json({ message: 'Not authorized to access this godown' });
    }
    
    res.json(godown);
  } catch (error) {
    console.error('Get godown by id error:', error);
    res.status(500).json({ message: 'Server error retrieving godown' });
  }
};

// @desc    Create a new godown
// @route   POST /api/godowns
// @access  Private/SuperAdmin
const createGodown = async (req, res) => {
  try {
    console.log('Create godown request received:', req.body);
    const { name, location, isActive } = req.body;
    
    // Log user details for debugging
    console.log('User attempting to create godown:', {
      userId: req.user?.id,
      role: req.user?.role,
      name: req.user?.name
    });
    
    // Only superadmin can create godowns
    if (req.user.role !== 'superadmin') {
      console.log('Authorization failed: User role is not superadmin');
      return res.status(403).json({ message: 'Not authorized to create godowns' });
    }
    
    // Validate required fields
    if (!name || !location) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Name and location are required' });
    }
    
    // Create godown
    console.log('Creating godown with data:', { name, location, isActive });
    const godown = await Godown.create({
      name,
      location,
      isActive: isActive !== undefined ? isActive : true
    });
    
    console.log('Godown created successfully:', godown.id);
    res.status(201).json(godown);
  } catch (error) {
    console.error('Create godown error - Full details:', error);
    // Send more detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        message: 'Server error creating godown',
        error: error.message,
        stack: error.stack
      });
    } else {
      // Send limited info in production
      res.status(500).json({ message: 'Server error creating godown' });
    }
  }
};

// @desc    Update a godown
// @route   PUT /api/godowns/:id
// @access  Private/SuperAdmin
const updateGodown = async (req, res) => {
  try {
    // Only superadmin can update godowns
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to update godowns' });
    }
    
    const godown = await Godown.findByPk(req.params.id);
    
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }
    
    const { name, location, isActive } = req.body;
    
    // Update fields if provided
    if (name) godown.name = name;
    if (location) godown.location = location;
    if (isActive !== undefined) godown.isActive = isActive;
    
    await godown.save();
    
    res.json(godown);
  } catch (error) {
    console.error('Update godown error:', error);
    res.status(500).json({ message: 'Server error updating godown' });
  }
};

// @desc    Delete a godown
// @route   DELETE /api/godowns/:id
// @access  Private/SuperAdmin
const deleteGodown = async (req, res) => {
  try {
    // Only superadmin can delete godowns
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to delete godowns' });
    }
    
    const godown = await Godown.findByPk(req.params.id);
    
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }
    
    // TODO: Check if there's inventory in this godown before deleting
    // If so, maybe don't allow deletion or require confirmation
    
    await godown.destroy();
    
    res.json({ message: 'Godown removed successfully' });
  } catch (error) {
    console.error('Delete godown error:', error);
    res.status(500).json({ message: 'Server error deleting godown' });
  }
};

export { getGodowns, getGodownById, createGodown, updateGodown, deleteGodown }; 