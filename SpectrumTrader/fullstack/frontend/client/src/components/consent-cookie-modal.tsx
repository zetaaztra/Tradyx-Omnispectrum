import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Cookie } from "lucide-react";
import type { ConsentPreferences } from "@/lib/consent";

interface CookieConsentModalProps {
  open: boolean;
  onSave: (preferences: ConsentPreferences) => void;
}

export function CookieConsentModal({ open, onSave }: CookieConsentModalProps) {
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  const handleAcceptAll = () => {
    onSave({ analytics: true, advertising: true });
  };

  const handleRejectAll = () => {
    onSave({ analytics: false, advertising: false });
  };

  const handleSaveChoices = () => {
    onSave({ analytics, advertising });
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-[550px]" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-accent/10">
              <Cookie className="h-5 w-5 text-accent" />
            </div>
            <DialogTitle className="text-xl">Cookies & Advertising Consent</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed pt-4 space-y-3">
            <p>
              We use cookies for theme preferences and performance. Our advertising partner (Adsterra) may also use cookies to show you relevant ads. You can control this below.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="analytics" className="text-sm font-medium">
                Analytics & Performance
              </Label>
              <p className="text-xs text-muted-foreground">
                Helps us improve dashboard performance and user experience.
              </p>
            </div>
            <Switch
              id="analytics"
              checked={analytics}
              onCheckedChange={setAnalytics}
              data-testid="switch-analytics"
            />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="advertising" className="text-sm font-medium">
                Advertising (Adsterra)
              </Label>
              <p className="text-xs text-muted-foreground">
                Allows personalized ads from our advertising partner.
              </p>
            </div>
            <Switch
              id="advertising"
              checked={advertising}
              onCheckedChange={setAdvertising}
              data-testid="switch-advertising"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleRejectAll}
            className="w-full sm:w-auto"
            data-testid="button-reject-all"
          >
            Reject All
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSaveChoices}
            className="w-full sm:w-auto"
            data-testid="button-save-choices"
          >
            Save Choices
          </Button>
          <Button 
            onClick={handleAcceptAll}
            className="w-full sm:w-auto"
            data-testid="button-accept-all"
          >
            Accept All
          </Button>
        </DialogFooter>

        <div className="flex flex-wrap items-center gap-2 pt-4 text-xs text-muted-foreground border-t border-card-border">
          <a href="/privacy" className="text-accent hover:underline">Privacy</a>
          <span>·</span>
          <a href="/cookies" className="text-accent hover:underline">Cookies</a>
          <span>·</span>
          <a href="/terms" className="text-accent hover:underline">Terms</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
