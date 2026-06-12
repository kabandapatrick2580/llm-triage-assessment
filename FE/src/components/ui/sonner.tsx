import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * App-wide toast surface. Mirrors the active theme so toasts blend in with
 * light/dark mode.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group rounded-xl border border-border bg-card text-card-foreground shadow-lg",
        },
      }}
    />
  );
}
