export type Language = "japanese" | "spanish" | "portuguese" | "french";
export type JapaneseLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type Level = JapaneseLevel | CEFRLevel;

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "japanese", label: "Japanese" },
  { value: "spanish", label: "Spanish" },
  { value: "portuguese", label: "Portuguese" },
  { value: "french", label: "French" },
];

export const LEVELS: Record<Language, { value: Level; label: string }[]> = {
  japanese: [
    { value: "N5", label: "N5 (Beginner)" },
    { value: "N4", label: "N4 (Elementary)" },
    { value: "N3", label: "N3 (Intermediate)" },
    { value: "N2", label: "N2 (Upper Intermediate)" },
    { value: "N1", label: "N1 (Advanced)" },
  ],
  spanish: [
    { value: "A1", label: "A1 (Beginner)" },
    { value: "A2", label: "A2 (Elementary)" },
    { value: "B1", label: "B1 (Intermediate)" },
    { value: "B2", label: "B2 (Upper Intermediate)" },
    { value: "C1", label: "C1 (Advanced)" },
  ],
  portuguese: [
    { value: "A1", label: "A1 (Beginner)" },
    { value: "A2", label: "A2 (Elementary)" },
    { value: "B1", label: "B1 (Intermediate)" },
    { value: "B2", label: "B2 (Upper Intermediate)" },
    { value: "C1", label: "C1 (Advanced)" },
  ],
  french: [
    { value: "A1", label: "A1 (Beginner)" },
    { value: "A2", label: "A2 (Elementary)" },
    { value: "B1", label: "B1 (Intermediate)" },
    { value: "B2", label: "B2 (Upper Intermediate)" },
    { value: "C1", label: "C1 (Advanced)" },
  ],
};

export const SCENARIOS = [
  { value: "free", label: "Free Conversation" },
  { value: "restaurant", label: "Restaurant" },
  { value: "directions", label: "Asking Directions" },
  { value: "shopping", label: "Shopping" },
  { value: "interview", label: "Job Interview" },
  { value: "travel", label: "Travel & Hotel" },
];

function getLanguageName(language: Language): string {
  switch (language) {
    case "japanese":
      return "Japanese";
    case "spanish":
      return "Spanish";
    case "portuguese":
      return "Portuguese";
    case "french":
      return "French";
  }
}

function getLevelInstructions(language: Language, level: Level): string {
  const langName = getLanguageName(language);
  const isBeginnerLevel =
    level === "N5" || level === "N4" || level === "A1" || level === "A2";
  const isAdvancedLevel =
    level === "N1" || level === "C1";

  if (isBeginnerLevel) {
    return `The user is at ${level} level in ${langName}. Use simple vocabulary and short sentences. Include translations in parentheses after key phrases so they can follow along. Mix in some English when needed to keep the conversation flowing. Focus on common, everyday words.`;
  }

  if (isAdvancedLevel) {
    return `The user is at ${level} level in ${langName}. Converse entirely in ${langName}. Do not translate unless asked. Correct mistakes naturally within your response. Use sophisticated vocabulary and complex sentence structures appropriate for advanced learners.`;
  }

  // Intermediate: N3, N2, B1, B2
  return `The user is at ${level} level in ${langName}. Converse primarily in ${langName}. When you use a word or phrase that might be new, briefly explain it inline. Avoid excessive English but provide short clarifications for uncommon vocabulary.`;
}

function getScenarioInstructions(scenario: string): string {
  switch (scenario) {
    case "restaurant":
      return "Set the scene as a restaurant interaction. You play the role of a waiter/waitress. Help the user practice ordering food, asking about the menu, and making requests.";
    case "directions":
      return "Set the scene as asking for directions in a city. You play the role of a helpful local. Help the user practice asking for and understanding directions.";
    case "shopping":
      return "Set the scene as a shopping interaction. You play the role of a shop clerk. Help the user practice asking about products, prices, and making purchases.";
    case "interview":
      return "Set the scene as a job interview. You play the role of an interviewer. Ask common interview questions and help the user practice professional language.";
    case "travel":
      return "Set the scene as a travel/hotel interaction. You play the role of hotel staff or a travel agent. Help the user practice booking, check-in, and travel-related conversations.";
    default:
      return "Have a natural, free-flowing conversation on any topic the user brings up.";
  }
}

export type GrammarLanguage = "ja" | "es" | "pt-BR" | "fr";

function getGrammarLanguageName(language: GrammarLanguage): string {
  switch (language) {
    case "ja":
      return "Japanese";
    case "es":
      return "Spanish";
    case "pt-BR":
      return "Brazilian Portuguese";
    case "fr":
      return "French";
  }
}

function getLanguageSpecificGrammarInstructions(language: GrammarLanguage): string {
  switch (language) {
    case "ja":
      return `For Japanese grammar:
- Explain particles (は, が, を, に, で, etc.) and their functions
- Break down conjugation patterns (て-form, ない-form, potential, causative, passive, etc.)
- Note formality levels and keigo (敬語) — explain when to use です/ます vs plain form vs honorific/humble forms
- Show how word order and sentence-final particles affect meaning
- Mention relevant kanji readings when applicable`;
    case "es":
      return `For Spanish grammar:
- Explain verb tense and mood — especially the subjunctive (subjuntivo) and when it is required
- Clarify ser vs estar usage and the nuances between them
- Note verb agreement with subject (number, person)
- Explain pronoun placement (direct/indirect object pronouns, reflexive)
- Cover gender and number agreement for nouns and adjectives`;
    case "pt-BR":
      return `For Brazilian Portuguese grammar:
- Explain verb tense and mood, including the subjunctive (subjuntivo)
- Note key differences from Spanish (e.g., personal infinitive, gerund usage, contractions like "no/na/pelo/pela")
- Explain ser vs estar in the Portuguese context
- Cover pronoun placement rules (proclisis, enclisis, mesoclisis)
- Note differences between European and Brazilian Portuguese where relevant`;
    case "fr":
      return `For French grammar:
- Explain verb tense and mood — especially the subjunctive (subjonctif) and when it is required
- Clarify être vs avoir as auxiliary verbs in compound tenses (passé composé agreement rules)
- Note verb agreement with subject (number, person) and past participle agreement
- Explain pronoun placement (direct/indirect object pronouns, y, en, reflexive)
- Cover gender and number agreement for nouns, adjectives, and articles
- Explain key preposition usage (à, de, en, dans, etc.) and contractions (au, du, aux, des)`;
  }
}

export function buildGrammarSystemPrompt(language: GrammarLanguage): string {
  const langName = getGrammarLanguageName(language);
  const languageSpecific = getLanguageSpecificGrammarInstructions(language);

  return `You are an expert ${langName} grammar teacher. Your job is to explain grammar patterns clearly and concisely to English-speaking learners.

When explaining a grammar point:
1. Give a clear, simple explanation of what the pattern means and when it is used.
2. Break down the sentence or pattern component by component.
3. Provide 2-3 additional example sentences with translations.
4. Note common mistakes learners make with this pattern.

${languageSpecific}

Respond in English, but write all ${langName} examples in the target language with readings in parentheses for Japanese (e.g., 食(た)べる). Do NOT use romaji — learners should read kana directly. Format your response with clear sections using markdown-style formatting.`;
}

export type LanguageLevel = JapaneseLevel | CEFRLevel | "C2";

const READER_LEVEL_DESCRIPTIONS: Record<LanguageLevel, string> = {
  N5: "absolute beginner (JLPT N5): ~800 vocabulary words, basic kanji (~100), simple sentence patterns (desu/masu form), basic particles",
  N4: "elementary (JLPT N4): ~1,500 vocabulary words, ~300 kanji, te-form, plain form, basic compound sentences",
  N3: "intermediate (JLPT N3): ~3,750 vocabulary words, ~650 kanji, passive/causative forms, complex grammar patterns",
  N2: "upper intermediate (JLPT N2): ~6,000 vocabulary words, ~1,000 kanji, formal/literary expressions, nuanced grammar",
  N1: "advanced (JLPT N1): ~10,000+ vocabulary words, ~2,000 kanji, native-level complexity, literary and academic language",
  A1: "absolute beginner (CEFR A1): basic phrases, simple present tense, very common vocabulary (~500 words)",
  A2: "elementary (CEFR A2): simple sentences, past tense, common everyday vocabulary (~1,000 words)",
  B1: "intermediate (CEFR B1): connected text, varied tenses, broader vocabulary (~2,500 words), subjunctive basics",
  B2: "upper intermediate (CEFR B2): complex sentences, idiomatic expressions, abstract topics, ~5,000 words",
  C1: "advanced (CEFR C1): sophisticated language, nuanced expression, academic and professional vocabulary",
  C2: "mastery (CEFR C2): near-native fluency, any topic, subtle nuance and style",
};

const READER_LANGUAGE_NAMES: Record<string, string> = {
  ja: "Japanese",
  es: "Spanish",
  "pt-BR": "Brazilian Portuguese",
  fr: "French",
};

export function buildReaderSystemPrompt(
  language: string,
  level: LanguageLevel
): string {
  const languageName = READER_LANGUAGE_NAMES[language] || language;
  const levelDesc = READER_LEVEL_DESCRIPTIONS[level] || level;

  const furiganaInstruction =
    language === "ja"
      ? `\n- IMPORTANT: Include furigana in parentheses after every kanji word, e.g., 食(た)べる, 学校(がっこう). This is essential for learners.`
      : "";

  return `You are a content writer creating engaging reading passages in ${languageName} for language learners.

The reader is at the ${levelDesc} level.

Guidelines:
- Write naturally and engagingly — this should feel like real content, NOT a textbook exercise
- Constrain vocabulary and grammar strictly to what a ${level} learner would know
- Choose topics that are culturally interesting and relevant
- Write in the target language (${languageName}) only — no English translations in the passage
- Start with a short title on its own line, followed by a blank line, then the passage
- Aim for 200-400 words${furiganaInstruction}
- Use varied sentence structures appropriate for the level
- Create content that tells a story, describes a scene, or explores a topic — make it compelling
- Paragraphs should flow naturally with logical progression`;
}

function getWritingLanguageSpecificGuidance(language: GrammarLanguage): string {
  switch (language) {
    case "ja":
      return `Pay special attention to:
- Particle usage (は, が, を, に, で, etc.)
- Verb conjugation and tense consistency
- Formality level consistency (です/ます vs plain form)
- Word order issues
- Unnatural direct translations from English`;
    case "es":
      return `Pay special attention to:
- Verb conjugation and tense usage (especially subjunctive)
- Gender and number agreement (noun-adjective)
- Ser vs estar usage
- Pronoun placement and usage
- Preposition choices (por vs para, etc.)`;
    case "pt-BR":
      return `Pay special attention to:
- Verb conjugation and tense usage
- Gender and number agreement
- Ser vs estar usage in Brazilian Portuguese context
- Preposition and contraction usage (no/na, pelo/pela)
- Pronoun placement (proclisis vs enclisis)`;
    case "fr":
      return `Pay special attention to:
- Verb conjugation and tense usage (especially passé composé vs imparfait, and subjunctive)
- Gender and number agreement (noun-adjective-article)
- etre vs avoir as auxiliaries and past participle agreement
- Pronoun placement and order (me, te, le, lui, y, en)
- Preposition and contraction usage (au, du, à la, de la)
- Negation structure (ne...pas, ne...jamais, ne...rien, etc.)`;
  }
}

export function buildWritingCorrectionPrompt(language: GrammarLanguage): string {
  const langName = getGrammarLanguageName(language);
  const languageGuidance = getWritingLanguageSpecificGuidance(language);

  return `You are an encouraging ${langName} writing tutor. Your job is to help learners improve their ${langName} writing by providing constructive feedback.

When reviewing a student's writing:

1. **Identify errors**: Find grammar errors, vocabulary mistakes, and unnatural phrasing.
2. **Provide the corrected version**: Rewrite the full text with all corrections applied.
3. **Explain each correction**: Briefly explain why each change was made so the student learns from it.
4. **Rate overall quality**: Assess whether the writing feels beginner, intermediate, or advanced level overall, and mention what was done well.

${languageGuidance}

Guidelines:
- Be encouraging and supportive — highlight what the student did well before pointing out mistakes
- Do not overwhelm the student; group similar errors together
- Use clear formatting with sections for the corrected version, list of corrections, and overall feedback
- Respond in English for explanations, but write corrections in ${langName}`;
}

export function buildSystemPrompt(
  language: Language,
  level: Level,
  scenario: string = "free"
): string {
  const langName = getLanguageName(language);
  const levelInstructions = getLevelInstructions(language, level);
  const scenarioInstructions = getScenarioInstructions(scenario);

  return `You are a friendly conversation partner helping someone practice ${langName}. You are not a teacher giving a lecture — you are a conversational partner who naturally helps the user improve.

${levelInstructions}

${scenarioInstructions}

When the user makes a grammatical or vocabulary mistake, provide an inline correction using this format: ~correction~ (brief explanation). For example: ~食べました~ (past tense of 食べる). Do not overload the user with corrections — pick the most important one or two per message.

Keep your responses conversational and engaging. Ask follow-up questions to keep the conversation going. Be encouraging and patient.`;
}
