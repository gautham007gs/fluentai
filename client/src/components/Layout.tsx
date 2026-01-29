import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Plus, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateChatDialog } from "@/components/CreateChatDialog";
import { useConversations } from "@/hooks/use-conversations";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: conversations } = useConversations();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-20">
        <Link href="/" className="text-xl font-bold font-display text-primary tracking-tight">
          FluentAI
        </Link>
        <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:relative z-40 w-72 h-full min-h-screen bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-slate-100 hidden md:block">
          <Link href="/" className="text-2xl font-bold font-display text-primary flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-lg">FL</span>
            FluentAI
          </Link>
        </div>

        <div className="p-4">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            size="lg"
          >
            <Plus size={18} /> New Chat
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium ${location === '/' ? 'bg-slate-100 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recent Conversations
          </div>

          {conversations?.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/chat/${chat.id}`}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${location === `/chat/${chat.id}` ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <MessageSquare size={18} className={location === `/chat/${chat.id}` ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="truncate">{chat.title}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            onClick={() => logout()}
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden relative">
        {children}
      </main>

      <CreateChatDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
