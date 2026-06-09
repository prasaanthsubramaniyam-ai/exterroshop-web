import client, { unwrap } from "./api";
import type { Product } from "@/types";

export const favoriteService = {
  // Backend returns List<ProductDTO> — a flat list of the favorited products
  async list(): Promise<Product[]> {
    const response = await client.get<{ data: Product[] }>("/favorites");
    return unwrap<Product[]>(response);
  },

  async add(productId: number): Promise<Product> {
    const response = await client.post<{ data: Product }>(
      `/favorites/${productId}`
    );
    return unwrap<Product>(response);
  },

  async remove(productId: number): Promise<void> {
    await client.delete(`/favorites/${productId}`);
  },
};
