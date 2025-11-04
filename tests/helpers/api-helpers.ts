import { Page } from '@playwright/test';

export async function createProduct(page: Page, productData: {
  name: string;
  price: number;
}) {
  const response = await page.request.post('/api/products', {
    data: productData,
  });
  return response.json();
}

export async function createStock(page: Page, stockData: {
  productId: string;
  batch: string;
  quantity: number;
  expiryDate: string;
  mrp?: number;
}) {
  const response = await page.request.post('/api/stock', {
    data: stockData,
  });
  return response.json();
}

export async function getProducts(page: Page) {
  const response = await page.request.get('/api/products');
  return response.json();
}

export async function getStock(page: Page) {
  const response = await page.request.get('/api/stock');
  return response.json();
}

export async function createSale(page: Page, saleData: {
  total: number;
  items: string;
  paymentMethod: 'cash' | 'upi' | 'card';
}) {
  const response = await page.request.post('/api/sales', {
    data: saleData,
  });
  return response.json();
}

export async function getSales(page: Page) {
  const response = await page.request.get('/api/sales');
  return response.json();
}

export async function createPharmacyOrder(page: Page, orderData: {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}) {
  const response = await page.request.post('/api/pharmacy-orders', {
    data: orderData,
  });
  return response.json();
}

export async function getPharmacyOrders(page: Page) {
  const response = await page.request.get('/api/pharmacy-orders');
  return response.json();
}

export async function updateOrderStatus(page: Page, orderId: string, status: string) {
  const response = await page.request.patch(`/api/pharmacy-orders/${orderId}`, {
    data: { status },
  });
  return response.json();
}

export async function searchProducts(page: Page, query: string) {
  const response = await page.request.get(`/api/products/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(response =>
    typeof urlPattern === 'string'
      ? response.url().includes(urlPattern)
      : urlPattern.test(response.url())
  );
}

export async function mockAPIResponse(page: Page, url: string, response: any) {
  await page.route(url, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

export async function mockAPIError(page: Page, url: string, statusCode: number, error: any) {
  await page.route(url, async route => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify(error),
    });
  });
}
