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
import { storedSentencesSchema } from '@/schemas';

const DATA_FILE = resolve(process.cwd(), 'data.json');

/** データ層のエラー種別ごとのユーザ向けメッセージ。 */
export const DATA_ERROR_MESSAGES = {
  // 読み込み自体に失敗した（ファイル I/O など想定外の失敗）。
  read: 'データの取得に失敗しました',
  // 読み込めたが中身が期待する形と違う（JSON 破損・スキーマ検証エラー）。
  validation: '予期しないデータが取得されました',
} as const;

/**
 * データ層で発生したユーザに提示すべきエラー。
 * message にはそのまま画面表示できる日本語メッセージを持たせる。
 */
export class SentenceDataError extends Error {
  kind: 'read' | 'validation';

  constructor(kind: 'read' | 'validation') {
    super(DATA_ERROR_MESSAGES[kind]);
    this.name = 'SentenceDataError';
    this.kind = kind;
  }
}

/** 任意のエラーを画面表示用メッセージへ変換する（想定外は取得失敗として扱う）。 */
export function toDataErrorMessage(err: unknown): string {
  return err instanceof SentenceDataError ? err.message : DATA_ERROR_MESSAGES.read;
}

/** Node の fs エラー（存在しないファイル）かどうかを判定する。 */
function isFileNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 'ENOENT';
}

async function loadAll(): Promise<Sentence[]> {
  let text: string;
  try {
    text = await readFile(DATA_FILE, 'utf-8');
  } catch (err) {
    // ファイルが無い場合は空データ（初回保存前）として扱う。
    if (isFileNotFound(err)) return [];
    // それ以外の読み込み失敗は取得エラーとして通知する。
    console.error('data.json の読み込みに失敗しました:', err);
    throw new SentenceDataError('read');
  }
  // ここで検証して初めて Sentence[] とみなす（旧: JSON.parse を as で信頼していた箇所）。
  // naturalTranslation / tags が無い古いデータはスキーマ側の既定値で補完される。
  // JSON 破損・スキーマ不一致は握りつぶさず、検証エラーとして通知する。
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error('data.json のパースに失敗しました:', err);
    throw new SentenceDataError('validation');
  }
  const result = storedSentencesSchema.safeParse(json);
  if (!result.success) {
    console.error('data.json がスキーマに一致しません:', result.error);
    throw new SentenceDataError('validation');
  }
  return result.data;
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
