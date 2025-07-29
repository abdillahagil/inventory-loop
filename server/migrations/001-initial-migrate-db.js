// Migration: Drop and recreate all tables
export async function up(sequelize) {
  console.log('Dropping and recreating all tables...');
  await sequelize.sync({ force: true });
  console.log('All tables dropped and recreated.');
} 