'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-zinc-500 bg-zinc-800' 
          : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-zinc-300 text-sm">Drop the {label} here</p>
      ) : (
        <p className="text-zinc-400 text-sm">
          Drag & drop {label} or <span className="text-white underline">browse</span>
        </p>
      )}
      {selectedFile && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-zinc-500 text-xs mb-1">Selected file:</p>
          <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
        </div>
      )}
    </div>
  );
}
