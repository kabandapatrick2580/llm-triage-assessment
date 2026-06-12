import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTickets } from "../TicketsContext";
import { PRIORITY_RANK } from "../metrics";
import { CATEGORIES, PRIORITIES, type Ticket } from "../types";
import { CategoryBadge, PriorityBadge } from "../components/badges";
import { TicketDetail } from "../components/TicketDetail";
import { IntakeForm } from "../components/IntakeForm";

type SortKey = "priority" | "category" | "customer" | "created_at";
type Dir = "asc" | "desc";

function fmt(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function InboxPage() {
  const { tickets, loading } = useTickets();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [dir, setDir] = useState<Dir>("desc");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = tickets.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (q) {
        const hay =
          `${t.issue_summary} ${t.original_text} ${t.customer_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    rows.sort((a, b) => {
      let c = 0;
      if (sort === "priority") c = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      else if (sort === "category") c = a.category.localeCompare(b.category);
      else if (sort === "customer")
        c = (a.customer_name ?? "").localeCompare(b.customer_name ?? "");
      else c = +new Date(a.created_at) - +new Date(b.created_at);
      return dir === "asc" ? c : -c;
    });
    return rows;
  }, [tickets, search, category, priority, sort, dir]);

  function toggleSort(key: SortKey) {
    if (key === sort) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir(key === "created_at" || key === "priority" ? "desc" : "asc");
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort !== k ? (
      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
    ) : dir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Every triaged ticket, with search, filtering, and sorting.
        </p>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New triage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New triage</DialogTitle>
              <DialogDescription>
                Paste an inbound message. It will be classified and added to the
                inbox.
              </DialogDescription>
            </DialogHeader>
            <IntakeForm onDone={() => setNewOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search summary, message, or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {filtered.length} of {tickets.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("priority")}
              >
                <span className="inline-flex items-center gap-1">
                  Priority <SortIcon k="priority" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("category")}
              >
                <span className="inline-flex items-center gap-1">
                  Category <SortIcon k="category" />
                </span>
              </TableHead>
              <TableHead>Summary</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("customer")}
              >
                <span className="inline-flex items-center gap-1">
                  Customer <SortIcon k="customer" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("created_at")}
              >
                <span className="inline-flex items-center gap-1">
                  Created <SortIcon k="created_at" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Loading tickets…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No tickets match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(t)}
                >
                  <TableCell>
                    <PriorityBadge priority={t.priority} />
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={t.category} />
                  </TableCell>
                  <TableCell className="max-w-sm truncate">
                    {t.issue_summary}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {t.customer_name ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {fmt(t.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket detail</DialogTitle>
          </DialogHeader>
          {selected && <TicketDetail ticket={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
