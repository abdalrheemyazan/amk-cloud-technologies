"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  Zap,
  Paperclip,
  Activity,
  Server,
  Lock,
  Cpu,
  RefreshCw,
  Search,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiningText } from "@/components/ui/shining-text";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  confidence?: number;
};

const quickActions = [
  { label: "יצירת קריאת שירות", icon: Sparkles },
  { label: "סיכום התראות פעילות", icon: Activity },
  { label: "ניתוח תקלות שרת", icon: Server },
  { label: "בדיקת סטטוס VPN", icon: Lock },
  { label: "אבחון תעבורת רשת", icon: RefreshCw },
];

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const textToSend = text || input;
    if (!textToSend.trim() || isTyping) return;

    // Append user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Reset textarea height instantly
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "בדקתי את התקלה במערכת. נראה שיש חוסר תקשורת מול שרת ה־VPN.\nממליץ לאתחל את שירות האבטחה בחוות השרתים הראשית (IL-CENTER-1). האם תרצה שאבצע זאת עבורך?",
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.96,
        sources: ["VPN Access Logs", "Infrastructure Health Report"]
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-32px)] flex flex-col bg-[#FAFCFF] text-slate-900 rounded-3xl overflow-hidden shadow-[inset_0_0_100px_rgba(255,255,255,1)] text-right selection:bg-blue-600/10" dir="rtl">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] right-[15%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Floating Status Module (Top Left) */}
      <div className="absolute top-6 left-6 hidden xl:flex flex-col gap-2 bg-white/70 backdrop-blur-md border border-slate-200/60 p-3 rounded-2xl shadow-sm z-20">
        <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-2">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Neural Core Active</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-[10px]">
          <span className="text-slate-400 font-bold">Knowledge Coverage</span>
          <span className="font-black text-slate-800">98.2%</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-[10px]">
          <span className="text-slate-400 font-bold">Response Latency</span>
          <span className="font-black text-emerald-600">24ms</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-[10px]">
          <span className="text-slate-400 font-bold">Status</span>
          <span className="font-black text-blue-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            ONLINE
          </span>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative z-10 pt-10 pb-8 h-full">
        
        {/* Empty State / Welcome Screen */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 animate-in slide-in-from-bottom-4 duration-700 ease-out mb-10">
            <div className="relative mb-6">
              {/* Animated Glow Orb */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse duration-3000" />
              <div className="w-20 h-20 relative bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-3xl rotate-3 shadow-lg shadow-blue-500/20 flex items-center justify-center transform transition-transform hover:scale-105 hover:rotate-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              AMK Operations Intelligence
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 text-center">
              איך אוכל לעזור לך היום?
            </h1>
            
            <p className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-1.5 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              מחובר למאגר הידע המאובטח של AMK Cloud
            </p>
          </div>
        )}

        {/* Conversation Area */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 space-y-8 custom-scrollbar scroll-smooth">
            {messages.map((msg, idx) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex gap-4 w-full animate-in slide-in-from-bottom-2 duration-300 opacity-0 fill-mode-forwards",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1",
                  msg.role === "user" 
                    ? "bg-slate-100 border border-slate-200/60 text-slate-600" 
                    : "bg-gradient-to-tr from-blue-600 to-indigo-650 text-white shadow-blue-500/20"
                )}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  "max-w-[85%] flex flex-col space-y-2",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 text-[14px] font-medium leading-relaxed rounded-2xl break-words",
                    msg.role === "user" 
                      ? "bg-slate-100/80 border border-slate-200/50 text-slate-800 rounded-tr-sm" 
                      : "bg-white border border-slate-200/60 text-slate-800 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                  )}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">{line}</p>
                    ))}
                    
                    {/* Sources if Assistant */}
                    {msg.role === "assistant" && msg.sources && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 pl-1">
                          <Search className="w-3 h-3" /> מקורות:
                        </span>
                        {msg.sources.map((src, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-600">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Meta Data */}
                  <div className="flex items-center gap-3 px-1 text-[10px] text-slate-400 font-semibold">
                    <span>{msg.timestamp}</span>
                    {msg.confidence && (
                      <span className="flex items-center gap-1 text-blue-500 bg-blue-50/50 px-1.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> 
                        {(msg.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator using ShiningText component */}
            {isTyping && (
              <div className="flex gap-4 w-full animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/20 mt-1">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200/60 px-5 py-3 rounded-2xl rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-3 h-[52px]">
                  <div className="flex gap-1.5 pt-1 pr-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                  <ShiningText text="AMK AI is thinking..." />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}

        {/* Input & Quick Actions Dock */}
        <div className="px-4 sm:px-8 mt-auto shrink-0 space-y-4">
          
          {/* Quick Actions (Show if empty to encourage interaction) */}
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-1 animate-in fade-in duration-500 delay-300">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 hover:bg-white border border-slate-200/60 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm rounded-xl text-[11px] font-bold text-slate-600 transition-all active:scale-95"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Floating ChatGPT/Claude Style Input Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-colors duration-500 -z-10 rounded-3xl" />
            
            <div 
              className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[1.5rem] p-2 flex items-end shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgba(37,99,235,0.08)] focus-within:border-blue-300/50 transition-all duration-300"
            >
              <button 
                type="button" 
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 flex items-center justify-center transition-colors shrink-0 mb-0.5"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="הזן פקודה, שאל שאלה טכנית או בקש סיכום אירועים..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 px-3 py-2.5 outline-none resize-none overflow-y-auto max-h-[120px] min-h-[44px]"
                rows={1}
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shrink-0 shadow-md shadow-blue-600/20 active:scale-95 ml-1 mb-0.5"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
          
          <div className="text-center pb-2">
            <span className="text-[10px] font-semibold text-slate-400">
              התשובות מופקות על ידי מודל שפה ויש לאמת מידע קריטי מול נהלי החברה או טכנאי תורן.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
