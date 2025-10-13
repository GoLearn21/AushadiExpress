import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function fixSchema() {
  try {
    console.log('Adding pincode column to users table...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10)`;
    console.log('✓ Pincode column added successfully');

    console.log('\nCreating session table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
    `;
    console.log('✓ Session table created successfully');

    console.log('\nAdding session primary key...');
    await sql`ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey"`;
    await sql`ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid")`;
    console.log('✓ Session primary key added successfully');

    console.log('\nCreating session expire index...');
    await sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")`;
    console.log('✓ Session expire index created successfully');

    console.log('\n✅ Schema fixes applied successfully!');
  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  }
}

fixSchema();
