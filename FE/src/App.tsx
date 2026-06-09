import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { TicketsProvider } from "./context/TicketsContext";
import styles from "./App.module.css";

export default function App() {
  return (
    <TicketsProvider>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </TicketsProvider>
  );
}
