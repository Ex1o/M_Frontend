import { useState, useCallback, useRef, useEffect } from "react";
import { NeuralBackground } from "@/components/NeuralBackground";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AudioUploader, AudioFile } from "@/components/AudioUploader";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView, AnalysisResult } from "@/components/ResultsView";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Footer } from "@/components/Footer";

type View = "home" | "upload" | "processing" | "results" | "analytics";

// Mock data for demo
const generateMockResults = (files: AudioFile[]): AnalysisResult[] => {
  return files.map((file) => ({
    id: file.id,
    fileName: file.name,
    transcript: [
      {
        id: "1",
        speaker: "Speaker 1",
        text: "Welcome to our quarterly review meeting. Today we'll be discussing the progress made on our key initiatives and the feedback we've received from our customers.",
        timestamp: 0,
      },
      {
        id: "2",
        speaker: "Speaker 2",
        text: "Thank you for the introduction. I'm excited to share that our customer satisfaction scores have increased by 15% this quarter. The team has done an exceptional job addressing concerns.",
        timestamp: 12,
      },
      {
        id: "3",
        speaker: "Speaker 1",
        text: "That's wonderful news! Can you elaborate on the specific improvements that contributed to this increase?",
        timestamp: 28,
      },
      {
        id: "4",
        speaker: "Speaker 2",
        text: "Certainly. We implemented a new response time policy and enhanced our support documentation. Additionally, the AI-powered chatbot has been handling routine inquiries effectively.",
        timestamp: 35,
      },
      {
        id: "5",
        speaker: "Speaker 1",
        text: "Excellent progress. Let's continue with this momentum and aim for even better results next quarter.",
        timestamp: 52,
      },
    ],
    audioSentiment: {
      overall: Math.random() > 0.3 ? "positive" : Math.random() > 0.5 ? "neutral" : "negative",
      confidence: Math.floor(75 + Math.random() * 20),
      breakdown: {
        positive: Math.floor(40 + Math.random() * 30),
        neutral: Math.floor(20 + Math.random() * 20),
        negative: Math.floor(5 + Math.random() * 15),
      },
    },
    textSentiment: {
      overall: Math.random() > 0.4 ? "positive" : Math.random() > 0.5 ? "neutral" : "negative",
      confidence: Math.floor(80 + Math.random() * 15),
      breakdown: {
        positive: Math.floor(45 + Math.random() * 25),
        neutral: Math.floor(25 + Math.random() * 15),
        negative: Math.floor(5 + Math.random() * 10),
      },
    },
  }));
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

  const handleProcess = useCallback(() => {
    if (files.length === 0) return;
    
    setView("processing");
    setProcessingStage("transcribing");
    setProcessingProgress(0);
    setProcessingFileName(files[0]?.name || "");

    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setProcessingProgress(Math.min(progress, 100));

      if (progress === 50) {
        setProcessingStage("analyzing");
      }

      if (progress >= 100) {
        clearInterval(interval);
        // Update file statuses
        const updatedFiles = files.map((f) => ({
          ...f,
          status: "completed" as const,
          progress: 100,
        }));
        setFiles(updatedFiles);
        
        // Generate results
        const mockResults = generateMockResults(updatedFiles);
        setResults(mockResults);
        setSelectedResultId(mockResults[0]?.id || "");
        setView("results");
      }
    }, 50);
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