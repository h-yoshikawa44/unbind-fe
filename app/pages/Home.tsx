// Step 0 検証用の暫定ページ（互換性確認後に削除する）
import type { PageProps } from '../pages.gen';

export default function Home({ message }: PageProps<'Home'>) {
  return <h1>{message}</h1>;
}
