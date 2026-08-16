import { Link } from '@inertiajs/react';
import type { PageProps } from '../pages.gen';
import { RootLayout } from '@/layouts/RootLayout';
import styles from './Error.module.css';

/**
 * データ取得・検証に失敗したときに表示するエラーページ。
 * 例外でアプリを落とさず、ユーザにメッセージと一覧への導線を提示する。
 */
export default function ErrorPage({ message }: PageProps<'Error'>) {
  return (
    <RootLayout>
      <div className={styles.errorPanel} role="alert">
        <h2 className={styles.errorTitle}>エラーが発生しました</h2>
        <p className={styles.errorMessage}>{message}</p>
        <Link href="/" className={styles.errorLink}>
          一覧へ戻る
        </Link>
      </div>
    </RootLayout>
  );
}
