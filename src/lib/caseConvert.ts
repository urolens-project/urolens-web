/**
 * Recursive key-case conversion for the HTTP boundary.
 *
 * The backend (`urolens-backend`, camelCase convention since the naming-standard
 * migration) speaks camelCase for every schema-defined field. The frontend was
 * written against the earlier snake_case API. Rather than rename ~800 field
 * references across the app, we translate at the edge: outbound request bodies
 * and query params snake -> camel, inbound response bodies camel -> snake.
 *
 * Only plain objects and arrays are walked. Blobs, FormData, Dates, etc. pass
 * through untouched so binary uploads (annotation images, microscopy) are safe.
 * Keys that carry no separator/casing to convert (single words, already-snake
 * JSONB payload keys like `weighted_score`) are left as-is by construction.
 */

const snakeToCamelKey = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

// Only inserts an underscore at a real lower-to-upper boundary, so a run of
// capitals (an acronym like RBC, or ID in userID) stays together instead of
// getting split letter-by-letter — the old /([A-Z])/g version turned RBC
// into _r_b_c, userID into user_i_d, and Bacteria into _bacteria.
const camelToSnakeKey = (key: string): string =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function convertKeys<T>(input: T, convertKey: (key: string) => string): T {
  if (Array.isArray(input)) {
    return input.map((item) => convertKeys(item, convertKey)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      out[convertKey(key)] = convertKeys(value, convertKey);
    }
    return out as T;
  }
  return input;
}

/** Deep snake_case -> camelCase (outbound: request bodies / params). */
export const keysToCamel = <T>(input: T): T => convertKeys(input, snakeToCamelKey);

/** Deep camelCase -> snake_case (inbound: response bodies). */
export const keysToSnake = <T>(input: T): T => convertKeys(input, camelToSnakeKey);
