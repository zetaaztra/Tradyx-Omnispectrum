import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-6">About</h1>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="text-sm italic">Content to be provided by Zeta Aztra Technologies.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
