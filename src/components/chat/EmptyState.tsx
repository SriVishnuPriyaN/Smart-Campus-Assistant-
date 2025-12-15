import { FileText, MessageSquare, Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse-glow">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Welcome to Smart PDF Chat
        </h2>
        
        <p className="text-muted-foreground mb-8">
          Upload a PDF document to start asking questions. I'll search through the content and find relevant answers for you.
        </p>

        <div className="grid gap-4 text-left">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">Upload Your PDF</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click the upload area in the sidebar
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">Ask Questions</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Type your question and I'll find the answer in the document
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">100% Offline</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Everything runs locally - no data leaves your browser
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
