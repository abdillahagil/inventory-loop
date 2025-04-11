import { Shop } from '../models/index.js';

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = async (req, res) => {
  try {
    // Get all shops ordered by creation date
    const shops = await Shop.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json(shops);
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ message: 'Server error retrieving shops' });
  }
};

// @desc    Get single shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    res.json(shop);
  } catch (error) {
    console.error('Get shop by id error:', error);
    res.status(500).json({ message: 'Server error retrieving shop' });
  }
};

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Public
const createShop = async (req, res) => {
  try {
    console.log('Create shop request received:', req.body);
    const { name, location, isActive } = req.body;
    
    // Validate required fields
    if (!name || !location) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Name and location are required' });
    }
    
    // Create shop
    console.log('Creating shop with data:', { name, location, isActive });
    const shop = await Shop.create({
      name,
      location,
      isActive: isActive !== undefined ? isActive : true
    });
    
    console.log('Shop created successfully:', shop.id);
    res.status(201).json(shop);
  } catch (error) {
    console.error('Create shop error - Full details:', error);
    // Send more detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        message: 'Server error creating shop',
        error: error.message,
        stack: error.stack
      });
    } else {
      // Send limited info in production
      res.status(500).json({ message: 'Server error creating shop' });
    }
  }
};

// @desc    Update a shop
// @route   PUT /api/shops/:id
// @access  Public
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    const { name, location, isActive } = req.body;
    
    // Update fields if provided
    if (name) shop.name = name;
    if (location) shop.location = location;
    if (isActive !== undefined) shop.isActive = isActive;
    
    await shop.save();
    
    res.json(shop);
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({ message: 'Server error updating shop' });
  }
};

// @desc    Delete a shop
// @route   DELETE /api/shops/:id
// @access  Public
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    await shop.destroy();
    
    res.json({ message: 'Shop removed successfully' });
  } catch (error) {
    console.error('Delete shop error:', error);
    res.status(500).json({ message: 'Server error deleting shop' });
  }
};

export { getShops, getShopById, createShop, updateShop, deleteShop }; 