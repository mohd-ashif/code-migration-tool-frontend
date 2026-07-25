import apiClient from '../services/http/apiClient';

export interface UploadProgress {
  uploadId?: string;
  jobId?: string;
  progressPercent: number;
  uploadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  formattedSpeed: string;
  formattedEta: string;
  status: 'idle' | 'uploading' | 'paused' | 'completing' | 'complete' | 'error';
  errorMessage?: string;
}

export class ChunkedUploader {
  private file: File;
  private targetFramework: string;
  private sourceFramework?: string;
  private chunkSize: number; // Default 2MB
  private uploadId: string | null = null;
  private isPausedState = false;
  private isCancelledState = false;

  private onProgressCallback?: (progress: UploadProgress) => void;
  private onCompleteCallback?: (result: { jobId: string; status: string }) => void;
  private onErrorCallback?: (error: string) => void;

  private startTime = 0;
  private uploadedBytesAcc = 0;

  constructor(file: File, targetFramework: string, sourceFramework?: string, chunkSize = 2 * 1024 * 1024) {
    this.file = file;
    this.targetFramework = targetFramework;
    this.sourceFramework = sourceFramework;
    this.chunkSize = chunkSize;
  }

  public onProgress(cb: (progress: UploadProgress) => void) {
    this.onProgressCallback = cb;
    return this;
  }

  public onComplete(cb: (result: { jobId: string; status: string }) => void) {
    this.onCompleteCallback = cb;
    return this;
  }

  public onError(cb: (error: string) => void) {
    this.onErrorCallback = cb;
    return this;
  }

  public pause() {
    this.isPausedState = true;
    this.emitProgress('paused');
  }

  public resume() {
    if (!this.isPausedState) return;
    this.isPausedState = false;
    this.startUpload();
  }

  public cancel() {
    this.isCancelledState = true;
    this.isPausedState = false;
    this.emitProgress('idle');
  }

  public async startUpload() {
    this.isPausedState = false;
    this.isCancelledState = false;
    this.startTime = Date.now();

    try {
      const totalSize = this.file.size;
      const totalChunks = Math.ceil(totalSize / this.chunkSize);

      // Check if resuming existing session from localStorage
      const storageKey = `chunk_upload_${this.file.name}_${this.file.size}`;
      let sessionUploadId = localStorage.getItem(storageKey);

      if (!sessionUploadId) {
        const initRes: any = await apiClient.post('/api/upload/init', {
          filename: this.file.name,
          totalSize,
          totalChunks,
        });
        sessionUploadId = initRes.metadata.uploadId;
        localStorage.setItem(storageKey, sessionUploadId!);
      }

      this.uploadId = sessionUploadId;

      // Query uploaded chunk status from backend for resumption
      const statusRes: any = await apiClient.get(`/api/upload/status/${this.uploadId}`);
      const completedIndices: number[] = statusRes.status?.completedChunks || [];
      const completedSet = new Set(completedIndices);

      this.uploadedBytesAcc = completedIndices.length * this.chunkSize;
      this.emitProgress('uploading');

      for (let i = 0; i < totalChunks; i++) {
        if (this.isPausedState || this.isCancelledState) {
          return;
        }

        if (completedSet.has(i)) {
          continue;
        }

        const start = i * this.chunkSize;
        const end = Math.min(start + this.chunkSize, totalSize);
        const chunkBlob = this.file.slice(start, end);

        await this.uploadChunkWithRetry(this.uploadId!, i, chunkBlob);

        this.uploadedBytesAcc += chunkBlob.size;
        this.emitProgress('uploading');
      }

      if (this.isPausedState || this.isCancelledState) return;

      this.emitProgress('completing');

      // Complete upload and merge chunks into migration job
      const completeRes: any = await apiClient.post('/api/upload/complete', {
        uploadId: this.uploadId,
        targetFramework: this.targetFramework,
        sourceFramework: this.sourceFramework,
      });

      localStorage.removeItem(storageKey);
      this.emitProgress('complete');

      if (this.onCompleteCallback) {
        this.onCompleteCallback({ jobId: completeRes.jobId, status: completeRes.status });
      }
    } catch (err: any) {
      const msg = err.message || 'Chunked upload failed.';
      this.emitProgress('error', msg);
      if (this.onErrorCallback) {
        this.onErrorCallback(msg);
      }
    }
  }

  private async uploadChunkWithRetry(uploadId: string, chunkIndex: number, chunkBlob: Blob, retries = 3) {
    let attempt = 0;
    while (attempt < retries) {
      attempt++;
      try {
        const formData = new FormData();
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', String(chunkIndex));
        formData.append('chunk', chunkBlob, `chunk_${chunkIndex}`);

        await apiClient.post('/api/upload/chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          showToast: false,
        } as any);

        return;
      } catch (err: any) {
        if (attempt >= retries || this.isCancelledState) {
          throw new Error(`Chunk ${chunkIndex} failed after ${retries} attempts.`);
        }
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
  }

  private emitProgress(status: UploadProgress['status'], errorMessage?: string) {
    const totalBytes = this.file.size;
    const uploadedBytes = Math.min(this.uploadedBytesAcc, totalBytes);
    const progressPercent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

    const elapsedTimeSec = Math.max((Date.now() - this.startTime) / 1000, 0.1);
    const speedBytesPerSec = uploadedBytes / elapsedTimeSec;

    const remainingBytes = totalBytes - uploadedBytes;
    const etaSec = speedBytesPerSec > 0 ? Math.round(remainingBytes / speedBytesPerSec) : 0;

    const formattedSpeed = `${(speedBytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
    const formattedEta = etaSec > 60 ? `${Math.floor(etaSec / 60)}m ${etaSec % 60}s` : `${etaSec}s`;

    if (this.onProgressCallback) {
      this.onProgressCallback({
        uploadId: this.uploadId || undefined,
        progressPercent,
        uploadedBytes,
        totalBytes,
        speedBytesPerSec,
        formattedSpeed,
        formattedEta,
        status,
        errorMessage,
      });
    }
  }
}
