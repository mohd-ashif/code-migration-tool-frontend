import React, { useState, useRef } from 'react';
import { Upload, FileCode, CheckCircle, AlertCircle, ArrowLeft, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpload } from '../hooks/useUpload';
import { API_KEY } from '../../../services/http/apiClient';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useAppDispatch } from '../../../store';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { ParsedFile } from '../../../shared/types/api.types';
import { defaultTransition, slideHorizontal } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { parseDroppedItems } from '../../../utils/folderParser';
import { ChunkedUploader, UploadProgress } from '../../../utils/chunkedUploader';
import LiveMigrationTracker from '../../migration/components/LiveMigrationTracker';

interface UploadCardProps {
  disabled?: boolean;
}

const UploadCard = React.memo(function UploadCard({ disabled = false }: UploadCardProps) {
  const dispatch = useAppDispatch();
  const { parseProject, isParsing, startMigration, isMigrating } = useUpload();
  const isReduced = useReducedMotion();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'configure' | 'active_job'>('upload');

  // Chunked Upload & Folder Parsing States
  const [isFolder, setIsFolder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const uploaderRef = useRef<ChunkedUploader | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Configuration states
  const [detectedFramework, setDetectedFramework] = useState<string>('');
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [targetFramework, setTargetFramework] = useState<string>('react');
  const [sourceFramework, setSourceFramework] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    // 1. Check for Directory Drop via HTML5 webkitGetAsEntry
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const items = e.dataTransfer.items;
      const isDir = items[0].webkitGetAsEntry?.()?.isDirectory;

      if (isDir) {
        setIsFolder(true);
        try {
          const folderFiles = await parseDroppedItems(items);
          if (folderFiles.length === 0) {
            setError("No valid source files found in dropped folder.");
            return;
          }
          setParsedFiles(folderFiles);
          setDetectedFramework('javascript');
          setSourceFramework('javascript');
          setStep('configure');
          return;
        } catch (err: any) {
          setError("Failed to parse dropped directory structure.");
          return;
        }
      }
    }

    // 2. Regular File / ZIP Drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
        setIsFolder(false);
        setError(null);
      } else {
        setError("Only ZIP files or Project Folders are supported.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsFolder(false);
      setError(null);
    }
  };

  const handleParse = async () => {
    if (parsedFiles.length > 0 && isFolder) {
      setStep('configure');
      return;
    }

    if (!file) return;
    setError(null);

    try {
      const res = await parseProject(file);
      if (res.success && res.data) {
        const fw = res.data.framework;
        setDetectedFramework(fw);
        setSourceFramework(fw);
        setParsedFiles(res.data.files);

        if (fw === 'react') setTargetFramework('typescript');
        else if (fw === 'angular' || fw === 'vue') setTargetFramework('react');
        else if (fw === 'javascript') setTargetFramework('typescript');
        else setTargetFramework('react');

        setStep('configure');
      } else {
        setError((res as any).message || "Failed to parse project. Ensure it's a valid ZIP archive.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during project parsing.");
    }
  };

  const handleMigrate = async () => {
    setError(null);

    // Large File Chunked Upload Strategy (Files > 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      const uploader = new ChunkedUploader(file, targetFramework, sourceFramework);
      uploaderRef.current = uploader;

      uploader
        .onProgress((prog) => {
          setUploadProgress(prog);
        })
        .onComplete(({ jobId }) => {
          setActiveJobId(jobId);
          dispatch(setSelectedJobId(jobId));
          setStep('active_job');
        })
        .onError((errMessage) => {
          setError(errMessage);
        });

      uploader.startUpload();
      return;
    }

    // Standard In-Memory Migration Strategy
    try {
      const res = await startMigration({
        projectFiles: parsedFiles,
        targetFramework,
        sourceFramework,
      });
      if (res.success && res.jobId) {
        setActiveJobId(res.jobId);
        dispatch(setSelectedJobId(res.jobId));
        setStep('active_job');
      } else {
        setError((res as any).message || "Failed to start migration job.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred starting migration.");
    }
  };

  const chips = [
    { label: 'react', value: 'react' },
    { label: 'next', value: 'next' },
    { label: 'vue3', value: 'vue' },
    { label: 'typescript', value: 'typescript' },
    { label: 'nuxt', value: 'nuxt' },
  ];

  const loading = isParsing || isMigrating || uploadProgress?.status === 'uploading';
  const isBlocked = disabled || loading;

  return (
    <Card 
      id="upload-card-root"
      tabIndex={0}
      className="flex flex-col flex-1 min-h-[460px] relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 'active_job' && activeJobId ? (
          <motion.div
            key="active-job-step"
            variants={slideHorizontal}
            custom={1}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-1 justify-between h-full"
          >
            <LiveMigrationTracker
              jobId={activeJobId}
              onCancel={() => {
                setStep('upload');
                setActiveJobId(null);
                setFile(null);
              }}
              onComplete={() => {
                // Keep completed view accessible
              }}
            />
          </motion.div>
        ) : step === 'upload' ? (
          <motion.div
            key="upload-step"
            variants={slideHorizontal}
            custom={-1}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-1 justify-between h-full"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5 select-none">
                <Upload className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Upload Project</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed select-none">
                Drop a ZIP archive or entire project folder, or grab a{' '}
                <a
                  href={`/api/sample?apiKey=${API_KEY}`}
                  download
                  className="text-primary hover:underline font-semibold transition-all"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                >
                  sample project ZIP
                </a>{' '}
                to test drive the engine.
              </p>

              {/* Drag and Drop Zone */}
              <motion.div
                onDragEnter={disabled ? undefined : handleDrag}
                onDragOver={disabled ? undefined : handleDrag}
                onDragLeave={disabled ? undefined : handleDrag}
                onDrop={disabled ? undefined : handleDrop}
                onClick={() => { if (!disabled) inputRef.current?.click(); }}
                whileHover={isReduced ? {} : { scale: 1.015 }}
                animate={
                  dragActive
                    ? {
                        scale: 1.02,
                        borderColor: "rgba(124, 108, 255, 1)",
                        backgroundColor: "rgba(124, 108, 255, 0.08)",
                        boxShadow: "0 0 25px rgba(124, 108, 255, 0.2)",
                        backdropFilter: "blur(4px)"
                      }
                    : {
                        scale: 1,
                        borderColor: "var(--border)",
                        backgroundColor: "rgba(21, 22, 40, 0.2)",
                        boxShadow: "none",
                        backdropFilter: "blur(0px)"
                      }
                }
                transition={defaultTransition}
                className={`border border-dashed rounded-xl py-12 px-6 text-center relative group flex flex-col items-center justify-center min-h-[190px] border-border ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".zip"
                  onChange={handleChange}
                />
                
                <motion.div 
                  animate={dragActive && !isReduced ? { y: [0, -8, 0], transition: { repeat: Infinity, duration: 0.8 } } : {}}
                  className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl mb-3 group-hover:scale-105 transition-transform duration-300 shadow-glow"
                >
                  {isFolder ? <Folder className="w-6 h-6" /> : <FileCode className="w-6 h-6" />}
                </motion.div>
                
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {file ? file.name : parsedFiles.length > 0 ? `Folder parsed (${parsedFiles.length} files)` : "Drag & drop project ZIP or Folder"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "supports large ZIPs up to 500MB+ & folder drag-and-drop"}
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Parse / Next Button */}
            <div className="mt-6 pt-4 border-t border-border/40">
              <Button
                variant="primary"
                onClick={handleParse}
                disabled={isBlocked || (!file && parsedFiles.length === 0)}
                loading={isParsing}
                className="w-full justify-center shadow-glow"
              >
                {isParsing ? "Analyzing Codebase AST..." : "Inspect & Configure Migration →"}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Configure Step */
          <motion.div
            key="configure-step"
            variants={slideHorizontal}
            custom={1}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-1 justify-between h-full"
          >
            <div>
              <button
                onClick={() => setStep('upload')}
                disabled={isBlocked}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
              </button>

              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Target Architecture</h2>
              <p className="text-xs text-muted-foreground mb-4 select-none">
                Select your desired target framework to transform codebase codemods.
              </p>

              {/* Source info */}
              <div className="mb-4 p-3 bg-secondary/30 border border-border/60 rounded-xl flex items-center justify-between select-none">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Detected Source</span>
                  <span className="text-xs font-bold text-foreground capitalize">{sourceFramework || detectedFramework || 'Auto-Detect'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" /> {parsedFiles.length} files parsed
                </div>
              </div>

              {/* Target chips */}
              <div className="space-y-2 select-none">
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Select Target Framework</span>
                <div className="grid grid-cols-2 gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => setTargetFramework(chip.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        targetFramework === chip.value
                          ? 'bg-primary/10 border-primary text-primary shadow-glow'
                          : 'bg-secondary/20 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Upload Progress Bar if Chunking */}
              {uploadProgress && uploadProgress.status === 'uploading' && (
                <div className="mt-4 p-3 bg-[#0B0B14] border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white font-mono">Uploading Chunks...</span>
                    <span className="text-primary font-bold">{uploadProgress.progressPercent}% ({uploadProgress.formattedSpeed})</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-200" style={{ width: `${uploadProgress.progressPercent}%` }} />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <div className="mt-6 pt-4 border-t border-border/40">
              <Button
                variant="primary"
                onClick={handleMigrate}
                disabled={isBlocked}
                loading={isMigrating || uploadProgress?.status === 'uploading'}
                className="w-full justify-center shadow-glow"
              >
                {uploadProgress?.status === 'uploading'
                  ? `Uploading Chunks (${uploadProgress.progressPercent}%)...`
                  : isMigrating
                  ? "Initializing Live Engine..."
                  : `Start Codebase Migration →`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

export default UploadCard;
