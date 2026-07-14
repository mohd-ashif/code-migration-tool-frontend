import apiClient, { API_KEY } from '../../../services/http/apiClient';
import { JobRecord } from '../../../shared/types/api.types';

export async function getJobs(): Promise<{ success: boolean; jobs?: JobRecord[] }> {
  return apiClient.get('/api/jobs');
}

export async function getJobStatus(jobId: string): Promise<{ success: boolean; job?: JobRecord }> {
  return apiClient.get(`/api/migrate/${jobId}`);
}

export function getDownloadUrl(jobId: string): string {
  return `/api/download?jobId=${jobId}&apiKey=${API_KEY}`;
}
