import { Inventory, Product, sequelize } from '../models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Script to populate the inventory name field from associated products
 */
const populateInventoryNames = async () => {
  console.log('Starting inventory name update script...');
  
  // Get all inventory items that don't have a name set
  try {
    const inventoryItems = await Inventory.findAll({
      where: {
        name: null // Find items where name is null
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name']
      }]
    });
    
    console.log(`Found ${inventoryItems.length} inventory items without names`);
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      let updated = 0;
      
      // Update each inventory item with its product name
      for (const item of inventoryItems) {
        if (item.product && item.product.name) {
          item.name = item.product.name;
          await item.save({ transaction });
          updated++;
        } else {
          console.log(`Warning: No product name found for inventory id: ${item.id}`);
        }
      }
      
      // Commit the transaction
      await transaction.commit();
      console.log(`Successfully updated ${updated} inventory items with product names`);
    } catch (error) {
      // Rollback if there was an error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating inventory names:', error);
    process.exit(1);
  }
  
  console.log('Inventory name update completed');
  process.exit(0);
};

// Run the script
populateInventoryNames(); 