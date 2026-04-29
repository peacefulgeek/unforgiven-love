/**
 * Weekly Product Spotlight Generator
 * Generates one product spotlight article every Saturday 08:00 UTC.
 * Uses DeepSeek V4-Pro for content, assignHeroImage() for images.
 * Inserts directly as status='published'.
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

// Product rotation pool
const PRODUCT_POOL = [
  { name: 'Forgive for Good', author: 'Dr. Fred Luskin', asin: '0062517627', category: 'the-forensic-method', topic: 'the science of structured forgiveness' },
  { name: 'The Body Keeps the Score', author: 'Bessel van der Kolk', asin: '0143127748', category: 'the-body', topic: 'how trauma lives in the body and what to do about it' },
  { name: 'The Untethered Soul', author: 'Michael A. Singer', asin: '0062339346', category: 'the-liberation', topic: 'freeing yourself from habitual thoughts and emotions' },
  { name: 'When Things Fall Apart', author: 'Pema Chodron', asin: '0143128043', category: 'the-liberation', topic: 'staying present with pain instead of running' },
  { name: 'Radical Acceptance', author: 'Tara Brach', asin: '0062652559', category: 'the-specific', topic: 'embracing your life with the heart of a Buddha' },
  { name: 'Letting Go', author: 'David R. Hawkins', asin: '1401945074', category: 'the-liberation', topic: 'the pathway of surrender and emotional release' },
  { name: 'What Happened to You?', author: 'Bruce D. Perry', asin: '0062906585', category: 'the-body', topic: 'understanding trauma through brain science' },
  { name: 'It Didn\'t Start with You', author: 'Mark Wolynn', asin: '1501121685', category: 'the-specific', topic: 'inherited family trauma and ancestral resentment' },
  { name: 'Rising Strong', author: 'Brene Brown', asin: '0062457713', category: 'the-forensic-method', topic: 'the reckoning, the rumble, and the revolution' },
  { name: 'The Book of Forgiving', author: 'Desmond Tutu', asin: '0062694669', category: 'the-lie', topic: 'forgiveness at the civilizational scale' },
  { name: 'Waking the Tiger', author: 'Peter A. Levine', asin: '0399576770', category: 'the-body', topic: 'somatic experiencing and trauma discharge' },
  { name: 'Complex PTSD: From Surviving to Thriving', author: 'Pete Walker', asin: '1626250766', category: 'the-specific', topic: 'recovering from complex childhood trauma' },
];

function buildAmazonLink(product) {
  return `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}" target="_blank" rel="nofollow sponsored">${product.name} by ${product.author} (paid link)</a>`;
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function main() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[product-spotlight] AUTO_GEN_ENABLED is not true. Skipping.');
    return;
  }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));

  // Find which products have already been spotlighted
  const spotlightSlugs = articles
    .filter(a => a.slug && a.slug.startsWith('product-spotlight-'))
    .map(a => a.slug);

  const usedCount = spotlightSlugs.length;
  const productIndex = usedCount % PRODUCT_POOL.length;
  const product = PRODUCT_POOL[productIndex];

  // Pick 2 additional products for the 3-4 Amazon link requirement
  const otherProducts = PRODUCT_POOL.filter((_, i) => i !== productIndex);
  const extras = otherProducts.sort(() => Math.random() - 0.5).slice(0, 2);
  const allProducts = [product, ...extras];

  const title = `Product Spotlight: ${product.name} by ${product.author}`;
  const slug = `product-spotlight-${slugify(product.name)}-${Date.now()}`;

  console.log(`[product-spotlight] Generating: ${title}`);

  const productLinks = allProducts.map(p => buildAmazonLink(p));

  let body = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are Kalesh, a consciousness teacher and writer. Write an honest product review with raw authenticity. Use contractions, direct address ("you"), 2-3 dialogue markers ("Right?!", "Know what I mean?", "Does that land?"). NO em-dashes (use " - " instead). NO banned words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.`
          },
          {
            role: 'user',
            content: `Write a 1400-2000 word product spotlight article about "${product.name}" by ${product.author}. Topic: ${product.topic}.

Requirements:
1. HTML format (<p>, <h2>, <h3>, <ul>, <li>, <blockquote>)
2. Include exactly ${allProducts.length} Amazon affiliate links naturally:
${productLinks.map((l, i) => `   ${i + 1}. ${l}`).join('\n')}
3. Honest review - mention both strengths and limitations
4. Connect to the forgiveness journey
5. Start with a hook, end emotionally
6. Include FTC disclosure at top: "This article contains affiliate links. We may earn a small commission if you make a purchase - at no extra cost to you."
7. Use " - " instead of em-dashes`
          }
        ],
        temperature: 0.72,
      });

      const raw = response.choices[0].message.content;
      const gateResult = runQualityGate(raw);

      if (gateResult.passed) {
        body = gateResult.cleaned;
        break;
      } else {
        console.log(`[product-spotlight] Gate failed attempt ${attempt}: ${gateResult.failures.join(', ')}`);
      }
    } catch (err) {
      console.error(`[product-spotlight] Error attempt ${attempt}: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  if (!body) {
    console.error('[product-spotlight] All 4 attempts failed. Skipping this week.');
    return;
  }

  // Assign hero image from library
  const heroUrl = await assignHeroImage(slug);

  const now = new Date().toISOString();
  const article = {
    slug,
    title,
    metaTitle: `${title} | The Unforgiven`,
    metaDescription: `Kalesh's honest review of ${product.name} - and why it matters for the forgiveness journey.`,
    category: product.category,
    dateISO: now.split('T')[0],
    readingTime: `${Math.ceil(body.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 238)} min read`,
    heroAlt: `${product.name} - a recommended resource for the forgiveness journey`,
    body,
    faqs: [],
    toc: [],
    excerpt: `Kalesh's honest review of ${product.name} - and why it matters for the forgiveness journey.`,
    heroImage: heroUrl,
    ogImage: heroUrl,
    hasAffiliateLinks: true,
    status: 'published',
    queued_at: now,
    published_at: now,
  };

  articles.push(article);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles));

  console.log(`[product-spotlight] Published: ${title}`);
  console.log(`[product-spotlight] Total articles: ${articles.length}`);
}

main().catch(err => {
  console.error('[product-spotlight] Error:', err);
  process.exit(1);
});
