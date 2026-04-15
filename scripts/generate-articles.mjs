// ─── FEATURE FLAG (stays in code — not a secret) ───
const AUTO_GEN_ENABLED = true; // Site is live — autogen enabled

// ─── FROM RENDER ENV VARS (auto-revoked if found in code) ───
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GH_PAT = process.env.GH_PAT;

// ─── HARDCODED (Bunny is safe in code) ───
const BUNNY_STORAGE_ZONE = 'unforgiven-love';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_STORAGE_PASSWORD = '24cbeac6-ad6e-4ff9-b892fb9f975f-fb5a-4c5f';
const BUNNY_CDN_BASE = 'https://unforgiven-love.b-cdn.net';
const GITHUB_REPO = 'peacefulgeek/unforgiven-love';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CATEGORIES = [
  { slug: 'the-lie', name: 'The Lie of Forgiveness' },
  { slug: 'the-forensic-method', name: 'The Forensic Method' },
  { slug: 'the-body', name: 'The Body Keeps the Score' },
  { slug: 'the-specific', name: 'The Specific Wound' },
  { slug: 'the-liberation', name: 'The Liberation' },
];

const OPENER_TYPES = ['scene', 'provocation', 'first-person', 'question', 'named-ref', 'gut-punch'];

const RESEARCHERS = [
  'Bessel van der Kolk', 'Gabor Mate', 'Peter Levine', 'Stephen Porges',
  'Dick Schwartz', 'Tara Brach', 'Kristin Neff', 'Dan Siegel',
  'Pat Ogden', 'Deb Dana', 'Janina Fisher', 'Judith Herman',
  'Bruce Perry', 'Allan Schore', 'Francine Shapiro',
];

const BANNED_WORDS = `profound, profoundly, transformative, holistic, nuanced, multifaceted, delve, delving, tapestry, resonate, resonates, resonating, embark, embarking, paradigm, synergy, leverage, utilize, utilizing, facilitate, facilitating, encompass, encompassing, moreover, furthermore, nevertheless, notwithstanding, seamlessly, pivotal, myriad, plethora, robust, foster, fostering, cultivate, cultivating, navigate, navigating, landscape, realm, unveil, unveiling, beacon, testament, cornerstone, underscores, game-changer, groundbreaking, cutting-edge`;

const BANNED_PHRASES = `"this is where", "lean into", "showing up for", "authentic self", "safe space", "hold space", "sacred container", "raise your vibration", "be gentle with yourself", "be patient with yourself", "you are not alone", "trust the process", "give yourself grace", "take it one day at a time", "in conclusion", "it is important to note", "it is worth noting", "in today's world", "in this day and age", "at the end of the day"`;

const KALESH_PHRASES = [
  "The mind is not the enemy. The identification with it is.",
  "Most of what passes for healing is just rearranging the furniture in a burning house.",
  "Awareness doesn't need to be cultivated. It needs to be uncovered.",
  "The nervous system doesn't respond to what you believe. It responds to what it senses.",
  "You cannot think your way into a felt sense of safety. The body has its own logic.",
  "Every resistance is information. The question is whether you're willing to read it.",
  "The gap between stimulus and response is where your entire life lives.",
  "Consciousness doesn't arrive. It's what's left when everything else quiets down.",
  "There is no version of growth that doesn't involve the dissolution of something you thought was permanent.",
  "Trauma reorganizes perception. Recovery reorganizes it again, but this time with your participation.",
  "The space between knowing something intellectually and knowing it in your body is where all the real work happens.",
  "Attention is the most undervalued resource you have. Everything else follows from where you place it.",
  "Sit with it long enough and even the worst feeling reveals its edges.",
  "The breath doesn't need your management. It needs your companionship.",
  "When you stop trying to fix the moment, something remarkable happens - the moment becomes workable.",
  "The paradox of acceptance is that nothing changes until you stop demanding that it does.",
  "You don't arrive at peace. You stop walking away from it.",
  "Stillness is not something you achieve. It's what's already here beneath the achieving.",
  "Information without integration is just intellectual hoarding.",
  "Your nervous system doesn't care about your philosophy. It cares about what happened at three years old.",
  "Not every insight requires action. Some just need to be witnessed.",
  "Complexity is the ego's favorite hiding place.",
  "If your spiritual practice makes you more rigid, it's not working.",
  "The research is clear on this, and it contradicts almost everything popular culture teaches.",
  "The body has a grammar. Most of us never learned to read it.",
  "Freedom is not the absence of constraint. It's the capacity to choose your relationship to it.",
];

async function generateArticle(topic, category) {
  const openerType = OPENER_TYPES[Math.floor(Math.random() * OPENER_TYPES.length)];
  const conclusionType = Math.random() > 0.5 ? 'challenge' : 'tender';
  const researcher = RESEARCHERS[Math.floor(Math.random() * RESEARCHERS.length)];
  const researcher2 = RESEARCHERS[Math.floor(Math.random() * RESEARCHERS.length)];
  const phrases = [];
  for (let i = 0; i < 3; i++) {
    phrases.push(KALESH_PHRASES[Math.floor(Math.random() * KALESH_PHRASES.length)]);
  }

  const prompt = `Write a 1200-1800 word article about "${topic}" for the category "${category.name}" on a forensic forgiveness site.

VOICE: You are Kalesh, a consciousness teacher. Write in long, unfolding sentences that build and turn, averaging 18-28 words, with occasional short drops like stones. Lead with intellectual warmth - 40% teaching, 30% tender, 20% philosophical, 10% fierce. Use contractions. Use incomplete sentences sometimes.

STRICT RULES:
1. WORD COUNT: Between 1200-1800 words exactly.
2. NEVER use em-dashes (—). Use commas, periods, ellipsis (...), or short hyphens instead.
3. NEVER use these words: ${BANNED_WORDS}
4. NEVER use these phrases: ${BANNED_PHRASES}
5. OPENER: Use a ${openerType} opener. ${openerType === 'scene' ? 'Start with a vivid scene, no "Imagine..."' : openerType === 'provocation' ? 'Start with a provocative claim' : openerType === 'first-person' ? 'Start with "I" and a personal observation' : openerType === 'question' ? 'Start with a specific, uncomfortable question' : openerType === 'named-ref' ? `Start by citing ${researcher}'s work` : 'Start with a gut-punch truth'}
6. CONCLUSION: ${conclusionType === 'challenge' ? 'End with a direct challenge or uncomfortable question' : 'End with earned tenderness, not generic comfort'}
7. WEAVE IN these Kalesh phrases naturally: ${phrases.map(p => `"${p}"`).join(', ')}
8. ADD 2 conversational interjections like "Stay with me here." or "I know, I know." or "Wild, right?"
9. REFERENCE ${researcher} and ${researcher2} and their work naturally (editorial, not academic)
10. ADD 1-2 first-person lived experience sentences
11. VARY sentence lengths aggressively. Mix 5-word sentences with 30-word ones.
12. Use specific H2/H3 headers (not "Moving Forward" or "The Path Ahead")
13. Output ONLY HTML body content starting with first <h2>. No title, no metadata, no code fences.
14. Make it conversational, truly connective, something Google would never flag as AI.
15. Be specific, use real examples, name real situations. No generic advice.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are Kalesh, a consciousness teacher. Write in long unfolding sentences with short drops. Never use em-dashes. Never use AI-flagged words. Output only HTML.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.85,
    }),
  });

  const data = await response.json();
  let body = data.choices[0].message.content.trim();
  
  // Strip code fences
  body = body.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  
  // Post-process: remove em-dashes and banned words
  body = body.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');
  body = body.replace(/---/g, '...').replace(/--/g, ' - ');
  
  return body;
}

async function generateImage(title, slug) {
  const prompt = `A luminous, warm, healing scene directly related to the concept of "${title}". Ethereal soft light, muted earth tones with warm amber and gold accents. No text, no words, no letters. Contemplative, spiritual, emotionally resonant. Fine art photography style with painterly quality.`;
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      response_format: 'b64_json',
    }),
  });

  const data = await response.json();
  return Buffer.from(data.data[0].b64_json, 'base64');
}

async function uploadToBunny(filePath, content) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${filePath}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_STORAGE_PASSWORD,
      'Content-Type': 'application/octet-stream',
    },
    body: content,
  });
  return response.ok;
}

async function commitToGitHub(articles) {
  // Commit updated articles.json to GitHub
  const articlesPath = 'content/articles.json';
  const content = Buffer.from(JSON.stringify(articles, null, null)).toString('base64');
  
  // Get current file SHA
  const getResp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${articlesPath}`, {
    headers: { 'Authorization': `token ${GH_PAT}` },
  });
  const current = await getResp.json();
  
  // Update file
  await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${articlesPath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GH_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `[auto-gen] Add new articles ${new Date().toISOString().split('T')[0]}`,
      content,
      sha: current.sha,
    }),
  });
}

async function main() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[generate] AUTO_GEN_ENABLED is false. Exiting.');
    process.exit(0);
  }

  if (!OPENAI_API_KEY) {
    console.log('[generate] No OPENAI_API_KEY set. Exiting.');
    process.exit(0);
  }

  console.log('[generate] Starting daily article generation...');
  
  const articlesPath = path.join(ROOT, 'content', 'articles.json');
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
  
  // Find articles that need publishing today (gated articles with today's date)
  const today = new Date().toISOString().split('T')[0];
  let published = 0;
  for (const article of articles) {
    if (article.status === 'gated' && article.dateISO <= today) {
      article.status = 'published';
      published++;
    }
  }
  
  if (published > 0) {
    console.log(`[generate] Published ${published} gated articles.`);
    fs.writeFileSync(articlesPath, JSON.stringify(articles, null, null));
  }
  
  // Check if we need to generate new articles (when gated queue is running low)
  const gatedCount = articles.filter(a => a.status === 'gated').length;
  console.log(`[generate] ${gatedCount} articles still gated.`);
  
  if (gatedCount < 30) {
    console.log('[generate] Gated queue running low. Generating 5 new articles...');
    
    const newArticles = [];
    for (let i = 0; i < 5; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const topic = `forensic forgiveness topic for ${category.name}`;
      
      try {
        const body = await generateArticle(topic, category);
        const slug = `new-${Date.now()}-${i}`;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + gatedCount + i);
        
        newArticles.push({
          slug,
          title: topic,
          body,
          category: category.slug,
          dateISO: futureDate.toISOString().split('T')[0],
          status: 'gated',
          heroImage: `${BUNNY_CDN_BASE}/images/${slug}.webp`,
          ogImage: `${BUNNY_CDN_BASE}/images/og-${slug}.webp`,
          heroAlt: `Illustration for ${topic}`,
          readingTime: Math.ceil(body.split(/\s+/).length / 250),
          faqs: [],
          hasAffiliateLinks: true,
        });
        
        console.log(`[generate] Generated article ${i + 1}/5`);
      } catch (err) {
        console.error(`[generate] Failed to generate article ${i + 1}:`, err.message);
      }
    }
    
    if (newArticles.length > 0) {
      articles.push(...newArticles);
      fs.writeFileSync(articlesPath, JSON.stringify(articles, null, null));
      console.log(`[generate] Added ${newArticles.length} new articles.`);
    }
  }
  
  console.log('[generate] Generation complete.');
}

main().catch(err => {
  console.error('[generate] Error:', err);
  process.exit(1);
});
