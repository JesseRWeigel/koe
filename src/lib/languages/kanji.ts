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
  { character: '刀', meaning: 'knife', strokeCount: 2 },
  { character: '力', meaning: 'power', strokeCount: 2 },
  { character: '又', meaning: 'again', strokeCount: 2 },
  { character: '口', meaning: 'mouth', strokeCount: 3 },
  { character: '土', meaning: 'earth', strokeCount: 3 },
  { character: '大', meaning: 'big', strokeCount: 3 },
  { character: '女', meaning: 'woman', strokeCount: 3 },
  { character: '子', meaning: 'child', strokeCount: 3 },
  { character: '寸', meaning: 'inch', strokeCount: 3 },
  { character: '山', meaning: 'mountain', strokeCount: 3 },
  { character: '川', meaning: 'river', strokeCount: 3 },
  { character: '工', meaning: 'work', strokeCount: 3 },
  { character: '己', meaning: 'self', strokeCount: 3 },
  { character: '干', meaning: 'dry', strokeCount: 3 },
  { character: '弓', meaning: 'bow', strokeCount: 3 },
  { character: '日', meaning: 'sun', strokeCount: 4 },
  { character: '月', meaning: 'moon', strokeCount: 4 },
  { character: '木', meaning: 'tree', strokeCount: 4 },
  { character: '水', meaning: 'water', strokeCount: 4 },
  { character: '火', meaning: 'fire', strokeCount: 4 },
  { character: '父', meaning: 'father', strokeCount: 4 },
  { character: '牛', meaning: 'cow', strokeCount: 4 },
  { character: '王', meaning: 'king', strokeCount: 4 },
  { character: '心', meaning: 'heart', strokeCount: 4 },
  { character: '戈', meaning: 'halberd', strokeCount: 4 },
  { character: '方', meaning: 'direction', strokeCount: 4 },
  { character: '欠', meaning: 'lack', strokeCount: 4 },
  { character: '田', meaning: 'rice field', strokeCount: 5 },
  { character: '目', meaning: 'eye', strokeCount: 5 },
  { character: '白', meaning: 'white', strokeCount: 5 },
  { character: '立', meaning: 'stand', strokeCount: 5 },
  { character: '手', meaning: 'hand', strokeCount: 4 },
  { character: '足', meaning: 'foot', strokeCount: 7 },
  { character: '金', meaning: 'gold', strokeCount: 8 },
  { character: '小', meaning: 'small', strokeCount: 3 },
  { character: '言', meaning: 'say', strokeCount: 7 },
  { character: '車', meaning: 'car', strokeCount: 7 },
  { character: '門', meaning: 'gate', strokeCount: 8 },
  { character: '雨', meaning: 'rain', strokeCount: 8 },
  { character: '食', meaning: 'eat', strokeCount: 9 },
  { character: '馬', meaning: 'horse', strokeCount: 10 },
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
    readings: { on: ['モク'], kun: ['め', 'ま'] },
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
  // Numbers
  {
    character: '四',
    meanings: ['four'],
    readings: { on: ['シ'], kun: ['よ', 'よつ', 'よっつ'] },
    radicals: ['口'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '四つ', reading: 'よっつ', meaning: 'four things' },
      { word: '四月', reading: 'しがつ', meaning: 'April' },
    ],
  },
  {
    character: '五',
    meanings: ['five'],
    readings: { on: ['ゴ'], kun: ['いつ', 'いつつ'] },
    radicals: ['二'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '五つ', reading: 'いつつ', meaning: 'five things' },
      { word: '五月', reading: 'ごがつ', meaning: 'May' },
    ],
  },
  {
    character: '六',
    meanings: ['six'],
    readings: { on: ['ロク'], kun: ['む', 'むつ', 'むっつ'] },
    radicals: ['八'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '六つ', reading: 'むっつ', meaning: 'six things' },
      { word: '六月', reading: 'ろくがつ', meaning: 'June' },
    ],
  },
  {
    character: '七',
    meanings: ['seven'],
    readings: { on: ['シチ'], kun: ['なな', 'ななつ'] },
    radicals: ['一'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '七つ', reading: 'ななつ', meaning: 'seven things' },
      { word: '七月', reading: 'しちがつ', meaning: 'July' },
    ],
  },
  {
    character: '八',
    meanings: ['eight'],
    readings: { on: ['ハチ'], kun: ['や', 'やつ', 'やっつ'] },
    radicals: ['八'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '八つ', reading: 'やっつ', meaning: 'eight things' },
      { word: '八月', reading: 'はちがつ', meaning: 'August' },
    ],
  },
  {
    character: '九',
    meanings: ['nine'],
    readings: { on: ['キュウ', 'ク'], kun: ['ここの', 'ここのつ'] },
    radicals: ['乙'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '九つ', reading: 'ここのつ', meaning: 'nine things' },
      { word: '九月', reading: 'くがつ', meaning: 'September' },
    ],
  },
  {
    character: '十',
    meanings: ['ten'],
    readings: { on: ['ジュウ', 'ジッ'], kun: ['とお', 'と'] },
    radicals: ['十'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '十', reading: 'じゅう', meaning: 'ten' },
      { word: '二十歳', reading: 'はたち', meaning: 'twenty years old' },
    ],
  },
  {
    character: '百',
    meanings: ['hundred'],
    readings: { on: ['ヒャク', 'ビャク'], kun: [] },
    radicals: ['一', '白'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '百', reading: 'ひゃく', meaning: 'hundred' },
      { word: '三百', reading: 'さんびゃく', meaning: 'three hundred' },
    ],
  },
  {
    character: '千',
    meanings: ['thousand'],
    readings: { on: ['セン'], kun: ['ち'] },
    radicals: ['十'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '千', reading: 'せん', meaning: 'thousand' },
      { word: '三千', reading: 'さんぜん', meaning: 'three thousand' },
    ],
  },
  {
    character: '万',
    meanings: ['ten thousand'],
    readings: { on: ['マン', 'バン'], kun: [] },
    radicals: ['一'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '一万', reading: 'いちまん', meaning: 'ten thousand' },
      { word: '万年筆', reading: 'まんねんひつ', meaning: 'fountain pen' },
    ],
  },
  // Time/Calendar
  {
    character: '年',
    meanings: ['year'],
    readings: { on: ['ネン'], kun: ['とし'] },
    radicals: ['干'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '今年', reading: 'ことし', meaning: 'this year' },
      { word: '去年', reading: 'きょねん', meaning: 'last year' },
      { word: '一年', reading: 'いちねん', meaning: 'one year' },
    ],
  },
  {
    character: '時',
    meanings: ['time', 'hour'],
    readings: { on: ['ジ'], kun: ['とき'] },
    radicals: ['日', '寸'],
    jlptLevel: 'N5',
    strokeCount: 10,
    exampleWords: [
      { word: '時間', reading: 'じかん', meaning: 'time' },
      { word: '一時', reading: 'いちじ', meaning: 'one o\'clock' },
      { word: '時々', reading: 'ときどき', meaning: 'sometimes' },
    ],
  },
  {
    character: '半',
    meanings: ['half'],
    readings: { on: ['ハン'], kun: ['なか'] },
    radicals: ['十', '二'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '半分', reading: 'はんぶん', meaning: 'half' },
      { word: '三時半', reading: 'さんじはん', meaning: 'three thirty' },
    ],
  },
  {
    character: '午',
    meanings: ['noon'],
    readings: { on: ['ゴ'], kun: [] },
    radicals: ['十'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '午前', reading: 'ごぜん', meaning: 'morning / AM' },
      { word: '午後', reading: 'ごご', meaning: 'afternoon / PM' },
    ],
  },
  {
    character: '今',
    meanings: ['now', 'present'],
    readings: { on: ['コン', 'キン'], kun: ['いま'] },
    radicals: ['人'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '今', reading: 'いま', meaning: 'now' },
      { word: '今日', reading: 'きょう', meaning: 'today' },
      { word: '今年', reading: 'ことし', meaning: 'this year' },
    ],
  },
  {
    character: '先',
    meanings: ['previous', 'ahead', 'tip'],
    readings: { on: ['セン'], kun: ['さき'] },
    radicals: ['儿'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '先生', reading: 'せんせい', meaning: 'teacher' },
      { word: '先週', reading: 'せんしゅう', meaning: 'last week' },
    ],
  },
  {
    character: '後',
    meanings: ['behind', 'after', 'later'],
    readings: { on: ['ゴ', 'コウ'], kun: ['あと', 'うし'] },
    radicals: ['彳'],
    jlptLevel: 'N5',
    strokeCount: 9,
    exampleWords: [
      { word: '午後', reading: 'ごご', meaning: 'afternoon' },
      { word: '後ろ', reading: 'うしろ', meaning: 'behind' },
    ],
  },
  {
    character: '毎',
    meanings: ['every', 'each'],
    readings: { on: ['マイ'], kun: ['ごと'] },
    radicals: ['母'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '毎日', reading: 'まいにち', meaning: 'every day' },
      { word: '毎週', reading: 'まいしゅう', meaning: 'every week' },
    ],
  },
  {
    character: '間',
    meanings: ['interval', 'between', 'space'],
    readings: { on: ['カン', 'ケン'], kun: ['あいだ', 'ま'] },
    radicals: ['門', '日'],
    jlptLevel: 'N5',
    strokeCount: 12,
    exampleWords: [
      { word: '時間', reading: 'じかん', meaning: 'time' },
      { word: '間', reading: 'あいだ', meaning: 'between' },
    ],
  },
  // Directions/Position
  {
    character: '上',
    meanings: ['up', 'above', 'upper'],
    readings: { on: ['ジョウ', 'ショウ'], kun: ['うえ', 'あ', 'のぼ', 'かみ'] },
    radicals: ['一'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '上', reading: 'うえ', meaning: 'above' },
      { word: '上手', reading: 'じょうず', meaning: 'skilled' },
    ],
  },
  {
    character: '下',
    meanings: ['down', 'below', 'lower'],
    readings: { on: ['カ', 'ゲ'], kun: ['した', 'さ', 'くだ', 'お'] },
    radicals: ['一'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '下', reading: 'した', meaning: 'below' },
      { word: '下手', reading: 'へた', meaning: 'unskilled' },
    ],
  },
  {
    character: '中',
    meanings: ['middle', 'inside', 'center'],
    readings: { on: ['チュウ'], kun: ['なか'] },
    radicals: ['丨', '口'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '中', reading: 'なか', meaning: 'inside' },
      { word: '中国', reading: 'ちゅうごく', meaning: 'China' },
    ],
  },
  {
    character: '左',
    meanings: ['left'],
    readings: { on: ['サ'], kun: ['ひだり'] },
    radicals: ['工'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '左', reading: 'ひだり', meaning: 'left' },
      { word: '左手', reading: 'ひだりて', meaning: 'left hand' },
    ],
  },
  {
    character: '右',
    meanings: ['right'],
    readings: { on: ['ウ', 'ユウ'], kun: ['みぎ'] },
    radicals: ['口'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '右', reading: 'みぎ', meaning: 'right' },
      { word: '右手', reading: 'みぎて', meaning: 'right hand' },
    ],
  },
  {
    character: '北',
    meanings: ['north'],
    readings: { on: ['ホク'], kun: ['きた'] },
    radicals: ['匕'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '北', reading: 'きた', meaning: 'north' },
      { word: '北海道', reading: 'ほっかいどう', meaning: 'Hokkaido' },
    ],
  },
  {
    character: '南',
    meanings: ['south'],
    readings: { on: ['ナン', 'ナ'], kun: ['みなみ'] },
    radicals: ['十', '冂'],
    jlptLevel: 'N5',
    strokeCount: 9,
    exampleWords: [
      { word: '南', reading: 'みなみ', meaning: 'south' },
      { word: '南口', reading: 'みなみぐち', meaning: 'south exit' },
    ],
  },
  {
    character: '東',
    meanings: ['east'],
    readings: { on: ['トウ'], kun: ['ひがし'] },
    radicals: ['木', '日'],
    jlptLevel: 'N5',
    strokeCount: 8,
    exampleWords: [
      { word: '東', reading: 'ひがし', meaning: 'east' },
      { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
    ],
  },
  {
    character: '西',
    meanings: ['west'],
    readings: { on: ['セイ', 'サイ'], kun: ['にし'] },
    radicals: ['西'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '西', reading: 'にし', meaning: 'west' },
      { word: '西口', reading: 'にしぐち', meaning: 'west exit' },
    ],
  },
  {
    character: '前',
    meanings: ['before', 'in front of'],
    readings: { on: ['ゼン'], kun: ['まえ'] },
    radicals: ['刀', '月'],
    jlptLevel: 'N5',
    strokeCount: 9,
    exampleWords: [
      { word: '前', reading: 'まえ', meaning: 'front / before' },
      { word: '名前', reading: 'なまえ', meaning: 'name' },
    ],
  },
  {
    character: '外',
    meanings: ['outside', 'foreign'],
    readings: { on: ['ガイ', 'ゲ'], kun: ['そと', 'ほか', 'はず'] },
    radicals: ['夕'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '外', reading: 'そと', meaning: 'outside' },
      { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
    ],
  },
  // People/Body
  {
    character: '女',
    meanings: ['woman', 'female'],
    readings: { on: ['ジョ', 'ニョ'], kun: ['おんな'] },
    radicals: ['女'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '女の人', reading: 'おんなのひと', meaning: 'woman' },
      { word: '女子', reading: 'じょし', meaning: 'girl / woman' },
    ],
  },
  {
    character: '子',
    meanings: ['child'],
    readings: { on: ['シ', 'ス'], kun: ['こ'] },
    radicals: ['子'],
    jlptLevel: 'N5',
    strokeCount: 3,
    exampleWords: [
      { word: '子供', reading: 'こども', meaning: 'child' },
      { word: '女の子', reading: 'おんなのこ', meaning: 'girl' },
    ],
  },
  {
    character: '父',
    meanings: ['father'],
    readings: { on: ['フ'], kun: ['ちち'] },
    radicals: ['父'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '父', reading: 'ちち', meaning: 'father' },
      { word: 'お父さん', reading: 'おとうさん', meaning: 'father (polite)' },
    ],
  },
  {
    character: '母',
    meanings: ['mother'],
    readings: { on: ['ボ'], kun: ['はは'] },
    radicals: ['母'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '母', reading: 'はは', meaning: 'mother' },
      { word: 'お母さん', reading: 'おかあさん', meaning: 'mother (polite)' },
    ],
  },
  {
    character: '男',
    meanings: ['man', 'male'],
    readings: { on: ['ダン', 'ナン'], kun: ['おとこ'] },
    radicals: ['田', '力'],
    jlptLevel: 'N5',
    strokeCount: 7,
    exampleWords: [
      { word: '男の人', reading: 'おとこのひと', meaning: 'man' },
      { word: '男子', reading: 'だんし', meaning: 'boy / man' },
    ],
  },
  {
    character: '友',
    meanings: ['friend'],
    readings: { on: ['ユウ'], kun: ['とも'] },
    radicals: ['又'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '友達', reading: 'ともだち', meaning: 'friend' },
      { word: '友人', reading: 'ゆうじん', meaning: 'friend (formal)' },
    ],
  },
  // Actions
  {
    character: '入',
    meanings: ['enter', 'insert'],
    readings: { on: ['ニュウ'], kun: ['い', 'はい'] },
    radicals: ['入'],
    jlptLevel: 'N5',
    strokeCount: 2,
    exampleWords: [
      { word: '入口', reading: 'いりぐち', meaning: 'entrance' },
      { word: '入る', reading: 'はいる', meaning: 'to enter' },
    ],
  },
  {
    character: '出',
    meanings: ['exit', 'go out', 'put out'],
    readings: { on: ['シュツ', 'スイ'], kun: ['で', 'だ'] },
    radicals: ['山'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '出口', reading: 'でぐち', meaning: 'exit' },
      { word: '出る', reading: 'でる', meaning: 'to go out' },
    ],
  },
  {
    character: '行',
    meanings: ['go', 'carry out'],
    readings: { on: ['コウ', 'ギョウ'], kun: ['い', 'ゆ', 'おこな'] },
    radicals: ['彳'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '行く', reading: 'いく', meaning: 'to go' },
      { word: '銀行', reading: 'ぎんこう', meaning: 'bank' },
    ],
  },
  {
    character: '来',
    meanings: ['come', 'next'],
    readings: { on: ['ライ'], kun: ['く', 'きた', 'こ'] },
    radicals: ['木'],
    jlptLevel: 'N5',
    strokeCount: 7,
    exampleWords: [
      { word: '来る', reading: 'くる', meaning: 'to come' },
      { word: '来年', reading: 'らいねん', meaning: 'next year' },
      { word: '来週', reading: 'らいしゅう', meaning: 'next week' },
    ],
  },
  {
    character: '見',
    meanings: ['see', 'look'],
    readings: { on: ['ケン'], kun: ['み'] },
    radicals: ['目', '儿'],
    jlptLevel: 'N5',
    strokeCount: 7,
    exampleWords: [
      { word: '見る', reading: 'みる', meaning: 'to see' },
      { word: '花見', reading: 'はなみ', meaning: 'flower viewing' },
    ],
  },
  {
    character: '聞',
    meanings: ['hear', 'ask', 'listen'],
    readings: { on: ['ブン', 'モン'], kun: ['き'] },
    radicals: ['門', '耳'],
    jlptLevel: 'N5',
    strokeCount: 14,
    exampleWords: [
      { word: '聞く', reading: 'きく', meaning: 'to listen / to ask' },
      { word: '新聞', reading: 'しんぶん', meaning: 'newspaper' },
    ],
  },
  {
    character: '読',
    meanings: ['read'],
    readings: { on: ['ドク', 'トク'], kun: ['よ'] },
    radicals: ['言'],
    jlptLevel: 'N5',
    strokeCount: 14,
    exampleWords: [
      { word: '読む', reading: 'よむ', meaning: 'to read' },
      { word: '読書', reading: 'どくしょ', meaning: 'reading (books)' },
    ],
  },
  {
    character: '書',
    meanings: ['write'],
    readings: { on: ['ショ'], kun: ['か'] },
    radicals: ['日'],
    jlptLevel: 'N5',
    strokeCount: 10,
    exampleWords: [
      { word: '書く', reading: 'かく', meaning: 'to write' },
      { word: '辞書', reading: 'じしょ', meaning: 'dictionary' },
    ],
  },
  {
    character: '話',
    meanings: ['talk', 'speak', 'story'],
    readings: { on: ['ワ'], kun: ['はな', 'はなし'] },
    radicals: ['言'],
    jlptLevel: 'N5',
    strokeCount: 13,
    exampleWords: [
      { word: '話す', reading: 'はなす', meaning: 'to speak' },
      { word: '電話', reading: 'でんわ', meaning: 'telephone' },
    ],
  },
  {
    character: '食',
    meanings: ['eat', 'food'],
    readings: { on: ['ショク', 'ジキ'], kun: ['た', 'く'] },
    radicals: ['食'],
    jlptLevel: 'N5',
    strokeCount: 9,
    exampleWords: [
      { word: '食べる', reading: 'たべる', meaning: 'to eat' },
      { word: '食事', reading: 'しょくじ', meaning: 'meal' },
    ],
  },
  {
    character: '休',
    meanings: ['rest', 'take a break'],
    readings: { on: ['キュウ'], kun: ['やす'] },
    radicals: ['人', '木'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '休む', reading: 'やすむ', meaning: 'to rest' },
      { word: '休日', reading: 'きゅうじつ', meaning: 'holiday' },
    ],
  },
  {
    character: '生',
    meanings: ['life', 'birth', 'raw'],
    readings: { on: ['セイ', 'ショウ'], kun: ['い', 'う', 'なま'] },
    radicals: ['生'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '先生', reading: 'せんせい', meaning: 'teacher' },
      { word: '学生', reading: 'がくせい', meaning: 'student' },
      { word: '生まれる', reading: 'うまれる', meaning: 'to be born' },
    ],
  },
  // Descriptors
  {
    character: '長',
    meanings: ['long', 'leader', 'chief'],
    readings: { on: ['チョウ'], kun: ['なが'] },
    radicals: ['長'],
    jlptLevel: 'N5',
    strokeCount: 8,
    exampleWords: [
      { word: '長い', reading: 'ながい', meaning: 'long' },
      { word: '社長', reading: 'しゃちょう', meaning: 'company president' },
    ],
  },
  {
    character: '高',
    meanings: ['tall', 'high', 'expensive'],
    readings: { on: ['コウ'], kun: ['たか'] },
    radicals: ['口', '高'],
    jlptLevel: 'N5',
    strokeCount: 10,
    exampleWords: [
      { word: '高い', reading: 'たかい', meaning: 'tall / expensive' },
      { word: '高校', reading: 'こうこう', meaning: 'high school' },
    ],
  },
  {
    character: '白',
    meanings: ['white'],
    readings: { on: ['ハク', 'ビャク'], kun: ['しろ', 'しら'] },
    radicals: ['白'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '白い', reading: 'しろい', meaning: 'white' },
      { word: '白人', reading: 'はくじん', meaning: 'Caucasian' },
    ],
  },
  {
    character: '天',
    meanings: ['heaven', 'sky'],
    readings: { on: ['テン'], kun: ['あめ', 'あま'] },
    radicals: ['大'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '天気', reading: 'てんき', meaning: 'weather' },
      { word: '天国', reading: 'てんごく', meaning: 'heaven' },
    ],
  },
  {
    character: '気',
    meanings: ['spirit', 'air', 'mood'],
    readings: { on: ['キ', 'ケ'], kun: [] },
    radicals: ['气'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '天気', reading: 'てんき', meaning: 'weather' },
      { word: '元気', reading: 'げんき', meaning: 'energetic / healthy' },
      { word: '気持ち', reading: 'きもち', meaning: 'feeling' },
    ],
  },
  // Objects/Other
  {
    character: '本',
    meanings: ['book', 'origin', 'main'],
    readings: { on: ['ホン'], kun: ['もと'] },
    radicals: ['木'],
    jlptLevel: 'N5',
    strokeCount: 5,
    exampleWords: [
      { word: '本', reading: 'ほん', meaning: 'book' },
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
    ],
  },
  {
    character: '車',
    meanings: ['car', 'vehicle'],
    readings: { on: ['シャ'], kun: ['くるま'] },
    radicals: ['車'],
    jlptLevel: 'N5',
    strokeCount: 7,
    exampleWords: [
      { word: '車', reading: 'くるま', meaning: 'car' },
      { word: '電車', reading: 'でんしゃ', meaning: 'train' },
    ],
  },
  {
    character: '学',
    meanings: ['study', 'learning'],
    readings: { on: ['ガク'], kun: ['まな'] },
    radicals: ['子'],
    jlptLevel: 'N5',
    strokeCount: 8,
    exampleWords: [
      { word: '学生', reading: 'がくせい', meaning: 'student' },
      { word: '大学', reading: 'だいがく', meaning: 'university' },
    ],
  },
  {
    character: '校',
    meanings: ['school'],
    readings: { on: ['コウ'], kun: [] },
    radicals: ['木'],
    jlptLevel: 'N5',
    strokeCount: 10,
    exampleWords: [
      { word: '学校', reading: 'がっこう', meaning: 'school' },
      { word: '高校', reading: 'こうこう', meaning: 'high school' },
    ],
  },
  {
    character: '国',
    meanings: ['country'],
    readings: { on: ['コク'], kun: ['くに'] },
    radicals: ['口', '玉'],
    jlptLevel: 'N5',
    strokeCount: 8,
    exampleWords: [
      { word: '国', reading: 'くに', meaning: 'country' },
      { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
    ],
  },
  {
    character: '名',
    meanings: ['name', 'famous'],
    readings: { on: ['メイ', 'ミョウ'], kun: ['な'] },
    radicals: ['口', '夕'],
    jlptLevel: 'N5',
    strokeCount: 6,
    exampleWords: [
      { word: '名前', reading: 'なまえ', meaning: 'name' },
      { word: '有名', reading: 'ゆうめい', meaning: 'famous' },
    ],
  },
  {
    character: '語',
    meanings: ['language', 'word'],
    readings: { on: ['ゴ'], kun: ['かた'] },
    radicals: ['言', '口'],
    jlptLevel: 'N5',
    strokeCount: 14,
    exampleWords: [
      { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
      { word: '英語', reading: 'えいご', meaning: 'English language' },
    ],
  },
  {
    character: '円',
    meanings: ['circle', 'yen'],
    readings: { on: ['エン'], kun: ['まる'] },
    radicals: ['冂'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '百円', reading: 'ひゃくえん', meaning: 'one hundred yen' },
      { word: '千円', reading: 'せんえん', meaning: 'one thousand yen' },
    ],
  },
  {
    character: '雨',
    meanings: ['rain'],
    readings: { on: ['ウ'], kun: ['あめ', 'あま'] },
    radicals: ['雨'],
    jlptLevel: 'N5',
    strokeCount: 8,
    exampleWords: [
      { word: '雨', reading: 'あめ', meaning: 'rain' },
      { word: '大雨', reading: 'おおあめ', meaning: 'heavy rain' },
    ],
  },
  {
    character: '電',
    meanings: ['electricity'],
    readings: { on: ['デン'], kun: [] },
    radicals: ['雨'],
    jlptLevel: 'N5',
    strokeCount: 13,
    exampleWords: [
      { word: '電車', reading: 'でんしゃ', meaning: 'train' },
      { word: '電話', reading: 'でんわ', meaning: 'telephone' },
    ],
  },
  {
    character: '分',
    meanings: ['minute', 'part', 'divide'],
    readings: { on: ['ブン', 'フン', 'ブ'], kun: ['わ'] },
    radicals: ['八', '刀'],
    jlptLevel: 'N5',
    strokeCount: 4,
    exampleWords: [
      { word: '十分', reading: 'じゅっぷん', meaning: 'ten minutes' },
      { word: '半分', reading: 'はんぶん', meaning: 'half' },
      { word: '自分', reading: 'じぶん', meaning: 'oneself' },
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
