import axios from 'axios';
import type { VIR, CreateVIRRequest, CreateVIRResponse, VerifyVIRRequest } from '@/types/vir';

const baseURL = import.meta.env.VITE_BACKEND_URL;

// Get all VIRs
export async function getAllVIRs(): Promise<VIR[]> {
  const url = `${baseURL}/vir/all`;
  const resp = await axios.get(url, { withCredentials: true });

  return (resp.data?.data ?? resp.data) as VIR[];
}

// Get one VIR by vir_number
export async function getVIRDetailsById(virNumber: string): Promise<VIR> {
  const { data } = await axios.get(`${baseURL}/vir/${virNumber}`, { withCredentials: true });
  return (data?.data ?? data) as VIR;
}

// Create a VIR
export async function createVIR(payload: CreateVIRRequest): Promise<CreateVIRResponse> {
  const { data } = await axios.post(`${baseURL}/vir/create`, payload, { withCredentials: true });
  return (data?.data ?? data) as CreateVIRResponse;
}

// Verify a VIR
export async function verifyVIR(virNumber: string, payload: VerifyVIRRequest): Promise<void> {
  await axios.patch(`${baseURL}/vir/verify/${virNumber}`, payload, { withCredentials: true });
}

// Convenience: filter completed ones client-side
export async function getCompletedVIRs(): Promise<VIR[]> {
  const list = await getAllVIRs();
  return list.filter((v) => v.status === 'completed');
}
