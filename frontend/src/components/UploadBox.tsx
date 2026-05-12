'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, CheckCircle2 } from 'lucide-react';

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  label: string;
  selectedFile: File | null;
}

export default function UploadBox({ onFileSelect, label, selectedFile }: UploadBoxProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  return (
    <div 
      {...getRootProps()} 
      className={`border text-sm flex items-center justify-between p-3 transition-colors cursor-pointer ${
        isDragActive 
          ? 'border-indigo-500 bg-indigo-50/50' 
          : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      <input {...getInputProps()} />
      
      {!selectedFile ? (
        <div className="flex items-center gap-3 w-full">
          <UploadCloud className={`w-4 h-4 shrink-0 ${isDragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className={isDragActive ? 'text-indigo-700 font-medium' : 'text-slate-600'}>
            {isDragActive ? `Drop ${label}...` : `Select or drop ${label}`}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</span>
              <span className="font-mono text-slate-800 truncate leading-none">{selectedFile.name}</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 hover:text-slate-600 shrink-0">Change</span>
        </div>
      )}
    </div>
  );
}
