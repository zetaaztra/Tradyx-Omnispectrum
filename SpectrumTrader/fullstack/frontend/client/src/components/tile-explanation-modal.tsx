import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { tileExplanations } from "@shared/schema";

interface TileExplanationModalProps {
  open: boolean;
  onClose: () => void;
  tileKey: keyof typeof tileExplanations;
}

export function TileExplanationModal({ open, onClose, tileKey }: TileExplanationModalProps) {
  const explanation = tileExplanations[tileKey];

  if (!explanation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg sm:text-xl pr-8">{explanation.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4"
              data-testid="button-close-explanation"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription className="text-sm leading-relaxed pt-4 text-muted-foreground">
            {explanation.description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
