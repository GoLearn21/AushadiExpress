import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');

    const users = await sql`SELECT id, username, role, tenant_id, pharmacy_name, pincode, onboarded, created_at FROM users ORDER BY created_at DESC`;

    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Tenant ID: ${user.tenant_id}`);
        console.log(`  Pharmacy Name: ${user.pharmacy_name || 'N/A'}`);
        console.log(`  Pincode: ${user.pincode || 'N/A'}`);
        console.log(`  Onboarded: ${user.onboarded}`);
        console.log(`  Created: ${user.created_at}`);
        console.log('');
      });
    }

    // Check session table
    console.log('\nChecking sessions...');
    const sessions = await sql`SELECT sid, sess, expire FROM session ORDER BY expire DESC LIMIT 5`;
    console.log(`Found ${sessions.length} session(s)`);
    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        const sessData = session.sess as any;
        console.log(`\nSession ${index + 1}:`);
        console.log(`  SID: ${session.sid}`);
        console.log(`  User ID: ${sessData.userId || 'Not set'}`);
        console.log(`  Expires: ${session.expire}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
