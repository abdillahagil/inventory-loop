import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Product from './Product.js';

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Product name stored directly in inventory table'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minimumStockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  lastUpdatedBy: {
    type: DataTypes.UUID
  }
}, {
  timestamps: true
});

// Define association
Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Inventory, { foreignKey: 'productId', as: 'inventories' });

export default Inventory; 