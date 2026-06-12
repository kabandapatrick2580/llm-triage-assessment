import { AppShell } from "./AppShell";
import { TRIAGE_NAV } from "./navigation";
import { TicketsProvider } from "@/features/triage/TicketsContext";
import { MessagesProvider } from "@/features/triage/MessagesContext";

/** Shell for UC1 — Smart Intake Triage. Ticket + queue state lives here so it
 *  persists as the user moves between the overview, queue, and inbox. */
export function TriageLayout() {
  return (
    <TicketsProvider>
      <MessagesProvider>
        <AppShell
          nav={TRIAGE_NAV}
          brandTitle="Smart Intake Triage"
          brandSubtitle="Structured generation · UC1"
        />
      </MessagesProvider>
    </TicketsProvider>
  );
}
