import apiClient from '../../../services/http/apiClient';
import { ParsedFile } from '../../../shared/types/api.types';

export async function parseProject(file: File): Promise<{ success: boolean; data?: { framework: string; files: ParsedFile[] } }> {
  const formData = new FormData();
  formData.append('project', file);

  return apiClient.post('/api/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function startMigration(
  projectFiles: ParsedFile[],
  targetFramework: string,
  sourceFramework?: string
): Promise<{ success: boolean; jobId?: string }> {
  return apiClient.post('/api/migrate', {
    projectFiles,
    targetFramework,
    sourceFramework,
  });
}
