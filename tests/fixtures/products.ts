export interface TestProduct {
  name: string;
  price: number;
  stock: Array<{
    batch: string;
    quantity: number;
    expiryDate: string;
    mrp?: number;
  }>;
}

export const SAMPLE_PRODUCTS: TestProduct[] = [
  {
    name: 'Paracetamol 500mg',
    price: 5.00,
    stock: [
      { batch: 'BATCH001', quantity: 100, expiryDate: '2026-12-31', mrp: 5.50 },
      { batch: 'BATCH002', quantity: 50, expiryDate: '2025-06-30', mrp: 5.50 }
    ]
  },
  {
    name: 'Amoxicillin 250mg',
    price: 15.00,
    stock: [
      { batch: 'BATCH003', quantity: 75, expiryDate: '2026-03-15', mrp: 16.00 }
    ]
  },
  {
    name: 'Crocin Advance',
    price: 12.00,
    stock: [
      { batch: 'BATCH004', quantity: 120, expiryDate: '2027-01-01', mrp: 13.00 }
    ]
  },
  {
    name: 'Vitamin C 500mg',
    price: 8.00,
    stock: [
      { batch: 'BATCH005', quantity: 200, expiryDate: '2026-09-30', mrp: 9.00 }
    ]
  },
  {
    name: 'Ibuprofen 400mg',
    price: 10.00,
    stock: [
      { batch: 'BATCH006', quantity: 60, expiryDate: '2026-11-20', mrp: 11.00 }
    ]
  },
  {
    name: 'Cetirizine 10mg',
    price: 6.00,
    stock: [
      { batch: 'BATCH007', quantity: 90, expiryDate: '2026-08-15', mrp: 7.00 }
    ]
  },
  {
    name: 'Dolo 650',
    price: 3.50,
    stock: [
      { batch: 'BATCH008', quantity: 150, expiryDate: '2027-02-28', mrp: 4.00 }
    ]
  },
  {
    name: 'Azithromycin 500mg',
    price: 25.00,
    stock: [
      { batch: 'BATCH009', quantity: 40, expiryDate: '2026-05-10', mrp: 27.00 }
    ]
  }
];

export interface ExcelTestData {
  fileName: string;
  content: Array<Record<string, any>>;
  expectedMappings: {
    productName: string;
    batch: string;
    quantity: string;
    expiry: string;
    price: string;
  };
}

export const EXCEL_UPLOAD_SAMPLES: ExcelTestData[] = [
  {
    fileName: 'inventory-standard.xlsx',
    content: [
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
      }
    ],
    expectedMappings: {
      productName: 'Product Name',
      batch: 'Batch No',
      quantity: 'Quantity',
      expiry: 'Expiry Date',
      price: 'MRP'
    }
  },
  {
    fileName: 'inventory-custom-columns.xlsx',
    content: [
      {
        'Medicine': 'Omeprazole 20mg',
        'Batch': 'OME001',
        'Qty': 60,
        'Exp': '2026-09-15',
        'Price': 12.00
      }
    ],
    expectedMappings: {
      productName: 'Medicine',
      batch: 'Batch',
      quantity: 'Qty',
      expiry: 'Exp',
      price: 'Price'
    }
  }
];
