"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DropZone({ files, onChange, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: File[]) => {
    const pdfs = incoming.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!pdfs.length) return;
    const existing = new Set(files.map((f) => `${f.name}:${f.size}`));
    const merged = [...files];
    for (const f of pdfs) {
      const key = `${f.name}:${f.size}`;
      if (!existing.has(key)) {
        merged.push(f);
        existing.add(key);
      }
    }
    onChange(merged);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    // Reset so picking the same file twice still triggers onChange.
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 py-14 px-8",
          disabled
            ? "cursor-not-allowed opacity-60 border-slate-200 bg-slate-50"
            : "cursor-pointer",
          !disabled && isDragging
            ? "border-teal-500 bg-teal-50"
            : !disabled && "border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        <motion.div
          animate={isDragging ? { scale: 1.08 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
            isDragging ? "bg-teal-100" : "bg-white border border-slate-200 shadow-sm",
          )}
        >
          <UploadCloud
            className={cn(
              "w-6 h-6 transition-colors",
              isDragging ? "text-teal-600" : "text-slate-400",
            )}
          />
        </motion.div>

        <p className="text-slate-700 font-semibold text-base mb-1">
          {isDragging ? "Drop your PDFs here" : "Drop PDFs here or click to browse"}
        </p>
        <p className="text-slate-400 text-sm">Accepts PDF files only · Multiple files supported</p>

        <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Admission notes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Progress notes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Lab results
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Medication records
          </span>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Queued Files ({files.length})
            </p>
            {files.map((file, idx) => (
              <motion.div
                key={`${file.name}-${file.size}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-card group"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) removeFile(idx);
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  disabled={disabled}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
