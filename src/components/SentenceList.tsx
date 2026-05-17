import type { Sentence } from '../types';

interface Props {
  sentences: Sentence[];
  onEdit: (sentence: Sentence) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function SentenceList({ sentences, onEdit, onDelete, onAdd }: Props) {
  return (
    <div className="sentence-list">
      <div className="list-header">
        <h2>英文一覧</h2>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + 英文を追加
        </button>
      </div>

      {sentences.length === 0 ? (
        <div className="empty-state">
          <p>まだ英文が登録されていません。</p>
          <button type="button" className="btn btn-primary" onClick={onAdd}>
            最初の英文を追加する
          </button>
        </div>
      ) : (
        <ul className="sentence-items">
          {sentences.map((sentence) => (
            <li key={sentence.id} className="sentence-item">
              <button type="button" className="sentence-item-body" onClick={() => onEdit(sentence)}>
                <p className="sentence-item-text">{sentence.text}</p>
                <p className="sentence-item-meta">
                  {sentence.tokens.length} トークン ·{' '}
                  {new Date(sentence.updatedAt).toLocaleDateString('ja-JP')}
                </p>
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
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
