import { Inventory, Product, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    // For godown and shop admins, show their location's inventory and unassigned items if they're godown admin
    let whereClause = {};

    if (req.user.role === 'godownadmin' && req.user.location) {
      // Parse the comma-separated godown names from the user's location
      const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
      console.log('Godown admin assigned locations:', assignedGodownNames);

      // GodownAdmin can see their assigned location inventory AND unassigned inventory
      whereClause = {
        [Op.or]: [
          { location: { [Op.in]: assignedGodownNames } }, // Match any of the assigned godowns
          { location: 'Unassigned' }
        ]
      };
    } else if (req.user.role === 'shopadmin' && req.user.location) {
      // ShopAdmin can only see their location
      whereClause = { location: req.user.location };
    }
    // SuperAdmin can see all inventory (empty whereClause)

    const inventory = await Inventory.findAll({
      where: whereClause,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'category', 'imageUrl', 'price', 'costPrice']
      }]
    });

    // Transform data to include product details directly
    const transformedInventory = inventory.map(item => ({
      id: item.id,
      name: item.name || item.product.name, // Use inventory name if available, falling back to product name
      sku: item.product.sku,
      category: item.product.category,
      location: item.location,
      quantity: item.quantity,
      unit: 'pcs', // Default unit
      status: item.quantity <= item.minimumStockLevel ? 'Low' : 'Normal',
      lastUpdated: item.updatedAt.toISOString().split('T')[0],
      price: item.product.price,
      costPrice: item.product.costPrice,
      productId: item.productId
    }));

    res.json(transformedInventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error retrieving inventory' });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockItems = async (req, res) => {
  try {
    // For godown and shop admins, only show their location's inventory
    let whereClause = {};

    if (req.user.role === 'godownadmin' && req.user.location) {
      // Parse the comma-separated godown names from the user's location
      const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
      console.log('Godown admin assigned locations for low stock check:', assignedGodownNames);

      // Find low stock items in any of the assigned godowns
      whereClause.location = { [Op.in]: assignedGodownNames };
    } else if (req.user.role === 'shopadmin' && req.user.location) {
      // Shop admins can only see their location
      whereClause.location = req.user.location;
    }
    // SuperAdmin can see all low stock items (empty whereClause)

    // Add condition to only get items where quantity <= minimumStockLevel
    const inventory = await Inventory.findAll({
      where: {
        ...whereClause,
        quantity: {
          [Op.lte]: sequelize.col('minimumStockLevel')
        }
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'category', 'imageUrl']
      }]
    });

    res.json(inventory);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error retrieving low stock items' });
  }
};

// @desc    Get inventory by ID
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'category', 'imageUrl']
      }]
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if user has access to this inventory location
    if (req.user.role === 'superadmin') {
      // Super admin can access all inventory
    } else if (req.user.role === 'godownadmin' && req.user.location) {
      // Parse the comma-separated godown names from the user's location
      const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
      console.log('Godown admin assigned locations:', assignedGodownNames);

      // Allow godown admins to access their assigned godowns and Unassigned items
      if (inventory.location !== 'Unassigned' && !assignedGodownNames.includes(inventory.location)) {
        return res.status(403).json({ message: 'Not authorized to access this inventory location' });
      }
    } else if (req.user.role === 'shopadmin' && req.user.location !== inventory.location) {
      // Shop admins can only access their assigned shop
      return res.status(403).json({ message: 'Not authorized to access this inventory location' });
    }

    res.json(inventory);
  } catch (error) {
    console.error('Get inventory by id error:', error);
    res.status(500).json({ message: 'Server error retrieving inventory item' });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private/SuperAdmin,GodownAdmin
const createInventory = async (req, res) => {
  try {
    const { productId, location, quantity, minimumStockLevel, price, costPrice, name, sku, category } = req.body;

    let product;

    // If product ID is provided, use existing product
    if (productId) {
      // Check if product exists
      product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // For superadmins, they can use any location
      if (req.user.role === 'superadmin') {
        // No location check required
      }
      // For godown admins, they can only create inventory for their assigned locations
      else if (req.user.role === 'godownadmin' && req.user.location) {
        // Parse the comma-separated godown names from the user's location
        const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
        console.log('Godown admin assigned locations for create inventory:', assignedGodownNames);

        // Check if the provided location is one of their assigned godowns
        if (!assignedGodownNames.includes(location)) {
          return res.status(403).json({
            message: 'You can only create inventory for your assigned locations'
          });
        }
      }
      // For shop admins, they can only create inventory for their own shop
      else if (req.user.role === 'shopadmin' && req.user.location !== location) {
        return res.status(403).json({
          message: 'You can only create inventory for your own location'
        });
      }
    }
    // If productId is not provided and user is superadmin or godownadmin, create a new product
    else if ((req.user.role === 'superadmin' || req.user.role === 'godownadmin') && name && sku) {
      // Check if product with same SKU already exists
      const productExists = await Product.findOne({ where: { sku } });

      if (productExists) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }

      // Create new product
      product = await Product.create({
        name,
        sku,
        category: category || 'Uncategorized',
        price: price || 0,
        costPrice: costPrice || 0,
        isActive: true
      });
    } else {
      return res.status(400).json({
        message: 'Either a valid productId or product details (name, sku) must be provided'
      });
    }

    // Allow superadmins to create unassigned inventory items
    const inventoryLocation = location || (req.user.role === 'superadmin' ? 'Unassigned' : null);

    if (!inventoryLocation) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Check if inventory for this product at this location already exists
    const inventoryExists = await Inventory.findOne({
      where: { productId: product.id, location: inventoryLocation }
    });

    if (inventoryExists) {
      return res.status(400).json({
        message: 'Inventory for this product at this location already exists'
      });
    }

    // Create inventory item with product name
    const inventory = await Inventory.create({
      productId: product.id,
      name: product.name, // Store the product name in the inventory table
      location: inventoryLocation,
      quantity: quantity || 0,
      minimumStockLevel: minimumStockLevel || 10,
      lastUpdatedBy: req.user.id
    });

    res.status(201).json({
      ...inventory.toJSON(),
      product: product.toJSON()
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ message: 'Server error creating inventory item' });
  }
};

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Private/SuperAdmin,GodownAdmin,ShopAdmin
const updateInventory = async (req, res) => {
  try {
    console.log('Received update request with body:', req.body);

    const inventory = await Inventory.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'product',
      }]
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    console.log('Found inventory item:', inventory.id);
    console.log('Associated product:', inventory.product ? inventory.product.id : 'None');

    // Check if user has access to update this inventory
    // SuperAdmin can update anything
    // GodownAdmin can update items in their location AND assign unassigned items to any godown
    // ShopAdmin can only update their location items
    let canUpdate = false;

    // Extensive debug logging
    console.log('--------- Authorization Check Debug ---------');
    console.log('User role:', req.user.role);
    console.log('User location:', req.user.location);
    console.log('User ID:', req.user.id);
    console.log('Inventory location:', inventory.location);
    console.log('Requested location change:', req.body.location);
    console.log('------------------------------------------');

    if (req.user.role === 'superadmin') {
      // Superadmin can edit any inventory
      canUpdate = true;
    } else if (req.user.role === 'godownadmin') {
      // GodownAdmin can edit inventory in their assigned godowns OR any Unassigned inventory
      if (req.user.location) {
        const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
        // Allow edit if inventory is in one of their godowns
        if (assignedGodownNames.includes(inventory.location)) {
          canUpdate = true;
        } else if (inventory.location === 'Unassigned') {
          // Allow editing any Unassigned inventory (not just assignment)
          canUpdate = true;
        } else {
          // Not allowed
        }
      }
    } else if (req.user.role === 'shopadmin' && req.user.location === inventory.location) {
      canUpdate = true;
    }

    if (!canUpdate) {
      return res.status(403).json({
        message: 'Not authorized to update this inventory location'
      });
    }

    const { quantity, minimumStockLevel, name, price, costPrice, location, originalQuantity, productId } = req.body;

    const { category } = req.body;
    console.log('Extracted fields from request:', { quantity, minimumStockLevel, name, price, costPrice, location, originalQuantity, productId, category });

    // Start a transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // Check if this is a partial assignment from Unassigned to a godown
      if (inventory.location === 'Unassigned' && location && location !== 'Unassigned' &&
        quantity && originalQuantity && quantity < originalQuantity) {

        console.log('Processing partial assignment from Unassigned to godown');

        // 1. Create a new inventory record for the godown with the specified quantity
        const newInventory = await Inventory.create({
          productId: inventory.productId,
          location: location,
          quantity: quantity,
          minimumStockLevel: inventory.minimumStockLevel,
          lastUpdatedBy: req.user.id
        }, { transaction });

        console.log('Created new inventory record for godown:', newInventory.id);

        // 2. Update the original unassigned inventory with the remaining quantity
        const remainingQuantity = originalQuantity - quantity;
        await inventory.update({
          quantity: remainingQuantity
        }, { transaction });

        console.log('Updated original inventory with remaining quantity:', remainingQuantity);

        // 3. Update associated product if needed
        if (name !== undefined || price !== undefined || costPrice !== undefined || category !== undefined) {
          console.log('Updating product fields:', { name, price, costPrice, category });
          // Convert price and costPrice to proper decimal values
          const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
          const parsedCostPrice = costPrice !== undefined ? parseFloat(costPrice) : undefined;
          console.log('Parsed price values:', { parsedPrice, parsedCostPrice });
          if (!inventory.product) {
            console.log('No product associated with inventory in the initial query. Fetching product directly...');
            // If product not included in the inventory query result, fetch it separately
            const productId = inventory.productId;
            console.log('Product ID from inventory record:', productId);
            const product = await Product.findByPk(productId, { transaction });
            if (product) {
              console.log('Found product to update:', product.id, 'with current values:', {
                name: product.name,
                price: product.price,
                costPrice: product.costPrice,
                category: product.category
              });
              if (name !== undefined) {
                product.name = name;
                // Also update the name in the inventory record
                inventory.name = name;
              }
              if (parsedPrice !== undefined) product.price = parsedPrice;
              if (parsedCostPrice !== undefined) product.costPrice = parsedCostPrice;
              if (category !== undefined) product.category = category;
              await product.save({ transaction });
              console.log('Saved product changes. New values:', {
                name: product.name,
                price: product.price,
                costPrice: product.costPrice,
                category: product.category
              });
            } else {
              console.log('No product found for ID:', productId);
            }
          } else {
            console.log('Product already loaded with inventory:', inventory.product.id);
            const product = inventory.product;
            console.log('Current product values:', {
              name: product.name,
              price: product.price,
              costPrice: product.costPrice,
              category: product.category
            });
            if (name !== undefined) {
              product.name = name;
              // Also update the name in the inventory record
              inventory.name = name;
            }
            if (parsedPrice !== undefined) product.price = parsedPrice;
            if (parsedCostPrice !== undefined) product.costPrice = parsedCostPrice;
            if (category !== undefined) product.category = category;
            await product.save({ transaction });
            console.log('Saved product changes. New values:', {
              name: product.name,
              price: product.price,
              costPrice: product.costPrice,
              category: product.category
            });
          }
        }

        // Commit the transaction
        await transaction.commit();
        console.log('Transaction committed successfully');

        // Fetch the updated inventory with product details
        const updatedInventory = await Inventory.findByPk(inventory.id, {
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'category', 'imageUrl', 'price', 'costPrice']
          }]
        });

        // Transform the data to match the format of getInventory
        const transformedInventory = {
          id: updatedInventory.id,
          name: updatedInventory.product.name,
          sku: updatedInventory.product.sku,
          category: updatedInventory.product.category,
          location: updatedInventory.location,
          quantity: updatedInventory.quantity,
          unit: 'pcs', // Default unit
          status: updatedInventory.quantity <= updatedInventory.minimumStockLevel ? 'Low' : 'Normal',
          lastUpdated: updatedInventory.updatedAt.toISOString().split('T')[0],
          price: updatedInventory.product.price,
          costPrice: updatedInventory.product.costPrice,
          productId: updatedInventory.productId
        };

        console.log('Sending response with transformed inventory:', transformedInventory);
        res.json(transformedInventory);

        return;
      }

      // Regular update logic for non-partial assignments
      // Update inventory fields
      if (quantity !== undefined) inventory.quantity = quantity;
      if (minimumStockLevel !== undefined) inventory.minimumStockLevel = minimumStockLevel;
      if (location !== undefined) inventory.location = location;

      // Track who updated it
      inventory.lastUpdatedBy = req.user.id;

      // Save inventory changes
      await inventory.save({ transaction });
      console.log('Saved inventory changes');

      // Update associated product if needed
      if (name !== undefined || price !== undefined || costPrice !== undefined || category !== undefined) {
        console.log('Updating product fields:', { name, price, costPrice, category });
        // Convert price and costPrice to proper decimal values
        const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
        const parsedCostPrice = costPrice !== undefined ? parseFloat(costPrice) : undefined;
        console.log('Parsed price values:', { parsedPrice, parsedCostPrice });
        if (!inventory.product) {
          console.log('No product associated with inventory in the initial query. Fetching product directly...');
          // If product not included in the inventory query result, fetch it separately
          const productId = inventory.productId;
          console.log('Product ID from inventory record:', productId);
          const product = await Product.findByPk(productId, { transaction });
          if (product) {
            console.log('Found product to update:', product.id, 'with current values:', {
              name: product.name,
              price: product.price,
              costPrice: product.costPrice,
              category: product.category
            });
            if (name !== undefined) {
              product.name = name;
              // Also update the name in the inventory record
              inventory.name = name;
            }
            if (parsedPrice !== undefined) product.price = parsedPrice;
            if (parsedCostPrice !== undefined) product.costPrice = parsedCostPrice;
            if (category !== undefined) product.category = category;
            await product.save({ transaction });
            console.log('Saved product changes. New values:', {
              name: product.name,
              price: product.price,
              costPrice: product.costPrice,
              category: product.category
            });
          } else {
            console.log('No product found for ID:', productId);
          }
        } else {
          console.log('Product already loaded with inventory:', inventory.product.id);
          const product = inventory.product;
          console.log('Current product values:', {
            name: product.name,
            price: product.price,
            costPrice: product.costPrice,
            category: product.category
          });
          if (name !== undefined) {
            product.name = name;
            // Also update the name in the inventory record
            inventory.name = name;
          }
          if (parsedPrice !== undefined) product.price = parsedPrice;
          if (parsedCostPrice !== undefined) product.costPrice = parsedCostPrice;
          if (category !== undefined) product.category = category;
          await product.save({ transaction });
          console.log('Saved product changes. New values:', {
            name: product.name,
            price: product.price,
            costPrice: product.costPrice,
            category: product.category
          });
        }
      } else {
        console.log('No product fields to update');
      }

      // Commit the transaction
      await transaction.commit();
      console.log('Transaction committed successfully');

      // Fetch the updated inventory with product details
      const updatedInventory = await Inventory.findByPk(inventory.id, {
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category', 'imageUrl', 'price', 'costPrice']
        }]
      });

      // Transform the data to match the format of getInventory
      const transformedInventory = {
        id: updatedInventory.id,
        name: updatedInventory.product.name,
        sku: updatedInventory.product.sku,
        category: updatedInventory.product.category,
        location: updatedInventory.location,
        quantity: updatedInventory.quantity,
        unit: 'pcs', // Default unit
        status: updatedInventory.quantity <= updatedInventory.minimumStockLevel ? 'Low' : 'Normal',
        lastUpdated: updatedInventory.updatedAt.toISOString().split('T')[0],
        price: updatedInventory.product.price,
        costPrice: updatedInventory.product.costPrice,
        productId: updatedInventory.productId
      };

      console.log('Sending response with transformed inventory:', transformedInventory);
      res.json(transformedInventory);
    } catch (error) {
      // Rollback transaction if an error occurs
      await transaction.rollback();
      console.error('Transaction rolled back due to error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error updating inventory item' });
  }
};

// @desc    Delete inventory
// @route   DELETE /api/inventory/:id
// @access  Private/SuperAdmin
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Only super admin or authorized godownadmin can delete inventory items
    if (req.user.role === 'superadmin') {
      // allow
    } else if (req.user.role === 'godownadmin') {
      if (req.user.location) {
        const assignedGodownNames = req.user.location.split(',').map(name => name.trim());
        if (!assignedGodownNames.includes(inventory.location)) {
          return res.status(403).json({
            message: 'GodownAdmin not authorized to delete inventory from this location'
          });
        }
        // allow
      } else {
        return res.status(403).json({
          message: 'GodownAdmin has no assigned locations'
        });
      }
    } else {
      return res.status(403).json({
        message: 'Not authorized to delete inventory items'
      });
    }

    // Start a transaction to ensure both operations succeed or fail together
    const transaction = await sequelize.transaction();

    try {
      // If the inventory is assigned (not 'Unassigned'), move its quantity to the unassigned stock
      if (inventory.location !== 'Unassigned') {
        // Find or create the unassigned inventory for this product
        let unassignedInventory = await Inventory.findOne({
          where: { productId: inventory.productId, location: 'Unassigned' },
          transaction
        });
        if (unassignedInventory) {
          // Add the quantity to the unassigned inventory
          unassignedInventory.quantity += inventory.quantity;
          await unassignedInventory.save({ transaction });
        } else {
          // Create a new unassigned inventory row
          unassignedInventory = await Inventory.create({
            productId: inventory.productId,
            name: inventory.name,
            quantity: inventory.quantity,
            location: 'Unassigned',
            status: inventory.status,
            price: inventory.price,
            costPrice: inventory.costPrice,
            minimumStockLevel: inventory.minimumStockLevel
          }, { transaction });
        }
      }
      // Delete the inventory item
      await inventory.destroy({ transaction });
      // If this was the last inventory item for this product, delete the product too
      const remainingInventory = await Inventory.count({
        where: { productId: inventory.productId },
        transaction
      });
      if (remainingInventory === 0 && inventory.product) {
        await inventory.product.destroy({ transaction });
      }
      // Commit the transaction
      await transaction.commit();
      res.json({ message: 'Inventory item deleted. If assigned, quantity returned to unassigned stock.' });
    } catch (error) {
      // Rollback the transaction if anything fails
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ message: 'Server error deleting inventory item' });
  }
};

export {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getLowStockItems
}; 