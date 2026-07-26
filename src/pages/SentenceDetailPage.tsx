import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import type { Sentence, TokenWithAnalysis } from '@/types';
import { fetchAllTags, fetchSentences, updateSentence } from '@/api';
import { SentenceEditor } from '@/components/SentenceEditor';
import styles from '@/pages/SentenceDetailPage.module.css';

export function SentenceDetailPage() {
  const { sentenceId } = useParams({ from: '/sentences/$sentenceId' });
  const navigate = useNavigate();
  const [sentence, setSentence] = useState<Sentence | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSentences(), fetchAllTags()])
      .then(([sentences, tags]) => {
        setSentence(sentences.find((s) => s.id === sentenceId) ?? null);
        setTagSuggestions(tags);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sentenceId]);

  const handleSave = async (
    tokens: TokenWithAnalysis[],
    naturalTranslation: string,
    tags: string[],
  ) => {
    const updated = await updateSentence(sentenceId, tokens, naturalTranslation, tags);
    setSentence(updated);
    setTagSuggestions(await fetchAllTags());
  };

  const handleBack = () => {
    void navigate({ to: '/' });
  };

  if (loading) return null;

  if (!sentence) {
    return (
      <div className={styles.emptyHint}>
        <p>英文が見つかりません</p>
      </div>
    );
  }

  return (
    <SentenceEditor
      sentence={sentence}
      onSave={handleSave}
      onBack={handleBack}
      tagSuggestions={tagSuggestions}
    />
  );
}
