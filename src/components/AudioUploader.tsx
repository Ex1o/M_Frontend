import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, X, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
}

interface AudioUploaderProps {
  files: AudioFile[];
  onFilesChange: (files: AudioFile[]) => void;
  onProcess: () => void;
}

export const AudioUploader = ({ files, onFilesChange, onProcess }: AudioUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type.startsWith("audio/") ||
          file.name.endsWith(".mp3") ||
          file.name.endsWith(".wav") ||
          file.name.endsWith(".m4a")
      );
      addFiles(droppedFiles);
    },
    [files]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
      }
    },
    [files]
  );

  const addFiles = (newFiles: File[]) => {
    const audioFiles: AudioFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
    }));
    onFilesChange([...files, ...audioFiles]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: AudioFile["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-positive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AudioFile["status"]) => {
    const styles = {
      pending: "bg-muted text-muted-foreground",
      processing: "bg-primary/20 text-primary",
      completed: "bg-positive/20 text-positive",
      error: "bg-negative/20 text-negative",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <motion.section
      className="max-w-4xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Drop Zone */}
      <motion.div
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-card/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragging ? "Drop files here" : "Drag & drop audio files"}
          </h3>
          <p className="text-muted-foreground mb-4">
            or click to browse • MP3, WAV, M4A supported
          </p>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="mt-8 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </h3>
              <Button variant="hero" onClick={onProcess}>
                Process All Files
              </Button>
            </div>

            {files.map((file, index) => (
              <motion.div
                key={file.id}
                className="glass rounded-xl p-4 flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileAudio className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{file.name}</span>
                    {getStatusBadge(file.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatSize(file.size)}</span>
                    {file.duration && <span>{Math.round(file.duration)}s</span>}
                  </div>
                  {file.status === "processing" && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(file.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
