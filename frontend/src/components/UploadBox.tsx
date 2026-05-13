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
      className={`flex min-h-[92px] cursor-pointer items-center justify-between rounded-2xl border p-4 text-sm transition-colors ${
        isDragActive 
          ? 'border-black bg-white' 
          : 'border-[#e2e2e2] bg-[#efefef] hover:bg-[#e2e2e2]'
      }`}
    >
      <input {...getInputProps()} />
      
      {!selectedFile ? (
        <div className="flex items-center gap-3 w-full">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black">
            <UploadCloud className="h-4 w-4" />
          </span>
          <span className={isDragActive ? 'font-medium text-black' : 'text-[#5e5e5e]'}>
            {isDragActive ? `Drop ${label}...` : `Select or drop ${label}`}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black">
              <FileIcon className="h-4 w-4" />
              <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 fill-white text-black" />
            </span>
            <div className="flex flex-col overflow-hidden">
              <span className="mb-1 text-xs font-medium leading-none text-[#5e5e5e]">{label}</span>
              <span className="truncate text-sm font-medium leading-5 text-black">{selectedFile.name}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">Change</span>
        </div>
      )}
    </div>
  );
}
