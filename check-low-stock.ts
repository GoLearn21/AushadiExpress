import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function checkLowStock() {
  try {
    console.log('=== Checking Stock by Tenant ===\n');

    // Get the most recent user (Sai Balaji Medicals)
    const recentUser = await sql`
      SELECT id, username, tenant_id
      FROM users
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (recentUser.length === 0) {
      console.log('No users found');
      return;
    }

    const tenantId = recentUser[0].tenant_id;
    console.log(`Current User: ${recentUser[0].username}`);
    console.log(`Tenant ID: ${tenantId}\n`);

    // Get all stock for this tenant
    const allStock = await sql`
      SELECT
        s.id,
        s.product_name,
        s.batch_number,
        s.quantity,
        s.expiry_date
      FROM stock s
      WHERE s.tenant_id = ${tenantId}
      ORDER BY s.quantity ASC
    `;

    console.log(`Total stock items for this tenant: ${allStock.length}\n`);

    if (allStock.length === 0) {
      console.log('⚠️ No stock items found for this tenant');
      return;
    }

    // Check for low stock (< 10)
    const lowStock = allStock.filter(s => s.quantity < 10);
    console.log(`\n📊 Stock Analysis:`);
    console.log(`- Items with quantity < 10: ${lowStock.length}`);
    console.log(`- Items with quantity >= 10: ${allStock.length - lowStock.length}`);

    if (lowStock.length > 0) {
      console.log(`\n🔴 LOW STOCK ITEMS (quantity < 10):\n`);
      lowStock.forEach((item, index) => {
        console.log(`${index + 1}. ${item.product_name}`);
        console.log(`   Batch: ${item.batch_number || 'N/A'}`);
        console.log(`   Quantity: ${item.quantity} ⚠️`);
        console.log(`   Expiry: ${item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}`);
        console.log('');
      });
    }

    console.log(`\n📦 ALL STOCK ITEMS (sorted by quantity):\n`);
    allStock.slice(0, 15).forEach((item, index) => {
      const icon = item.quantity < 10 ? '🔴' : item.quantity < 20 ? '🟡' : '🟢';
      console.log(`${index + 1}. ${icon} ${item.product_name} - Qty: ${item.quantity}`);
    });

    if (allStock.length > 15) {
      console.log(`\n... and ${allStock.length - 15} more items`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLowStock();
