import apiClient from '../../../services/http/apiClient';
import { JobRecord } from '../../../shared/types/api.types';

export async function getJobs(): Promise<{ success: boolean; jobs?: JobRecord[] }> {
  return apiClient.get('/api/jobs');
}

export async function getJobStatus(jobId: string): Promise<{ success: boolean; job?: JobRecord }> {
  return apiClient.get(`/api/migrate/${jobId}`);
}

export function getDownloadUrl(jobId: string): string {
  // Uses session cookie (withCredentials) — no API key exposed in URL
  return `/api/download?jobId=${jobId}`;
}

