import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileAudio, Copy, Download, Check, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export interface TranscriptSegment {
  id: string;
  speaker?: string;
  text: string;
  timestamp: number;
}

export interface SentimentResult {
  overall: "positive" | "neutral" | "negative";
  confidence: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  transcript: TranscriptSegment[];
  audioSentiment: SentimentResult;
  textSentiment: SentimentResult;
  rawJson?: unknown;
}

interface ResultsViewProps {
  results: AnalysisResult[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const ResultsView = ({ results, selectedId, onSelect }: ResultsViewProps) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedResult = results.find((r) => r.id === selectedId);

  const copyTranscript = () => {
    if (!selectedResult) return;
    const text = selectedResult.transcript.map((s) => s.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranscript = () => {
    if (!selectedResult) return;

    const payload =
      selectedResult.rawJson ??
      selectedResult.transcript.map((s) => ({
        timestamp: s.timestamp,
        speaker: s.speaker,
        text: s.text,
      }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedResult.fileName.replace(/\.[^/.]+$/, "")}_transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredTranscript = selectedResult?.transcript.filter((segment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.speaker?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!selectedResult) return null;

  return (
    <motion.section
      className="max-w-6xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="grid md:grid-cols-[280px,1fr] gap-6">
        {/* File Sidebar */}
        <div className="glass rounded-2xl p-4 h-fit">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
            Processed Files
          </h3>
          <div className="space-y-2">
            {results.map((result) => (
              <motion.button
                key={result.id}
                onClick={() => onSelect(result.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  result.id === selectedId
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-muted"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-primary shrink-0" />
                  <span className="truncate text-sm font-medium">{result.fileName}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results Content */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-bold">{selectedResult.fileName}</h2>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" onClick={copyTranscript}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="glass" size="sm" onClick={downloadTranscript}>
                <Download className="w-4 h-4" />
                Download JSON
              </Button>
            </div>
          </div>

          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="transcript" className="rounded-lg">
                Transcript
              </TabsTrigger>
              <TabsTrigger value="audio-sentiment" className="rounded-lg">
                Audio Sentiment
              </TabsTrigger>
              <TabsTrigger value="text-sentiment" className="rounded-lg">
                Text Sentiment
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="transcript" className="mt-0">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transcript..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                  />
                </div>
                <motion.div
                  className="max-h-96 overflow-y-auto pr-4 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {filteredTranscript.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No matching segments found
                    </div>
                  ) : (
                    filteredTranscript.map((segment, i) => (
                      <motion.div
                        key={segment.id}
                        className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(segment.timestamp)}
                          </span>
                        </div>
                        <div className="flex-1">
                          {segment.speaker && (
                            <span className="text-sm font-medium text-primary mb-1 block">
                              {highlightText(segment.speaker, searchQuery)}
                            </span>
                          )}
                          <p className="text-foreground">{highlightText(segment.text, searchQuery)}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="audio-sentiment" className="mt-0">
                <SentimentPanel sentiment={selectedResult.audioSentiment} type="Audio" />
              </TabsContent>

              <TabsContent value="text-sentiment" className="mt-0">
                <SentimentPanel sentiment={selectedResult.textSentiment} type="Text" />
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </motion.section>
  );
};

const SentimentPanel = ({
  sentiment,
  type,
}: {
  sentiment: SentimentResult;
  type: string;
}) => {
  const getSentimentEmoji = (s: SentimentResult["overall"]) => {
    switch (s) {
      case "positive": return "😄";
      case "neutral": return "😐";
      case "negative": return "😡";
    }
  };

  const getSentimentBg = (s: SentimentResult["overall"]) => {
    switch (s) {
      case "positive": return "from-positive/20 to-positive/5";
      case "neutral": return "from-neutral/20 to-neutral/5";
      case "negative": return "from-negative/20 to-negative/5";
    }
  };

  const getSentimentText = (s: SentimentResult["overall"]) => {
    switch (s) {
      case "positive": return "text-positive";
      case "neutral": return "text-neutral";
      case "negative": return "text-negative";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Overall Sentiment Card */}
      <div className={`rounded-2xl bg-gradient-to-br ${getSentimentBg(sentiment.overall)} p-8 mb-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{type} Sentiment</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getSentimentEmoji(sentiment.overall)}</span>
              <span className={`text-3xl font-bold capitalize ${getSentimentText(sentiment.overall)}`}>
                {sentiment.overall}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Confidence</p>
            <p className="text-3xl font-bold">{sentiment.confidence}%</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {(["positive", "neutral", "negative"] as const).map((key) => {
          const colors = {
            positive: { bg: "bg-positive", text: "text-positive" },
            neutral: { bg: "bg-neutral", text: "text-neutral" },
            negative: { bg: "bg-negative", text: "text-negative" },
          };
          return (
            <motion.div
              key={key}
              className="glass rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className={`text-2xl font-bold ${colors[key].text} mb-1`}>
                {sentiment.breakdown[key]}%
              </div>
              <div className="text-sm text-muted-foreground capitalize">{key}</div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${colors[key].bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.breakdown[key]}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};