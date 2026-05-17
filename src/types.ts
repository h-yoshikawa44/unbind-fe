export type PartOfSpeech =
  | 'noun'
  | 'pronoun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'article'
  | 'interjection'
  | 'other';

export const PART_OF_SPEECH_LABELS: Record<PartOfSpeech, string> = {
  noun: '名詞',
  pronoun: '代名詞',
  verb: '動詞',
  adjective: '形容詞',
  adverb: '副詞',
  preposition: '前置詞',
  conjunction: '接続詞',
  article: '冠詞',
  interjection: '感嘆詞',
  other: 'その他',
};

/** 型安全なイテレーションのために使用する PartOfSpeech の値一覧。 */
export const PART_OF_SPEECH_VALUES: ReadonlyArray<PartOfSpeech> = [
  'noun',
  'pronoun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'article',
  'interjection',
  'other',
];

/** PartOfSpeech 値のランタイム検証用タイプガード。 */
export function isPartOfSpeech(value: string): value is PartOfSpeech {
  return value in PART_OF_SPEECH_LABELS;
}

/**
 * 英文中の単語またはフレーズを表すトークン。
 * DB対応: "tokens" テーブルに対応。
 *
 * memberTexts は隣接する単語を結合して作成したフレーズトークンのみに存在し、
 * 元の個別単語を保持する（フレーズを分解して元に戻す際に使用）。
 */
export interface Token {
  id: string;
  sentenceId: string;
  text: string;
  order: number;
  memberTexts?: string[];
}

/**
 * トークン単体の言語分析データ。
 * DB対応: "token_analyses" テーブルに対応。
 */
export interface TokenAnalysis {
  tokenId: string;
  partOfSpeech: PartOfSpeech | null;
  wordMeaning: string;
  idiomMeaning: string;
  literalTranslation: string;
  naturalTranslation: string;
}

/**
 * フロントエンド全体で使用する Token + TokenAnalysis の結合ビュー。
 * バックエンドへ保存する際はそれぞれのテーブルに分割して扱う。
 */
export type TokenWithAnalysis = Token & Omit<TokenAnalysis, 'tokenId'>;

/**
 * 英文とそのトークン分析データをまとめたエンティティ。
 * DB対応: "sentences" テーブルに対応（トークンは別テーブルで管理）。
 */
export interface Sentence {
  id: string;
  text: string;
  tokens: TokenWithAnalysis[];
  createdAt: string;
  updatedAt: string;
}
