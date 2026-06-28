import { useState, useEffect } from 'react';
import type { Sentence, TokenWithAnalysis } from './types';
import { fetchSentences, createSentence, updateSentence, deleteSentence } from './api';
import { tokenize } from './tokenize';
import { SentenceList } from './components/SentenceList';
import { SentenceEditor } from './components/SentenceEditor';
import { SentenceForm } from './components/SentenceForm';
import './App.css';

type View = { type: 'list' } | { type: 'add' } | { type: 'editor'; sentence: Sentence };

function App() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [view, setView] = useState<View>({ type: 'list' });

  useEffect(() => {
    fetchSentences().then(setSentences).catch(console.error);
  }, []);

  const handleAdd = async (text: string) => {
    const id = crypto.randomUUID();
    const tokens = tokenize(id, text);
    const sentence = await createSentence(text, tokens, id);
    setSentences((prev) => [...prev, sentence]);
    setView({ type: 'editor', sentence });
  };

  const handleSave = async (
    sentence: Sentence,
    tokens: TokenWithAnalysis[],
    naturalTranslation: string,
  ) => {
    const updated = await updateSentence(sentence.id, tokens, naturalTranslation);
    setSentences((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setView({ type: 'editor', sentence: updated });
  };

  const handleDelete = async (id: string) => {
    await deleteSentence(id);
    setSentences((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <button type="button" className="app-logo" onClick={() => setView({ type: 'list' })}>
          Unbind
        </button>
        <span className="app-subtitle">英文分解・翻訳アシスタント</span>
      </header>

      <main className="app-main">
        {view.type === 'list' && (
          <SentenceList
            sentences={sentences}
            onEdit={(s) => setView({ type: 'editor', sentence: s })}
            onDelete={handleDelete}
            onAdd={() => setView({ type: 'add' })}
          />
        )}

        {view.type === 'add' && (
          <SentenceForm onSubmit={handleAdd} onCancel={() => setView({ type: 'list' })} />
        )}

        {view.type === 'editor' && (
          <SentenceEditor
            sentence={view.sentence}
            onSave={(tokens, naturalTranslation) =>
              handleSave(view.sentence, tokens, naturalTranslation)
            }
            onBack={() => setView({ type: 'list' })}
          />
        )}
      </main>
    </div>
  );
}

export default App;
