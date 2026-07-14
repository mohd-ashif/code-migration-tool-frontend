import React, { useState, useRef } from 'react';
import { Upload, FileCode, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useUpload } from '../hooks/useUpload';
import { API_KEY } from '../../../services/http/apiClient';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useAppDispatch } from '../../../store';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { ParsedFile } from '../../../shared/types/api.types';

const UploadCard = React.memo(function UploadCard() {
  const dispatch = useAppDispatch();
  const { parseProject, isParsing, startMigration, isMigrating } = useUpload();

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
    <Card className="flex flex-col flex-1 h-[460px]">
      {step === 'upload' ? (
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5 select-none">
              <Upload className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Upload Project</h2>
            </div>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed select-none">
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
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border border-dashed rounded-xl py-12 px-6 text-center cursor-pointer transition-all duration-300 relative group flex flex-col items-center justify-center min-h-[190px] ${
                dragActive
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-[#1E1F35] hover:border-primary/45 hover:bg-[#151628]/40'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".zip"
                onChange={handleChange}
              />
              
              <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl mb-3 group-hover:scale-105 transition-transform duration-300 shadow-glow">
                <FileCode className="w-6 h-6" />
              </div>
              
              <p className="text-sm font-bold text-white group-hover:text-primary/90 transition-colors">
                {file ? file.name : "Drag & drop your project ZIP"}
              </p>
              <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse • max 200MB"}
              </p>
            </div>

            {/* Framework Chips shortcuts */}
            <div className="mt-6 flex flex-wrap gap-2 select-none">
              {chips.map((c) => {
                const isSelected = targetFramework === c.value;
                return (
                  <button
                    key={c.label}
                    onClick={() => setTargetFramework(c.value)}
                    className={`px-3 py-1.5 text-[11px] font-semibold font-mono rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-white shadow-glow'
                        : 'border-[#1E1F35] bg-[#12131F]/30 text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    {isSelected ? '• ' : '+ '}
                    {c.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-error/10 text-error text-xs rounded-xl flex items-center gap-2 border border-error/20">
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
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-between select-none">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4 h-4 text-success" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Project Analyzed</h2>
            </div>
            <p className="text-xs text-gray-400 mb-6">Configure the migration parameters below.</p>

            <div className="space-y-4">
              <div className="p-3.5 bg-success/5 border border-success/15 rounded-xl text-xs flex justify-between items-center">
                <span className="text-gray-400 font-medium">Auto-detected Framework:</span>
                <span className="text-success font-bold font-mono capitalize bg-success/10 px-2 py-0.5 rounded-lg border border-success/20">
                  {detectedFramework || "Vanilla JS"}
                </span>
              </div>

              {/* Source selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Source Framework (Override)
                </label>
                <select
                  value={sourceFramework}
                  onChange={(e) => setSourceFramework(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12131F] border border-[#1E1F35] text-white rounded-xl focus:outline-none focus:border-primary text-xs transition-all cursor-pointer font-medium"
                >
                  <option value="angular">Angular</option>
                  <option value="vue">Vue</option>
                  <option value="react">React</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="next">Next.js</option>
                  <option value="svelte">Svelte</option>
                  <option value="nuxt">Nuxt.js</option>
                </select>
              </div>

              {/* Target selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Target Framework
                </label>
                <select
                  value={targetFramework}
                  onChange={(e) => setTargetFramework(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12131F] border border-[#1E1F35] text-white rounded-xl focus:outline-none focus:border-primary text-xs transition-all cursor-pointer font-medium"
                >
                  <option value="react">React (JSX)</option>
                  <option value="typescript">TypeScript (TSX)</option>
                  <option value="next">Next.js</option>
                  <option value="vue">Vue 3</option>
                  <option value="svelte">Svelte</option>
                  <option value="nuxt">Nuxt.js</option>
                </select>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 font-mono">
                Found <strong className="text-white">{parsedFiles.length}</strong> source files ready to transform.
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-error/10 text-error text-xs rounded-xl flex items-center gap-2 border border-error/20">
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
        </div>
      )}
    </Card>
  );
});

export default UploadCard;
