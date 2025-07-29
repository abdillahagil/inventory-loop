# Migrations Folder

Place your migration files here. Each migration file should export an async function named `up`:

```js
// Example migration file: 001-add-sample.js
export async function up(sequelize) {
  // Your migration logic here, e.g.:
  // await sequelize.query('ALTER TABLE ...');
}
```

Migration files are run in filename order after all tables are dropped and recreated. 