// Load environment variables
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize environment variables
dotenv.config();

console.log('Running fix-missing-seller-ids migration...');

try {
  // Run the migration script directly
  execSync('node src/migrations/fix-missing-seller-ids.js', { 
    stdio: 'inherit'
  });
  console.log('Migration completed successfully.');
} catch (error) {
  console.error('Error running migration:', error);
  process.exit(1);
} 