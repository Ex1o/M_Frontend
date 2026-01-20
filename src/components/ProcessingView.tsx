import { motion } from "framer-motion";
import { Brain, AudioLines } from "lucide-react";

interface ProcessingViewProps {
  stage: "transcribing" | "analyzing";
  fileName?: string;
  progress: number;
}

export const ProcessingView = ({ stage, fileName, progress }: ProcessingViewProps) => {
  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-20 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Neural Animation Container */}
      <motion.div
        className="relative w-48 h-48 mx-auto mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle Ring */}
        <div className="absolute inset-4 rounded-full border border-accent/20" />
        <motion.div
          className="absolute inset-4 rounded-full border border-transparent border-b-accent"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Content */}
        <div className="absolute inset-8 rounded-full glass flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {stage === "transcribing" ? (
              <AudioLines className="w-12 h-12 text-primary" />
            ) : (
              <Brain className="w-12 h-12 text-accent" />
            )}
          </motion.div>
        </div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={{
              top: "50%",
              left: "50%",
            }}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 6) * 80],
              y: [0, Math.sin((i * Math.PI * 2) / 6) * 80],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      {/* Waveform Animation */}
      {stage === "transcribing" && (
        <div className="flex items-center justify-center gap-1 mb-8 h-12">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-primary"
              animate={{
                height: [8, 32, 8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-2">
          {stage === "transcribing" ? "Transcribing Audio" : "Analyzing Sentiment"}
        </h2>
        {fileName && (
          <p className="text-muted-foreground mb-4">{fileName}</p>
        )}
        <div className="flex items-center justify-center gap-2 text-primary">
          <span className="text-lg font-semibold">{Math.round(progress)}%</span>
          <span className="text-muted-foreground">complete</span>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="mt-8 max-w-md mx-auto">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
