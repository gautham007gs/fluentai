import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateConversation } from "@/hooks/use-conversations";
import { useLocation } from "wouter";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Chinese", 
  "Japanese", "Korean", "Hindi", "Telugu", "Kannada", "Arabic"
].sort();

const formSchema = z.object({
  nativeLanguage: z.string().min(1, "Native language is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateChatDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [, setLocation] = useLocation();
  const createConversation = useCreateConversation();
  
  const { handleSubmit, control, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nativeLanguage: "English",
      targetLanguage: "",
    }
  });

  const onSubmit = (data: FormValues) => {
    const title = `${data.targetLanguage} Practice`;
    
    createConversation.mutate({ 
      title,
      nativeLanguage: data.nativeLanguage,
      targetLanguage: data.targetLanguage
    }, {
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
            Choose the language you want to practice with your friend.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">I want to practice (Target)</Label>
              <Controller
                name="targetLanguage"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.targetLanguage && <span className="text-xs text-red-500">{errors.targetLanguage.message}</span>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">I speak (Native)</Label>
              <Controller
                name="nativeLanguage"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                  Starting...
                </>
              ) : (
                "Let's Chat"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
