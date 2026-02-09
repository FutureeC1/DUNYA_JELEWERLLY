const API =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://dunya-jewellery-backend.onrender.com";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_uzs: number;
  sizes: Array<number | string>;
  image_urls: string[];
  in_stock: boolean;
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

function toBackendFormat(p: OrderPayload) {
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

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API}/api/products/`, { cache: "no-store" });
  if (!res.ok) throw new Error("products fetch failed");
  const data = await res.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API}/api/products/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("product fetch failed");
  return res.json();
}

export async function submitOrder(order: OrderPayload) {
  const res = await fetch(`${API}/api/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toBackendFormat(order)),
  });

  if (!res.ok) {
    let msg = "";
    try {
      msg = JSON.stringify(await res.json());
    } catch {}
    return { ok: false, errorMessage: msg };
  }

  return { ok: true };
}
