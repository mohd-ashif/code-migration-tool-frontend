import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSizeMb = 100,
  label,
  helperText,
  error: customError,
  disabled = false,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        setFileError(`File "${file.name}" exceeds maximum size of ${maxSizeMb}MB.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles(validFiles);
    onFileSelect(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFileSelect(updated);
  };

  const displayError = customError || fileError;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && <label className="text-xs font-semibold text-zinc-300 select-none">{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={[
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-darkCard/50',
          isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-zinc-600',
          disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/30' : '',
          displayError ? 'border-danger/80 bg-danger/5' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-zinc-200">
            Click to upload <span className="font-normal text-zinc-400">or drag and drop</span>
          </span>
          <span className="text-xs text-zinc-500">
            {accept ? `Supported files: ${accept}` : 'SVG, PNG, JPG, GIF or Code File'} (Max {maxSizeMb}MB)
          </span>
        </div>
      </div>

      {/* Selected File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-darkCard border border-border rounded-lg text-xs text-zinc-300"
            >
              <div className="flex items-center gap-2.5 truncate">
                <File className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-zinc-500 shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {displayError ? (
        <span className="text-xs font-medium text-danger">{displayError}</span>
      ) : (
        helperText && <span className="text-xs text-zinc-400">{helperText}</span>
      )}
    </div>
  );
};

export default FileUpload;
