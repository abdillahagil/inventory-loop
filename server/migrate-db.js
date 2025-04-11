// This script handles database migrations and data reset
import dotenv from 'dotenv';
import { sequelize } from './src/models/index.js';

// Load environment variables
dotenv.config();

// Enable Sequelize logging
sequelize.options.logging = console.log;

async function migrateDatabase() {
  try {
    console.log('Starting database migration process...');
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Drop and recreate all tables in the database
    console.log('Erasing all database tables...');
    console.log('This will remove the username column and add an email column');
    await sequelize.sync({ force: true });
    
    console.log('Database migration completed successfully - All tables have been reset');
    console.log('Users now use email for authentication instead of username');
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Database migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (process.argv[1].includes('migrate-db.js')) {
  migrateDatabase();
}

export { migrateDatabase }; 