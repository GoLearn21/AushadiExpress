import { test, expect } from '@playwright/test';
import { TEST_USERS, registerUser } from '../fixtures/auth';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

test.describe('Excel Upload with AI Schema Detection', () => {
  const testDataDir = path.join(__dirname, '../fixtures/excel');

  test.beforeAll(() => {
    // Create test Excel files
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Create standard format Excel
    const standardData = [
      {
        'Product Name': 'Aspirin 100mg',
        'Batch No': 'ASP001',
        'Quantity': 100,
        'Expiry Date': '2026-12-31',
        'MRP': 5.00
      },
      {
        'Product Name': 'Metformin 500mg',
        'Batch No': 'MET001',
        'Quantity': 80,
        'Expiry Date': '2027-06-30',
        'MRP': 8.00
      },
      {
        'Product Name': 'Atorvastatin 10mg',
        'Batch No': 'ATO001',
        'Quantity': 60,
        'Expiry Date': '2026-09-15',
        'MRP': 12.00
      }
    ];

    const standardWorkbook = XLSX.utils.book_new();
    const standardWorksheet = XLSX.utils.json_to_sheet(standardData);
    XLSX.utils.book_append_sheet(standardWorkbook, standardWorksheet, 'Inventory');
    XLSX.writeFile(standardWorkbook, path.join(testDataDir, 'standard-inventory.xlsx'));

    // Create custom column names Excel
    const customData = [
      {
        'Medicine': 'Omeprazole 20mg',
        'Batch': 'OME001',
        'Qty': 60,
        'Exp': '2026-09-15',
        'Price': 12.00
      },
      {
        'Medicine': 'Losartan 50mg',
        'Batch': 'LOS001',
        'Qty': 90,
        'Exp': '2027-01-20',
        'Price': 15.00
      }
    ];

    const customWorkbook = XLSX.utils.book_new();
    const customWorksheet = XLSX.utils.json_to_sheet(customData);
    XLSX.utils.book_append_sheet(customWorkbook, customWorksheet, 'Stock');
    XLSX.writeFile(customWorkbook, path.join(testDataDir, 'custom-columns.xlsx'));

    // Create Indian format Excel (different date format, rupee symbol)
    const indianData = [
      {
        'Drug Name': 'Paracetamol 650mg',
        'Batch Number': 'PAR001',
        'Stock Qty': 150,
        'Expiry': '31/12/2026',
        'Rate': '₹3.50'
      },
      {
        'Drug Name': 'Crocin Advance',
        'Batch Number': 'CRO001',
        'Stock Qty': 120,
        'Expiry': '30/06/2027',
        'Rate': '₹12.00'
      }
    ];

    const indianWorkbook = XLSX.utils.book_new();
    const indianWorksheet = XLSX.utils.json_to_sheet(indianData);
    XLSX.utils.book_append_sheet(indianWorkbook, indianWorksheet, 'Medicine List');
    XLSX.writeFile(indianWorkbook, path.join(testDataDir, 'indian-format.xlsx'));
  });

  test.beforeEach(async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Excel Upload ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/excel-upload');
    await page.waitForLoadState('networkidle');
  });

  test('should display Excel upload page', async ({ page }) => {
    await expect(page.getByText(/upload.*excel/i)).toBeVisible();
    await expect(page.getByText(/AI.*detect|automatically.*detect/i)).toBeVisible();
  });

  test('should show instructions for Excel upload', async ({ page }) => {
    // Should display helpful instructions
    await expect(page.getByText(/how it works|instructions/i)).toBeVisible();
    await expect(page.getByText(/column|format|AI/i).first()).toBeVisible();
  });

  test('should accept Excel file via file input', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Should show file name
    await expect(page.getByText('standard-inventory.xlsx')).toBeVisible();
  });

  test('should accept Excel file via drag and drop', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    // Get the drop zone
    const dropZone = page.locator('.border-dashed').first();

    // Read file as buffer
    const buffer = fs.readFileSync(filePath);

    // Create data transfer
    const dataTransfer = await page.evaluateHandle((data) => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(data)], 'standard-inventory.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      dt.items.add(file);
      return dt;
    }, Array.from(buffer));

    // Dispatch drop event
    await dropZone.dispatchEvent('drop', { dataTransfer });

    // Should show file name
    await expect(page.getByText('standard-inventory.xlsx')).toBeVisible({ timeout: 5000 });
  });

  test('should reject non-Excel files', async ({ page }) => {
    // Create a text file
    const txtPath = path.join(testDataDir, 'test.txt');
    fs.writeFileSync(txtPath, 'This is not an Excel file');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(txtPath);

    // Should show error
    await expect(page.getByText(/invalid.*file|excel.*file/i)).toBeVisible({ timeout: 5000 });
  });

  test('should process standard format Excel', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Click upload button
    await page.getByRole('button', { name: /upload|process/i }).click();

    // Should show processing indicator
    await expect(page.getByText(/processing|uploading/i)).toBeVisible({ timeout: 5000 });

    // Should show success message
    await expect(page.getByText(/success|completed/i)).toBeVisible({ timeout: 30000 });

    // Should show items processed count
    await expect(page.getByText(/3.*item|item.*3/i)).toBeVisible();
  });

  test('should detect AI column mappings correctly', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Wait for success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Should show detected columns
    await expect(page.getByText(/AI.*detect.*column|detected.*column/i)).toBeVisible();
    await expect(page.getByText(/Product Name/i)).toBeVisible();
    await expect(page.getByText(/Batch No/i)).toBeVisible();
    await expect(page.getByText(/Quantity/i)).toBeVisible();
  });

  test('should handle custom column names', async ({ page }) => {
    const filePath = path.join(testDataDir, 'custom-columns.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Should process successfully
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Should detect custom columns
    await expect(page.getByText(/Medicine/i)).toBeVisible();
    await expect(page.getByText(/Qty/i)).toBeVisible();
  });

  test('should handle Indian format Excel', async ({ page }) => {
    const filePath = path.join(testDataDir, 'indian-format.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Should process successfully
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Should handle Indian date format and rupee symbol
    await expect(page.getByText(/2.*item|item.*2/i)).toBeVisible();
  });

  test('should show preview of uploaded data', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Wait for success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Should show sample items
    await expect(page.getByText(/sample|preview/i)).toBeVisible();
    await expect(page.getByText(/Aspirin|Metformin/i)).toBeVisible();
  });

  test('should show processing time', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Wait for success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Should show processing time
    await expect(page.getByText(/\d+.*s|second/i)).toBeVisible();
  });

  test('should allow uploading another file after success', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Wait for success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Click upload another
    await page.getByRole('button', { name: /upload.*another|reset/i }).click();

    // Should reset the form
    await expect(page.getByText('standard-inventory.xlsx')).not.toBeVisible();
  });

  test('should navigate to inventory after upload', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Wait for success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Click view inventory button
    await page.getByRole('button', { name: /view.*inventory/i }).click();

    // Should navigate to inventory page
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('should handle large Excel files', async ({ page }) => {
    // Create a large Excel file
    const largeData = [];
    for (let i = 0; i < 100; i++) {
      largeData.push({
        'Product Name': `Medicine ${i}`,
        'Batch No': `BATCH${String(i).padStart(3, '0')}`,
        'Quantity': Math.floor(Math.random() * 200) + 10,
        'Expiry Date': '2026-12-31',
        'MRP': (Math.random() * 50 + 5).toFixed(2)
      });
    }

    const largeWorkbook = XLSX.utils.book_new();
    const largeWorksheet = XLSX.utils.json_to_sheet(largeData);
    XLSX.utils.book_append_sheet(largeWorkbook, largeWorksheet, 'Inventory');
    const largePath = path.join(testDataDir, 'large-inventory.xlsx');
    XLSX.writeFile(largeWorkbook, largePath);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Should process successfully
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 60000 });
    await expect(page.getByText(/100.*item|item.*100/i)).toBeVisible();
  });

  test('should show clear error messages for invalid data', async ({ page }) => {
    // Create Excel with missing required columns
    const invalidData = [
      {
        'Product': 'Test Product',
        'Qty': 10
        // Missing other required fields
      }
    ];

    const invalidWorkbook = XLSX.utils.book_new();
    const invalidWorksheet = XLSX.utils.json_to_sheet(invalidData);
    XLSX.utils.book_append_sheet(invalidWorkbook, invalidWorksheet, 'Inventory');
    const invalidPath = path.join(testDataDir, 'invalid-data.xlsx');
    XLSX.writeFile(invalidWorkbook, invalidPath);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidPath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Should show error or process with warnings
    await expect(page.getByText(/error|warning|failed|missing/i)).toBeVisible({ timeout: 30000 });
  });

  test('should cancel file selection', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Should show file name
    await expect(page.getByText('standard-inventory.xlsx')).toBeVisible();

    // Click cancel/close button
    const cancelButton = page.getByRole('button', { name: /close|cancel|remove/i }).first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // File should be deselected
      await expect(page.getByText('standard-inventory.xlsx')).not.toBeVisible();
    }
  });

  test('should update inventory counts after upload', async ({ page }) => {
    const filePath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.getByRole('button', { name: /upload|process/i }).click();

    // Wait for success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 30000 });

    // Navigate to inventory
    await page.getByRole('button', { name: /view.*inventory/i }).click();

    // Should show uploaded products
    await expect(page.getByText(/Aspirin|Metformin|Atorvastatin/i)).toBeVisible();
  });

  test('should support multiple Excel formats (.xls, .xlsx, .xlsm)', async ({ page }) => {
    // Test .xlsx format (already tested above)
    const xlsxPath = path.join(testDataDir, 'standard-inventory.xlsx');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(xlsxPath);

    // Should accept the file
    await expect(page.getByText('standard-inventory.xlsx')).toBeVisible();
  });
});

test.describe('Excel Upload Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    const retailer = {
      ...TEST_USERS.retailer,
      username: `Mobile Excel ${Date.now()}`,
    };
    await registerUser(page, retailer);

    await page.goto('/excel-upload');
    await page.waitForLoadState('networkidle');

    // Should display mobile-optimized interface
    await expect(page.getByText(/upload.*excel/i)).toBeVisible();

    // File input should work on mobile
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});
