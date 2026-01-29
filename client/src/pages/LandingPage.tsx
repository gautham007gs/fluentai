import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Languages, MessageCircle, Sparkles, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/" />;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">FL</div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">FluentAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api/login">
              <Button size="sm" variant="ghost" className="font-medium text-slate-600 hover:text-primary hover:bg-primary/5">
                Sign In
              </Button>
            </Link>
            <Link href="/api/login">
              <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={16} className="text-amber-500 fill-amber-500" />
            <span>AI-Powered Language Tutor</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 mb-6 leading-tight max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Master any language by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">chatting naturally</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Don't just memorize vocabulary. Have real conversations with an AI that understands context, corrects your grammar, and translates your thoughts instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link href="/api/login">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-1">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageCircle className="w-8 h-8 text-blue-500" />}
              title="Natural Conversations"
              description="Chat about your interests, hobbies, or daily life. The AI adapts to your proficiency level."
            />
            <FeatureCard 
              icon={<Languages className="w-8 h-8 text-purple-500" />}
              title="Instant Translation"
              description="Stuck? Type in your native language and see how to say it in your target language instantly."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-green-500" />}
              title="Global Context"
              description="Learn cultural nuances and idioms that textbooks often miss."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© 2024 FluentAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 group">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
