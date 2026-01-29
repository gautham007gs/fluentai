import { Layout } from "@/components/Layout";
import { useConversation, useSendMessage } from "@/hooks/use-conversations";
import { useRoute } from "wouter";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";

export default function ChatPage() {
  const [, params] = useRoute("/chat/:id");
  const id = Number(params?.id);
  
  const { data, isLoading, error } = useConversation(id);
  const sendMessage = useSendMessage();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages, sendMessage.isPending]);

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    
    sendMessage.mutate(
      { id, content: input },
      {
        onSuccess: () => {
          setInput("");
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-slate-400 text-sm">Loading conversation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl font-bold text-slate-900">Conversation not found</h2>
          <Link href="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { conversation, messages } = data;

  return (
    <Layout>
      <div className="flex flex-col h-full bg-white md:rounded-tl-3xl shadow-2xl relative overflow-hidden">
        {/* Chat Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-md z-10">
          <Link href="/">
            <Button variant="ghost" size="icon" className="md:hidden text-slate-500">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">{conversation.title}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Active Session
            </p>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Send className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-medium">Say hello to start learning!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                role={msg.role as "user" | "assistant"} 
                content={msg.content} 
              />
            ))
          )}
          
          {/* Loading Indicator */}
          {sendMessage.isPending && (
            <div className="flex items-center gap-3 text-slate-400 text-sm p-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              <span>AI is translating and thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <div className="relative max-w-4xl mx-auto flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type in your native language..."
              className="min-h-[56px] max-h-32 resize-none rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base p-4 pr-14 shadow-inner"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              size="icon"
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 flex-shrink-0 mb-[2px]"
            >
              {sendMessage.isPending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            Press Enter to send. Shift + Enter for new line.
          </p>
        </div>
      </div>
    </Layout>
  );
}
