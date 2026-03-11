import { useState, useCallback, useRef, useEffect } from "react";
import { NeuralBackground } from "@/components/NeuralBackground";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AudioUploader, AudioFile } from "@/components/AudioUploader";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView, AnalysisResult, TranscriptSegment } from "@/components/ResultsView";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Languages, FileText } from "lucide-react";

type View = "home" | "upload" | "processing" | "review" | "editor" | "translate";

// Empty string = use Vite dev proxy (/api/* → http://127.0.0.1:5000)
// Set VITE_API_BASE_URL in .env only if deploying to a different host
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const buildTranscriptSegments = (segments: any[]): TranscriptSegment[] => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return [{ id: "seg-0", text: "Transcription completed.", timestamp: 0 }];
  }
  return segments.map((seg: any, index: number) => ({
    id: `seg-${index}`,
    // speaker can be an object { id, name } or a plain string
    speaker: seg?.speaker?.name ?? seg?.speaker ?? undefined,
    text: String(seg?.text ?? seg?.transcript ?? "").trim(),
    timestamp: Number(seg?.start_time ?? 0),
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

  const [translatorFile, setTranslatorFile] = useState<File | null>(null);
  const [translatorLanguage, setTranslatorLanguage] = useState<string>("hi");
  const [translatorLoading, setTranslatorLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [translatedMeta, setTranslatedMeta] = useState<{ download?: string; original?: string } | null>(null);
  const [translateAfterTranscription, setTranslateAfterTranscription] = useState(false);

  // Use ref to track translation settings - refs are always current and don't cause stale closure issues
  const translateSettingsRef = useRef({ shouldTranslate: false, targetLanguage: "en" });

  // Navigation helper: use this to change view and push history entries so the browser back button works
  const navigateTo = useCallback((v: View, replace = false) => {
    setView(v);
    const url = `#${v}`;
    try {
      if (replace) {
        window.history.replaceState({ view: v }, "", url);
      } else {
        window.history.pushState({ view: v }, "", url);
      }
    } catch (e) {
      // ignore when not in browser environment
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    // Reset translation settings when using regular upload
    translateSettingsRef.current = { shouldTranslate: false, targetLanguage: "en" };
    setTranslateAfterTranscription(false);
    navigateTo("upload");
  }, [navigateTo]);

  const handleUploadAndTranslateClick = useCallback((languageCode: string) => {
    // Set the translator target and mark that we should auto-translate after transcription
    // Use both state AND ref to ensure the value is available in handleProcess
    translateSettingsRef.current = { shouldTranslate: true, targetLanguage: languageCode };
    setTranslatorLanguage(languageCode);
    setTranslateAfterTranscription(true);
    console.log("[handleUploadAndTranslateClick] Set translation:", { shouldTranslate: true, targetLanguage: languageCode });
    navigateTo("upload");
  }, [navigateTo]);

  const handleTranslatorFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setTranslatorFile(file ?? null);
    setTranslatedText("");
    setTranslatedMeta(null);
  };

  const handleTranslate = async () => {
    if (!translatorFile) {
      toast({ title: "Upload transcript", description: "Please select a TXT or JSON transcript first." });
      return;
    }

    const formData = new FormData();
    formData.append("file", translatorFile);
    formData.append("target_language", translatorLanguage);

    try {
      setTranslatorLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Translation failed.");
      }

      setTranslatedText(payload?.translated_text ?? "");
      setTranslatedMeta({
        download: payload?.download_filename,
        original: payload?.original_filename,
      });
      toast({ title: "Translation complete" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Translation failed.";
      toast({ title: "Translator", description: message });
    } finally {
      setTranslatorLoading(false);
    }
  };

  const triggerTranslatedDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = translatedMeta?.download || "translated_transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync with browser history / hash so back button works across views
  useEffect(() => {
    const allowed: View[] = ["home", "upload", "processing", "review", "editor", "translate"];

    // Initialize from hash if present
    const initialHash = (window.location.hash || "").replace("#", "") as View;
    if (initialHash && allowed.includes(initialHash)) {
      navigateTo(initialHash, true);
    } else {
      // ensure there's a replaceState for the current view
      try {
        window.history.replaceState({ view }, "", `#${view}`);
      } catch (e) {
        /* ignore */
      }
    }

    const onPop = () => {
      const h = (window.location.hash || "").replace("#", "") as View;
      if (h && allowed.includes(h)) {
        setView(h);
      } else {
        setView("home");
        try {
          window.history.replaceState({ view: "home" }, "", "#home");
        } catch (e) {
          /* ignore */
        }
      }
    };

    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, [navigateTo, view]);
  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    // Get translation settings from ref (always current, no stale closure issues)
    const { shouldTranslate, targetLanguage } = translateSettingsRef.current;

    // Debug: Log translation settings at the start of processing
    console.log("=== PROCESS START ===");
    console.log("shouldTranslate (from ref):", shouldTranslate);
    console.log("targetLanguage (from ref):", targetLanguage);
    console.log("translateAfterTranscription (state):", translateAfterTranscription);
    console.log("translatorLanguage (state):", translatorLanguage);

    navigateTo("processing");
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

        const contentType = response.headers.get("content-type") ?? "";
        let payload: any = null;
        let transcriptText = "";
        let segments: any[] = [];
        let languageCode = "en";

        if (contentType.includes("application/json")) {
          payload = await response.json().catch(() => null);
          if (payload?.data) {
            // ✅ New backend format: { success: true, data: { text, segments, flat_segments, language_code } }
            const data = payload.data;
            transcriptText = data.text || "";
            segments = data.segments || [];
            languageCode = data.language_code || "en";
            // flat_segments is stored separately for JSON download
          } else if (payload?.text) {
            transcriptText = payload.text;
            segments = payload.segments || [];
            languageCode = payload.language_code || "en";
          } else if (typeof payload === "string") {
            transcriptText = payload;
          }
        } else {
          transcriptText = await response.text();
        }

        if (!response.ok) {
          throw new Error(payload?.error || transcriptText || "Transcription failed.");
        }

        // If no full text but segments exist, reconstruct it
        if (!transcriptText && segments.length > 0) {
          transcriptText = segments.map((s: any) => s?.text || "").join(" ").trim();
        }

        setProcessingStage("analyzing");
        setProcessingProgress(80);

        const transcriptSegments = buildTranscriptSegments(segments);

        // flat_segments = the download format: { index, speaker_id, start_time, end_time, text }
        const flatSegments = payload?.data?.flat_segments ?? segments.map((seg: any, i: number) => ({
          index: i,
          speaker_id: seg?.speaker?.id ?? "unknown",
          start_time: seg?.start_time ?? 0,
          end_time: seg?.end_time ?? 0,
          text: (seg?.text ?? "").trim(),
        }));

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
          rawJson: flatSegments,
          rawText: transcriptText,
          segments: flatSegments,   // used by downloadJSON in ResultsView
          languageCode: languageCode,
        };

        // If user requested translation along with transcription, call the translate API
        // Use ref values which are always current (no stale closure issues)
        console.log("[Translation] shouldTranslate (ref):", shouldTranslate);
        console.log("[Translation] targetLanguage (ref):", targetLanguage);
        console.log("[Translation] transcriptText length:", transcriptText?.length);

        if (shouldTranslate && transcriptText) {
          try {
            const tf = new FormData();
            // Use the extracted transcriptText which is now properly populated
            const textToTranslate = transcriptText.trim();
            console.log("[Translation] Text to translate:", textToTranslate.substring(0, 200));

            if (!textToTranslate) {
              toast({ title: "Translation skipped", description: "No transcript text to translate." });
            } else {
              const transcriptBlob = new Blob([textToTranslate], { type: "text/plain;charset=utf-8" });
              const filename = `${targetFile.name.replace(/\.[^/.]+$/, "")}_transcript.txt`;
              tf.append("file", transcriptBlob, filename);
              tf.append("target_language", targetLanguage);

              console.log("[Translation] Calling /api/translate with language:", targetLanguage);

              const trResp = await fetch(`${API_BASE_URL}/api/translate`, { method: "POST", body: tf });
              const trPayload = await trResp.json().catch(() => null);
              console.log("[Translation] Response status:", trResp.status);
              console.log("[Translation] Response payload:", JSON.stringify(trPayload, null, 2));
              console.log("[Translation] translated_text:", trPayload?.translated_text);
              console.log("[Translation] translated_text length:", trPayload?.translated_text?.length);

              if (trResp.ok) {
                const translatedText = trPayload?.translated_text || "";
                console.log("[Translation] Setting translatedText on result:", translatedText.substring(0, 100));
                (result as any).translatedText = translatedText;
                (result as any).translatedLanguage = trPayload?.target_language || targetLanguage;
                (result as any).translatedMeta = { download: trPayload?.download_filename, original: trPayload?.original_filename };
                toast({ title: "Translation complete", description: `${targetFile.name} → ${trPayload?.target_language || targetLanguage}` });
              } else {
                toast({ title: "Translation failed", description: trPayload?.error || "Translation failed." });
              }
            }
          } catch (err) {
            console.error("[Translation] Error:", err);
            toast({ title: "Translation failed", description: err instanceof Error ? err.message : String(err) });
          }
        }

        // Reset translation settings after processing
        translateSettingsRef.current = { shouldTranslate: false, targetLanguage: "en" };

        newResults.push(result);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === targetFile.id ? { ...f, status: "completed", progress: 100 } : f
          )
        );
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
      navigateTo("review");
      // reset auto-translate flag after processing
      setTranslateAfterTranscription(false);
    } else {
      navigateTo("upload");
    }
  }, [files, translatorLanguage, translateAfterTranscription]);

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
        onNavigate={navigateTo}
        hasResults={results.length > 0}
      />

      <main className="pt-16 flex-1">
        {view === "home" && <HeroSection onUploadClick={handleUploadClick} onUploadAndTranslateClick={handleUploadAndTranslateClick} />}

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

        {view === "review" && results.length > 0 && (
          <ResultsView
            results={results}
            selectedId={selectedResultId}
            onSelect={setSelectedResultId}
          />
        )}

        {view === "editor" && (
          <AnalyticsDashboard data={analyticsData} />
        )}

        {view === "translate" && (
          <section className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" /> Transcript Translator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Upload transcript (TXT or JSON)</Label>
                    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-muted-foreground/40 p-6 text-center">
                      <UploadCloud className="w-10 h-10 mx-auto text-primary" />
                      <div>
                        <p className="font-semibold">Drag & drop or click to upload</p>
                        <p className="text-sm text-muted-foreground">
                          Supports plain text and ElevenLabs JSON transcripts
                        </p>
                      </div>
                      <Input type="file" accept=".txt,.json" onChange={handleTranslatorFileChange} className="cursor-pointer" />
                      {translatorFile && (
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4" /> {translatorFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Target language</Label>
                    <Select value={translatorLanguage} onValueChange={setTranslatorLanguage}>
                      <SelectTrigger className="bg-muted/40">
                        <SelectValue placeholder="Choose language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleTranslate} disabled={translatorLoading} className="w-full">
                      {translatorLoading ? "Translating..." : "Translate Transcript"}
                    </Button>
                  </div>
                </div>

                {translatedText && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Translated Text</h3>
                      <Button variant="secondary" size="sm" onClick={triggerTranslatedDownload}>
                        Download TXT
                      </Button>
                    </div>
                    <textarea
                      value={translatedText}
                      readOnly
                      className="w-full min-h-[240px] rounded-xl bg-muted/30 border border-border/40 p-4 text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;