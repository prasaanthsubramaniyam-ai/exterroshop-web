"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  OFFICE_LOCATIONS,
} from "@/constants";
import type {
  CreateProductPayload,
  OfficeLocation,
  ProductCategory,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";

const schema = z.object({
  title: z.string().min(4).max(100),
  description: z.string().min(20),
  price: z.coerce.number().positive(),
  category: z.enum(
    PRODUCT_CATEGORIES.map((c) => c.value) as [ProductCategory, ...ProductCategory[]]
  ),
  condition: z.enum(PRODUCT_CONDITIONS as [string, ...string[]]),
  location: z.enum(OFFICE_LOCATIONS as [OfficeLocation, ...OfficeLocation[]]),
});

type FormValues = z.infer<typeof schema>;

export function EditProductView({ productId }: { productId: number }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { fetchById, update, selected, isMutating } = useProducts();
  const [loading, setLoading] = React.useState(true);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    fetchById(productId)
      .then((p) => {
        form.reset({
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          condition: p.condition,
          location: p.location,
        });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [fetchById, productId, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await update(productId, values as Partial<CreateProductPayload>);
      dispatch(
        pushToast({ title: "Listing updated", variant: "success" })
      );
      router.replace(`/dashboard/products/${productId}`);
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't save changes",
          description: (err as Error).message,
          variant: "destructive",
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-display-sm font-semibold tracking-tight">
          Edit listing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details and save your changes.
        </p>
      </header>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 rounded-lg border border-border/60 bg-card p-6 shadow-card"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" error={!!form.formState.errors.title} {...form.register("title")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" {...form.register("price")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select id="category" {...form.register("category")}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select id="condition" {...form.register("condition")}>
              {PRODUCT_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select id="location" {...form.register("location")}>
              {OFFICE_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={6} {...form.register("description")} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={isMutating}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
