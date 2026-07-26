import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createSentence, fetchAllTags } from '@/api';
import { SentenceForm } from '@/components/SentenceForm';
import { tokenize } from '@/tokenize';

export function SentenceNewPage() {
  const navigate = useNavigate();
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchAllTags().then(setTagSuggestions).catch(console.error);
  }, []);

  const handleSubmit = async (text: string, tags: string[]) => {
    const id = crypto.randomUUID();
    const tokens = tokenize(id, text);
    const sentence = await createSentence(text, tokens, tags, id);
    await navigate({ to: '/sentences/$sentenceId', params: { sentenceId: sentence.id } });
  };

  const handleCancel = () => {
    void navigate({ to: '/' });
  };

  return (
    <SentenceForm onSubmit={handleSubmit} onCancel={handleCancel} tagSuggestions={tagSuggestions} />
  );
}
