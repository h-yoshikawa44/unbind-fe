import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { Sentence } from '@/types';
import { deleteSentence, fetchSentences } from '@/api';
import { SentenceList } from '@/components/SentenceList';

/** 1 ページあたりに表示する英文の件数。 */
const PAGE_SIZE = 20;

export function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const navigate = useNavigate();
  const { tags, q, page } = useSearch({ from: '/' });

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

  // ページング: 絞り込み後の結果を PAGE_SIZE 件ずつに分割する。
  // 絞り込みや削除で総ページ数が減った場合に備え、表示ページは有効範囲へ丸める。
  const totalPages = Math.max(1, Math.ceil(filteredSentences.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page ?? 1, 1), totalPages);
  const pagedSentences = useMemo(
    () => filteredSentences.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredSentences, currentPage],
  );

  const handleToggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    // 絞り込み条件が変わると総ページ数も変わるため、1 ページ目に戻す。
    void navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        tags: next.length > 0 ? next.join(',') : undefined,
        page: undefined,
      }),
    });
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    const trimmed = value.trim();
    // 絞り込み条件が変わると総ページ数も変わるため、1 ページ目に戻す。
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, q: trimmed.length > 0 ? trimmed : undefined, page: undefined }),
      replace: true,
    });
  };

  const handleClearFilters = () => {
    setKeyword('');
    void navigate({ to: '/', search: {} });
  };

  const handlePageChange = (nextPage: number) => {
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, page: nextPage > 1 ? nextPage : undefined }),
    });
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
      sentences={pagedSentences}
      totalCount={filteredSentences.length}
      currentPage={currentPage}
      totalPages={totalPages}
      allTags={allTags}
      selectedTags={selectedTags}
      keyword={keyword}
      onToggleTag={handleToggleTag}
      onKeywordChange={handleKeywordChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}
