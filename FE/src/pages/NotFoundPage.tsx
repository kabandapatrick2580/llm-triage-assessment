import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
