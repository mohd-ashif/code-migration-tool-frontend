import apiClient from '../../../services/http/apiClient';

export async function getDependencyGraph(
  jobId: string,
  page: number,
  limit: number,
  search?: string,
  filter?: string
): Promise<any> {
  const query = new URLSearchParams({
    jobId,
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(filter && { filter }),
  });

  return apiClient.get(`/api/graph?${query.toString()}`);
}
