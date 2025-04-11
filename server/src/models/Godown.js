import { DataTypes } from 'sequelize';

/**
 * Godown model - represents a warehouse/storage location
 */
const Godown = (sequelize) => {
  const GodownModel = sequelize.define('Godown', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return GodownModel;
};

export default Godown; 