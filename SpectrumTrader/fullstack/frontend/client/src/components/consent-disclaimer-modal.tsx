import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-[600px]" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Important Disclaimer</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed pt-4 space-y-3">
            <p className="font-semibold text-foreground">
              Please read and acknowledge the following before using this dashboard:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                This dashboard provides <strong>educational forecasts only</strong> and is not financial advice.
              </li>
              <li>
                Market forecasts are probabilistic and may be incorrect. Past performance does not guarantee future results.
              </li>
              <li>
                Trading involves substantial risk of loss. Only trade with capital you can afford to lose.
              </li>
              <li>
                We are not SEBI-registered advisors. Consult a licensed professional before making investment decisions.
              </li>
              <li>
                Market data may be delayed up to 30 minutes and is sourced from third parties.
              </li>
              <li>
                By using this dashboard, you agree to our Terms of Use and acknowledge all associated risks.
              </li>
            </ul>

            <p className="text-xs text-muted-foreground pt-2">
              This disclaimer will reappear every 2 days to ensure you remain aware of these important notices.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={onAccept} 
            className="w-full sm:w-auto"
            data-testid="button-accept-disclaimer"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
