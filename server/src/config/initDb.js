import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔧 Initializing database...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await client.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create your first user via /api/auth/register');
    console.log('   2. Or run: npm run seed (to add sample data)');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
