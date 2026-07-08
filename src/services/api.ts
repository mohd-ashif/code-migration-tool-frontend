export interface ParsedFile {
  path: string;
  content: string;
}

export interface JobRecord {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'parsing...' | 'migrating...';
  result?: {
    success: boolean;
    targetFramework: string;
    migratedFiles: ParsedFile[];
    metadata: {
      fileCount: number;
      origin: string;
    };
  } | null;
  message?: string | null;
}

export const API_KEY = 'your-api-key-here';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...options.headers,
    'x-api-key': API_KEY,
  };
  return fetch(url, { ...options, headers });
}

export async function parseProject(file: File): Promise<{ success: boolean; data?: { framework: string; files: ParsedFile[] } }> {
  const formData = new FormData();
  formData.append('project', file);

  const res = await fetchWithAuth('/api/parse', {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function startMigration(
  projectFiles: ParsedFile[],
  targetFramework: string,
  sourceFramework?: string
): Promise<{ success: boolean; jobId?: string }> {
  const res = await fetchWithAuth('/api/migrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectFiles,
      targetFramework,
      sourceFramework,
    }),
  });
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<{ success: boolean; job?: JobRecord }> {
  const res = await fetchWithAuth(`/api/migrate/${jobId}`);
  return res.json();
}

export async function getJobs(): Promise<{ success: boolean; jobs?: JobRecord[] }> {
  const res = await fetchWithAuth('/api/jobs');
  return res.json();
}

export async function generateReport(jobId: string): Promise<{ success: boolean; report?: any }> {
  const res = await fetchWithAuth('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId }),
  });
  return res.json();
}

export function getDownloadUrl(jobId: string): string {
  return `/api/download?jobId=${jobId}&apiKey=${API_KEY}`;
}
