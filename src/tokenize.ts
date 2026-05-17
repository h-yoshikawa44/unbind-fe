/**
 * Tokenization utilities for English sentences.
 *
 * Currently uses simple whitespace splitting. In the future this logic
 * could be moved server-side and use an NLP library (e.g. spaCy, NLTK)
 * to provide automatic POS tagging and smarter tokenization.
 */
import type { TokenWithAnalysis } from './types';

/** Splits an English sentence into word tokens by whitespace. */
export function tokenize(sentenceId: string, text: string): TokenWithAnalysis[] {
  const regex = /\S+/g;
  const result: TokenWithAnalysis[] = [];
  let match: RegExpExecArray | null;
  let order = 0;

  while ((match = regex.exec(text)) !== null) {
    result.push({
      id: crypto.randomUUID(),
      sentenceId,
      text: match[0],
      order: order++,
      partOfSpeech: null,
      wordMeaning: '',
      idiomMeaning: '',
      literalTranslation: '',
      naturalTranslation: '',
    });
  }

  return result;
}

/**
 * Merges a set of adjacent tokens into a single phrase token.
 * The provided ids must correspond to consecutive tokens in the list.
 */
export function mergeTokens(tokens: TokenWithAnalysis[], ids: string[]): TokenWithAnalysis[] {
  const indices = ids.map((id) => tokens.findIndex((t) => t.id === id)).sort((a, b) => a - b);

  const first = indices[0];
  const last = indices[indices.length - 1];

  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      throw new Error('Tokens must be adjacent to merge');
    }
  }

  const toMerge = tokens.slice(first, last + 1);
  // Flatten in case any of the selected tokens are already phrases
  const memberTexts = toMerge.flatMap((t) => t.memberTexts ?? [t.text]);

  const phraseToken: TokenWithAnalysis = {
    id: crypto.randomUUID(),
    sentenceId: tokens[first].sentenceId,
    text: memberTexts.join(' '),
    order: tokens[first].order,
    memberTexts,
    partOfSpeech: null,
    wordMeaning: '',
    idiomMeaning: '',
    literalTranslation: '',
    naturalTranslation: '',
  };

  return [...tokens.slice(0, first), phraseToken, ...tokens.slice(last + 1)];
}

/**
 * Splits a phrase token back into individual word tokens.
 * Has no effect if the token is not a phrase (memberTexts is absent).
 */
export function splitToken(tokens: TokenWithAnalysis[], id: string): TokenWithAnalysis[] {
  const idx = tokens.findIndex((t) => t.id === id);
  if (idx === -1) return tokens;

  const token = tokens[idx];
  if (!token.memberTexts || token.memberTexts.length <= 1) return tokens;

  const individual: TokenWithAnalysis[] = token.memberTexts.map((text, i) => ({
    id: crypto.randomUUID(),
    sentenceId: token.sentenceId,
    text,
    order: token.order + i,
    partOfSpeech: null,
    wordMeaning: '',
    idiomMeaning: '',
    literalTranslation: '',
    naturalTranslation: '',
  }));

  return [...tokens.slice(0, idx), ...individual, ...tokens.slice(idx + 1)];
}
