import type { RequestPayload } from '@inertiajs/core';

/**
 * ドメインオブジェクトを Inertia の router.post/put 用ペイロードへ変換する。
 *
 * Inertia の RequestPayload は `Record<string, FormDataConvertible>` を要求するが、
 * interface 由来のドメイン型（Token など）は暗黙の index signature を持たないため
 * 構造的に一致しない。値はすべて JSON シリアライズ可能なので、ここで一括変換する。
 */
export function toPayload(data: object): RequestPayload {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- 上記コメント参照（値は JSON シリアライズ可能）
  return data as unknown as RequestPayload;
}
