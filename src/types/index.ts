/**
 * Domain types — exact mirror of backend DTOs and mobile app types.
 * Source of truth: ExterroShop-backend/src/main/java/com/exterroshop/dto/*
 */

export type UserRole =
  | "EMPLOYEE_USER"
  | "MANAGER"
  | "HR"
  | "STAFF"
  | "FINANCE"
  | "IT_ADMIN"
  | "SUPER_ADMIN";

// ── EMS reference types ───────────────────────────────────────────────────────

export interface Department {
  id: number;
  name: string;
  code: string;
  headId?: number;
  headName?: string;
  parentId?: number;
  parentName?: string;
  active: boolean;
}

export interface Designation {
  id: number;
  title: string;
  level: number;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  active: boolean;
}

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "ON_NOTICE" | "EXITED";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;

  /** Legacy free-text department (also populated from structured dept name) */
  department?: string;

  avatarUrl?: string;
  location: OfficeLocation;
  role?: UserRole;
  gender?: "MALE" | "FEMALE";
  createdAt: string;

  // ── EMS profile (V13) ───────────────────────────────────────────
  jobTitle?:         string;
  managerId?:        number;
  managerName?:      string;
  managerAvatarUrl?: string;
  dateOfJoining?:    string;   // ISO date YYYY-MM-DD
  dateOfBirth?:      string;   // ISO date YYYY-MM-DD
  workLocation?:     string;

  // ── EMS structured (V16) ────────────────────────────────────────
  employeeCode?:     string;
  departmentId?:     number;
  departmentName?:   string;
  departmentCode?:   string;
  designationId?:    number;
  designationTitle?: string;
  designationLevel?: number;
  employmentType?:   EmploymentType;
  skills?:           string[];
  emergencyContact?: string;   // JSON string {name, phone, relation}
  userStatus?:       UserStatus;
}

export type OfficeLocation = "Chennai" | "Coimbatore" | "Bangalore";

export type ProductCategory =
  | "Cars"
  | "Bikes"
  | "Mobiles"
  | "Laptops"
  | "Furniture"
  | "Properties"
  | "Electronics"
  | "Sports";

export type ProductCondition = "New" | "Like New" | "Good" | "Fair" | "Poor";

export type FuelType =
  | "Petrol"
  | "Diesel"
  | "Electric"
  | "Hybrid"
  | "CNG"
  | "N/A";

export type ProductStatus = "active" | "sold" | "inactive";

export interface ProductImage {
  id: number;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: FuelType;
  kmDriven?: number;
  condition: ProductCondition;
  location: OfficeLocation;
  images: ProductImage[];
  seller: User;
  isFavorite?: boolean;
  favoriteCount: number;
  viewCount: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: FuelType;
  kmDriven?: number;
  condition: ProductCondition;
  location: OfficeLocation;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: ProductCategory;
  location?: OfficeLocation;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: "price" | "createdAt" | "views";
  sortOrder?: "asc" | "desc";
}

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  product: Product;
  createdAt: string;
}

export type CallRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface PurchasedProduct {
  product: Product;
  callRequestStatus: CallRequestStatus;
}

export interface CallRequest {
  id: number;
  productId: number;
  productTitle: string;
  requesterId: number;
  requesterName: string;
  requesterAvatar?: string;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string; // only when ACCEPTED
  status: CallRequestStatus;
  createdAt: string;
}

export interface Conversation {
  id: number;
  productId: number;
  productTitle: string;
  productImage?: string;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  type:
    | "call_request_received"
    | "call_request_accepted"
    | "call_request_rejected"
    | "new_message"
    | "leave_applied"
    | "leave_approved"
    | "leave_rejected";
  title: string;
  body?: string;
  referenceId?: number;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

// ── Announcements ──────────────────────────────────────────────────────────────

export type AnnouncementAudience = "ALL" | "MANAGER_ONLY" | "HR_ONLY";

export interface Announcement {
  id:             number;
  title:          string;
  body:           string;
  authorId:       number;
  authorName:     string;
  authorAvatarUrl?: string;
  audience:       AnnouncementAudience;
  pinned:         boolean;
  createdAt:      string;
}

export interface SendMessagePayload {
  content: string;
}
