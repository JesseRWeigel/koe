import { describe, it, expect } from "vitest";
import {
  LANGUAGES,
  LANGUAGE_CODES,
  LANGUAGE_LIST,
  languageToCode,
  codeToLanguage,
  codeToLabel,
  codeToBcp47,
} from "./languages";

describe("LANGUAGES", () => {
  it("contains all expected language codes", () => {
    expect(Object.keys(LANGUAGES)).toEqual(["ja", "es", "pt-BR", "fr"]);
  });

  it("each entry has name, label, flag, and bcp47", () => {
    for (const code of LANGUAGE_CODES) {
      const lang = LANGUAGES[code];
      expect(lang.name).toBeTruthy();
      expect(lang.label).toBeTruthy();
      expect(lang.flag).toBeTruthy();
      expect(lang.bcp47).toBeTruthy();
    }
  });
});

describe("LANGUAGE_CODES", () => {
  it("is an array of all language codes", () => {
    expect(LANGUAGE_CODES).toEqual(["ja", "es", "pt-BR", "fr"]);
  });
});

describe("LANGUAGE_LIST", () => {
  it("has code, name, label, flag, bcp47 for each entry", () => {
    expect(LANGUAGE_LIST).toHaveLength(4);
    expect(LANGUAGE_LIST[0]).toEqual({
      code: "ja",
      name: "japanese",
      label: "Japanese",
      flag: expect.any(String),
      bcp47: "ja-JP",
    });
  });
});

describe("languageToCode", () => {
  it("maps full names to codes", () => {
    expect(languageToCode("japanese")).toBe("ja");
    expect(languageToCode("spanish")).toBe("es");
    expect(languageToCode("portuguese")).toBe("pt-BR");
    expect(languageToCode("french")).toBe("fr");
  });
});

describe("codeToLanguage", () => {
  it("maps codes to full names", () => {
    expect(codeToLanguage("ja")).toBe("japanese");
    expect(codeToLanguage("es")).toBe("spanish");
    expect(codeToLanguage("pt-BR")).toBe("portuguese");
    expect(codeToLanguage("fr")).toBe("french");
  });
});

describe("codeToLabel", () => {
  it("maps codes to display labels", () => {
    expect(codeToLabel("ja")).toBe("Japanese");
    expect(codeToLabel("fr")).toBe("French");
  });
});

describe("codeToBcp47", () => {
  it("maps codes to BCP-47 tags", () => {
    expect(codeToBcp47("ja")).toBe("ja-JP");
    expect(codeToBcp47("es")).toBe("es-ES");
    expect(codeToBcp47("pt-BR")).toBe("pt-BR");
    expect(codeToBcp47("fr")).toBe("fr-FR");
  });
});
