import { sequelize, Godown, User } from './models/index.js';

/**
 * Seed script to populate test data
 */
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Seed godowns unconditionally
    console.log('Seeding godowns...');
    console.log('Godown model:', Godown);
    
    // Create test godowns
    const godowns = [
      {
        name: 'Main Warehouse',
        location: 'Main Street, City Center',
        isActive: true
      },
      {
        name: 'North Storage',
        location: 'North Industrial Zone',
        isActive: true
      },
      {
        name: 'East Facility',
        location: 'East Highway Exit 12',
        isActive: true
      },
      {
        name: 'South Distribution Center',
        location: 'South Port Area',
        isActive: true
      }
    ];
    
    try {
      // Check if there are existing godowns
      const existingGodowns = await Godown.findAll();
      console.log(`Found ${existingGodowns.length} existing godowns`);
      
      // Only seed if no godowns exist
      if (existingGodowns.length === 0) {
        for (const godownData of godowns) {
          await Godown.create(godownData);
          console.log(`Created godown: ${godownData.name}`);
        }
        console.log('Godown seeding complete!');
      } else {
        console.log('Godowns already exist, skipping seeding.');
      }
    } catch (error) {
      console.error('Error working with Godown model:', error);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Execute the seeding function
seedDatabase(); 