import type { Sentence } from '../types';
import styles from '@/components/SentenceList.module.css';
import buttonStyles from '@/styles/button.module.css';

interface Props {
  sentences: Sentence[];
  onEdit: (sentence: Sentence) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function SentenceList({ sentences, onEdit, onDelete, onAdd }: Props) {
  return (
    <div className={styles.sentenceList}>
      <div className={styles.listHeader}>
        <h2>英文一覧</h2>
        <button
          type="button"
          className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}
          onClick={onAdd}
        >
          + 英文を追加
        </button>
      </div>

      {sentences.length === 0 ? (
        <div className={styles.emptyState}>
          <p>まだ英文が登録されていません。</p>
          <button
            type="button"
            className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}
            onClick={onAdd}
          >
            最初の英文を追加する
          </button>
        </div>
      ) : (
        <ul className={styles.sentenceItems}>
          {sentences.map((sentence) => (
            <li key={sentence.id} className={styles.sentenceItem}>
              <button
                type="button"
                className={styles.sentenceItemBody}
                onClick={() => onEdit(sentence)}
              >
                <p className={styles.sentenceItemText}>{sentence.text}</p>
                <p className={styles.sentenceItemMeta}>
                  {sentence.tokens.length} トークン ·{' '}
                  {new Date(sentence.updatedAt).toLocaleDateString('ja-JP')}
                </p>
              </button>
              <button
                type="button"
                className={`${buttonStyles.btn} ${buttonStyles.btnDanger} ${buttonStyles.btnSm}`}
                onClick={() => {
                  if (
                    confirm(
                      `"${sentence.text.slice(0, 40)}${sentence.text.length > 40 ? '...' : ''}" を削除しますか？`,
                    )
                  ) {
                    onDelete(sentence.id);
                  }
                }}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
