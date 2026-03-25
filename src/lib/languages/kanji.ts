export interface Radical {
  character: string;
  meaning: string;
  strokeCount: number;
}

export interface KanjiEntry {
  character: string;
  meanings: string[];
  readings: { on: string[]; kun: string[] };
  radicals: string[];
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  strokeCount: number;
  exampleWords: { word: string; reading: string; meaning: string }[];
}

const radicals: Radical[] = [
  { character: '一', meaning: 'one', strokeCount: 1 },
  { character: '丨', meaning: 'line', strokeCount: 1 },
  { character: '丶', meaning: 'dot', strokeCount: 1 },
  { character: '丿', meaning: 'slash', strokeCount: 1 },
  { character: '乙', meaning: 'second', strokeCount: 1 },
  { character: '亅', meaning: 'hook', strokeCount: 1 },
  { character: '二', meaning: 'two', strokeCount: 2 },
  { character: '人', meaning: 'person', strokeCount: 2 },
  { character: '儿', meaning: 'legs', strokeCount: 2 },
  { character: '入', meaning: 'enter', strokeCount: 2 },
  { character: '八', meaning: 'eight', strokeCount: 2 },
  { character: '冂', meaning: 'down box', strokeCount: 2 },
  { character: '十', meaning: 'ten', strokeCount: 2 },
  { character: '口', meaning: 'mouth', strokeCount: 3 },
  { character: '土', meaning: 'earth', strokeCount: 3 },
  { character: '大', meaning: 'big', strokeCount: 3 },
  { character: '女', meaning: 'woman', strokeCount: 3 },
  { character: '山', meaning: 'mountain', strokeCount: 3 },
  { character: '川', meaning: 'river', strokeCount: 3 },
  { character: '日', meaning: 'sun', strokeCount: 4 },
  { character: '月', meaning: 'moon', strokeCount: 4 },
  { character: '木', meaning: 'tree', strokeCount: 4 },
  { character: '水', meaning: 'water', strokeCount: 4 },
  { character: '火', meaning: 'fire', strokeCount: 4 },
  { character: '田', meaning: 'rice field', strokeCount: 5 },
  { character: '目', meaning: 'eye', strokeCount: 5 },
  { character: '手', meaning: 'hand', strokeCount: 4 },
  { character: '足', meaning: 'foot', strokeCount: 7 },
  { character: '金', meaning: 'gold', strokeCount: 8 },
  { character: '小', meaning: 'small', strokeCount: 3 },
];

const kanjiData: KanjiEntry[] = [
  {
    character: '一',
    meanings: ['one'],
    readings: { on: ['イチ', 'イツ'], kun: ['ひと', 'ひとつ'] },
    radicals: ['一'],
    jlptLevel: 'N5',
    strokeCount: 1,
    exampleWords: [
      { word: '一つ', reading: 'ひとつ', meaning: 'one thing' },
      { word: '一人', reading: 'ひとり', meaning: 'one person' },
    ],
  },
  {
    character: '二',
    meanings: ['two'],
    readings: { on: ['ニ'], kun: ['ふた', 'ふたつ'] },
    radicals: ['二'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '二つ', reading: 'ふたつ', meaning: 'two things' },
      { word: '二人', reading: 'ふたり', meaning: 'two people' },
    ],
  },
  {
    character: '三',
    meanings: ['three'],
    readings: { on: ['サン'], kun: ['み', 'みつ', 'みっつ'] },
    radicals: ['一'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '三つ', reading: 'みっつ', meaning: 'three things' },
      { word: '三人', reading: 'さんにん', meaning: 'three people' },
    ],
  },
  {
    character: '大',
    meanings: ['big', 'large'],
    readings: { on: ['ダイ', 'タイ'], kun: ['おお', 'おおきい'] },
    radicals: ['大'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '大きい', reading: 'おおきい', meaning: 'big' },
      { word: '大学', reading: 'だいがく', meaning: 'university' },
    ],
  },
  {
    character: '小',
    meanings: ['small', 'little'],
    readings: { on: ['ショウ'], kun: ['ちい', 'ちいさい', 'こ'] },
    radicals: ['小'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '小さい', reading: 'ちいさい', meaning: 'small' },
      { word: '小学校', reading: 'しょうがっこう', meaning: 'elementary school' },
    ],
  },
  {
    character: '日',
    meanings: ['day', 'sun'],
    readings: { on: ['ニチ', 'ジツ'], kun: ['ひ', 'か'] },
    radicals: ['日'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' },
      { word: '毎日', reading: 'まいにち', meaning: 'every day' },
    ],
  },
  {
    character: '月',
    meanings: ['month', 'moon'],
    readings: { on: ['ゲツ', 'ガツ'], kun: ['つき'] },
    radicals: ['月'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
      { word: '一月', reading: 'いちがつ', meaning: 'January' },
    ],
  },
  {
    character: '火',
    meanings: ['fire'],
    readings: { on: ['カ'], kun: ['ひ', 'ほ'] },
    radicals: ['火'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '火曜日', reading: 'かようび', meaning: 'Tuesday' },
      { word: '花火', reading: 'はなび', meaning: 'fireworks' },
    ],
  },
  {
    character: '水',
    meanings: ['water'],
    readings: { on: ['スイ'], kun: ['みず'] },
    radicals: ['水'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
      { word: 'お水', reading: 'おみず', meaning: 'water (polite)' },
    ],
  },
  {
    character: '木',
    meanings: ['tree', 'wood'],
    readings: { on: ['モク', 'ボク'], kun: ['き', 'こ'] },
    radicals: ['木'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '木曜日', reading: 'もくようび', meaning: 'Thursday' },
      { word: '木', reading: 'き', meaning: 'tree' },
    ],
  },
  {
    character: '金',
    meanings: ['gold', 'money', 'metal'],
    readings: { on: ['キン', 'コン'], kun: ['かね', 'かな'] },
    radicals: ['金'],
    jlptLevel: 'N5',
    strokeCount: 8,
    exampleWords: [
      { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
      { word: 'お金', reading: 'おかね', meaning: 'money' },
    ],
  },
  {
    character: '土',
    meanings: ['earth', 'soil', 'ground'],
    readings: { on: ['ド', 'ト'], kun: ['つち'] },
    radicals: ['土'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '土曜日', reading: 'どようび', meaning: 'Saturday' },
      { word: '土地', reading: 'とち', meaning: 'land' },
    ],
  },
  {
    character: '人',
    meanings: ['person', 'people'],
    readings: { on: ['ジン', 'ニン'], kun: ['ひと'] },
    radicals: ['人'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '人', reading: 'ひと', meaning: 'person' },
      { word: '日本人', reading: 'にほんじん', meaning: 'Japanese person' },
    ],
  },
  {
    character: '口',
    meanings: ['mouth', 'opening'],
    readings: { on: ['コウ', 'ク'], kun: ['くち'] },
    radicals: ['口'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '口', reading: 'くち', meaning: 'mouth' },
      { word: '入口', reading: 'いりぐち', meaning: 'entrance' },
    ],
  },
  {
    character: '目',
    meanings: ['eye'],
    readings: { on: ['モク', 'ボク'], kun: ['め', 'ま'] },
    radicals: ['目'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '目', reading: 'め', meaning: 'eye' },
      { word: '目的', reading: 'もくてき', meaning: 'purpose' },
    ],
  },
  {
    character: '手',
    meanings: ['hand'],
    readings: { on: ['シュ'], kun: ['て', 'た'] },
    radicals: ['手'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '手', reading: 'て', meaning: 'hand' },
      { word: '上手', reading: 'じょうず', meaning: 'skilled' },
    ],
  },
  {
    character: '足',
    meanings: ['foot', 'leg', 'sufficient'],
    readings: { on: ['ソク'], kun: ['あし', 'たりる', 'たす'] },
    radicals: ['口', '足'],
    jlptLevel: 'N5',
    strokeCount: 7,
    exampleWords: [
      { word: '足', reading: 'あし', meaning: 'foot/leg' },
      { word: '不足', reading: 'ふそく', meaning: 'shortage' },
    ],
  },
  {
    character: '山',
    meanings: ['mountain'],
    readings: { on: ['サン'], kun: ['やま'] },
    radicals: ['山'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '山', reading: 'やま', meaning: 'mountain' },
      { word: '富士山', reading: 'ふじさん', meaning: 'Mt. Fuji' },
    ],
  },
  {
    character: '川',
    meanings: ['river'],
    readings: { on: ['セン'], kun: ['かわ'] },
    radicals: ['川'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '川', reading: 'かわ', meaning: 'river' },
      { word: '小川', reading: 'おがわ', meaning: 'stream' },
    ],
  },
  {
    character: '田',
    meanings: ['rice field', 'rice paddy'],
    readings: { on: ['デン'], kun: ['た'] },
    radicals: ['田'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '田んぼ', reading: 'たんぼ', meaning: 'rice paddy' },
      { word: '田中', reading: 'たなか', meaning: 'Tanaka (surname)' },
    ],
  },
];

export function getRadicals(): Radical[] {
  return radicals;
}

export function getKanjiByLevel(level: string): KanjiEntry[] {
  return kanjiData.filter((k) => k.jlptLevel === level);
}

export function getKanjiByRadical(radical: string): KanjiEntry[] {
  return kanjiData.filter((k) => k.radicals.includes(radical));
}

export function getKanji(character: string): KanjiEntry | undefined {
  return kanjiData.find((k) => k.character === character);
}

export function searchKanji(query: string): KanjiEntry[] {
  const lowerQuery = query.toLowerCase();
  return kanjiData.filter((k) => {
    // Search by meaning
    if (k.meanings.some((m) => m.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    // Search by on reading
    if (k.readings.on.some((r) => r.includes(query))) {
      return true;
    }
    // Search by kun reading
    if (k.readings.kun.some((r) => r.includes(query))) {
      return true;
    }
    return false;
  });
}
