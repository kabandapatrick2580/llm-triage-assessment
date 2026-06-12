import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Zap,
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
import { useMessages } from "../MessagesContext";
import { AddMessageForm } from "../components/AddMessageForm";
import { MessageStatusBadge } from "../components/badges";
import type { MessageStatus, RawMessage } from "../types";

type SortKey = "from" | "status" | "receivedAt";
type Dir = "asc" | "desc";

const STATUS_RANK: Record<MessageStatus, number> = {
  failed: 0,
  pending: 1,
  triaging: 2,
  triaged: 3,
};

const selectable = (m: RawMessage) =>
  m.status !== "triaged" && m.status !== "triaging";

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

export function IntakeQueuePage() {
  const { messages, triagingIds, triageOne, triageMany, remove, clearTriaged } =
    useMessages();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | MessageStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("receivedAt");
  const [dir, setDir] = useState<Dir>("desc");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = messages.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (q && !`${m.text} ${m.from ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    rows.sort((a, b) => {
      let c = 0;
      if (sort === "from") c = (a.from ?? "").localeCompare(b.from ?? "");
      else if (sort === "status") c = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      else c = +new Date(a.receivedAt) - +new Date(b.receivedAt);
      return dir === "asc" ? c : -c;
    });
    return rows;
  }, [messages, search, status, sort, dir]);

  const selectableFiltered = filtered.filter(selectable);
  const allSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((m) => selected.has(m.id));
  const selectedCount = selectableFiltered.filter((m) =>
    selected.has(m.id),
  ).length;
  const triagedCount = messages.filter((m) => m.status === "triaged").length;
  const busy = triagingIds.size > 0;

  function toggleSort(key: SortKey) {
    if (key === sort) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir(key === "receivedAt" ? "desc" : "asc");
    }
  }
  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      const n = new Set(prev);
      selectableFiltered.forEach((m) =>
        allSelected ? n.delete(m.id) : n.add(m.id),
      );
      return n;
    });
  }
  async function triageSelected() {
    const ids = selectableFiltered
      .filter((m) => selected.has(m.id))
      .map((m) => m.id);
    setSelected(new Set());
    await triageMany(ids);
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
          Unstructured student messages waiting to be triaged. Triage one or
          many — each becomes a ticket in the inbox.
        </p>
        <div className="flex gap-2">
          <Button onClick={triageSelected} disabled={selectedCount === 0 || busy}>
            <Zap className="h-4 w-4" />
            Triage selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4" /> Add message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add student message</DialogTitle>
                <DialogDescription>
                  Drop in a raw, unstructured message. It joins the queue as
                  “Pending” until you triage it.
                </DialogDescription>
              </DialogHeader>
              <AddMessageForm onDone={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search message text or sender…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as "all" | MessageStatus)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="triaged">Triaged</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {filtered.length} of {messages.length}
        </span>
        {triagedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearTriaged}>
            Clear triaged ({triagedCount})
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={selectableFiltered.length === 0}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("from")}
              >
                <span className="inline-flex items-center gap-1">
                  From <SortIcon k="from" />
                </span>
              </TableHead>
              <TableHead>Message</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("receivedAt")}
              >
                <span className="inline-flex items-center gap-1">
                  Received <SortIcon k="receivedAt" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("status")}
              >
                <span className="inline-flex items-center gap-1">
                  Status <SortIcon k="status" />
                </span>
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No messages in the queue. Add one or load the sample batch.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const isBusy = triagingIds.has(m.id);
                const done = m.status === "triaged";
                return (
                  <TableRow key={m.id} className={done ? "bg-success/5" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label="Select message"
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                        checked={selected.has(m.id)}
                        onChange={() => toggle(m.id)}
                        disabled={done || isBusy}
                      />
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">
                      {m.from || "—"}
                    </TableCell>
                    <TableCell className="max-w-md truncate" title={m.text}>
                      {m.text}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {fmt(m.receivedAt)}
                    </TableCell>
                    <TableCell>
                      <MessageStatusBadge
                        status={isBusy ? "triaging" : m.status}
                      />
                      {m.status === "failed" && m.error && (
                        <p className="mt-1 max-w-52 text-xs text-destructive">
                          {m.error}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {done ? (
                        m.ticketId != null ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/triage/inbox">View in inbox</Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Done
                          </span>
                        )
                      ) : isBusy ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                          Triaging…
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => triageOne(m.id)}
                          >
                            {m.status === "failed" ? (
                              <>
                                <RotateCcw className="h-3.5 w-3.5" /> Retry
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" /> Triage
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove"
                            onClick={() => remove(m.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
