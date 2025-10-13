import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function fixDuramectin() {
  try {
    const tenantId = 'pharm_mgjekfit_6eb4b602'; // test tenant

    console.log('=== Fixing DURAMECTIN stock entry ===\n');

    // Get the DURAMECTIN product
    const product = await sql`
      SELECT id, name, batch_number, total_quantity
      FROM products
      WHERE tenant_id = ${tenantId}
      AND name = 'DURAMECTIN'
    `;

    if (product.length === 0) {
      console.log('❌ DURAMECTIN product not found');
      return;
    }

    console.log('Found DURAMECTIN product:');
    console.log(`  ID: ${product[0].id}`);
    console.log(`  Name: ${product[0].name}`);
    console.log(`  Batch: ${product[0].batch_number || 'N/A'}`);
    console.log(`  Total Quantity: ${product[0].total_quantity}\n`);

    // Check if stock entry already exists
    const existingStock = await sql`
      SELECT id FROM stock
      WHERE product_id = ${product[0].id}
      AND tenant_id = ${tenantId}
    `;

    if (existingStock.length > 0) {
      console.log('✓ Stock entry already exists');
      return;
    }

    // Create stock entry
    console.log('Creating stock entry...');

    const result = await sql`
      INSERT INTO stock (
        product_id,
        product_name,
        batch_number,
        quantity,
        expiry_date,
        tenant_id
      ) VALUES (
        ${product[0].id},
        ${product[0].name},
        'DOIBL2501',
        ${product[0].total_quantity},
        '2027-01-01',
        ${tenantId}
      )
      RETURNING id
    `;

    console.log('✅ Stock entry created successfully!');
    console.log(`   Stock ID: ${result[0].id}\n`);

    // Verify
    const allStock = await sql`
      SELECT COUNT(*) as count FROM stock
      WHERE tenant_id = ${tenantId}
    `;

    console.log(`Total stock entries for test tenant: ${allStock[0].count}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDuramectin();
