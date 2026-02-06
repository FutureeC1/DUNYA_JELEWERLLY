const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dunya-jewellery-backend.railway.app";

export interface Product {
  slug: string;
  title: string;
  description: string;
  price_uzs: number;
  image_urls: string[];
  category: string;
  available_sizes: number[];
  is_new: boolean;
}

export interface OrderPayload {
  customer_name: string;
  phone: string;
  address: string;
  comment?: string;
  telegram_username?: string;
  items: Array<{
    product_slug: string;
    size: number;
    qty: number;
  }>;
}

export async function fetchProduct(slug: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${slug}/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/products/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createOrder(orderData: OrderPayload): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }
  
  return response.json();
}
