import axios from 'axios';
import { QAQCData } from '@/types/grn';

export async function fetchQAQCEntry(grnNumber: string): Promise<QAQCData | null> {
  try {
    const response = await axios.get(`/api/qaqc/view?processType=grn&processRef=${grnNumber}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch QAQC entry');
  }
}

export async function createQAQCEntry(
  payload: Omit<QAQCData, 'grnId'> & { processType: string; processRef: string }
): Promise<void> {
  try {
    await axios.post('/api/qaqc/create', payload);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create QAQC entry');
  }
}
