/** API base URL: VITE_API_URL or VITE_API_BASE_URL (fallback) */
const API =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://dunya-jewellery-backend.onrender.com";

const QUEUE_KEY = "orders_queue_v1";
const CACHE_KEY = "products_cache_v1";
const CACHE_TS_KEY = "products_cache_ts_v1";

export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  price_uzs: number;
  image_urls: string[];
  category?: string;
  available_sizes?: number[];
  sizes?: number[];
  is_new?: boolean;
  created_at: string;
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
  meta?: {
    locale?: string;
    theme?: string;
  };
}

interface QueuedOrder {
  orderId: string;
  order: OrderPayload;
  createdAt: number;
}

/** Преобразует наш payload в формат бэкенда (customer, productSlug, selectedSize) */
function toBackendFormat(p: OrderPayload): Record<string, unknown> {
  return {
    customer: {
      name: p.customer_name,
      phone: p.phone,
      address: p.address,
      comment: p.comment ?? "",
      telegram_username: p.telegram_username ?? "",
    },
    items: p.items.map((it) => ({
      productSlug: it.product_slug,
      qty: it.qty,
      selectedSize: it.size,
    })),
    meta: {
      locale: p.meta?.locale ?? "ru",
      theme: p.meta?.theme ?? "light",
    },
  };
}

function loadQueue(): QueuedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedOrder[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders-queue-changed"));
  }
}

export function getQueueLength(): number {
  return loadQueue().length;
}

export function loadCache(): Product[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCacheTimestamp(): number | null {
  try {
    const ts = localStorage.getItem(CACHE_TS_KEY);
    return ts ? parseInt(ts, 10) : null;
  } catch {
    return null;
  }
}

function saveCache(data: Product[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
  } catch {}
}

function generateOrderId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function postOrder(order: OrderPayload): Promise<unknown> {
  const url = `${API.replace(/\/$/, "")}/api/orders/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toBackendFormat(order)),
  });
  if (res.status === 409) {
    return { status: "already_exists" };
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function submitOrder(
  order: OrderPayload
): Promise<{ ok: boolean; queued: boolean }> {
  const queue = loadQueue();

  try {
    await postOrder(order);
    return { ok: true, queued: false };
  } catch (e) {
    const orderId = generateOrderId();
    queue.push({ orderId, order, createdAt: Date.now() });
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
      rest.push(item);
    }
  }
  saveQueue(rest);
}

async function getProducts(): Promise<Product[]> {
  const url = `${API.replace(/\/$/, "")}/api/products/`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchProductsWithRetry(): Promise<{
  data: Product[];
  error: string | null;
}> {
  const cached = loadCache();
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const data = await getProducts();
      saveCache(data);
      return { data, error: null };
    } catch (e) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 800 * attempt));
      } else {
        return {
          data: cached,
          error:
            cached.length > 0
              ? "Временная ошибка загрузки. Показаны сохранённые товары."
              : "Не удалось загрузить товары.",
        };
      }
    }
  }
  return { data: loadCache(), error: "Не удалось загрузить товары." };
}

export async function fetchProduct(slug: string): Promise<Product> {
  const url = `${API.replace(/\/$/, "")}/api/products/${slug}/`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch product: ${response.statusText}`);
  return response.json();
}

export async function fetchProductWithCache(slug: string): Promise<{
  product: Product | null;
  fromCache: boolean;
}> {
  try {
    const product = await fetchProduct(slug);
    return { product, fromCache: false };
  } catch {
    const cached = loadCache();
    const found = cached.find((p) => p.slug === slug) ?? null;
    return { product: found, fromCache: !!found };
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const url = `${API.replace(/\/$/, "")}/api/products/`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  return response.json();
}

export function getApiBase(): string {
  return API;
}
