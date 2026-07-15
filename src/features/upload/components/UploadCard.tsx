import React, { useState, useRef } from 'react';
import { Upload, FileCode, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
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

const UploadCard = React.memo(function UploadCard() {
  const dispatch = useAppDispatch();
  const { parseProject, isParsing, startMigration, isMigrating } = useUpload();
  const isReduced = useReducedMotion();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'configure'>('upload');

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only ZIP files are supported.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setError(null);
    try {
      const res = await parseProject(file);
      if (res.success && res.data) {
        const fw = res.data.framework;
        setDetectedFramework(fw);
        setSourceFramework(fw);
        setParsedFiles(res.data.files);

        // Suggest a valid target framework
        if (fw === 'react') {
          setTargetFramework('typescript');
        } else if (fw === 'angular' || fw === 'vue') {
          setTargetFramework('react');
        } else if (fw === 'javascript') {
          setTargetFramework('typescript');
        } else {
          setTargetFramework('react');
        }

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
    try {
      const res = await startMigration({
        projectFiles: parsedFiles,
        targetFramework,
        sourceFramework,
      });
      if (res.success && res.jobId) {
        dispatch(setSelectedJobId(res.jobId));
        // Reset state
        setFile(null);
        setStep('upload');
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

  const loading = isParsing || isMigrating;

  return (
    <Card className="flex flex-col flex-1 h-[460px] relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'upload' ? (
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
                Drop a ZIP of your frontend project, or grab a{' '}
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
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
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
                className="border border-dashed rounded-xl py-12 px-6 text-center cursor-pointer relative group flex flex-col items-center justify-center min-h-[190px] border-border"
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
                  <FileCode className="w-6 h-6" />
                </motion.div>
                
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {file ? file.name : "Drag & drop your project ZIP"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse • max 200MB"}
                </p>
              </motion.div>

              {/* Framework Chips shortcuts */}
              <div className="mt-6 flex flex-wrap gap-2 select-none">
                {chips.map((c) => {
                  const isSelected = targetFramework === c.value;
                  return (
                    <motion.button
                      whileTap={isReduced ? {} : { scale: 0.95 }}
                      key={c.label}
                      onClick={() => setTargetFramework(c.value)}
                      className={`px-3 py-1.5 text-[11px] font-semibold font-mono rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-white shadow-glow'
                          : 'border-border bg-card/40 text-muted-foreground hover:text-foreground hover:border-gray-500'
                      }`}
                    >
                      {isSelected ? '• ' : '+ '}
                      {c.label}
                    </motion.button>
                  );
                })}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive text-xs rounded-xl flex items-center gap-2 border border-destructive/20 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleParse(); }}
              disabled={!file || loading}
              loading={isParsing}
              className="w-full mt-6"
            >
              Upload and Analyze Project
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="configure-step"
            variants={slideHorizontal}
            custom={1}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-1 justify-between h-full select-none"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle className="w-4 h-4 text-success" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Project Analyzed</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Configure the migration parameters below.</p>

              <div className="space-y-4">
                <div className="p-3.5 bg-success/5 border border-success/15 rounded-xl text-xs flex justify-between items-center font-mono">
                  <span className="text-muted-foreground font-medium">Auto-detected Framework:</span>
                  <span className="text-success font-bold capitalize bg-success/10 px-2 py-0.5 rounded-lg border border-success/20">
                    {detectedFramework || "Vanilla JS"}
                  </span>
                </div>

                {/* Source selector override */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Source Framework (Override)
                  </label>
                  <select
                    value={sourceFramework}
                    onChange={(e) => setSourceFramework(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#12131F] border border-[#1E1F35] text-white rounded-xl focus:outline-none focus:border-primary text-xs transition-all cursor-pointer font-medium"
                  >
                    <option value="angular" className="bg-[#12131F] text-white">Angular</option>
                    <option value="vue" className="bg-[#12131F] text-white">Vue</option>
                    <option value="react" className="bg-[#12131F] text-white">React</option>
                    <option value="javascript" className="bg-[#12131F] text-white">JavaScript</option>
                    <option value="typescript" className="bg-[#12131F] text-white">TypeScript</option>
                    <option value="next" className="bg-[#12131F] text-white">Next.js</option>
                    <option value="svelte" className="bg-[#12131F] text-white">Svelte</option>
                    <option value="nuxt" className="bg-[#12131F] text-white">Nuxt.js</option>
                  </select>
                </div>

                {/* Target framework selector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Target Framework
                  </label>
                  <select
                    value={targetFramework}
                    onChange={(e) => setTargetFramework(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#12131F] border border-[#1E1F35] text-white rounded-xl focus:outline-none focus:border-primary text-xs transition-all cursor-pointer font-medium"
                  >
                    <option value="react" className="bg-[#12131F] text-white">React (JSX)</option>
                    <option value="typescript" className="bg-[#12131F] text-white">TypeScript (TSX)</option>
                    <option value="next" className="bg-[#12131F] text-white">Next.js</option>
                    <option value="vue" className="bg-[#12131F] text-white">Vue 3</option>
                    <option value="svelte" className="bg-[#12131F] text-white">Svelte</option>
                    <option value="nuxt" className="bg-[#12131F] text-white">Nuxt.js</option>
                  </select>
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground font-mono">
                  Found <strong className="text-foreground">{parsedFiles.length}</strong> source files ready to transform.
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive text-xs rounded-xl flex items-center gap-2 border border-destructive/20 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                disabled={loading}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={loading}
                loading={isMigrating}
                className="flex-1"
              >
                Run Migration
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

export default UploadCard;
