"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  OFFICE_LOCATIONS,
  FUEL_TYPES,
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
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { productService } from "@/services/product.service";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format";

const schema = z
  .object({
    title: z.string().min(4, "Title must be at least 4 characters").max(100),
    description: z.string().min(20, "Add at least 20 characters"),
    price: z.coerce.number().positive("Price must be positive"),
    category: z.enum(
      PRODUCT_CATEGORIES.map((c) => c.value) as [ProductCategory, ...ProductCategory[]]
    ),
    condition: z.enum(PRODUCT_CONDITIONS as [string, ...string[]]),
    location: z.enum(OFFICE_LOCATIONS as [OfficeLocation, ...OfficeLocation[]]),
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.coerce.number().optional(),
    kmDriven: z.coerce.number().optional(),
    fuelType: z.string().optional(),
  })
  .refine((d) => d.category, { message: "Category required" });

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { key: "info", label: "Details" },
  { key: "images", label: "Photos" },
  { key: "location", label: "Location" },
  { key: "review", label: "Review" },
] as const;

export function CreateProductView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { create } = useProducts();

  const [step, setStep] = React.useState(0);
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { condition: "Good", location: "Chennai" },
  });

  const values = form.watch();
  const isVehicle =
    values.category === "Cars" || values.category === "Bikes";

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).slice(0, 6 - files.length);
    setFiles((prev) => [...prev, ...next]);
    next.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPreviews((prev) => [...prev, url]);
    });
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const validateStep = async (): Promise<boolean> => {
    if (step === 0) {
      return form.trigger([
        "title",
        "description",
        "price",
        "category",
        "condition",
      ]);
    }
    if (step === 1) {
      if (!files.length) {
        dispatch(
          pushToast({
            title: "Add at least one photo",
            variant: "destructive",
          })
        );
        return false;
      }
      return true;
    }
    if (step === 2) {
      return form.trigger(["location"]);
    }
    return true;
  };

  const next = async () => {
    if (await validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const publish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload: CreateProductPayload = {
        title: values.title,
        description: values.description,
        price: values.price,
        category: values.category,
        condition: values.condition as CreateProductPayload["condition"],
        location: values.location,
        brand: values.brand || undefined,
        model: values.model || undefined,
        year: values.year || undefined,
        kmDriven: values.kmDriven || undefined,
        fuelType: (values.fuelType as CreateProductPayload["fuelType"]) || undefined,
      };
      const product = await create(payload);

      // Upload images — non-fatal if Cloudinary is not configured
      try {
        await Promise.all(files.map((f) => productService.uploadImage(product.id, f)));
      } catch (imgErr) {
        console.warn("Image upload skipped:", imgErr);
      }

      dispatch(
        pushToast({
          title: "Listing published",
          description: `${product.title} is now live.`,
          variant: "success",
        })
      );
      router.replace(`/dashboard/products/${product.id}`);
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't publish",
          description: (err as Error).message,
          variant: "destructive",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-display-sm font-semibold tracking-tight">
          Sell your item
        </h1>
        <p className="text-sm text-muted-foreground">
          A few quick steps and your listing goes live to all Exterro offices.
        </p>
      </header>

      <Stepper step={step} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === STEPS.length - 1) publish();
          else next();
        }}
        className="space-y-6 rounded-lg border border-border/60 bg-card p-6 shadow-card sm:p-8"
      >
        {step === 0 ? <InfoStep form={form} isVehicle={isVehicle} /> : null}

        {step === 1 ? (
          <PhotosStep
            previews={previews}
            onFiles={handleFiles}
            onRemove={removeFile}
          />
        ) : null}

        {step === 2 ? <LocationStep form={form} /> : null}

        {step === 3 ? (
          <ReviewStep values={values} previews={previews} />
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-5">
          <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
            <ChevronLeft />
            Back
          </Button>
          <Button type="submit" loading={submitting}>
            {step === STEPS.length - 1 ? "Publish listing" : "Continue"}
            {step !== STEPS.length - 1 ? <ChevronRight /> : null}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center justify-between gap-2 sm:gap-4">
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-primary/10 text-primary ring-2 ring-primary"
                  : "bg-surface text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {i !== STEPS.length - 1 ? (
              <span className="mx-1 h-[2px] flex-1 bg-border sm:mx-2" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function InfoStep({
  form,
  isVehicle,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  isVehicle: boolean;
}) {
  const { register, formState: { errors } } = form;
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. iPhone 14 Pro Max — Deep Purple, 256 GB"
          error={!!errors.title}
          {...register("title")}
        />
        {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            placeholder="0"
            error={!!errors.price}
            {...register("price")}
          />
          {errors.price ? <p className="text-xs text-destructive">{errors.price.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select id="category" placeholder="Select category" {...register("category")}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          {errors.category ? <p className="text-xs text-destructive">{errors.category.message as string}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select id="condition" {...register("condition")}>
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {isVehicle ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" placeholder="e.g. Honda" {...register("brand")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" placeholder="e.g. City ZX" {...register("model")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" placeholder="2022" {...register("year")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel</Label>
            <Select id="fuelType" {...register("fuelType")}>
              <option value="">Select</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="kmDriven">Kilometers driven</Label>
            <Input id="kmDriven" type="number" placeholder="0" {...register("kmDriven")} />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Describe the item: condition, reason for selling, what's included…"
          error={!!errors.description}
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>
    </div>
  );
}

function PhotosStep({
  previews,
  onFiles,
  onRemove,
}: {
  previews: string[];
  onFiles: (files: FileList | null) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Add photos</h3>
        <p className="text-sm text-muted-foreground">
          Up to 6 photos. First photo will be your cover.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {previews.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Upload ${i + 1}`} className="size-full object-cover" />
            {i === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Cover
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card backdrop-blur"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {previews.length < 6 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-surface/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Upload className="size-5" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  );
}

function LocationStep({
  form,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const value = form.watch("location");
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Pick a pickup location</h3>
        <p className="text-sm text-muted-foreground">
          Buyers near this office will see your listing first.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {OFFICE_LOCATIONS.map((loc) => {
          const selected = value === loc;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => form.setValue("location", loc)}
              className={cn(
                "rounded-lg border bg-card p-4 text-left transition-all",
                selected
                  ? "border-primary bg-primary/5 shadow-card-hover"
                  : "border-border/60 hover:border-foreground/20"
              )}
            >
              <p className="text-sm font-semibold text-foreground">{loc} office</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Exterro {loc} workspace
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewStep({
  values,
  previews,
}: {
  values: FormValues;
  previews: string[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Review & publish</h3>
        <p className="text-sm text-muted-foreground">
          Make sure everything looks right before going live.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border/60">
        <div className="grid gap-4 p-5 sm:grid-cols-[200px_1fr]">
          {previews[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previews[0]}
              alt="Cover"
              className="aspect-square w-full rounded-md object-cover"
            />
          ) : (
            <div className="aspect-square w-full rounded-md bg-surface" />
          )}
          <div className="space-y-2">
            <Badge>{values.category}</Badge>
            <h4 className="text-base font-semibold">{values.title || "—"}</h4>
            <p className="text-xl font-semibold text-primary">
              {values.price ? formatPrice(values.price) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {values.condition} · {values.location}
            </p>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {values.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
