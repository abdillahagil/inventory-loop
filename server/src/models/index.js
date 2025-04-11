import { sequelize } from '../config/db.js';
import User from './User.js';
import Product from './Product.js';
import Inventory from './Inventory.js';
import Godown from './Godown.js';
import Shop from './Shop.js';

// Initialize models
const GodownModel = Godown(sequelize);
const ShopModel = Shop(sequelize);

// Import any additional models here

// Define additional relationships if needed

// Function to clear godown data on server restart
const clearGodownData = async () => {
  try {
    // Delete all records from the Godown table
    await GodownModel.destroy({
      where: {},  // Empty where clause means delete all records
      truncate: true, // Use truncate for faster deletion and to reset auto-increment
      cascade: true // Delete related records if there are any foreign key constraints
    });
    console.log('All godown data has been cleared successfully.');
    return true;
  } catch (error) {
    console.error('Failed to clear godown data:', error);
    return false;
  }
};

// Function to clear shop data on server restart
const clearShopData = async () => {
  try {
    // Delete all records from the Shop table
    await ShopModel.destroy({
      where: {},  // Empty where clause means delete all records
      truncate: true, // Use truncate for faster deletion and to reset auto-increment
      cascade: true // Delete related records if there are any foreign key constraints
    });
    console.log('All shop data has been cleared successfully.');
    return true;
  } catch (error) {
    console.error('Failed to clear shop data:', error);
    return false;
  }
};

// Function to clear product data on server restart
const clearProductData = async () => {
  try {
    // Delete all records from the Product table
    await Product.destroy({
      where: {},  // Empty where clause means delete all records
      truncate: { cascade: true } // Use truncate for faster deletion and cascade to delete related inventory
    });
    console.log('All product data has been cleared successfully.');
    return true;
  } catch (error) {
    console.error('Failed to clear product data:', error);
    return false;
  }
};

// Function to clear inventory data on server restart
const clearInventoryData = async () => {
  try {
    // Delete all records from the Inventory table
    await Inventory.destroy({
      where: {},  // Empty where clause means delete all records
      truncate: true // Use truncate for faster deletion
    });
    console.log('All inventory data has been cleared successfully.');
    return true;
  } catch (error) {
    console.error('Failed to clear inventory data:', error);
    return false;
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
    
    // Always clear all data on server restart, 
    // even if we're not doing a full resync (force=true)
    await clearGodownData();
    await clearShopData();
    await clearProductData();
    await clearInventoryData();
    
    // Seed initial data if needed
    if (force) {
      await seedInitialData();
    }
    
    return true;
  } catch (error) {
    console.error('Failed to synchronize database:', error);
    return false;
  }
};

// Function to seed initial data
const seedInitialData = async () => {
  try {
    // No initial data will be created
    console.log('Database initialized with no seed data');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

export {
  sequelize,
  User,
  Product,
  Inventory,
  GodownModel as Godown,
  ShopModel as Shop,
  syncDatabase,
  clearGodownData,
  clearShopData,
  clearProductData,
  clearInventoryData
}; 