import { motion } from "framer-motion";
import { AudioLines, Upload, Home, Languages, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "home" | "upload" | "processing" | "review" | "editor" | "translate";

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  hasResults: boolean;
}

export const Header = ({ currentView, onNavigate, hasResults }: HeaderProps) => {
  const navItems = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "upload" as const, label: "Upload", icon: Upload },
    { id: "review" as const, label: "Review", icon: AudioLines, disabled: !hasResults },
    { id: "editor" as const, label: "Editor", icon: PenSquare, disabled: !hasResults },
    { id: "translate" as const, label: "Translator", icon: Languages },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate("home")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <AudioLines className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">
            Audio<span className="gradient-text">Insight</span>
          </span>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => !item.disabled && onNavigate(item.id)}
              disabled={item.disabled}
              className={`gap-2 ${item.disabled ? "opacity-50" : ""}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};
