import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import styles from "./TriagingLoader.module.css";

const MESSAGES = [
  "Reading the message closely…",
  "The AI is refining its understanding…",
  "Classifying category and priority…",
  "Extracting the key details…",
  "Drafting a thoughtful reply…",
  "Almost there — it’s worth the wait…",
];

const INTERVAL_MS = 2600;

export function TriagingLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % MESSAGES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <div className={styles.orb}>
        <Sparkles size={26} strokeWidth={2} />
      </div>

      <p className={styles.title}>Please wait — triaging in progress</p>

      <p key={index} className={styles.message}>
        {MESSAGES[index]}
      </p>

      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
