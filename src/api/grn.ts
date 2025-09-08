import axios from 'axios';
import { GRN } from '@/types/grn';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export async function fetchGRNs(): Promise<GRN[]> {
  const response = await axios.get(`${baseURL}/grn/view`, { withCredentials: true });
  if (!response) {
    throw new Error('Failed to fetch GRNs');
  }
  return response.data.data;
}

export async function createGRN(grnData: Partial<GRN>): Promise<GRN> {
  const response = await axios.post(`${baseURL}/grn/create`, grnData, { withCredentials: true });
  if (!response) {
    throw new Error('Failed to create GRN');
  }
  return response.data.data;
}

export async function updateGRN(id: number, grnData: Partial<GRN>): Promise<GRN> {
  const response = await axios.put(`${baseURL}/grn/update/${id}`, grnData, {
    withCredentials: true,
  });
  if (!response) {
    throw new Error('Failed to update GRN');
  }
  return response.data.data;
}
