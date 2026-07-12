import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Sentence } from '../types';
import { deleteSentence, fetchSentences } from '../api';
import { SentenceList } from '../components/SentenceList';

export function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSentences().then(setSentences).catch(console.error);
  }, []);

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
      sentences={sentences}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}
