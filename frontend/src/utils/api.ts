const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dunya-jewellery-backend.railway.app";
const QUEUE_KEY = "orders_queue_v1";

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

interface QueuedOrder {
  order: OrderPayload;
  createdAt: number;
}

function loadQueue(): QueuedOrder[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
  catch { return []; }
}

function saveQueue(queue: QueuedOrder[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function postOrder(order: OrderPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function submitOrder(order: OrderPayload): Promise<{ ok: boolean; queued: boolean }> {
  const queue = loadQueue();

  try {
    await postOrder(order);
    return { ok: true, queued: false };
  } catch (e) {
    queue.push({ order, createdAt: Date.now() });
    saveQueue(queue);
    return { ok: false, queued: true };
  }
}

export async function flushOrderQueue(): Promise<void> {
  let queue = loadQueue();
  if (!queue.length) return;

  const rest: QueuedOrder[] = [];
  for (const item of queue) {
    try {
      await postOrder(item.order);
    } catch (e) {
      rest.push(item); // оставляем, попробуем позже
    }
  }
  saveQueue(rest);
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
