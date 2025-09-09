// src/api/bootstrap.ts
import axios from 'axios';
import type { Vendor, Product, UserLite } from '@/types/bootstrap';

const baseURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL,
  withCredentials: true, // required (you’re using Cookie auth)
});

export async function fetchAllVendors(): Promise<Vendor[]> {
  const res = await api.get('/vendor/allVendors');
  // Backend shape: { data: Vendor[] }
  return (res.data?.data ?? []) as Vendor[];
}

export async function fetchAllProducts(): Promise<Product[]> {
  const res = await api.get('/product/allProducts');
  return (res.data?.data ?? []) as Product[];
}

export async function fetchAllUsers(): Promise<UserLite[]> {
  const res = await api.get('/user/allUsers');
  return (res.data?.data ?? []) as UserLite[];
}
