/**
 * 英文データの APIレイヤー。
 *
 * 現在は localStorage をストレージとして使用している。
 * バックエンド実装後は各関数の中身を実際の HTTP リクエスト (fetch/axios) に置き換える。
 * 関数シグネチャと戻り値の型は REST API の形に合わせて設計しているため、移行は容易。
 */
import type { Sentence, TokenWithAnalysis } from '@/types';
import { normalizeTags } from '@/types';

const STORAGE_KEY = 'unbind_sentences';

function loadAll(): Sentence[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- 実APIへ移行するまでは localStorage のデータを Sentence[] として信頼する
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Sentence[];
    // 後から追加したフィールドは古いデータに存在しないため、既定値で補完する。
    return raw.map((s) => ({
      ...s,
      naturalTranslation: s.naturalTranslation ?? '',
      tags: s.tags ?? [],
    }));
  } catch {
    return [];
  }
}

function saveAll(sentences: Sentence[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences));
}

/** GET /api/sentences - 英文一覧を取得する（最終更新日の降順） */
export function fetchSentences(): Promise<Sentence[]> {
  const sentences = loadAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return Promise.resolve(sentences);
}

/** POST /api/sentences - 英文を新規作成する */
export function createSentence(
  text: string,
  tokens: TokenWithAnalysis[],
  tags: string[] = [],
  id: string = crypto.randomUUID(),
): Promise<Sentence> {
  const sentences = loadAll();
  const now = new Date().toISOString();
  const sentence: Sentence = {
    id,
    text,
    tokens,
    naturalTranslation: '',
    tags: normalizeTags(tags),
    createdAt: now,
    updatedAt: now,
  };
  saveAll([...sentences, sentence]);
  return Promise.resolve(sentence);
}

/** PUT /api/sentences/:id - 英文のトークン分析データを更新する */
export function updateSentence(
  id: string,
  tokens: TokenWithAnalysis[],
  naturalTranslation: string,
  tags: string[],
): Promise<Sentence> {
  const sentences = loadAll();
  const idx = sentences.findIndex((s) => s.id === id);
  if (idx === -1) return Promise.reject(new Error(`Sentence ${id} not found`));
  const updated: Sentence = {
    ...sentences[idx],
    tokens,
    naturalTranslation,
    tags: normalizeTags(tags),
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

/** GET /api/tags - 登録済みの全英文から使用中のタグ一覧（重複なし・50音/アルファベット順）を取得する */
export function fetchAllTags(): Promise<string[]> {
  const tagSet = new Set<string>();
  for (const sentence of loadAll()) {
    for (const tag of sentence.tags) tagSet.add(tag);
  }
  return Promise.resolve([...tagSet].sort((a, b) => a.localeCompare(b, 'ja')));
}
