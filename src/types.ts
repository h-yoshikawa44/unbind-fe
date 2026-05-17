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

/** Ordered list of all PartOfSpeech values, used for type-safe iteration. */
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

/** Type guard for runtime validation of PartOfSpeech values. */
export function isPartOfSpeech(value: string): value is PartOfSpeech {
  return value in PART_OF_SPEECH_LABELS;
}

/**
 * A word or phrase token within a sentence.
 * DB-ready: maps to the "tokens" table.
 *
 * memberTexts is present only for phrase tokens created by merging
 * adjacent words. It stores the original individual words so the
 * phrase can be split back later.
 */
export interface Token {
  id: string;
  sentenceId: string;
  text: string;
  order: number;
  memberTexts?: string[];
}

/**
 * Linguistic analysis data for a single token.
 * DB-ready: maps to the "token_analyses" table.
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
 * Combined view of Token + TokenAnalysis used throughout the frontend.
 * When persisting to the backend, these will be split into their
 * respective tables.
 */
export type TokenWithAnalysis = Token & Omit<TokenAnalysis, 'tokenId'>;

/**
 * An English sentence together with all its token analyses.
 * DB-ready: maps to the "sentences" table (tokens stored separately).
 */
export interface Sentence {
  id: string;
  text: string;
  tokens: TokenWithAnalysis[];
  createdAt: string;
  updatedAt: string;
}
