import { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function SentenceForm({ onSubmit, onCancel }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <form className="sentence-form" onSubmit={handleSubmit}>
      <h2>英文を入力</h2>
      <textarea
        className="sentence-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例: The quick brown fox jumps over the lazy dog."
        rows={3}
        autoFocus
      />
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
          分解する
        </button>
      </div>
    </form>
  );
}
