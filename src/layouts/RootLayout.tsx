import { Link, Outlet } from '@tanstack/react-router';
import '../App.css';

export function RootLayout() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-logo">
          Unbind
        </Link>
        <span className="app-subtitle">英文分解・翻訳アシスタント</span>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
