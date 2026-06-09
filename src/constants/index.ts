import type {
  ProductCategory,
  OfficeLocation,
  ProductCondition,
  FuelType,
} from "@/types";
import {
  Home,
  Heart,
  Package,
  PlusCircle,
  Settings,
  LayoutGrid,
  MessageCircle,
  Phone,
  Scissors,
  UsersRound,
  SlidersHorizontal,
  Palette,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "ExterroShop";
export const COMPANY_EMAIL_DOMAIN = "@gmail.com";

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  "Chennai",
  "Coimbatore",
  "Bangalore",
];

export interface CategoryConfig {
  label: string;
  value: ProductCategory;
  image: string;
  color: string;
}

export const PRODUCT_CATEGORIES: CategoryConfig[] = [
  {
    label: "Cars",
    value: "Cars",
    image: "https://img.icons8.com/color/96/car--v1.png",
    color: "#FFE5DD",
  },
  {
    label: "Bikes",
    value: "Bikes",
    image: "https://img.icons8.com/color/96/motorcycle.png",
    color: "#E5F0FF",
  },
  {
    label: "Mobiles",
    value: "Mobiles",
    image: "https://img.icons8.com/color/96/iphone.png",
    color: "#F0E5FF",
  },
  {
    label: "Laptops",
    value: "Laptops",
    image: "https://img.icons8.com/color/96/laptop--v1.png",
    color: "#E5FFE9",
  },
  {
    label: "Furniture",
    value: "Furniture",
    image: "https://img.icons8.com/color/96/sofa.png",
    color: "#FFF5E0",
  },
  {
    label: "Properties",
    value: "Properties",
    image: "https://img.icons8.com/color/96/cottage.png",
    color: "#E0F7FF",
  },
  {
    label: "Electronics",
    value: "Electronics",
    image: "https://img.icons8.com/color/96/retro-tv.png",
    color: "#FFE0EC",
  },
  {
    label: "Sports",
    value: "Sports",
    image: "https://img.icons8.com/color/96/basketball.png",
    color: "#FFEFD5",
  },
];

export const PRODUCT_CONDITIONS: ProductCondition[] = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];

export const FUEL_TYPES: FuelType[] = [
  "Petrol",
  "Diesel",
  "Electric",
  "Hybrid",
  "CNG",
  "N/A",
];

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix?: string;
  /** Only visible to SUPER_ADMIN role */
  adminOnly?: boolean;
}

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Categories", href: "/dashboard/products", icon: LayoutGrid, matchPrefix: "/dashboard/products" },
  { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { label: "My Products", href: "/dashboard/my-products", icon: Package },
  { label: "Chats", href: "/dashboard/chat", icon: MessageCircle, matchPrefix: "/dashboard/chat" },
  { label: "Call Requests", href: "/dashboard/call-requests", icon: Phone, matchPrefix: "/dashboard/call-requests" },
  { label: "Sell Product", href: "/dashboard/products/new", icon: PlusCircle },
  { label: "Beauty Services", href: "/wellness/dashboard", icon: Scissors },
  { label: "User Management", href: "/dashboard/users", icon: UsersRound, matchPrefix: "/dashboard/users", adminOnly: true },
  { label: "CMS", href: "/dashboard/admin/cms", icon: SlidersHorizontal, matchPrefix: "/dashboard/admin/cms", adminOnly: true },
  { label: "Theme Editor", href: "/dashboard/admin/theme", icon: Palette, matchPrefix: "/dashboard/admin/theme", adminOnly: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { label: "Sell", href: "/dashboard/products/new", icon: PlusCircle },
  { label: "Profile", href: "/dashboard/profile", icon: Package },
];

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8082/api/v1";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "exterroshop_access_token",
  REFRESH_TOKEN: "exterroshop_refresh_token",
} as const;
