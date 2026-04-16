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
const AMAZON_TAG = 'spankyspinola-20';

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

// ─── AMAZON PRODUCT CATALOG FOR IN-ARTICLE LINKS ───
const PRODUCT_CATALOG = [
  { asin: '0143128043', name: 'The Body Keeps the Score', tags: ['trauma','body','nervous-system','somatic','tension'], sentence: "If you want to go deeper on how trauma lives in the body, I'd recommend picking up <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Body Keeps the Score</a> (paid link) - it changed how I think about this work entirely." },
  { asin: '0062339346', name: 'The Gifts of Imperfection', tags: ['self-compassion','vulnerability','shame','worthiness'], sentence: "One book that really helped me with this was <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Gifts of Imperfection</a> (paid link) by Brene Brown - it's about letting go of who you think you should be." },
  { asin: '0553386697', name: 'The Power of Now', tags: ['presence','awareness','consciousness','mindfulness','ego'], sentence: "If presence is something you're working on, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Power of Now</a> (paid link) is worth having on your shelf." },
  { asin: '1401944612', name: 'Radical Forgiveness', tags: ['forgiveness','radical','letting-go','spiritual','release'], sentence: "For a structured approach to this, I often point people toward <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Radical Forgiveness</a> (paid link) by Colin Tipping - the framework is practical and surprisingly gentle." },
  { asin: '0062517627', name: 'When Things Fall Apart', tags: ['grief','loss','buddhism','acceptance','suffering'], sentence: "When everything feels like it's crumbling, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">When Things Fall Apart</a> (paid link) by Pema Chodron sits with you in the wreckage without trying to fix anything." },
  { asin: '0399592520', name: 'The Wisdom of Trauma', tags: ['trauma','addiction','connection','childhood','healing'], sentence: "Gabor Mate's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Wisdom of Trauma</a> (paid link) reframes the whole conversation - trauma isn't what happened to you, it's what happened inside you as a result." },
  { asin: '1583949771', name: 'Radical Acceptance', tags: ['acceptance','self-compassion','buddhism','meditation'], sentence: "Tara Brach's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Radical Acceptance</a> (paid link) taught me that the opposite of resistance isn't giving up - it's showing up with your whole heart." },
  { asin: '0062652559', name: 'No Bad Parts', tags: ['ifs','parts-work','inner-child','self-therapy','internal'], sentence: "If parts work interests you, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">No Bad Parts</a> (paid link) by Dick Schwartz is the best starting point I know." },
  { asin: '1556439016', name: 'Waking the Tiger', tags: ['somatic','trauma','body','nervous-system','freeze'], sentence: "Peter Levine's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Waking the Tiger</a> (paid link) explains why the body sometimes needs to shake, tremble, or move to complete what the mind can't finish alone." },
  { asin: '0393710165', name: 'The Polyvagal Theory', tags: ['polyvagal','nervous-system','safety','vagus-nerve'], sentence: "If you want to understand why your body reacts the way it does, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Polyvagal Theory</a> (paid link) by Stephen Porges is dense but worth the effort." },
  { asin: '0062883682', name: 'What Happened to You', tags: ['trauma','childhood','brain','resilience','connection'], sentence: "I keep coming back to <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">What Happened to You</a> (paid link) - it shifts the question from 'what's wrong with you' to 'what happened to you.'" },
  { asin: '1401945074', name: 'Forgive for Good', tags: ['forgiveness','science','research','health','method'], sentence: "Fred Luskin's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Forgive for Good</a> (paid link) brings Stanford research to forgiveness - if you need evidence before you trust a process, start here." },
  { asin: '0525509283', name: 'Set Boundaries Find Peace', tags: ['boundaries','relationships','self-care','communication'], sentence: "If boundaries are the piece you're missing, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Set Boundaries Find Peace</a> (paid link) by Nedra Tawwab is the most practical guide I've found." },
  { asin: '0062457713', name: 'The Book of Forgiving', tags: ['forgiveness','reconciliation','justice','truth'], sentence: "Desmond Tutu's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Book of Forgiving</a> (paid link) offers a fourfold path tested in some of the hardest circumstances imaginable." },
  { asin: '1501121685', name: "It Didn't Start with You", tags: ['ancestral','generational','epigenetics','family','inherited'], sentence: "Mark Wolynn's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">It Didn't Start with You</a> (paid link) traces emotional patterns back through family lines - sometimes what you're carrying isn't even yours." },
  { asin: 'B07R3YPKQX', name: 'Tibetan Singing Bowl Set', tags: ['singing-bowl','meditation','sound','vibration','ritual'], sentence: "I started using a <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Tibetan Singing Bowl</a> (paid link) during my own forgiveness practice, and the vibration anchors the work in a way that words alone can't." },
  { asin: 'B08DFPC99N', name: 'Meditation Cushion', tags: ['meditation','cushion','sitting','practice','posture'], sentence: "A decent <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Meditation Cushion</a> (paid link) makes a real difference - the body needs support when you ask it to be still with difficult material." },
  { asin: 'B0BZK3MHXG', name: 'Theragun Mini', tags: ['massage','tension','body','release','muscle'], sentence: "A <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Theragun Mini</a> (paid link) targets the specific muscle tension that often accompanies unresolved resentment - jaw, shoulders, hips especially." },
  { asin: 'B07PXLF7TC', name: 'Weighted Blanket', tags: ['weighted-blanket','anxiety','nervous-system','sleep','grounding'], sentence: "A <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Weighted Blanket</a> (paid link) provides deep pressure stimulation that calms an activated nervous system - it's like a hug that doesn't ask anything of you." },
  { asin: 'B07RZDCQSC', name: 'Essential Oil Diffuser', tags: ['diffuser','essential-oils','atmosphere','calm','ritual'], sentence: "An <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Essential Oil Diffuser</a> (paid link) can anchor your practice in a specific sensory experience - the body remembers scent faster than it remembers words." },
  { asin: 'B0CYB1K6SG', name: 'Magnesium Glycinate', tags: ['magnesium','sleep','nervous-system','calm','supplement'], sentence: "<a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Magnesium Glycinate</a> (paid link) supports nervous system regulation and the kind of deep sleep that chronic resentment tends to steal." },
  { asin: '1648481388', name: 'The Forgiveness Workbook', tags: ['forgiveness','workbook','exercises','writing','practice'], sentence: "If you prefer working things out on paper, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Forgiveness Workbook</a> (paid link) gives you guided exercises that take this from theory to practice." },
  { asin: 'B0BX7GR3XG', name: 'Shadow Work Journal', tags: ['shadow','inner-work','journaling','unconscious','self-discovery'], sentence: "A <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Shadow Work Journal</a> (paid link) is designed for exactly this kind of exploration - the parts of yourself you tend to avoid are usually the ones holding the resentment." },
  { asin: 'B0C8JYR2PN', name: 'Breathing Exercise Device', tags: ['breathwork','breathing','nervous-system','regulation','vagus'], sentence: "A <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Breathing Exercise Device</a> (paid link) guides your exhale to activate the vagus nerve - it's a physical tool for something that feels entirely internal." },
  { asin: 'B0CXJK9QMN', name: 'Grounding Mat', tags: ['grounding','earthing','body','nature','nervous-system'], sentence: "A <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Grounding Mat</a> (paid link) brings the calming effects of earth contact indoors - your nervous system responds to it whether your mind believes in it or not." },
];

function selectProducts(title, categorySlug, body) {
  const text = (title + ' ' + categorySlug + ' ' + body).toLowerCase();
  const scored = PRODUCT_CATALOG.map(p => {
    let score = 0;
    for (const tag of p.tags) {
      if (text.includes(tag)) score += 3;
    }
    return { product: p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  
  // Pick top 3 with variety
  const selected = [];
  const usedAsins = new Set();
  for (const { product } of scored) {
    if (selected.length >= 3) break;
    if (usedAsins.has(product.asin)) continue;
    selected.push(product);
    usedAsins.add(product.asin);
  }
  return selected;
}

function injectAmazonLinks(body, products) {
  const paragraphs = body.match(/<p>[\s\S]*?<\/p>/g) || [];
  if (paragraphs.length < 4) {
    // Short article - append links
    for (const p of products) {
      const url = `https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}`;
      const sentence = p.sentence.replace('URL', url);
      body += `\n<p>${sentence}</p>`;
    }
    return body;
  }
  
  const total = paragraphs.length;
  const positions = [
    Math.max(2, Math.floor(total * 0.30)),
    Math.max(4, Math.floor(total * 0.55)),
    Math.max(6, Math.floor(total * 0.80)),
  ];
  
  for (let i = products.length - 1; i >= 0; i--) {
    const pos = Math.min(positions[i] || positions[0], paragraphs.length - 1);
    const target = paragraphs[pos];
    const url = `https://www.amazon.com/dp/${products[i].asin}?tag=${AMAZON_TAG}`;
    const sentence = products[i].sentence.replace('URL', url);
    const recPara = `<p>${sentence}</p>`;
    
    const idx = body.indexOf(target);
    if (idx >= 0) {
      const insertPoint = idx + target.length;
      body = body.slice(0, insertPoint) + '\n' + recPara + body.slice(insertPoint);
    }
  }
  
  return body;
}

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
  
  // Inject 3 Amazon affiliate links into the body
  const products = selectProducts(topic, category.slug, body);
  body = injectAmazonLinks(body, products);
  
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
        
        // Count Amazon links to verify
        const amazonLinks = (body.match(/amazon\.com\/dp\//g) || []).length;
        console.log(`[generate] Article ${i + 1}/5 has ${amazonLinks} Amazon links`);
        
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
