export type PitchPattern = "heiban" | "atamadaka" | "nakadaka" | "odaka";

export interface PitchEntry {
  word: string;
  reading: string;
  meaning: string;
  pattern: PitchPattern;
  accentPosition: number; // 0 = heiban, 1 = atamadaka, N = drop after mora N
  morae: string[]; // Split into morae (not characters)
}

/**
 * Split a hiragana/katakana reading into morae.
 * Combination kana (きょ, しゅ, etc.) count as one mora.
 * Small っ, ん count as individual morae.
 */
export function splitMorae(reading: string): string[] {
  const morae: string[] = [];
  const smallKana = "ぁぃぅぇぉゃゅょァィゥェォャュョ";
  for (let i = 0; i < reading.length; i++) {
    const char = reading[i];
    // Check if the next character is a small kana (combo like きょ)
    if (i + 1 < reading.length && smallKana.includes(reading[i + 1])) {
      morae.push(char + reading[i + 1]);
      i++; // skip the small kana
    } else {
      morae.push(char);
    }
  }
  return morae;
}

const pitchData: Omit<PitchEntry, "morae">[] = [
  // Heiban (flat) - accentPosition 0: LH...H
  { word: "桜", reading: "さくら", meaning: "cherry blossom", pattern: "heiban", accentPosition: 0 },
  { word: "友達", reading: "ともだち", meaning: "friend", pattern: "heiban", accentPosition: 0 },
  { word: "お父さん", reading: "おとうさん", meaning: "father", pattern: "heiban", accentPosition: 0 },
  { word: "先生", reading: "せんせい", meaning: "teacher", pattern: "heiban", accentPosition: 0 },
  { word: "兄弟", reading: "きょうだい", meaning: "siblings", pattern: "heiban", accentPosition: 0 },
  { word: "言葉", reading: "ことば", meaning: "word/language", pattern: "heiban", accentPosition: 0 },

  // Atamadaka (head-high) - accentPosition 1: HL...L
  { word: "命", reading: "いのち", meaning: "life", pattern: "atamadaka", accentPosition: 1 },
  { word: "雨", reading: "あめ", meaning: "rain", pattern: "atamadaka", accentPosition: 1 },
  { word: "箸", reading: "はし", meaning: "chopsticks", pattern: "atamadaka", accentPosition: 1 },
  { word: "猫", reading: "ねこ", meaning: "cat", pattern: "atamadaka", accentPosition: 1 },
  { word: "秋", reading: "あき", meaning: "autumn", pattern: "atamadaka", accentPosition: 1 },

  // Nakadaka (middle-high) - accentPosition N (2+): LH...HL
  { word: "男", reading: "おとこ", meaning: "man", pattern: "nakadaka", accentPosition: 2 },
  { word: "卵", reading: "たまご", meaning: "egg", pattern: "nakadaka", accentPosition: 2 },
  { word: "頭", reading: "あたま", meaning: "head", pattern: "nakadaka", accentPosition: 1 },
  { word: "切手", reading: "きって", meaning: "postage stamp", pattern: "nakadaka", accentPosition: 2 },
  { word: "お姉さん", reading: "おねえさん", meaning: "older sister", pattern: "nakadaka", accentPosition: 3 },

  // Odaka (tail-high) - accentPosition = last mora: LH...H(L on particle)
  { word: "鼻", reading: "はな", meaning: "nose", pattern: "odaka", accentPosition: 2 },
  { word: "妹", reading: "いもうと", meaning: "younger sister", pattern: "odaka", accentPosition: 4 },
  { word: "弟", reading: "おとうと", meaning: "younger brother", pattern: "odaka", accentPosition: 4 },
  { word: "山", reading: "やま", meaning: "mountain", pattern: "odaka", accentPosition: 2 },
  { word: "海", reading: "うみ", meaning: "sea", pattern: "odaka", accentPosition: 2 },
];

const entries: PitchEntry[] = pitchData.map((item) => ({
  ...item,
  morae: splitMorae(item.reading),
}));

export function getPitchEntries(): PitchEntry[] {
  return entries;
}

export function getPitchByPattern(pattern: PitchPattern): PitchEntry[] {
  return entries.filter((e) => e.pattern === pattern);
}

export function getPitchForWord(word: string): PitchEntry | undefined {
  return entries.find((e) => e.word === word || e.reading === word);
}
