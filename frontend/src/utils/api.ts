const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dunya-jewellery-backend.onrender.com";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_uzs: number;
  currency: string;
  sizes: number[];
  in_stock: boolean;
  image_urls: string[];
  created_at: string;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error("Failed to load products");
  }
  return response.json();
};

export const fetchProduct = async (slug: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to load product");
  }
  return response.json();
};

export interface OrderPayload {
  customer: {
    name: string;
    phone: string;
    address: string;
    comment?: string;
    telegram_username?: string;
  };
  items: {
    productSlug: string;
    qty: number;
    selectedSize: number;
  }[];
  meta: {
    locale: "ru" | "uz";
    theme: "light" | "dark";
  };
}

export interface OrderResponse {
  id: string;
  status: "sent" | "failed";
}

export const createOrder = async (payload: OrderPayload): Promise<OrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to submit order");
  }

  return response.json();
};
