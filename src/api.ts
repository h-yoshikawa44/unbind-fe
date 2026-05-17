/**
 * 英文データの APIレイヤー。
 *
 * 現在は localStorage をストレージとして使用している。
 * バックエンド実装後は各関数の中身を実際の HTTP リクエスト (fetch/axios) に置き換える。
 * 関数シグネチャと戻り値の型は REST API の形に合わせて設計しているため、移行は容易。
 */
import type { Sentence, TokenWithAnalysis } from './types';

const STORAGE_KEY = 'unbind_sentences';

function loadAll(): Sentence[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- 実APIへ移行するまでは localStorage のデータを Sentence[] として信頼する
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Sentence[];
  } catch {
    return [];
  }
}

function saveAll(sentences: Sentence[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences));
}

/** GET /api/sentences - 英文一覧を取得する */
export function fetchSentences(): Promise<Sentence[]> {
  return Promise.resolve(loadAll());
}

/** POST /api/sentences - 英文を新規作成する */
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

/** PUT /api/sentences/:id - 英文のトークン分析データを更新する */
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

/** DELETE /api/sentences/:id - 英文を削除する */
export function deleteSentence(id: string): Promise<void> {
  saveAll(loadAll().filter((s) => s.id !== id));
  return Promise.resolve();
}
