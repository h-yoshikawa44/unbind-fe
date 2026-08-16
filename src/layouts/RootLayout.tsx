import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import styles from '@/layouts/RootLayout.module.css';

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <Link href="/" className={styles.appLogo}>
          Unbind
        </Link>
        <span className={styles.appSubtitle}>英文分解・翻訳アシスタント</span>
      </header>
      <main className={styles.appMain}>{children}</main>
    </div>
  );
}
