# Database Migration Scripts

This directory contains scripts for database migrations and updates.

## Updating Inventory Names

The `updateInventoryNames.js` script populates the newly added `name` column in the Inventory table with the associated product names.

### Running the script

To run the script:

```bash
# Navigate to the server directory
cd server

# Run the script with Node
node src/scripts/updateInventoryNames.js
```

This script should be run once after deploying the code changes that add the name column to the Inventory table. The script will:

1. Find all inventory records that don't have a name set
2. Update each record with the associated product name
3. Log the number of records updated

Note: The script uses a transaction to ensure all updates are atomic. If any update fails, all changes will be rolled back. 