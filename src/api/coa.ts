import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL;

type UploadCOAResponse = { coaUrl: string };
type SignedURLResponse = { signedUrl: string };

export async function uploadCOA(file: File): Promise<string> {
  const url = `${baseURL}/sales-po/upload-coa`;

  const form = new FormData();
  form.append('coa', file);

  const resp = await axios.post(url, form, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const payload = (resp.data?.data ?? resp.data) as UploadCOAResponse;
  return payload.coaUrl;
}

export async function getCOASignedUrl(coaPath: string): Promise<string> {
  const url = `${baseURL}/sales-po/coa-signed-url`;

  const resp = await axios.get(url, {
    withCredentials: true,
    params: { coaPath },
  });

  const payload = (resp.data?.data ?? resp.data) as SignedURLResponse;
  return payload.signedUrl;
}
