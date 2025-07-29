import dotenv from 'dotenv';
import { sequelize } from '../src/models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname);

async function runMigrations() {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js') && f !== 'run-migrations.js')
    .sort();
  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    console.log(`Running migration: ${file}`);
    const migration = await import(pathToFileURL(migrationPath).href);
    if (typeof migration.up === 'function') {
      await migration.up(sequelize);
      console.log(`Migration ${file} completed.`);
    } else {
      console.warn(`Migration ${file} does not export an 'up' function. Skipping.`);
    }
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    await runMigrations();
    console.log('All migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})(); 