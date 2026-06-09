import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useTickets } from "../context/TicketsContext";
import { CATEGORIES, PRIORITIES, type Ticket } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { Drawer } from "../components/ui/Drawer";
import { TicketTable } from "../components/inbox/TicketTable";
import { TicketCard } from "../components/TicketCard";
import { IntakeForm } from "../components/IntakeForm";
import styles from "./InboxPage.module.css";

export function InboxPage() {
  const { tickets, loading } = useTickets();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showNew, setShowNew] = useState(false);

  // Deep-link support: /inbox?ticket=ID opens that ticket's detail.
  useEffect(() => {
    const id = searchParams.get("ticket");
    if (!id) return;
    const match = tickets.find((t) => String(t.id) === id);
    if (match) setSelected(match);
  }, [searchParams, tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (category && t.category !== category) return false;
      if (priority && t.priority !== priority) return false;
      if (q) {
        const haystack = `${t.issue_summary} ${t.original_text} ${t.customer_name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, search, category, priority]);

  function closeDetail() {
    setSelected(null);
    if (searchParams.has("ticket")) {
      searchParams.delete("ticket");
      setSearchParams(searchParams, { replace: true });
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Triage Inbox"
        subtitle="Every triaged ticket, with search, filtering, and sorting."
        actions={
          <button className={styles.newBtn} onClick={() => setShowNew(true)}>
            <Plus size={16} /> New triage
          </button>
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search summary, message, or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className={styles.select}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <span className={styles.count}>
          {filtered.length} of {tickets.length}
        </span>
      </div>

      {loading && tickets.length === 0 ? (
        <p className={styles.muted}>Loading tickets…</p>
      ) : (
        <TicketTable tickets={filtered} onSelect={setSelected} />
      )}

      <Drawer
        open={selected !== null}
        title="Ticket detail"
        onClose={closeDetail}
      >
        {selected && <TicketCard ticket={selected} />}
      </Drawer>

      <Drawer open={showNew} title="New triage" onClose={() => setShowNew(false)}>
        <p className={styles.drawerHint}>
          Paste an inbound message. It will be classified and added to the inbox.
        </p>
        <IntakeForm onTriaged={() => setShowNew(false)} />
      </Drawer>
    </div>
  );
}
