import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function checkTestTenant() {
  try {
    const tenantId = 'pharm_mgjekfit_6eb4b602'; // test tenant

    console.log('=== Stock for "test" tenant ===\n');

    const stock = await sql`
      SELECT id, product_name, batch_number, quantity, expiry_date
      FROM stock
      WHERE tenant_id = ${tenantId}
      ORDER BY quantity ASC
    `;

    console.log(`Total stock items: ${stock.length}\n`);

    stock.forEach((item, index) => {
      const icon = item.quantity < 10 ? '🔴' : item.quantity < 20 ? '🟡' : '🟢';
      console.log(`${index + 1}. ${icon} ${item.product_name}`);
      console.log(`   Batch: ${item.batch_number || 'N/A'}`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   ID: ${item.id}`);
      console.log('');
    });

    console.log('\n=== Products for "test" tenant ===\n');

    const products = await sql`
      SELECT id, name, price, total_quantity, batch_number
      FROM products
      WHERE tenant_id = ${tenantId}
      ORDER BY total_quantity ASC
    `;

    console.log(`Total products: ${products.length}\n`);

    products.forEach((item, index) => {
      const icon = item.total_quantity < 10 ? '🔴' : item.total_quantity < 20 ? '🟡' : '🟢';
      console.log(`${index + 1}. ${icon} ${item.name}`);
      console.log(`   Batch: ${item.batch_number || 'N/A'}`);
      console.log(`   Total Quantity: ${item.total_quantity}`);
      console.log(`   Price: ₹${item.price}`);
      console.log(`   ID: ${item.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTestTenant();
