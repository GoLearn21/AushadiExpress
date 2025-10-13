import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function checkAllTables() {
  try {
    console.log('=== Database Contents Summary ===\n');

    // Check users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`📊 users: ${users[0].count} rows`);

    // Check products
    const products = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`📦 products: ${products[0].count} rows`);

    // Check stock
    const stock = await sql`SELECT COUNT(*) as count FROM stock`;
    console.log(`📈 stock: ${stock[0].count} rows`);

    // Check sales
    const sales = await sql`SELECT COUNT(*) as count FROM sales`;
    console.log(`💰 sales: ${sales[0].count} rows`);

    // Check pending_invoices
    const pendingInvoices = await sql`SELECT COUNT(*) as count FROM pending_invoices`;
    console.log(`📋 pending_invoices: ${pendingInvoices[0].count} rows`);

    // Check documents
    const documents = await sql`SELECT COUNT(*) as count FROM documents`;
    console.log(`📄 documents: ${documents[0].count} rows`);

    // Check invoice_headers
    const invoiceHeaders = await sql`SELECT COUNT(*) as count FROM invoice_headers`;
    console.log(`📑 invoice_headers: ${invoiceHeaders[0].count} rows`);

    // Check invoice_line_items
    const invoiceLineItems = await sql`SELECT COUNT(*) as count FROM invoice_line_items`;
    console.log(`📝 invoice_line_items: ${invoiceLineItems[0].count} rows`);

    // Check favorite_stores
    const favoriteStores = await sql`SELECT COUNT(*) as count FROM favorite_stores`;
    console.log(`⭐ favorite_stores: ${favoriteStores[0].count} rows`);

    // Check session
    const sessions = await sql`SELECT COUNT(*) as count FROM session`;
    console.log(`🔐 session: ${sessions[0].count} rows`);

    console.log('\n=== Sample Data from users table ===\n');
    const sampleUsers = await sql`
      SELECT username, role, tenant_id, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;

    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.role}) - Tenant: ${user.tenant_id}`);
    });

    // Check if there's any data in products/stock
    if (products[0].count > 0) {
      console.log('\n=== Sample Products ===\n');
      const sampleProducts = await sql`
        SELECT name, price, total_quantity, tenant_id
        FROM products
        LIMIT 5
      `;
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ₹${product.price} (Qty: ${product.total_quantity}) - Tenant: ${product.tenant_id}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllTables();
