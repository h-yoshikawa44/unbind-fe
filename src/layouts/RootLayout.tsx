import { Link, Outlet } from '@tanstack/react-router';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <Link to="/" className={styles.appLogo}>
          Unbind
        </Link>
        <span className={styles.appSubtitle}>英文分解・翻訳アシスタント</span>
      </header>
      <main className={styles.appMain}>
        <Outlet />
      </main>
    </div>
  );
}
