import { NavLink } from "react-router-dom";
import { Inbox, LayoutDashboard } from "lucide-react";
import { useTickets } from "../../context/TicketsContext";
import styles from "./Sidebar.module.css";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inbox", label: "Triage Inbox", icon: Inbox, end: false },
];

const STATUS_LABEL: Record<string, string> = {
  checking: "Checking model…",
  online: "Model online",
  offline: "Model offline",
};

export function Sidebar() {
  const { modelStatus, tickets } = useTickets();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.mark}>◆</span>
        <div className={styles.brandText}>
          <strong>Triage</strong>
          <span>Smart Intake</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
            {to === "/inbox" && tickets.length > 0 && (
              <span className={styles.badge}>{tickets.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={`${styles.status} ${styles[modelStatus]}`}>
          <span className={styles.statusDot} />
          {STATUS_LABEL[modelStatus]}
        </span>
      </div>
    </aside>
  );
}
