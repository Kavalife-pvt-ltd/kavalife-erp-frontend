import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL;

type SignedURLResponse = {
  success?: boolean;
  data?: { signedUrl: string; expiresIn: number };
};

export async function getCOASignedUrl(path: string): Promise<string> {
  const url = `${baseURL}/files/coa/signed-url`;

  const resp = await axios.post<SignedURLResponse>(url, { path }, { withCredentials: true });

  const signed = resp.data?.data?.signedUrl?.trim();
  if (!signed) throw new Error('Signed URL not returned');
  return signed;
}
