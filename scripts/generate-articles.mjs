/**
 * Article Publisher / Generator
 * 
 * Queue-based publishing system:
 * - If queue has articles with status='queued', publish one (assign hero image, set published)
 * - If queue is empty, generate a new article using DeepSeek V4-Pro
 * 
 * Phase 1 (published < 60): Fires 5x/day every day
 * Phase 2 (published >= 60): Fires 1x/weekday
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { assignHeroImage } from '../src/lib/image-pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_FILE = path.join(__dirname, '..', 'content', 'articles.json');
const AFFILIATE_TAG = 'spankyspinola-20';

// DeepSeek V4-Pro client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

// ASIN pool for forgiveness/healing niche
const ASIN_POOL = [
  { asin: '0143128043', name: 'When Things Fall Apart', author: 'Pema Chodron' },
  { asin: '0062339346', name: 'The Untethered Soul', author: 'Michael A. Singer' },
  { asin: '0553386697', name: 'The Power of Now', author: 'Eckhart Tolle' },
  { asin: '1401944612', name: 'You Can Heal Your Life', author: 'Louise Hay' },
  { asin: '0062517627', name: 'Forgive for Good', author: 'Dr. Fred Luskin' },
  { asin: '0399592520', name: 'The Body Keeps the Score', author: 'Bessel van der Kolk' },
  { asin: '0553380990', name: 'A New Earth', author: 'Eckhart Tolle' },
  { asin: '0062652559', name: 'Radical Acceptance', author: 'Tara Brach' },
  { asin: '1556439016', name: 'Forgiveness Is a Choice', author: 'Robert D. Enright' },
  { asin: '0393710165', name: 'The Deepest Well', author: 'Nadine Burke Harris' },
  { asin: '1611803438', name: 'Real Love', author: 'Sharon Salzberg' },
  { asin: '1401945074', name: 'Letting Go', author: 'David R. Hawkins' },
  { asin: '0062906585', name: 'What Happened to You?', author: 'Bruce D. Perry' },
  { asin: '0525509283', name: 'Maybe You Should Talk to Someone', author: 'Lori Gottlieb' },
  { asin: '0062457713', name: 'Rising Strong', author: 'Brene Brown' },
  { asin: '1501121685', name: 'It Didn\'t Start with You', author: 'Mark Wolynn' },
  { asin: '0399576770', name: 'Waking the Tiger', author: 'Peter A. Levine' },
  { asin: '0062652710', name: 'True Refuge', author: 'Tara Brach' },
  { asin: '0593236599', name: 'Set Boundaries Find Peace', author: 'Nedra Glover Tawwab' },
  { asin: '0062916432', name: 'Untamed', author: 'Glennon Doyle' },
  { asin: '0062694669', name: 'The Book of Forgiving', author: 'Desmond Tutu' },
  { asin: '0062511734', name: 'Daring Greatly', author: 'Brene Brown' },
  { asin: '0143127748', name: 'The Body Keeps the Score (paperback)', author: 'Bessel van der Kolk' },
  { asin: '1626250766', name: 'Complex PTSD: From Surviving to Thriving', author: 'Pete Walker' },
];

// Categories for the site
const CATEGORIES = ['the-lie', 'the-forensic-method', 'the-body', 'the-specific', 'the-liberation'];

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function pickAsins(count = 3) {
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildAmazonLink(product) {
  return `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}" target="_blank" rel="nofollow sponsored">${product.name} by ${product.author} (paid link)</a>`;
}

async function generateArticle(topic, category) {
  const products = pickAsins(Math.random() < 0.5 ? 3 : 4);
  const productLinks = products.map(p => buildAmazonLink(p));

  const systemPrompt = `You are Kalesh, a consciousness teacher and writer. You write about forgiveness, resentment, healing, and liberation with raw honesty. Your voice is:
- Direct address ("you") throughout
- Contractions everywhere (don't, can't, it's, won't, you're)
- Compassionate but never saccharine
- 2-3 conversational dialogue markers like "Right?!", "Know what I mean?", "Does that land?", "Here's the thing", "Look,"
- Short punchy sentences mixed with longer flowing ones
- First person ("I") mixed with second person ("you")
- NO em-dashes (use " - " instead)
- NO words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore
- NO phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"`;

  const userPrompt = `Write a 1400-2000 word article about: "${topic}"

Category: ${category}

Requirements:
1. Write in HTML format (use <p>, <h2>, <h3>, <ul>, <li>, <blockquote> tags)
2. Include exactly ${products.length} Amazon affiliate links naturally woven into the text. Here are the links to include:
${productLinks.map((l, i) => `   ${i + 1}. ${l}`).join('\n')}
3. Start with a compelling hook - no generic opener
4. Use 2-3 dialogue markers naturally
5. Vary sentence length dramatically (some 3-5 words, some 20+)
6. End with something that lands emotionally, not a summary
7. Do NOT use any banned words or phrases
8. Use " - " (space-hyphen-space) instead of em-dashes`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.72
  });

  return response.choices[0].message.content;
}

async function publishFromQueue(articles) {
  const queued = articles.filter(a => a.status === 'queued');
  if (queued.length === 0) return null;

  // Publish the oldest queued article
  queued.sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
  const article = queued[0];

  // Assign hero image
  const heroUrl = await assignHeroImage(article.slug);
  article.heroImage = heroUrl;
  article.ogImage = heroUrl;
  article.status = 'published';
  article.published_at = new Date().toISOString();

  return article;
}

async function generateAndQueue(articles) {
  // Pick a random topic that doesn't already exist
  const existingSlugs = new Set(articles.map(a => a.slug));
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  // Generate a topic based on category
  const topicPrompt = `Generate one unique, specific article topic about forgiveness/resentment/healing for the category "${category}". Just the topic title, nothing else. Make it specific and emotionally compelling. Don't be generic.`;

  const topicResponse = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: topicPrompt }],
    temperature: 0.9
  });

  const topic = topicResponse.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
  const slug = slugify(topic);

  if (existingSlugs.has(slug)) {
    console.log(`[generate] Slug already exists: ${slug}. Skipping.`);
    return null;
  }

  // Generate with up to 4 attempts
  let body = null;
  let gateResult = null;

  for (let attempt = 1; attempt <= 4; attempt++) {
    console.log(`[generate] Attempt ${attempt}/4 for: ${topic}`);
    const raw = await generateArticle(topic, category);
    gateResult = runQualityGate(raw);

    if (gateResult.passed) {
      body = gateResult.cleaned;
      break;
    } else {
      console.log(`[generate] Gate failed: ${gateResult.failures.join(', ')}`);
    }
  }

  if (!body) {
    console.log(`[generate] All 4 attempts failed for: ${topic}`);
    return null;
  }

  // Build article object
  const now = new Date().toISOString();
  const article = {
    slug,
    title: topic,
    metaTitle: `${topic} | The Unforgiven`,
    metaDescription: `Kalesh explores ${topic.toLowerCase()} - a raw, honest look at what it takes to actually let go.`,
    category,
    dateISO: now.split('T')[0],
    readingTime: `${Math.ceil(gateResult.wordCount / 238)} min read`,
    heroAlt: topic,
    body,
    faqs: [],
    toc: [],
    excerpt: body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) + '...',
    heroImage: '',
    ogImage: '',
    hasAffiliateLinks: true,
    status: 'queued',
    queued_at: now,
    published_at: null
  };

  return article;
}

async function main() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate] AUTO_GEN_ENABLED is not true. Exiting.');
    return;
  }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const queuedCount = articles.filter(a => a.status === 'queued').length;

  console.log(`[generate] Published: ${publishedCount}, Queued: ${queuedCount}`);

  // Try to publish from queue first
  const published = await publishFromQueue(articles);
  if (published) {
    console.log(`[generate] Published from queue: ${published.slug}`);
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 0));
    return;
  }

  // Queue is empty - generate a new article
  console.log('[generate] Queue empty. Generating new article...');
  const newArticle = await generateAndQueue(articles);
  if (newArticle) {
    articles.push(newArticle);
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 0));
    console.log(`[generate] Queued new article: ${newArticle.slug}`);
  }
}

main().catch(err => {
  console.error('[generate] Fatal error:', err);
  process.exit(1);
});
