/**
 * 英文データのサーバ側ストア。
 *
 * 現在は JSON ファイル（data.json）をストレージとして使用している。
 * バックエンドに DB を導入する際は各関数の中身を差し替える。
 * 関数シグネチャと戻り値の型は移行前（旧 src/api.ts）と揃えてある。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Sentence, TokenWithAnalysis } from '@/types';
import { normalizeTags } from '@/types';

const DATA_FILE = resolve(process.cwd(), 'data.json');

async function loadAll(): Promise<Sentence[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- data.json のデータを Sentence[] として信頼する（DB 導入時に検証へ差し替え）
    const raw = JSON.parse(text) as Sentence[];
    // 後から追加したフィールドは古いデータに存在しないため、既定値で補完する。
    return raw.map((s) => ({
      ...s,
      naturalTranslation: s.naturalTranslation ?? '',
      tags: s.tags ?? [],
    }));
  } catch {
    // ファイルが無い / 壊れている場合は空データとして扱う。
    return [];
  }
}

async function saveAll(sentences: Sentence[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(sentences, null, 2), 'utf-8');
}

/** GET /api/sentences 相当 - 英文一覧を取得する（最終更新日の降順） */
export async function fetchSentences(): Promise<Sentence[]> {
  const sentences = await loadAll();
  return sentences.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** GET /api/sentences/:id 相当 - 単一の英文を取得する（無ければ null） */
export async function fetchSentence(id: string): Promise<Sentence | null> {
  const sentences = await loadAll();
  return sentences.find((s) => s.id === id) ?? null;
}

/** POST /api/sentences 相当 - 英文を新規作成する */
export async function createSentence(
  text: string,
  tokens: TokenWithAnalysis[],
  tags: string[] = [],
  id: string = crypto.randomUUID(),
): Promise<Sentence> {
  const sentences = await loadAll();
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
  await saveAll([...sentences, sentence]);
  return sentence;
}

/** PUT /api/sentences/:id 相当 - 英文のトークン分析データを更新する */
export async function updateSentence(
  id: string,
  tokens: TokenWithAnalysis[],
  naturalTranslation: string,
  tags: string[],
): Promise<Sentence> {
  const sentences = await loadAll();
  const idx = sentences.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Sentence ${id} not found`);
  const updated: Sentence = {
    ...sentences[idx],
    tokens,
    naturalTranslation,
    tags: normalizeTags(tags),
    updatedAt: new Date().toISOString(),
  };
  sentences[idx] = updated;
  await saveAll(sentences);
  return updated;
}

/** DELETE /api/sentences/:id 相当 - 英文を削除する */
export async function deleteSentence(id: string): Promise<void> {
  const sentences = await loadAll();
  await saveAll(sentences.filter((s) => s.id !== id));
}

/** GET /api/tags 相当 - 使用中のタグ一覧（重複なし・50音/アルファベット順）を取得する */
export async function fetchAllTags(): Promise<string[]> {
  const sentences = await loadAll();
  const tagSet = new Set<string>();
  for (const sentence of sentences) {
    for (const tag of sentence.tags) tagSet.add(tag);
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b, 'ja'));
}
