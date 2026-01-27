import { useState, useCallback, useRef } from "react";
import { NeuralBackground } from "@/components/NeuralBackground";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AudioUploader, AudioFile } from "@/components/AudioUploader";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView, AnalysisResult, TranscriptSegment } from "@/components/ResultsView";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

type View = "home" | "upload" | "processing" | "results" | "analytics";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000";

const buildTranscriptSegments = (outputPayload: any): TranscriptSegment[] => {
  if (Array.isArray(outputPayload)) {
    return outputPayload.map((segment: any, index: number) => ({
      id: `seg-${index}`,
      speaker: segment?.speaker,
      text: String(segment?.transcript ?? segment?.text ?? "").trim(),
      timestamp: Number(segment?.start_time ?? 0),
    }));
  }

  return [
    {
      id: "seg-0",
      text: "Transcription completed.",
      timestamp: 0,
    },
  ];
};

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const [processingStage, setProcessingStage] = useState<"transcribing" | "analyzing">("transcribing");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingFileName, setProcessingFileName] = useState("");
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleUploadClick = useCallback(() => {
    setView("upload");
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    setView("processing");
    setProcessingStage("transcribing");
    setProcessingProgress(0);

    const newResults: AnalysisResult[] = [];

    for (const targetFile of files) {
      setProcessingFileName(targetFile?.name || "");
      setProcessingProgress(5);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === targetFile.id ? { ...f, status: "processing", progress: 10 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", targetFile.file);

        const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
          method: "POST",
          body: formData,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || "Transcription failed.");
        }

        setProcessingStage("analyzing");
        setProcessingProgress(80);

      const transcriptSegments = buildTranscriptSegments(payload?.output);

        const result: AnalysisResult = {
          id: targetFile.id,
          fileName: targetFile.name,
          transcript: transcriptSegments,
          audioSentiment: {
            overall: "neutral",
            confidence: 0,
            breakdown: { positive: 0, neutral: 100, negative: 0 },
          },
          textSentiment: {
            overall: "neutral",
            confidence: 0,
            breakdown: { positive: 0, neutral: 100, negative: 0 },
          },
        rawJson: payload?.output ?? payload,
        };

        newResults.push(result);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === targetFile.id ? { ...f, status: "completed", progress: 100 } : f
          )
        );

        if (payload?.output) {
          const downloadName =
            payload?.download_filename ??
            `${targetFile.name.replace(/\.[^/.]+$/, "")}_transcript.json`;
          const blob = new Blob([JSON.stringify(payload.output, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = downloadName;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Transcription failed.";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === targetFile.id ? { ...f, status: "error", progress: 0 } : f
          )
        );
        toast({ title: "Upload failed", description: message });
      }
    }

    if (newResults.length > 0) {
      setResults(newResults);
      setSelectedResultId(newResults[0]?.id || "");
      setProcessingProgress(100);
      setView("results");
    } else {
      setView("upload");
    }
  }, [files]);

  // Analytics data derived from results
  const analyticsData = {
    totalProcessed: results.length,
    avgSentiment: results.length > 0 
      ? Math.round(results.reduce((acc, r) => acc + r.textSentiment.confidence, 0) / results.length)
      : 0,
    positiveCount: results.filter((r) => r.textSentiment.overall === "positive").length,
    negativeCount: results.filter((r) => r.textSentiment.overall === "negative").length,
    neutralCount: results.filter((r) => r.textSentiment.overall === "neutral").length,
    timeline: [
      { date: "Mon", sentiment: 72 },
      { date: "Tue", sentiment: 68 },
      { date: "Wed", sentiment: 81 },
      { date: "Thu", sentiment: 75 },
      { date: "Fri", sentiment: 85 },
      { date: "Sat", sentiment: 79 },
      { date: "Sun", sentiment: 88 },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <NeuralBackground />
      <Header
        currentView={view}
        onNavigate={setView}
        hasResults={results.length > 0}
      />
      
      <main className="pt-16 flex-1">
        {view === "home" && <HeroSection onUploadClick={handleUploadClick} />}
        
        {view === "upload" && (
          <div ref={uploadRef}>
            <AudioUploader
              files={files}
              onFilesChange={setFiles}
              onProcess={handleProcess}
            />
          </div>
        )}
        
        {view === "processing" && (
          <ProcessingView
            stage={processingStage}
            fileName={processingFileName}
            progress={processingProgress}
          />
        )}
        
        {view === "results" && results.length > 0 && (
          <ResultsView
            results={results}
            selectedId={selectedResultId}
            onSelect={setSelectedResultId}
          />
        )}
        
        {view === "analytics" && (
          <AnalyticsDashboard data={analyticsData} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;