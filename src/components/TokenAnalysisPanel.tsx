import type { TokenWithAnalysis } from '../types';
import { PartOfSpeechSelect } from './PartOfSpeechSelect';
import { VerbFormSelect } from './VerbFormSelect';

interface Props {
  token: TokenWithAnalysis;
  onChange: (updated: TokenWithAnalysis) => void;
  onSplit?: () => void;
}

export function TokenAnalysisPanel({ token, onChange, onSplit }: Props) {
  // Generic helper so TypeScript can verify field/value compatibility
  function update<K extends keyof TokenWithAnalysis>(field: K, value: TokenWithAnalysis[K]): void {
    onChange({ ...token, [field]: value } as TokenWithAnalysis);
  }

  const isPhrase = (token.memberTexts?.length ?? 0) > 1;

  return (
    <div className="analysis-panel">
      <div className="analysis-panel-header">
        <div className="analysis-token-info">
          <span className="analysis-token-kind">{isPhrase ? 'フレーズ' : '単語'}</span>
          <span className="analysis-token-text">{token.text}</span>
        </div>
        {isPhrase && onSplit && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onSplit}>
            分解する
          </button>
        )}
      </div>

      <div className="analysis-fields">
        <div className="field-group field-group--pos">
          <label className="field-label">品詞</label>
          <PartOfSpeechSelect
            value={token.partOfSpeech}
            onChange={(v) => update('partOfSpeech', v)}
          />
        </div>

        {token.partOfSpeech === 'verb' && (
          <div className="field-group field-group--pos">
            <label className="field-label">変化形</label>
            <VerbFormSelect value={token.verbForm} onChange={(v) => update('verbForm', v)} />
          </div>
        )}

        {isPhrase ? (
          <div className="field-group field-group--wide">
            <label className="field-label">慣用句としての意味</label>
            <textarea
              value={token.idiomMeaning}
              onChange={(e) => update('idiomMeaning', e.target.value)}
              placeholder="慣用句・イディオムとして使われる場合の意味..."
              rows={2}
            />
          </div>
        ) : (
          <div className="field-group field-group--wide">
            <label className="field-label">単語としての意味</label>
            <textarea
              value={token.wordMeaning}
              onChange={(e) => update('wordMeaning', e.target.value)}
              placeholder="単語・フレーズの基本的な意味..."
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
}
