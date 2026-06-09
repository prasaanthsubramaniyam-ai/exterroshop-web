import client, { unwrap } from "./api";
import type {
  Product,
  ProductImage as ProductImageDTO,
  PurchasedProduct,
  CreateProductPayload,
  ProductFilters,
  PaginatedResponse,
} from "@/types";

const toQuery = (filters?: ProductFilters): Record<string, string | number> => {
  if (!filters) return {};
  const params: Record<string, string | number> = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params[k] = v as string | number;
  });
  return params;
};

export const productService = {
  async list(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await client.get<{ data: PaginatedResponse<Product> }>(
      "/products",
      { params: toQuery(filters) }
    );
    return unwrap<PaginatedResponse<Product>>(response);
  },

  async getById(id: number): Promise<Product> {
    const response = await client.get<{ data: Product }>(`/products/${id}`);
    return unwrap<Product>(response);
  },

  async featured(): Promise<Product[]> {
    const response = await client.get<{ data: Product[] }>("/products/featured");
    return unwrap<Product[]>(response);
  },

  async mine(): Promise<Product[]> {
    const response = await client.get<{ data: Product[] }>("/products/mine");
    return unwrap<Product[]>(response);
  },

  async purchased(): Promise<PurchasedProduct[]> {
    const response = await client.get<{ data: PurchasedProduct[] }>("/products/purchased");
    return unwrap<PurchasedProduct[]>(response);
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const response = await client.post<{ data: Product }>("/products", payload);
    return unwrap<Product>(response);
  },

  async update(id: number, payload: Partial<CreateProductPayload>): Promise<Product> {
    const response = await client.patch<{ data: Product }>(
      `/products/${id}`,
      payload
    );
    return unwrap<Product>(response);
  },

  async remove(id: number): Promise<void> {
    await client.delete(`/products/${id}`);
  },

  async uploadImage(productId: number, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append("file", file);
    await client.post<{ data: ProductImageDTO }>(
      `/images/upload?productId=${productId}`,
      formData,
      {
        timeout: 120_000,
        headers: { "Content-Type": undefined }, // Let browser set multipart/form-data + boundary
      }
    );
    // Fetch updated product after image upload
    return this.getById(productId);
  },

  async deleteImage(productId: number, imageId: number): Promise<void> {
    await client.delete(`/products/${productId}/images/${imageId}`);
  },
};
