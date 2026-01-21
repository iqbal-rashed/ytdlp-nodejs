import { parseJson } from '../src/core/parsers/json';

describe('json parsing', () => {
  test('parses trimmed JSON', () => {
    const value = parseJson<{ ok: boolean }>('  { "ok": true }  ');
    expect(value.ok).toBe(true);
  });

  test('throws on empty input', () => {
    expect(() => parseJson('')).toThrow('Empty JSON output');
  });
});
