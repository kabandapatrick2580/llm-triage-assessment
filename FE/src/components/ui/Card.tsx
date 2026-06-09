import styles from "./Card.module.css";

interface Props {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, action, className, children }: Props) {
  return (
    <section className={`${styles.card} ${className ?? ""}`}>
      {(title || action) && (
        <div className={styles.head}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
