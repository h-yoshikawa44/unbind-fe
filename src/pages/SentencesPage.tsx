import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { Sentence } from '@/types';
import { deleteSentence, fetchSentences } from '@/api';
import { SentenceList } from '@/components/SentenceList';

export function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const navigate = useNavigate();
  const { tags } = useSearch({ from: '/' });

  const selectedTags = useMemo(() => (tags ? tags.split(',') : []), [tags]);

  useEffect(() => {
    fetchSentences().then(setSentences).catch(console.error);
  }, []);

  // 登録済みの全英文から使用中のタグ一覧を組み立てる（絞り込みバー用）。
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const sentence of sentences) {
      for (const tag of sentence.tags) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [sentences]);

  // AND 絞り込み: 選択したタグをすべて含む英文のみ表示する。
  const filteredSentences = useMemo(() => {
    if (selectedTags.length === 0) return sentences;
    return sentences.filter((s) => selectedTags.every((tag) => s.tags.includes(tag)));
  }, [sentences, selectedTags]);

  const handleToggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    void navigate({ to: '/', search: next.length > 0 ? { tags: next.join(',') } : {} });
  };

  const handleClearTags = () => {
    void navigate({ to: '/', search: {} });
  };

  const handleEdit = (sentence: Sentence) => {
    void navigate({ to: '/sentences/$sentenceId', params: { sentenceId: sentence.id } });
  };

  const handleDelete = async (id: string) => {
    await deleteSentence(id);
    setSentences((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAdd = () => {
    void navigate({ to: '/sentences/new' });
  };

  return (
    <SentenceList
      sentences={filteredSentences}
      allTags={allTags}
      selectedTags={selectedTags}
      onToggleTag={handleToggleTag}
      onClearTags={handleClearTags}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}
