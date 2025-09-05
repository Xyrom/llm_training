// API client for FastAPI backend
export const API_URL = "http://localhost:8000";

export async function getProducts() {
  const res = await fetch(`${API_URL}/products/`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(id: number) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function addProduct(product: {
  name: string;
  price: number;
  description?: string;
  stock: number;
}) {
  const res = await fetch(`${API_URL}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
}

export async function updateProduct(
  id: number,
  product: {
    name?: string;
    price?: number;
    description?: string;
    stock?: number;
  }
) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}
