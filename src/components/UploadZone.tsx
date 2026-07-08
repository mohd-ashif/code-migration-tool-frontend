import React, { useState, useRef } from 'react';
import { Upload, FileCode, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { parseProject, startMigration, ParsedFile, API_KEY } from '../services/api';

interface UploadZoneProps {
  onMigrationStarted: (jobId: string) => void;
}

export default function UploadZone({ onMigrationStarted }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError(null);
    try {
      const res = await parseProject(file);
      if (res.success && res.data) {
        const fw = res.data.framework;
        setDetectedFramework(fw);
        setSourceFramework(fw);
        setParsedFiles(res.data.files);

        // Dynamically suggest a valid target framework
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
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await startMigration(parsedFiles, targetFramework, sourceFramework);
      if (res.success && res.jobId) {
        onMigrationStarted(res.jobId);
        // Reset state
        setFile(null);
        setStep('upload');
      } else {
        setError((res as any).message || "Failed to start migration job.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred starting migration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all">
      {step === 'upload' ? (
        <div>
          <h2 className="text-xl font-bold mb-1 text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" /> Start a Migration
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload a ZIP file of your frontend project to get started. Or download a{' '}
            <a
              href={`/api/sample?apiKey=${API_KEY}`}
              download
              className="text-indigo-600 hover:underline font-semibold"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
            >
              sample project ZIP
            </a>{' '}
            to try it out.
          </p>

          <form
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".zip"
              onChange={handleChange}
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-600">
                <FileCode className="w-10 h-10" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">
                  {file ? file.name : "Drag & drop your project ZIP"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse files"}
                </p>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleParse(); }}
            disabled={!file || loading}
            className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Upload and Analyze Project"}
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-1 text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Project Analyzed
          </h2>
          <p className="text-sm text-gray-500 mb-6">Configure the migration parameters below.</p>

          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex justify-between items-center">
              <span>Auto-detected Framework:</span>
              <strong className="capitalize font-semibold">{detectedFramework || "Vanilla JS"}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Framework (Override)</label>
              <select
                value={sourceFramework}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSourceFramework(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Framework</label>
              <select
                value={targetFramework}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetFramework(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="react">React (JSX)</option>
                <option value="typescript">TypeScript (TSX)</option>
                <option value="next">Next.js</option>
                <option value="vue">Vue 3</option>
                <option value="svelte">Svelte</option>
                <option value="nuxt">Nuxt.js</option>
              </select>
            </div>

            <div className="pt-2 text-xs text-gray-400">
              Found <strong>{parsedFiles.length}</strong> files ready to transform.
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('upload')}
              disabled={loading}
              className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all"
            >
              Back
            </button>
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Run Migration"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
