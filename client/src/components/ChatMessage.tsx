import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string; // This will likely need parsing if we strictly follow "target" vs "native" text
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  // Naive parsing logic based on Implementation Notes:
  // "User Message: 'Hola' (Target) - Large/Bold ... 'Hi' (Native) - Small/Gray"
  // The API response might return raw text. 
  // For the sake of this demo, we'll assume the backend returns text that might have a delimiter, 
  // OR we simply display the content directly. 
  // If the backend returns "Target Text\nNative Text", we can split it.
  
  const parts = content.split('\n');
  const mainText = parts[0];
  const subText = parts.length > 1 ? parts.slice(1).join('\n') : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[85%] md:max-w-[70%] lg:max-w-[60%] flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm",
          isUser 
            ? "bg-primary text-white" 
            : "bg-white border border-slate-100 text-slate-700"
        )}>
          {isUser ? "ME" : "AI"}
        </div>

        {/* Message Bubble Group */}
        <div className={cn("flex flex-col gap-1 w-full", isUser ? "items-end" : "items-start")}>
          {/* Main Bubble (Target Language) */}
          <div className={cn(
            "p-4 rounded-2xl shadow-sm border w-fit max-w-full",
            isUser 
              ? "bg-primary text-white border-primary rounded-tr-sm" 
              : "bg-white text-slate-900 border-slate-100 rounded-tl-sm"
          )}>
            <p className="text-base md:text-lg font-medium leading-relaxed break-words">
              {mainText}
            </p>
          </div>

          {/* Sub Bubble (Native Translation) - only if exists */}
          {subText && (
            <div className={cn(
              "px-4 py-2 rounded-xl text-sm border backdrop-blur-sm w-fit max-w-full",
              isUser
                ? "bg-primary/10 text-primary-foreground border-primary/10" 
                : "bg-slate-50 text-slate-500 border-slate-100"
            )}>
              <p className={cn("break-words", isUser ? "text-primary/80 font-medium" : "")}>
                {subText}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
