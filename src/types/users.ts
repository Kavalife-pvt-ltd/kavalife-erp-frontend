// src/types/users.ts

export type User = {
  id: number;
  username: string;
  created_at: string;
  role: string;
  department: string;
  phone_num: string;
  name: string;
  email: string;
};

export type NewUser = {
  id: number;
  username: string;
  mob_number: string;
  email: string;
  name: string;
};

export type ApproveNewUserPayload = {
  id: number;
  role: string;
  department: string;
};
