const HIRAGANA_MAP: Record<string, string> = {
  // Basic vowels
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  // K-row
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  // S-row
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  // T-row
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  // N-row
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  // H-row
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  // M-row
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  // Y-row
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  // R-row
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  // W-row + n
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  // Dakuten (voiced)
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  // Handakuten (p-sounds)
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  // Small kana (combo sounds)
  'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
  // Small tsu (double consonant marker) - handled specially
  'っ': '',
  // Long vowel mark
  'ー': '-',
};

// Small kana used in combo sounds
const SMALL_KANA = new Set(['ゃ', 'ゅ', 'ょ']);

/**
 * Convert a hiragana string to romaji.
 * Non-hiragana characters pass through unchanged.
 */
export function toRomaji(text: string): string {
  if (!text) return '';

  let result = '';
  const chars = [...text]; // Handle multi-byte characters correctly

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const next = chars[i + 1];

    // Handle っ (double consonant): double the next character's first consonant
    if (char === 'っ' && next) {
      const nextRomaji = HIRAGANA_MAP[next];
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0];
        continue;
      }
    }

    // Handle combo sounds: き + ゃ -> kya (drop the vowel of the first, append small kana romaji)
    if (next && SMALL_KANA.has(next)) {
      const baseRomaji = HIRAGANA_MAP[char];
      const smallRomaji = HIRAGANA_MAP[next];
      if (baseRomaji && smallRomaji) {
        // Remove trailing vowel from base (e.g., "ki" -> "k", "shi" -> "sh", "chi" -> "ch")
        const base = baseRomaji.replace(/[aiueo]$/, '');
        // For multi-char bases like "sh", "ch", drop the 'y' from small kana
        // so sh + yu -> shu, ch + yo -> cho
        // For single-char bases like "k", keep it: k + ya -> kya
        const combo = base.length > 1 ? smallRomaji.replace(/^y/, '') : smallRomaji;
        result += base + combo;
        i++; // Skip the small kana
        continue;
      }
    }

    // Standard mapping
    const romaji = HIRAGANA_MAP[char];
    if (romaji !== undefined) {
      result += romaji;
    } else {
      // Non-hiragana characters pass through
      result += char;
    }
  }

  return result;
}
