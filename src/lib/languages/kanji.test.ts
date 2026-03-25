import { describe, expect, it } from 'vitest';
import {
  getRadicals,
  getKanjiByLevel,
  getKanjiByRadical,
  getKanji,
  searchKanji,
  type Radical,
  type KanjiEntry,
} from './kanji';

describe('kanji data', () => {
  describe('getRadicals', () => {
    it('returns an array of radicals', () => {
      const radicals = getRadicals();
      expect(radicals.length).toBeGreaterThan(0);
    });

    it('each radical has required fields', () => {
      const radicals = getRadicals();
      for (const radical of radicals) {
        expect(radical.character).toBeTruthy();
        expect(radical.meaning).toBeTruthy();
        expect(radical.strokeCount).toBeGreaterThan(0);
      }
    });
  });

  describe('getKanjiByLevel', () => {
    it('returns N5 kanji', () => {
      const kanji = getKanjiByLevel('N5');
      expect(kanji.length).toBe(84);
    });

    it('all returned kanji have the requested level', () => {
      const kanji = getKanjiByLevel('N5');
      for (const k of kanji) {
        expect(k.jlptLevel).toBe('N5');
      }
    });

    it('returns empty array for levels with no data', () => {
      const kanji = getKanjiByLevel('N1');
      expect(kanji).toEqual([]);
    });
  });

  describe('getKanjiByRadical', () => {
    it('returns kanji containing a specific radical', () => {
      const kanji = getKanjiByRadical('一');
      expect(kanji.length).toBeGreaterThan(0);
      for (const k of kanji) {
        expect(k.radicals).toContain('一');
      }
    });

    it('returns empty array for unknown radical', () => {
      const kanji = getKanjiByRadical('zzz');
      expect(kanji).toEqual([]);
    });
  });

  describe('getKanji', () => {
    it('returns a specific kanji entry', () => {
      const kanji = getKanji('日');
      expect(kanji).toBeDefined();
      expect(kanji!.character).toBe('日');
      expect(kanji!.meanings).toContain('day');
    });

    it('returns undefined for unknown character', () => {
      expect(getKanji('龘')).toBeUndefined();
    });

    it('has correct structure for a kanji entry', () => {
      const kanji = getKanji('大');
      expect(kanji).toBeDefined();
      expect(kanji!.meanings.length).toBeGreaterThan(0);
      expect(kanji!.readings.on.length).toBeGreaterThan(0);
      expect(kanji!.readings.kun.length).toBeGreaterThan(0);
      expect(kanji!.radicals.length).toBeGreaterThan(0);
      expect(kanji!.strokeCount).toBeGreaterThan(0);
      expect(kanji!.exampleWords.length).toBeGreaterThan(0);
    });
  });

  describe('searchKanji', () => {
    it('finds kanji by English meaning', () => {
      const results = searchKanji('fire');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].character).toBe('火');
    });

    it('finds kanji by partial meaning', () => {
      const results = searchKanji('moun');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].character).toBe('山');
    });

    it('finds kanji by on reading', () => {
      const results = searchKanji('ニチ');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].character).toBe('日');
    });

    it('finds kanji by kun reading', () => {
      const results = searchKanji('やま');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].character).toBe('山');
    });

    it('returns empty array for no matches', () => {
      expect(searchKanji('xyzabc')).toEqual([]);
    });

    it('is case-insensitive for meaning search', () => {
      const results = searchKanji('FIRE');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].character).toBe('火');
    });
  });
});
