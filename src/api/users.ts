// src/api/users.ts
import axios from 'axios';
import type { User, NewUser, ApproveNewUserPayload } from '@/types/users';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export type CreateNewUserPayload = {
  username: string;
  name: string;
  email?: string;
  password: string;
  mob_number: string;
};

export async function listUsers(): Promise<User[]> {
  const url = `${baseURL}/user/allUsers`;
  const resp = await axios.get(url, { withCredentials: true });

  const payload = resp.data?.data ?? resp.data;
  return Array.isArray(payload) ? (payload as User[]) : [];
}

export async function listNewUsers(): Promise<NewUser[]> {
  const url = `${baseURL}/user/allNewUsers`;
  const resp = await axios.get(url, { withCredentials: true });

  const payload = resp.data?.data ?? resp.data;
  return Array.isArray(payload) ? (payload as NewUser[]) : [];
}

export async function approveNewUser(payload: ApproveNewUserPayload): Promise<string> {
  const url = `${baseURL}/user/approveNewUser`;
  const resp = await axios.post(url, payload, { withCredentials: true });

  return (resp.data?.data ?? resp.data) as string;
}

export async function createNewUser(payload: CreateNewUserPayload): Promise<string> {
  const url = `${baseURL}/api/createNewUser`;
  const resp = await axios.post(url, payload);
  return (resp.data?.data ?? resp.data) as string;
}
