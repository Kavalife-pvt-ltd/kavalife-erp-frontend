import axios from 'axios';
const baseURL = import.meta.env.VITE_BACKEND_URL;

export interface Vendor {
  id: number;
  name: string;
}
export interface Product {
  id: number;
  name: string;
}
export interface UserLite {
  id: number;
  username: string;
  role?: string;
}

export async function fetchAllVendors(): Promise<Vendor[]> {
  const { data } = await axios.get(`${baseURL}/vendor/allVendors`, { withCredentials: true });
  return (data?.data ?? data) as Vendor[];
}
export async function fetchAllProducts(): Promise<Product[]> {
  const { data } = await axios.get(`${baseURL}/product/allProducts`, { withCredentials: true });
  return (data?.data ?? data) as Product[];
}
export async function fetchAllUsers(): Promise<UserLite[]> {
  const { data } = await axios.get(`${baseURL}/user/allUsers`, { withCredentials: true });
  return (data?.data ?? data) as UserLite[];
}
