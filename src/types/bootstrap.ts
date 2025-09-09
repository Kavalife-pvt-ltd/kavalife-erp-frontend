// src/types/bootstrap.ts

// ---------- Vendors ----------
export type VendorStatus = 'active' | 'inactive';
export type VendorType = 'buyer' | 'seller';

export interface PgNullableTime {
  Time: string; // ISO string
  Valid: boolean; // false => treat as undefined
}

export interface Vendor {
  id: number;
  name: string;
  created_at: string; // ISO
  status: VendorStatus;
  gov_id: string;
  type: VendorType;
  updated_by: number;
  updated_at: PgNullableTime; // { Time, Valid }
}

// ---------- Products ----------
export interface Product {
  id: number;
  name: string;
  quantity: number; // can be int/float
  userId: number; // creator/owner
}

// ---------- Users ----------
export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserLite {
  id: number;
  username: string;
  created_at: string; // ISO
  role: UserRole;
  phone_num: number;
}
