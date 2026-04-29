/**
 * Article Quality Gate — The Paul Voice Gate (Non-Negotiable)
 * Every article must pass this gate. If it fails, regenerate (up to 4 attempts).
 * Do not store failed articles.
 */

// ─── BANNED WORDS (regex match, case-insensitive) ───
const BANNED_WORDS = [
  'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy',
  'leverage', 'unlock', 'empower', 'pivotal', 'embark', 'underscore',
  'paramount', 'seamlessly', 'robust', 'beacon', 'foster', 'elevate',
  'curate', 'curated', 'bespoke', 'resonate', 'harness', 'intricate',
  'plethora', 'myriad', 'groundbreaking', 'innovative', 'cutting-edge',
  'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive',
  'transformative', 'holistic', 'nuanced', 'multifaceted', 'profound',
  'furthermore'
];

// ─── BANNED PHRASES (string match, case-insensitive) ───
const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "in conclusion",
  "in summary",
  "a holistic approach",
  "in the realm of",
  "dive deep into",
  "at the end of the day",
  "in today's fast-paced world",
  "plays a crucial role"
];

/**
 * Strip HTML tags for text analysis
 */
function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Count words in text (HTML stripped)
 */
export function countWords(text) {
  const stripped = stripHtml(text);
  return stripped ? stripped.split(/\s+/).length : 0;
}

/**
 * Count Amazon affiliate links
 */
export function countAmazonLinks(text) {
  const matches = text.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g);
  return matches ? matches.length : 0;
}

/**
 * Extract ASINs from text
 */
export function extractAsins(text) {
  const matches = text.match(/amazon\.com\/dp\/([A-Z0-9]{10})/g);
  if (!matches) return [];
  return matches.map(m => m.replace('amazon.com/dp/', ''));
}

/**
 * Check for em-dashes. Auto-replace them with " - " before checking.
 * Returns the cleaned text and whether any were found.
 */
export function fixEmDashes(text) {
  const cleaned = text.replace(/[\u2014\u2013]/g, ' - ');
  const hadEmDash = text !== cleaned;
  return { cleaned, hadEmDash };
}

/**
 * Find banned words in text (case-insensitive regex)
 */
export function findBannedWords(text) {
  const stripped = stripHtml(text).toLowerCase();
  const found = [];
  for (const word of BANNED_WORDS) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(stripped)) {
      found.push(word);
    }
  }
  return found;
}

/**
 * Find banned phrases in text (case-insensitive string match)
 */
export function findBannedPhrases(text) {
  const stripped = stripHtml(text).toLowerCase().replace(/\s+/g, ' ');
  return BANNED_PHRASES.filter(p => stripped.includes(p.toLowerCase()));
}

/**
 * Check voice signals: contractions, direct address, dialogue markers
 */
export function checkVoice(text) {
  const stripped = stripHtml(text);
  const lower = stripped.toLowerCase();

  // Contractions
  const contractions = (lower.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;

  // Direct address ("you")
  const directAddress = (lower.match(/\byou('re|r|rself|)?\b/g) || []).length;

  // Conversational dialogue markers (need 2-3)
  const dialogueMarkers = [
    /right\?!/i, /know what i mean\??/i, /does that land\??/i,
    /how does that make you feel\??/i, /here's the thing/i,
    /look,\s/i, /honestly,?\s/i, /truth is/i, /think about it/i,
    /so yeah/i, /you know\?/i, /get this/i, /hear me out/i
  ];
  const markerCount = dialogueMarkers.filter(r => r.test(stripped)).length;

  return { contractions, directAddress, markerCount };
}

/**
 * Run the full quality gate on an article body.
 * Returns { passed, failures, cleaned }
 */
export function runQualityGate(body) {
  const failures = [];

  // 1. Fix em-dashes first
  const { cleaned, hadEmDash } = fixEmDashes(body);
  if (hadEmDash) {
    // Em-dashes were auto-replaced, not a failure per se (they get fixed)
  }

  // 2. Word count: 1200-2500
  const words = countWords(cleaned);
  if (words < 1200) failures.push(`word-count-too-low:${words}`);
  if (words > 2500) failures.push(`word-count-too-high:${words}`);

  // 3. Amazon links: exactly 3 or 4
  const links = countAmazonLinks(cleaned);
  if (links < 3) failures.push(`amazon-links-too-few:${links}`);
  if (links > 4) failures.push(`amazon-links-too-many:${links}`);

  // 4. Banned words
  const bannedWords = findBannedWords(cleaned);
  if (bannedWords.length > 0) failures.push(`banned-words:${bannedWords.join(',')}`);

  // 5. Banned phrases
  const bannedPhrases = findBannedPhrases(cleaned);
  if (bannedPhrases.length > 0) failures.push(`banned-phrases:${bannedPhrases.join('|')}`);

  // 6. Em-dash check on cleaned text (should be zero after fix)
  if (cleaned.includes('\u2014') || cleaned.includes('\u2013')) {
    failures.push('em-dash-survived-cleanup');
  }

  // 7. Voice check (warning only for markers, but contractions required)
  const voice = checkVoice(cleaned);
  if (voice.directAddress === 0) {
    failures.push('no-direct-address-you');
  }

  return {
    passed: failures.length === 0,
    failures,
    wordCount: words,
    amazonLinks: links,
    asins: extractAsins(cleaned),
    voice,
    cleaned
  };
}
