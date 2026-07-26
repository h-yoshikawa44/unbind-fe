import { useState } from 'react';
import type { FormEvent } from 'react';
import styles from '@/components/SentenceForm.module.css';
import buttonStyles from '@/styles/button.module.css';

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
    <form className={styles.sentenceForm} onSubmit={handleSubmit}>
      <h2>英文を入力</h2>
      <textarea
        className={styles.sentenceInput}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例: The quick brown fox jumps over the lazy dog."
        rows={3}
        autoFocus
      />
      <div className={styles.formActions}>
        <button
          type="button"
          className={`${buttonStyles.btn} ${buttonStyles.btnOutline}`}
          onClick={onCancel}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}
          disabled={!text.trim()}
        >
          分解する
        </button>
      </div>
    </form>
  );
}
