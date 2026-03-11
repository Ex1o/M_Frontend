import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, AudioLines, Brain, Globe } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface HeroSectionProps {
  onUploadClick?: () => void;
  onUploadAndTranslateClick?: (languageCode: string) => void;
} 

export const HeroSection = ({ onUploadClick, onUploadAndTranslateClick }: HeroSectionProps) => {
  const [lang, setLang] = useState("en");
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-20">
      {/* Floating Icons */}
      <motion.div
        className="absolute top-20 left-[15%] text-primary/30"
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <AudioLines size={48} />
      </motion.div>
      <motion.div
        className="absolute top-32 right-[20%] text-accent/30"
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Brain size={56} />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-[25%] text-primary/20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Sparkles size={40} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="text-center max-w-4xl mx-auto z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Transform Audio into{" "}
          <span className="gradient-text">Actionable Insights</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Upload audio. Get transcripts. Understand sentiment instantly.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="hero"
              size="xl"
              onClick={onUploadClick}
              className="group"
            >
              <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
              Transcript
            </Button>

            <div className="flex items-center gap-3">
              <Select defaultValue="en" onValueChange={(v) => setLang(v)}>
                <SelectTrigger className="w-40 h-10">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="hero"
                size="xl"
                onClick={() => onUploadAndTranslateClick?.(lang)}
                className="group"
              >
                <Globe className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                Transcript + Translation
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[
            
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
