import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export const loginUser = async (username: string, password: string) => {
  return axios.post(`${baseURL}/api/login`, { username, password }, { withCredentials: true });
};

export const logoutUser = async () => {
  return axios.post(`${baseURL}/api/logout`, {}, { withCredentials: true });
};

export const checkUser = async () => {
  return axios.get(`${baseURL}/api/checkUser`, { withCredentials: true });
};
