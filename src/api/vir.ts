import axios from 'axios';
import type { VIR } from '@/types/vir';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export const fetchAllVIRs = async (): Promise<VIR[]> => {
  const response = await axios.get(`${baseURL}/vir/all`, { withCredentials: true });
  return response.data.data;
};
export const getVIRDetailsById = async (): Promise<VIR[]> => {
  const response = await axios.get(`${baseURL}/vir/all`, { withCredentials: true });
  return response.data.data;
};
export const getCompletedVIRs = async (): Promise<VIR[]> => {
  const response = await axios.get(`${baseURL}/vir/all`, { withCredentials: true });
  return response.data.data;
};
