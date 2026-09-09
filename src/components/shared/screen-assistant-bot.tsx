"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Minimize2,
  RefreshCw,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Compass,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export function ScreenAssistantBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Screen human-readable name & context
  const getScreenDetails = (path: string) => {
    if (path.startsWith("/kiosk")) {
      return {
        name: "Patient Kiosk Terminal",
        category: "Intake",
        summary: "Patient self-service terminal for ABHA ID, SOCRATES voice intake, Dashavidha Pariksha, and Prescription OCR.",
        quickPrompts: [
          "How do I scan my prescription?",
          "What is an ABHA ID?",
          "Can I give intake in Hindi?",
          "What are Red-Flag alerts?"
        ]
      };
    }
    if (path.startsWith("/doctor")) {
      return {
        name: "Doctor OPD Portal",
        category: "Clinical Desk",
        summary: "Physician workspace with automated SOAP summaries, AIIA 8-Part Ayush histories, and Drug-Herb interaction alerts.",
        quickPrompts: [
          "How does the SOAP summary work?",
          "How are Drug-Herb interactions detected?",
          "How to export FHIR R4 records?",
          "What is Prakriti vs Vikriti score?"
        ]
      };
    }
    if (path.startsWith("/desk")) {
      return {
        name: "Hospital Desk & Queue",
        category: "Reception",
        summary: "Live OPD patient queue, room token distribution, and audio announcements.",
        quickPrompts: [
          "How do I call the next patient token?",
          "How to assign a patient to a doctor room?",
          "How does live priority triage work?"
        ]
      };
    }
    if (path.startsWith("/patient")) {
      return {
        name: "Patient Health Pass",
        category: "Records",
        summary: "Patient digital portal with ABHA health records, digital OPD passes, and prescription history.",
        quickPrompts: [
          "Where can I download my prescription PDF?",
          "How do I link my ABHA health record?",
          "Can I start voice intake from here?"
        ]
      };
    }
    if (path.startsWith("/admin")) {
      return {
        name: "Ministry Analytics Portal",
        category: "Analytics",
        summary: "National dashboard for OPD wait-time reduction, hospital throughput, and AYUSH vs Allopathy metrics.",
        quickPrompts: [
          "What metrics are tracked here?",
          "How much time is saved per patient?",
          "How is ABHA data secured?"
        ]
      };
    }
    if (path.startsWith("/login")) {
      return {
        name: "Portal Authentication",
        category: "Sign In",
        summary: "Secure access with OTP and ABHA verification for patients, doctors, and desk staff.",
        quickPrompts: [
          "How do I log in with ABHA?",
          "How does OTP verification work?",
          "What if I don't have an ABHA ID?"
        ]
      };
    }
    return {
      name: "MediKiosk Home & Overview",
      category: "Home",
      summary: "Landing page presenting the All India Institute of Ayurveda and Ministry of Ayush clinical intake platform.",
      quickPrompts: [
        "What is MediKiosk and how does it help?",
        "How can I download this as a Web App (PWA)?",
        "How does the dual Allopathy & Ayush intake work?",
        "What are the ABDM milestones fulfilled?"
      ]
    };
  };

  const screenInfo = getScreenDetails(pathname || "/");

  // Initialize or update welcome greeting when screen changes
  React.useEffect(() => {
    const greeting: ChatMessage = {
      id: "welcome-" + pathname,
      role: "assistant",
      content: `Namaste! I am your **MediKiosk AI Assistant**.\n\nI can see you are currently on the **${screenInfo.name}**. I can answer any question about this screen, guide your next steps, or explain how any part of our platform works. What would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([greeting]);
  }, [pathname]);

  // Scroll to bottom on message update
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Gather current visible DOM headings to provide context
  const getVisibleHeadings = () => {
    if (typeof document === "undefined") return [];
    const elements = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
    return elements
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => Boolean(text && text.length < 80))
      .slice(0, 6);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const screenContext = {
        pathname,
        title: typeof document !== "undefined" ? document.title : screenInfo.name,
        summary: screenInfo.summary,
        visibleHeadings: getVisibleHeadings()
      };

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          screenContext
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply || "I am here to help you navigate MediKiosk. Please feel free to ask any question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "Sorry, I had trouble connecting. You can ask about our features, pages, or guidelines anytime!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bottom-Left Container */}
      <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-50 font-sans select-none print:hidden">
        {/* Closed Floating Trigger Button */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open MediKiosk AI Assistant"
            className="group relative flex items-center gap-1.5 sm:gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-950/25 hover:shadow-xl transition-all duration-200 active:scale-95 border border-emerald-500/40"
          >
            <div className="relative">
              <Bot className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300" />
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-tight pr-0.5">Ask MediKiosk AI</span>
          </button>
        )}

        {/* Expanded Chat Window */}
        {isOpen && (
          <div className="w-[calc(100vw-1.5rem)] sm:w-[390px] h-[500px] max-h-[calc(100dvh-5rem)] bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold tracking-tight">MediKiosk Assistant</h3>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-600/80 text-emerald-100 border border-emerald-500/50">
                      Live AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-100/90 font-medium">
                    <Compass className="w-3 h-3 text-emerald-200 shrink-0" />
                    <span className="truncate max-w-[210px]">{screenInfo.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Screen Awareness Banner */}
            <div className="px-3.5 py-1.5 bg-emerald-50/90 border-b border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Screen Context Active
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {pathname}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FBFDFD] text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col max-w-[88%]",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-emerald-700 text-white rounded-br-xs shadow-xs"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs"
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs w-fit text-slate-500 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span className="text-xs">Analyzing screen & generating answer…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips for Current Screen */}
            <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {screenInfo.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-emerald-200 hover:border-emerald-400 text-emerald-950 text-[10px] font-semibold hover:bg-emerald-50 transition-colors shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask about ${screenInfo.name}…`}
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send question"
                className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition-colors shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
