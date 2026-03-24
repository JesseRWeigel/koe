import { describe, expect, it } from 'vitest';
import { toRomaji } from './romaji';

describe('toRomaji', () => {
  it('converts basic vowels', () => {
    expect(toRomaji('あいうえお')).toBe('aiueo');
  });

  it('converts basic k-row consonants', () => {
    expect(toRomaji('かきくけこ')).toBe('kakikukeko');
  });

  it('converts dakuten (voiced consonants)', () => {
    expect(toRomaji('がぎぐげご')).toBe('gagigugego');
  });

  it('converts common words', () => {
    expect(toRomaji('たべる')).toBe('taberu');
    expect(toRomaji('のむ')).toBe('nomu');
    expect(toRomaji('はなす')).toBe('hanasu');
  });

  it('converts small kana combos', () => {
    expect(toRomaji('きゃ')).toBe('kya');
    expect(toRomaji('しゅ')).toBe('shu');
    expect(toRomaji('ちょ')).toBe('cho');
  });

  it('converts double consonant (っ)', () => {
    expect(toRomaji('きっと')).toBe('kitto');
    expect(toRomaji('がっこう')).toBe('gakkou');
  });

  it('passes through non-hiragana characters', () => {
    expect(toRomaji('食べる')).toBe('食beru');
  });

  it('returns empty string for empty input', () => {
    expect(toRomaji('')).toBe('');
  });

  it('handles long vowel mark', () => {
    expect(toRomaji('ラーメン')).toBe('ラ-メン');
  });

  it('converts s-row correctly', () => {
    expect(toRomaji('さしすせそ')).toBe('sashisuseso');
  });

  it('converts t-row correctly', () => {
    expect(toRomaji('たちつてと')).toBe('tachitsuteto');
  });

  it('converts handakuten (p-sounds)', () => {
    expect(toRomaji('ぱぴぷぺぽ')).toBe('papipupepo');
  });
});
