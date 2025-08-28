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
