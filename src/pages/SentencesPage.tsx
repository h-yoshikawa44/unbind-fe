import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { Sentence } from '@/types';
import { deleteSentence, fetchSentences } from '@/api';
import { SentenceList } from '@/components/SentenceList';

export function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const navigate = useNavigate();
  const { tags, q } = useSearch({ from: '/' });

  const selectedTags = useMemo(() => (tags ? tags.split(',') : []), [tags]);

  // キーワード入力はローカル状態で滑らかに扱い、URL（共有・リロード用）は初期値に利用する。
  const [keyword, setKeyword] = useState(q ?? '');

  useEffect(() => {
    fetchSentences().then(setSentences).catch(console.error);
  }, []);

  // 空白区切りで複数キーワードに分割する（各キーワードは AND 条件）。
  const keywords = useMemo(() => keyword.trim().split(/\s+/).filter(Boolean), [keyword]);

  // 登録済みの全英文から使用中のタグ一覧を組み立てる（絞り込みバー用）。
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const sentence of sentences) {
      for (const tag of sentence.tags) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [sentences]);

  // 絞り込み: 選択タグをすべて含み（AND）、かつ全キーワードを英文または和訳に含む（AND）英文のみ表示する。
  const filteredSentences = useMemo(() => {
    return sentences.filter((sentence) => {
      if (!selectedTags.every((tag) => sentence.tags.includes(tag))) return false;
      if (keywords.length > 0) {
        const haystack = `${sentence.text}\n${sentence.naturalTranslation}`.toLowerCase();
        if (!keywords.every((kw) => haystack.includes(kw.toLowerCase()))) return false;
      }
      return true;
    });
  }, [sentences, selectedTags, keywords]);

  const handleToggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, tags: next.length > 0 ? next.join(',') : undefined }),
    });
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    const trimmed = value.trim();
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, q: trimmed.length > 0 ? trimmed : undefined }),
      replace: true,
    });
  };

  const handleClearFilters = () => {
    setKeyword('');
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
      keyword={keyword}
      onToggleTag={handleToggleTag}
      onKeywordChange={handleKeywordChange}
      onClearFilters={handleClearFilters}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}
