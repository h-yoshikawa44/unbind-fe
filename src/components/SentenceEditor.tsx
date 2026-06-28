import { useState } from 'react';
import type { Sentence, TokenWithAnalysis } from '../types';
import {
  NOUN_FORM_LABELS,
  PART_OF_SPEECH_LABELS,
  PART_OF_SPEECH_VALUES,
  VERB_FORM_LABELS,
} from '../types';
import { mergeTokens, splitToken } from '../tokenize';
import { TokenAnalysisPanel } from './TokenAnalysisPanel';

interface Props {
  sentence: Sentence;
  onSave: (tokens: TokenWithAnalysis[], naturalTranslation: string) => void;
  onBack: () => void;
}

export function SentenceEditor({ sentence, onSave, onBack }: Props) {
  const [tokens, setTokens] = useState<TokenWithAnalysis[]>(sentence.tokens);
  const [naturalTranslation, setNaturalTranslation] = useState(sentence.naturalTranslation);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPhraseMode, setIsPhraseMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  const activeToken = tokens.find((t) => t.id === activeId) ?? null;

  const handleTokenClick = (id: string) => {
    if (isPhraseMode) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setActiveId((prev) => (prev === id ? null : id));
    }
  };

  const isSelectedAdjacent = (): boolean => {
    if (selected.size < 2) return false;
    const indices = tokens
      .map((t, i) => (selected.has(t.id) ? i : -1))
      .filter((i) => i !== -1)
      .sort((a, b) => a - b);
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) return false;
    }
    return true;
  };

  const handleGroup = () => {
    try {
      const newTokens = mergeTokens(tokens, [...selected]);
      setTokens(newTokens);
      setSelected(new Set());
      setIsPhraseMode(false);
      setActiveId(null);
      setIsDirty(true);
    } catch {
      // 非隣接トークンを選択した場合 — ボタンは無効化されているが念のためガード
    }
  };

  const handleSplit = (id: string) => {
    const newTokens = splitToken(tokens, id);
    setTokens(newTokens);
    setActiveId(null);
    setIsDirty(true);
  };

  const handleTokenChange = (updated: TokenWithAnalysis) => {
    setTokens((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(tokens, naturalTranslation);
    setIsDirty(false);
  };

  const handleBack = () => {
    if (isDirty && !confirm('保存していない変更があります。戻りますか？')) return;
    onBack();
  };

  const togglePhraseMode = () => {
    setIsPhraseMode((prev) => !prev);
    setSelected(new Set());
    setActiveId(null);
  };

  const canGroup = selected.size >= 2 && isSelectedAdjacent();
  const selectionInvalid = selected.size >= 2 && !isSelectedAdjacent();
  const usedPos = PART_OF_SPEECH_VALUES.filter((pos) => tokens.some((t) => t.partOfSpeech === pos));

  return (
    <div className="editor">
      <div className="editor-header">
        <button type="button" className="btn btn-outline" onClick={handleBack}>
          ← 戻る
        </button>
        <p className="editor-title">{sentence.text}</p>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!isDirty}>
          保存
        </button>
      </div>

      <div className="token-area">
        <div className="token-toolbar">
          <span className="toolbar-label">フレーズ操作:</span>
          <button
            type="button"
            className={`btn btn-sm ${isPhraseMode ? 'btn-active' : 'btn-outline'}`}
            onClick={togglePhraseMode}
          >
            {isPhraseMode ? '選択中...' : 'フレーズを作成'}
          </button>
          {isPhraseMode && canGroup && (
            <button type="button" className="btn btn-sm btn-primary" onClick={handleGroup}>
              グループ化
            </button>
          )}
          {isPhraseMode && selectionInvalid && (
            <span className="toolbar-warning">隣接したトークンのみグループ化できます</span>
          )}
          {isPhraseMode && selected.size === 0 && (
            <span className="toolbar-hint">グループ化したいトークンを選択してください</span>
          )}
        </div>

        <div className="token-list" role="list">
          {tokens.map((token) => {
            const isPhrase = (token.memberTexts?.length ?? 0) > 1;
            const isActive = activeId === token.id;
            const isSelected = selected.has(token.id);

            const classes = ['token-chip'];
            if (isPhrase) classes.push('token-chip--phrase');
            if (isActive) classes.push('token-chip--active');
            if (isSelected) classes.push('token-chip--selected');
            const className = classes.join(' ');

            return (
              <button
                key={token.id}
                type="button"
                role="listitem"
                className={className}
                onClick={() => handleTokenClick(token.id)}
              >
                <span className="token-chip-text">{token.text}</span>
                {!isPhraseMode && (
                  <span className="token-pos-badge" data-pos={token.partOfSpeech ?? undefined}>
                    {token.partOfSpeech ? PART_OF_SPEECH_LABELS[token.partOfSpeech] : '—'}
                  </span>
                )}
                {!isPhraseMode && token.partOfSpeech === 'verb' && token.verbForm && (
                  <span className="token-verbform-badge">{VERB_FORM_LABELS[token.verbForm]}</span>
                )}
                {!isPhraseMode && token.partOfSpeech === 'noun' && token.nounForm && (
                  <span className="token-nounform-badge">{NOUN_FORM_LABELS[token.nounForm]}</span>
                )}
                {!isPhraseMode && token.wordMeaning && (
                  <span className="token-chip-meaning">{token.wordMeaning}</span>
                )}
                {!isPhraseMode && token.idiomMeaning && (
                  <span className="token-chip-meaning token-chip-meaning--idiom">
                    慣: {token.idiomMeaning}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {!isPhraseMode && usedPos.length > 0 && (
          <div className="pos-legend">
            <span className="pos-legend-label">品詞凡例:</span>
            {usedPos.map((pos) => (
              <span key={pos} className="pos-legend-item" data-pos={pos}>
                {PART_OF_SPEECH_LABELS[pos]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="sentence-translation">
        <label className="sentence-translation-label" htmlFor="natural-translation">
          意訳
        </label>
        <textarea
          id="natural-translation"
          className="sentence-translation-input"
          value={naturalTranslation}
          onChange={(e) => {
            setNaturalTranslation(e.target.value);
            setIsDirty(true);
          }}
          placeholder="文章全体の自然な日本語訳..."
          rows={3}
        />
      </div>

      {activeToken && !isPhraseMode ? (
        <TokenAnalysisPanel
          token={activeToken}
          onChange={handleTokenChange}
          onSplit={
            (activeToken.memberTexts?.length ?? 0) > 1
              ? () => handleSplit(activeToken.id)
              : undefined
          }
        />
      ) : (
        !isPhraseMode && (
          <div className="empty-hint">
            <p>トークンをクリックして分析情報を入力できます</p>
          </div>
        )
      )}
    </div>
  );
}
