import { User } from '../models/index.js';

// @desc    Get recent activities
// @route   GET /api/activities
// @access  Private
const getRecentActivities = async (req, res) => {
  try {
    // Since we don't have a proper activities model yet, we'll return mock data
    // In a real application, you would query an Activities model
    const mockActivities = [
      {
        id: '1',
        action: 'inventory_update',
        description: 'Updated inventory for item XYZ-123',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
      },
      {
        id: '2',
        action: 'product_added',
        description: 'Added new product ABC-456',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '3',
        action: 'transfer_created',
        description: 'Created transfer from Warehouse A to Shop B',
        user: req.user.name,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
      }
    ];
    
    res.json(mockActivities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error retrieving activities' });
  }
};

export { getRecentActivities }; 