import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function checkAllTenantsStock() {
  try {
    console.log('=== Stock Analysis by Tenant ===\n');

    const tenants = await sql`
      SELECT u.tenant_id, u.username, u.created_at
      FROM users u
      ORDER BY u.created_at DESC
    `;

    for (const tenant of tenants) {
      console.log(`\n📦 Tenant: ${tenant.username}`);
      console.log(`   ID: ${tenant.tenant_id}\n`);

      const stock = await sql`
        SELECT product_name, quantity
        FROM stock
        WHERE tenant_id = ${tenant.tenant_id}
        ORDER BY quantity ASC
      `;

      if (stock.length === 0) {
        console.log('   ❌ No stock items\n');
        continue;
      }

      const lowStock = stock.filter(s => s.quantity < 10);
      const mediumStock = stock.filter(s => s.quantity >= 10 && s.quantity < 20);
      const highStock = stock.filter(s => s.quantity >= 20);

      console.log(`   Total items: ${stock.length}`);
      console.log(`   🔴 Low stock (< 10): ${lowStock.length}`);
      console.log(`   🟡 Medium stock (10-19): ${mediumStock.length}`);
      console.log(`   🟢 High stock (≥ 20): ${highStock.length}`);

      if (lowStock.length > 0) {
        console.log(`\n   Low stock items:`);
        lowStock.forEach(item => {
          console.log(`   - ${item.product_name}: ${item.quantity} units`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllTenantsStock();
