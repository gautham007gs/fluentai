import { Layout } from "@/components/Layout";
import { useConversations, useDeleteConversation } from "@/hooks/use-conversations";
import { Link } from "wouter";
import { MessageSquare, ArrowRight, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CreateChatDialog } from "@/components/CreateChatDialog";

export default function Dashboard() {
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your language learning journey</p>
            </div>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              size="lg" 
              className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary text-white hover:bg-primary/90"
            >
              Start New Conversation
            </Button>
          </header>

          {conversations && conversations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conversations.map((chat) => (
                <div 
                  key={chat.id}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm("Are you sure you want to delete this chat?")) {
                          deleteConversation.mutate(chat.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate pr-8">{chat.title}</h3>
                    <div className="flex items-center text-xs text-slate-400 gap-1">
                      <Calendar size={12} />
                      {chat.createdAt ? formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true }) : 'Just now'}
                    </div>
                  </div>

                  <Link href={`/chat/${chat.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                    >
                      Continue Learning
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">Start your first lesson to begin mastering a new language.</p>
              <Button onClick={() => setIsCreateOpen(true)} className="rounded-full">Create your first chat</Button>
            </div>
          )}
        </div>
      </div>
      <CreateChatDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </Layout>
  );
}
