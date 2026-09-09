"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
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

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node?.props?.children) {
    return extractText(node.props.children);
  }
  return "";
}

function AssistantMarkdown({ content }: { content: string }) {
  // Normalize unicode bullets to standard markdown list syntax
  const normalizedContent = React.useMemo(() => {
    if (!content) return "";
    return content.replace(/^[ \t]*[•●][ \t]+/gm, "- ");
  }, [content]);

  return (
    <div className="text-[12px] leading-relaxed text-slate-800 space-y-1.5 break-words">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h4 className="font-bold text-[13px] text-emerald-950 mt-2.5 mb-1.5 border-b border-emerald-100 pb-0.5 flex items-center gap-1.5">
              {children}
            </h4>
          ),
          h2: ({ children }) => (
            <h4 className="font-bold text-[12.5px] text-emerald-950 mt-2 mb-1 border-b border-emerald-100 pb-0.5 flex items-center gap-1.5">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="font-bold text-xs text-emerald-950 mt-2.5 mb-1 flex items-center gap-1 tracking-tight">
              {children}
            </h5>
          ),
          h4: ({ children }) => (
            <h6 className="font-semibold text-[11.5px] text-slate-900 mt-1.5 mb-0.5">
              {children}
            </h6>
          ),
          p: ({ children }) => {
            const text = extractText(children);
            if (text.includes("👉") || text.includes("💡") || text.includes("⚠️")) {
              return (
                <div className="my-2 p-2.5 rounded-xl bg-emerald-50/95 border border-emerald-200/90 text-emerald-950 font-medium text-[11.5px] leading-snug shadow-2xs">
                  {children}
                </div>
              );
            }
            return <p className="leading-relaxed text-slate-800 my-1 first:mt-0 last:mb-0">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="my-1.5 space-y-1.5 pl-4 list-disc marker:text-emerald-600 text-[11.5px]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 space-y-1.5 pl-4 list-decimal marker:text-emerald-700 marker:font-bold text-[11.5px]">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-slate-800 pl-0.5">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-950 bg-emerald-100/60 px-1 py-0.2 rounded border border-emerald-200/50">
              {children}
            </strong>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10.5px] font-mono border border-emerald-200/60 font-semibold">
              {children}
            </code>
          ),
          hr: () => <hr className="my-2.5 border-emerald-100" />,
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}

export function ScreenAssistantBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
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
      content: `### 🌟 MediKiosk Live Assistant
Welcome! You are exploring **${screenInfo.name}** (${screenInfo.category}).

### 💡 What I can help you with:
- **Feature Walkthrough**: Ask how any tool or module works on this screen.
- **Clinical Protocols**: Explain SOCRATES intake, Ayush Pariksha, or OCR vision extraction.
- **ABDM Milestones**: Explain ABHA verification, FHIR R4 bundles, and DPDP compliance.

👉 **Quick Start**: Tap any suggestion chip below or ask your question!`,
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
        name: screenInfo.name,
        category: screenInfo.category,
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
          <div
            className={cn(
              "w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-4.5rem)] bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 transition-all",
              isExpanded
                ? "sm:w-[540px] h-[640px]"
                : "sm:w-[420px] h-[520px]"
            )}
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between shadow-sm shrink-0">
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
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Collapse width" : "Expand width"}
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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
            <div className="px-3.5 py-1.5 bg-emerald-50/90 border-b border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between shrink-0">
              <span className="font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Screen Context Active
              </span>
              <span className="text-[10px] text-emerald-700 font-medium truncate max-w-[170px]">
                {pathname}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FBFDFD] text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col",
                    m.role === "user" ? "ml-auto items-end max-w-[85%]" : "mr-auto items-start max-w-[96%]"
                  )}
                >
                  {m.role === "user" ? (
                    <div className="p-2.5 px-3.5 rounded-2xl bg-emerald-700 text-white rounded-br-xs shadow-xs text-[11.5px] font-medium leading-relaxed">
                      {m.content}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 rounded-bl-xs shadow-2xs w-full">
                      <AssistantMarkdown content={m.content} />
                    </div>
                  )}
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs w-fit text-slate-500 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span className="text-xs">Analyzing screen & generating structured answer…</span>
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
