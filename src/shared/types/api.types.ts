export interface ParsedFile {
  path: string;
  content: string;
}

export interface JobRecord {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'parsing...' | 'migrating...' | 'processing' | 'cancelled';
  progress?: number;
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
