/**
 * API layer for sentences.
 *
 * Currently backed by localStorage. Replace each function body with a
 * real HTTP request (fetch/axios) when the backend is ready.
 * The function signatures and return types are designed to match
 * a typical REST API shape, so migration should be straightforward.
 */
import type { Sentence, TokenWithAnalysis } from './types';

const STORAGE_KEY = 'unbind_sentences';

function loadAll(): Sentence[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- localStorage data is trusted as Sentence[] until a real API with response validation is in place
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Sentence[];
  } catch {
    return [];
  }
}

function saveAll(sentences: Sentence[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences));
}

/** GET /api/sentences */
export function fetchSentences(): Promise<Sentence[]> {
  return Promise.resolve(loadAll());
}

/** POST /api/sentences */
export function createSentence(
  text: string,
  tokens: TokenWithAnalysis[],
  id: string = crypto.randomUUID(),
): Promise<Sentence> {
  const sentences = loadAll();
  const now = new Date().toISOString();
  const sentence: Sentence = { id, text, tokens, createdAt: now, updatedAt: now };
  saveAll([...sentences, sentence]);
  return Promise.resolve(sentence);
}

/** PUT /api/sentences/:id */
export function updateSentence(id: string, tokens: TokenWithAnalysis[]): Promise<Sentence> {
  const sentences = loadAll();
  const idx = sentences.findIndex((s) => s.id === id);
  if (idx === -1) return Promise.reject(new Error(`Sentence ${id} not found`));
  const updated: Sentence = {
    ...sentences[idx],
    tokens,
    updatedAt: new Date().toISOString(),
  };
  sentences[idx] = updated;
  saveAll(sentences);
  return Promise.resolve(updated);
}

/** DELETE /api/sentences/:id */
export function deleteSentence(id: string): Promise<void> {
  saveAll(loadAll().filter((s) => s.id !== id));
  return Promise.resolve();
}
