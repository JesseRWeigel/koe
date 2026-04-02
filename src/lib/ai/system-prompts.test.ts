import { describe, it, expect } from "vitest";
import {
  buildSystemPrompt,
  buildGrammarSystemPrompt,
  buildReaderSystemPrompt,
  buildWritingCorrectionPrompt,
} from "./system-prompts";

describe("buildSystemPrompt", () => {
  it("includes the language name in the prompt", () => {
    const prompt = buildSystemPrompt("japanese", "N5");
    expect(prompt).toContain("Japanese");
  });

  it("includes the level in the prompt", () => {
    const prompt = buildSystemPrompt("japanese", "N3");
    expect(prompt).toContain("N3");
  });

  it("includes the correction format instruction", () => {
    const prompt = buildSystemPrompt("spanish", "A1");
    expect(prompt).toContain("~correction~");
  });

  describe("Japanese levels", () => {
    it("includes translation instructions for N5 (beginner)", () => {
      const prompt = buildSystemPrompt("japanese", "N5");
      expect(prompt).toContain("translations in parentheses");
      expect(prompt).toContain("simple vocabulary");
    });

    it("includes translation instructions for N4 (beginner)", () => {
      const prompt = buildSystemPrompt("japanese", "N4");
      expect(prompt).toContain("translations in parentheses");
    });

    it("uses intermediate instructions for N3", () => {
      const prompt = buildSystemPrompt("japanese", "N3");
      expect(prompt).toContain("primarily in Japanese");
      expect(prompt).not.toContain("translations in parentheses");
    });

    it("uses intermediate instructions for N2", () => {
      const prompt = buildSystemPrompt("japanese", "N2");
      expect(prompt).toContain("primarily in Japanese");
    });

    it("uses advanced instructions for N1", () => {
      const prompt = buildSystemPrompt("japanese", "N1");
      expect(prompt).toContain("entirely in Japanese");
      expect(prompt).toContain("sophisticated vocabulary");
    });
  });

  describe("Spanish levels", () => {
    it("uses beginner instructions for A1", () => {
      const prompt = buildSystemPrompt("spanish", "A1");
      expect(prompt).toContain("simple vocabulary");
      expect(prompt).toContain("Spanish");
    });

    it("uses beginner instructions for A2", () => {
      const prompt = buildSystemPrompt("spanish", "A2");
      expect(prompt).toContain("translations in parentheses");
    });

    it("uses intermediate instructions for B1", () => {
      const prompt = buildSystemPrompt("spanish", "B1");
      expect(prompt).toContain("primarily in Spanish");
    });

    it("uses intermediate instructions for B2", () => {
      const prompt = buildSystemPrompt("spanish", "B2");
      expect(prompt).toContain("primarily in Spanish");
    });

    it("uses advanced instructions for C1", () => {
      const prompt = buildSystemPrompt("spanish", "C1");
      expect(prompt).toContain("entirely in Spanish");
    });
  });

  describe("Portuguese levels", () => {
    it("generates appropriate prompt for Portuguese A1", () => {
      const prompt = buildSystemPrompt("portuguese", "A1");
      expect(prompt).toContain("Portuguese");
      expect(prompt).toContain("simple vocabulary");
    });

    it("generates appropriate prompt for Portuguese C1", () => {
      const prompt = buildSystemPrompt("portuguese", "C1");
      expect(prompt).toContain("entirely in Portuguese");
    });
  });

  describe("French levels", () => {
    it("uses beginner instructions for A1", () => {
      const prompt = buildSystemPrompt("french", "A1");
      expect(prompt).toContain("simple vocabulary");
      expect(prompt).toContain("French");
    });

    it("uses beginner instructions for A2", () => {
      const prompt = buildSystemPrompt("french", "A2");
      expect(prompt).toContain("translations in parentheses");
      expect(prompt).toContain("French");
    });

    it("uses intermediate instructions for B1", () => {
      const prompt = buildSystemPrompt("french", "B1");
      expect(prompt).toContain("primarily in French");
      expect(prompt).not.toContain("translations in parentheses");
    });

    it("uses intermediate instructions for B2", () => {
      const prompt = buildSystemPrompt("french", "B2");
      expect(prompt).toContain("primarily in French");
    });

    it("uses advanced instructions for C1", () => {
      const prompt = buildSystemPrompt("french", "C1");
      expect(prompt).toContain("entirely in French");
      expect(prompt).toContain("sophisticated vocabulary");
    });
  });

  describe("scenarios", () => {
    it("includes restaurant scenario instructions", () => {
      const prompt = buildSystemPrompt("japanese", "N5", "restaurant");
      expect(prompt).toContain("restaurant");
      expect(prompt).toContain("waiter");
    });

    it("includes directions scenario instructions", () => {
      const prompt = buildSystemPrompt("spanish", "B1", "directions");
      expect(prompt).toContain("directions");
    });

    it("includes free conversation by default", () => {
      const prompt = buildSystemPrompt("japanese", "N3");
      expect(prompt).toContain("free-flowing conversation");
    });

    it("includes interview scenario instructions", () => {
      const prompt = buildSystemPrompt("portuguese", "B2", "interview");
      expect(prompt).toContain("interview");
    });

    it("includes scenario instructions for French", () => {
      const prompt = buildSystemPrompt("french", "B1", "shopping");
      expect(prompt).toContain("shopping");
      expect(prompt).toContain("shop clerk");
      expect(prompt).toContain("French");
    });
  });

  it("instructs the AI to be a conversation partner, not a teacher", () => {
    const prompt = buildSystemPrompt("japanese", "N5");
    expect(prompt).toContain("conversation partner");
    expect(prompt).toContain("not a teacher");
  });
});

describe("buildReaderSystemPrompt", () => {
  it("includes the target language name", () => {
    const prompt = buildReaderSystemPrompt("ja", "N5");
    expect(prompt).toContain("Japanese");
  });

  it("includes the level description", () => {
    const prompt = buildReaderSystemPrompt("ja", "N3");
    expect(prompt).toContain("N3");
    expect(prompt).toContain("intermediate");
  });

  it("includes furigana instructions for Japanese", () => {
    const prompt = buildReaderSystemPrompt("ja", "N5");
    expect(prompt).toContain("furigana");
    expect(prompt).toContain("食(た)べる");
  });

  it("does NOT include furigana instructions for Spanish", () => {
    const prompt = buildReaderSystemPrompt("es", "A1");
    expect(prompt).not.toContain("furigana");
  });

  it("does NOT include furigana instructions for Portuguese", () => {
    const prompt = buildReaderSystemPrompt("pt-BR", "B1");
    expect(prompt).not.toContain("furigana");
  });

  it("does NOT include furigana instructions for French", () => {
    const prompt = buildReaderSystemPrompt("fr", "A1");
    expect(prompt).not.toContain("furigana");
  });

  it("includes the French language name", () => {
    const prompt = buildReaderSystemPrompt("fr", "B1");
    expect(prompt).toContain("French");
  });

  it("includes correct level description for French levels", () => {
    const promptA1 = buildReaderSystemPrompt("fr", "A1");
    expect(promptA1).toContain("A1");
    expect(promptA1).toContain("beginner");
    expect(promptA1).toContain("~500 words");

    const promptB2 = buildReaderSystemPrompt("fr", "B2");
    expect(promptB2).toContain("B2");
    expect(promptB2).toContain("upper intermediate");
    expect(promptB2).toContain("~5,000 words");
  });

  it("includes content generation guidelines for French", () => {
    const prompt = buildReaderSystemPrompt("fr", "A2");
    expect(prompt).toContain("200-400 words");
    expect(prompt).toContain("title");
    expect(prompt).toContain("NOT a textbook exercise");
  });

  it("includes instructions to write in target language only", () => {
    const prompt = buildReaderSystemPrompt("ja", "N4");
    expect(prompt).toContain("Write in the target language");
    expect(prompt).toContain("no English translations");
  });

  it("includes different level descriptions for different levels", () => {
    const n5Prompt = buildReaderSystemPrompt("ja", "N5");
    const n1Prompt = buildReaderSystemPrompt("ja", "N1");

    expect(n5Prompt).toContain("~800 vocabulary");
    expect(n1Prompt).toContain("~10,000+");
    expect(n5Prompt).not.toContain("~10,000+");
    expect(n1Prompt).not.toContain("~800 vocabulary");
  });
});

describe("buildGrammarSystemPrompt", () => {
  it("returns a string containing the language name", () => {
    const prompt = buildGrammarSystemPrompt("ja");
    expect(prompt).toContain("Japanese");
  });

  it("includes language-specific instructions for Japanese", () => {
    const prompt = buildGrammarSystemPrompt("ja");
    expect(prompt).toContain("particles");
    expect(prompt).toContain("conjugation");
    expect(prompt).toContain("keigo");
    expect(prompt).toContain("formality");
  });

  it("includes language-specific instructions for Spanish", () => {
    const prompt = buildGrammarSystemPrompt("es");
    expect(prompt).toContain("Spanish");
    expect(prompt).toContain("subjunctive");
    expect(prompt).toContain("subjuntivo");
    expect(prompt).toContain("ser vs estar");
    expect(prompt).toContain("verb agreement");
  });

  it("includes language-specific instructions for Brazilian Portuguese", () => {
    const prompt = buildGrammarSystemPrompt("pt-BR");
    expect(prompt).toContain("Portuguese");
    expect(prompt).toContain("differences from Spanish");
    expect(prompt).toContain("personal infinitive");
    expect(prompt).toContain("pronoun placement");
  });

  it("includes language-specific instructions for French", () => {
    const prompt = buildGrammarSystemPrompt("fr");
    expect(prompt).toContain("French");
    expect(prompt).toContain("subjunctive");
    expect(prompt).toContain("subjonctif");
    expect(prompt).toContain("être vs avoir");
    expect(prompt).toContain("gender and number agreement");
    expect(prompt).toContain("pronoun placement");
  });

  it("includes general grammar explanation instructions", () => {
    const prompt = buildGrammarSystemPrompt("ja");
    expect(prompt).toContain("example sentences");
    expect(prompt).toContain("common mistakes");
    expect(prompt).toContain("component by component");
  });

  it("instructs to respond in English with target language examples", () => {
    const prompt = buildGrammarSystemPrompt("es");
    expect(prompt).toContain("Respond in English");
    expect(prompt).toContain("target language");
  });

  it("instructs to respond in English with French examples", () => {
    const prompt = buildGrammarSystemPrompt("fr");
    expect(prompt).toContain("Respond in English");
    expect(prompt).toContain("French");
  });
});

describe("buildWritingCorrectionPrompt", () => {
  it("returns a string containing correction instructions", () => {
    const prompt = buildWritingCorrectionPrompt("ja");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain("grammar");
    expect(prompt).toContain("corrected");
  });

  it("includes the language name", () => {
    const prompt = buildWritingCorrectionPrompt("ja");
    expect(prompt).toContain("Japanese");
  });

  it("includes language-specific guidance for Japanese", () => {
    const prompt = buildWritingCorrectionPrompt("ja");
    expect(prompt).toContain("Particle");
    expect(prompt).toContain("Japanese");
  });

  it("includes language-specific guidance for Spanish", () => {
    const prompt = buildWritingCorrectionPrompt("es");
    expect(prompt).toContain("Spanish");
    expect(prompt).toContain("Gender");
  });

  it("includes language-specific guidance for Brazilian Portuguese", () => {
    const prompt = buildWritingCorrectionPrompt("pt-BR");
    expect(prompt).toContain("Portuguese");
  });

  it("includes language-specific guidance for French", () => {
    const prompt = buildWritingCorrectionPrompt("fr");
    expect(prompt).toContain("French");
    expect(prompt).toContain("Gender");
    expect(prompt).toContain("tre vs avoir");
    expect(prompt).toContain("past participle agreement");
    expect(prompt).toContain("Pronoun");
    expect(prompt).toContain("Negation");
  });

  it("instructs to identify errors and provide corrections", () => {
    const prompt = buildWritingCorrectionPrompt("ja");
    expect(prompt).toContain("error");
    expect(prompt).toContain("corrected version");
  });

  it("instructs to explain corrections", () => {
    const prompt = buildWritingCorrectionPrompt("es");
    expect(prompt).toContain("explain");
  });

  it("instructs to be encouraging", () => {
    const prompt = buildWritingCorrectionPrompt("ja");
    expect(prompt).toContain("encouraging");
  });

  it("instructs to rate overall quality", () => {
    const prompt = buildWritingCorrectionPrompt("ja");
    expect(prompt).toContain("overall");
  });

  it("instructs to be encouraging for French", () => {
    const prompt = buildWritingCorrectionPrompt("fr");
    expect(prompt).toContain("encouraging");
    expect(prompt).toContain("corrected version");
  });
});