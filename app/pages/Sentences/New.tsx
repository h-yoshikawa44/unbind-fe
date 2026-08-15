import { router } from '@inertiajs/react';
import type { PageProps } from '../../pages.gen';
import { RootLayout } from '@/layouts/RootLayout';
import { SentenceForm } from '@/components/SentenceForm';
import { tokenize } from '@/tokenize';

export default function New({ tagSuggestions }: PageProps<'Sentences/New'>) {
  const handleSubmit = (text: string, tags: string[]) => {
    const id = crypto.randomUUID();
    const tokens = tokenize(id, text);
    router.post('/sentences', { id, text, tokens, tags });
  };

  const handleCancel = () => {
    router.visit('/');
  };

  return (
    <RootLayout>
      <SentenceForm onSubmit={handleSubmit} onCancel={handleCancel} tagSuggestions={tagSuggestions} />
    </RootLayout>
  );
}
