export interface ParsedFile {
  path: string;
  content: string;
}

export interface JobRecord {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'parsing...' | 'migrating...' | 'processing' | 'cancelled';
  progress?: number;
  workspace_id?: string | null;
  user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  result?: {
    success: boolean;
    targetFramework: string;
    sourceFramework?: string;
    migratedFiles: ParsedFile[];
    metadata: {
      fileCount: number;
      origin: string;
      durationMs?: number;
    };
  } | null;
  request?: {
    targetFramework?: string;
    sourceFramework?: string;
    jobId?: string;
  } | null;
  message?: string | null;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  owner_id: string;
  role?: string;
  created_at?: string;
}

export interface WorkspaceMemberDto {
  user_id: string;
  email?: string;
  role: string;
}

export interface UsageDto {
  jobCount: number;
  storageUsedMB: number;
  remainingMigrations: number;
  totalMigrations?: number;
}

