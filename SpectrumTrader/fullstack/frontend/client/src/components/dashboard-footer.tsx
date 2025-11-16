import { Link } from "wouter";

export function DashboardFooter() {
  return (
    <footer className="border-t border-card-border bg-card px-4 sm:px-6 py-8 mt-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="space-y-6">
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Data Sources:</strong> NSE India, Yahoo Finance
            </p>
            <p>
              <strong className="text-foreground">Analytics powered by</strong> Tradyxa Analytics Engine v1.0.0
            </p>
            <p>
              Market data © respective owners. Tradyxa Quant Dashboard is unaffiliated with NSE or Yahoo.
            </p>
            <p>
              Market data may be delayed up to 30 minutes. For educational use only.
            </p>
          </div>

          <div className="pt-4 border-t border-card-border text-xs text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Operated by</strong> Zeta Aztra Technologies (Individual Proprietorship, India)
            </p>
            <p>
              © 2025 Zeta Aztra Technologies. All Rights Reserved.
            </p>
            <p>
              zetaaztratech@gmail.com | Jurisdiction: Chennai, Tamil Nadu | Version: v1.0.0
            </p>
            <p className="pt-2">
              Visual models and code protected under Copyright Act, 1957 (India). 
              Unauthorized use of the Tradyxa or Zeta Aztra name, logo, or visuals is strictly prohibited.
            </p>
            <p>
              Tradyxa Quant Dashboard is a product of Zeta Aztra Technologies (India) and is not affiliated with any other Tradyxa-named companies or domains.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-card-border text-xs">
            <Link href="/privacy" className="text-accent hover-elevate px-2 py-1 rounded" data-testid="link-privacy">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/cookies" className="text-accent hover-elevate px-2 py-1 rounded" data-testid="link-cookies">
              Cookie Preferences
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/terms" className="text-accent hover-elevate px-2 py-1 rounded" data-testid="link-terms">
              Terms of Use
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/disclaimer" className="text-accent hover-elevate px-2 py-1 rounded" data-testid="link-disclaimer">
              Disclaimer
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/about" className="text-accent hover-elevate px-2 py-1 rounded" data-testid="link-about">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
