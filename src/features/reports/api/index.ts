import apiClient from '../../../services/http/apiClient';

export async function generateReport(jobId: string): Promise<{ success: boolean; report?: any }> {
  return apiClient.post('/api/report', { jobId });
}
