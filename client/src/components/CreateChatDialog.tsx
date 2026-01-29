import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateConversation } from "@/hooks/use-conversations";
import { useLocation } from "wouter";
import { z } from "zod";
import { Loader2 } from "lucide-react";

// Assuming title is just a name for now, but conceptually we'd want languages.
// Since the schema is simple (title), we'll simulate the "Language A -> Language B" experience
// by generating a title from the selected languages.

const formSchema = z.object({
  nativeLanguage: z.string().min(1, "Native language is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateChatDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [, setLocation] = useLocation();
  const createConversation = useCreateConversation();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    // We'll create a title like "Spanish Learning (English Native)"
    const title = `${data.targetLanguage} Learning`;
    
    createConversation.mutate({ title }, {
      onSuccess: (newChat) => {
        reset();
        onOpenChange(false);
        setLocation(`/chat/${newChat.id}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-primary">Start a New Chat</DialogTitle>
          <DialogDescription className="text-slate-500">
            Choose the language you want to practice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetLanguage" className="text-sm font-semibold text-slate-700">I want to learn (Target)</Label>
              <Input 
                id="targetLanguage"
                placeholder="e.g. Spanish, Japanese, French" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                {...register("targetLanguage")}
              />
              {errors.targetLanguage && <span className="text-xs text-red-500">{errors.targetLanguage.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nativeLanguage" className="text-sm font-semibold text-slate-700">I speak (Native)</Label>
              <Input 
                id="nativeLanguage"
                placeholder="e.g. English" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                {...register("nativeLanguage")}
              />
              {errors.nativeLanguage && <span className="text-xs text-red-500">{errors.nativeLanguage.message}</span>}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-11 border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createConversation.isPending}
              className="rounded-xl h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              {createConversation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Learning"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
