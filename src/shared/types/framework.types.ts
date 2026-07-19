export type FrameworkStatus = "active" | "inactive" | "maintenance" | "experimental" | "deprecated";
export type EngineType      = "ast" | "sfc" | "compiler" | "optimizer" | "translator" | "mapper";
export type OptimizationLevel = "ultra" | "high" | "medium" | "low";
export type Stability       = "stable" | "beta" | "experimental" | "unstable";

export interface FrameworkDto {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  logo: string;
  category: string;
  currentVersion: string;
  description: string | null;
  documentationUrl: string | null;
  homepageUrl: string | null;
  status: FrameworkStatus;
  engineCount?: number;
  codemodCount?: number;
  migrationsRun?: number;
  avgSuccessRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FrameworkVersionDto {
  id: string;
  frameworkId: string;
  version: string;
  releaseDate: string | null;
  isLatest: boolean;
  isSupported: boolean;
  minimumNodeVersion: string | null;
  notes: string | null;
}

export interface MigrationEngineDto {
  id: string;
  frameworkId: string;
  frameworkName?: string;
  frameworkSlug?: string;
  engineName: string;
  engineType: EngineType;
  status: FrameworkStatus;
  optimizationLevel: OptimizationLevel;
  compilerVersion: string;
  astVersion: string;
  activeCodemods: number;
  supported: boolean;
  migrationsRun: number;
  avgDurationMs: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodemodDto {
  id: string;
  frameworkId: string;
  engineId: string | null;
  name: string;
  description: string | null;
  enabled: boolean;
  priority: number;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportedMigrationDto {
  id: string;
  source: string;           // slug
  sourceName: string;
  target: string;           // slug
  targetName: string;
  supported: boolean;
  qualityScore: number;
  stability: Stability;
  estimatedSuccessRate: number;
}

export interface CompilerSettingsDto {
  id: string;
  frameworkId: string;
  parallelProcessing: boolean;
  optimization: boolean;
  treeShaking: boolean;
  sourceMaps: boolean;
  strictMode: boolean;
  experimentalFeatures: boolean;
  maxFileSize: number;
  timeout: number;
  memoryLimit: number;
}

export interface FrameworkDetailDto {
  framework: FrameworkDto;
  versions: FrameworkVersionDto[];
  engines: MigrationEngineDto[];
  codemods: CodemodDto[];
  supportedMigrations: SupportedMigrationDto[];
  settings: CompilerSettingsDto | null;
}

export interface CompilerHealthDto {
  engines: number;
  healthy: number;
  warnings: number;    // maintenance
  failed: number;      // inactive / deprecated
  experimental: number;
  totalMigrationsRun: number;
  avgDurationMs: number;
  lastChecked: string;
}

export interface PatchEnginePayload {
  status?: FrameworkStatus;
  optimizationLevel?: OptimizationLevel;
  compilerVersion?: string;
  astVersion?: string;
  supported?: boolean;
}

export interface PatchCodemodPayload {
  enabled?: boolean;
  priority?: number;
}

export interface PatchCompilerSettingsPayload {
  parallelProcessing?: boolean;
  optimization?: boolean;
  treeShaking?: boolean;
  sourceMaps?: boolean;
  strictMode?: boolean;
  experimentalFeatures?: boolean;
  maxFileSize?: number;
  timeout?: number;
  memoryLimit?: number;
}
