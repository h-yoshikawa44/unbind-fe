import { useNavigate } from '@tanstack/react-router';
import { createSentence } from '@/api';
import { SentenceForm } from '@/components/SentenceForm';
import { tokenize } from '@/tokenize';

export function SentenceNewPage() {
  const navigate = useNavigate();

  const handleSubmit = async (text: string) => {
    const id = crypto.randomUUID();
    const tokens = tokenize(id, text);
    const sentence = await createSentence(text, tokens, id);
    await navigate({ to: '/sentences/$sentenceId', params: { sentenceId: sentence.id } });
  };

  const handleCancel = () => {
    void navigate({ to: '/' });
  };

  return <SentenceForm onSubmit={handleSubmit} onCancel={handleCancel} />;
}
