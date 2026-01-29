import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-display font-bold text-slate-200">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Page not found</h2>
          <p className="text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
