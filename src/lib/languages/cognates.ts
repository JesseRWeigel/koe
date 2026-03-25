export interface CognateEntry {
  spanish: string;
  portuguese: string;
  meaning: string;
  isFalseFriend: boolean;
  note?: string;
}

const COGNATES: CognateEntry[] = [
  // ── True cognates ──────────────────────────────────────────────
  { spanish: "casa", portuguese: "casa", meaning: "house", isFalseFriend: false },
  { spanish: "agua", portuguese: "água", meaning: "water", isFalseFriend: false },
  { spanish: "libro", portuguese: "livro", meaning: "book", isFalseFriend: false },
  { spanish: "familia", portuguese: "família", meaning: "family", isFalseFriend: false },
  { spanish: "amigo", portuguese: "amigo", meaning: "friend", isFalseFriend: false },
  { spanish: "tiempo", portuguese: "tempo", meaning: "time / weather", isFalseFriend: false },
  { spanish: "ciudad", portuguese: "cidade", meaning: "city", isFalseFriend: false },
  { spanish: "escuela", portuguese: "escola", meaning: "school", isFalseFriend: false },
  { spanish: "comida", portuguese: "comida", meaning: "food", isFalseFriend: false },
  { spanish: "mundo", portuguese: "mundo", meaning: "world", isFalseFriend: false },
  { spanish: "persona", portuguese: "pessoa", meaning: "person", isFalseFriend: false },
  { spanish: "hombre", portuguese: "homem", meaning: "man", isFalseFriend: false },
  { spanish: "mujer", portuguese: "mulher", meaning: "woman", isFalseFriend: false },
  { spanish: "trabajo", portuguese: "trabalho", meaning: "work", isFalseFriend: false },
  { spanish: "dinero", portuguese: "dinheiro", meaning: "money", isFalseFriend: false },
  { spanish: "iglesia", portuguese: "igreja", meaning: "church", isFalseFriend: false },
  { spanish: "puerta", portuguese: "porta", meaning: "door", isFalseFriend: false },
  { spanish: "calle", portuguese: "rua", meaning: "street", isFalseFriend: false },
  { spanish: "noche", portuguese: "noite", meaning: "night", isFalseFriend: false },
  { spanish: "cuerpo", portuguese: "corpo", meaning: "body", isFalseFriend: false },
  { spanish: "problema", portuguese: "problema", meaning: "problem", isFalseFriend: false },
  { spanish: "gobierno", portuguese: "governo", meaning: "government", isFalseFriend: false },
  { spanish: "hermano", portuguese: "irmão", meaning: "brother", isFalseFriend: false },
  { spanish: "hermana", portuguese: "irmã", meaning: "sister", isFalseFriend: false },
  { spanish: "corazón", portuguese: "coração", meaning: "heart", isFalseFriend: false },
  { spanish: "historia", portuguese: "história", meaning: "history / story", isFalseFriend: false },
  { spanish: "número", portuguese: "número", meaning: "number", isFalseFriend: false },
  { spanish: "ejemplo", portuguese: "exemplo", meaning: "example", isFalseFriend: false },
  { spanish: "música", portuguese: "música", meaning: "music", isFalseFriend: false },
  { spanish: "lengua", portuguese: "língua", meaning: "language / tongue", isFalseFriend: false },
  { spanish: "verdad", portuguese: "verdade", meaning: "truth", isFalseFriend: false },

  // ── False friends ──────────────────────────────────────────────
  {
    spanish: "embarazada",
    portuguese: "embaraçada",
    meaning: "pregnant (ES) / embarrassed (PT)",
    isFalseFriend: true,
    note: "In Spanish this means pregnant, in Portuguese it means embarrassed",
  },
  {
    spanish: "exquisito",
    portuguese: "esquisito",
    meaning: "exquisite (ES) / strange (PT)",
    isFalseFriend: true,
    note: "In Spanish this means exquisite/delicious, in Portuguese it means strange/weird",
  },
  {
    spanish: "largo",
    portuguese: "largo",
    meaning: "long (ES) / wide, square (PT)",
    isFalseFriend: true,
    note: "In Spanish this means long, in Portuguese it means wide or a town square",
  },
  {
    spanish: "salsa",
    portuguese: "salsa",
    meaning: "sauce (ES) / parsley (PT)",
    isFalseFriend: true,
    note: "In Spanish this means sauce, in Portuguese it means parsley",
  },
  {
    spanish: "vaso",
    portuguese: "vaso",
    meaning: "glass/cup (ES) / vase/toilet (PT)",
    isFalseFriend: true,
    note: "In Spanish this means drinking glass, in Portuguese it means vase or toilet",
  },
  {
    spanish: "polvo",
    portuguese: "polvo",
    meaning: "dust (ES) / octopus (PT)",
    isFalseFriend: true,
    note: "In Spanish this means dust or powder, in Portuguese it means octopus",
  },
  {
    spanish: "borracha",
    portuguese: "borracha",
    meaning: "drunk woman (ES) / rubber/eraser (PT)",
    isFalseFriend: true,
    note: "In Spanish this means a drunk woman, in Portuguese it means rubber or eraser",
  },
  {
    spanish: "escritorio",
    portuguese: "escritório",
    meaning: "desk (ES) / office (PT)",
    isFalseFriend: true,
    note: "In Spanish this means desk, in Portuguese it means office",
  },
  {
    spanish: "doce",
    portuguese: "doce",
    meaning: "twelve (ES) / sweet (PT)",
    isFalseFriend: true,
    note: "In Spanish this means twelve, in Portuguese it means sweet/candy",
  },
  {
    spanish: "oficina",
    portuguese: "oficina",
    meaning: "office (ES) / workshop/garage (PT)",
    isFalseFriend: true,
    note: "In Spanish this means office, in Portuguese it means workshop or auto repair shop",
  },
  {
    spanish: "propina",
    portuguese: "propina",
    meaning: "tip/gratuity (ES) / bribe/tuition fee (PT)",
    isFalseFriend: true,
    note: "In Spanish this means tip/gratuity, in Portuguese it means bribe or tuition fee",
  },
  {
    spanish: "taller",
    portuguese: "talher",
    meaning: "workshop (ES) / cutlery (PT)",
    isFalseFriend: true,
    note: "In Spanish this means workshop, in Portuguese talher means cutlery/silverware",
  },
  {
    spanish: "rato",
    portuguese: "rato",
    meaning: "a while (ES) / mouse (PT)",
    isFalseFriend: true,
    note: "In Spanish this means a short while, in Portuguese it means mouse",
  },
  {
    spanish: "cola",
    portuguese: "cola",
    meaning: "tail/queue (ES) / glue (PT)",
    isFalseFriend: true,
    note: "In Spanish this means tail or queue, in Portuguese it means glue",
  },
  {
    spanish: "zurdo",
    portuguese: "surdo",
    meaning: "left-handed (ES) / deaf (PT)",
    isFalseFriend: true,
    note: "In Spanish zurdo means left-handed, in Portuguese surdo means deaf",
  },
  {
    spanish: "rojo",
    portuguese: "roxo",
    meaning: "red (ES) / purple (PT)",
    isFalseFriend: true,
    note: "In Spanish rojo means red, in Portuguese roxo means purple",
  },
];

/** Return all cognate entries (true cognates and false friends). */
export function getCognates(): CognateEntry[] {
  return COGNATES;
}

/** Return only false friend entries. */
export function getFalseFriends(): CognateEntry[] {
  return COGNATES.filter((e) => e.isFalseFriend);
}

/** Search cognates by Spanish word, Portuguese word, or meaning (case-insensitive, partial match). */
export function searchCognates(query: string): CognateEntry[] {
  const q = query.toLowerCase();
  return COGNATES.filter(
    (e) =>
      e.spanish.toLowerCase().includes(q) ||
      e.portuguese.toLowerCase().includes(q) ||
      e.meaning.toLowerCase().includes(q),
  );
}

/** Look up a cognate by exact word in the given source language (case-insensitive). */
export function getCognateForWord(
  word: string,
  sourceLang: "es" | "pt-BR",
): CognateEntry | undefined {
  const w = word.toLowerCase();
  if (sourceLang === "es") {
    return COGNATES.find((e) => e.spanish.toLowerCase() === w);
  }
  return COGNATES.find((e) => e.portuguese.toLowerCase() === w);
}
