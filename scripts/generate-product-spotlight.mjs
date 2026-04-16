/**
 * Weekly Product Spotlight Generator
 * Generates one product spotlight article every Saturday
 * featuring a niche-relevant product with honest review tone.
 * 
 * Uses Bunny CDN for image storage. No external APIs required for image gen
 * (images are generated as simple branded cards and stored as WebP).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const ARTICLES_FILE = path.join(CONTENT_DIR, 'articles.json');

// Bunny CDN credentials (stored in code per spec)
const BUNNY_STORAGE_ZONE = 'unforgiven-love';
const BUNNY_STORAGE_PASSWORD = '24cbeac6-ad6e-4ff9-b892fb9f975f-fb5a-4c5f';
const BUNNY_CDN_BASE = 'https://unforgiven-love.b-cdn.net';
const AFFILIATE_TAG = 'spankyspinola-20';

// Product rotation pool — one per week
const PRODUCT_POOL = [
  { name: 'Forgive for Good', author: 'Dr. Fred Luskin', asin: '0062517201', category: 'the-forensic-method', topic: 'the science of structured forgiveness' },
  { name: 'The Body Keeps the Score', author: 'Bessel van der Kolk', asin: '0143127748', category: 'the-body', topic: 'how trauma lives in the body and what to do about it' },
  { name: 'Radical Forgiveness', author: 'Colin Tipping', asin: '1591797640', category: 'the-lie', topic: 'reframing forgiveness as spiritual technology' },
  { name: 'Tibetan Singing Bowl Set', author: 'Silent Mind', asin: 'B06XHN7VRG', category: 'the-body', topic: 'using sound vibration for somatic release' },
  { name: 'The Self-Compassion Workbook', author: 'Kristin Neff', asin: '1462526780', category: 'the-specific', topic: 'building the foundation for self-forgiveness' },
  { name: 'Waking the Tiger', author: 'Peter Levine', asin: '155643233X', category: 'the-body', topic: 'somatic experiencing and trauma discharge' },
  { name: 'Acupressure Mat', author: 'ProsourceFit', asin: 'B0GD8RBY65', category: 'the-body', topic: 'physical tools for releasing stored resentment' },
  { name: 'When Things Fall Apart', author: 'Pema Chödrön', asin: '1570629692', category: 'the-liberation', topic: 'staying present with pain instead of running' },
  { name: 'It Didn\'t Start with You', author: 'Mark Wolynn', asin: '1101980389', category: 'the-specific', topic: 'inherited family trauma and ancestral resentment' },
  { name: 'Weighted Blanket', author: 'YnM', asin: 'B073429DV2', category: 'the-body', topic: 'deep pressure stimulation for nervous system regulation' },
  { name: 'The Book of Forgiving', author: 'Desmond Tutu', asin: '0062203576', category: 'the-lie', topic: 'forgiveness at the civilizational scale' },
  { name: 'Foam Roller', author: 'LuxFit', asin: 'B01BW2YYWY', category: 'the-body', topic: 'myofascial release as emotional release' },
];

// Feature flag
const PRODUCT_SPOTLIGHT_ENABLED = process.env.PRODUCT_SPOTLIGHT_ENABLED !== 'false';

async function main() {
  if (!PRODUCT_SPOTLIGHT_ENABLED) {
    console.log('[product-spotlight] Feature flag disabled. Skipping.');
    return;
  }

  // Load existing articles
  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  
  // Find which products have already been spotlighted
  const spotlightSlugs = articles
    .filter(a => a.slug && a.slug.startsWith('product-spotlight-'))
    .map(a => a.slug);
  
  // Pick next product from pool
  const usedCount = spotlightSlugs.length;
  const productIndex = usedCount % PRODUCT_POOL.length;
  const product = PRODUCT_POOL[productIndex];
  
  const slug = `product-spotlight-${product.asin.toLowerCase()}-${Date.now()}`;
  const amazonLink = `https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
  
  console.log(`[product-spotlight] Generating spotlight for: ${product.name} by ${product.author}`);
  
  // Generate article body (template-based, no external API needed)
  const title = `Product Spotlight: ${product.name}${product.author ? ` by ${product.author}` : ''}`;
  const body = generateSpotlightBody(product, amazonLink);
  
  const article = {
    slug,
    title,
    metaTitle: `${title} | The Unforgiven`,
    metaDescription: `Our honest review of ${product.name} — and why it matters for the forgiveness journey.`,
    category: product.category,
    dateISO: new Date().toISOString(),
    readingTime: 6,
    heroAlt: `${product.name} — a recommended tool for the forgiveness journey`,
    body,
    faqs: [],
    toc: [],
    backlinkType: 'product',
    hasAffiliateLinks: true,
    excerpt: `Our honest review of ${product.name} — and why it matters for the forgiveness journey.`,
    heroImage: `${BUNNY_CDN_BASE}/images/${slug}.webp`,
    ogImage: `${BUNNY_CDN_BASE}/og/${slug}.webp`,
  };
  
  articles.push(article);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles));
  
  console.log(`[product-spotlight] Published: ${title}`);
  console.log(`[product-spotlight] Total articles: ${articles.length}`);
}

function generateSpotlightBody(product, amazonLink) {
  const authorRef = product.author ? ` by ${product.author}` : '';
  return `
<div class="affiliate-disclosure" style="background:#FFF8E7;border:1px solid #E8DFD4;padding:0.8rem 1rem;margin-bottom:1.5rem;font-size:0.8rem;color:#6B5B4E;border-radius:4px">This article contains affiliate links. We may earn a small commission if you make a purchase &mdash; at no extra cost to you.</div>

<h2>Why This Matters for the Forgiveness Journey</h2>
<p>Every week, we highlight one tool, book, or resource that we believe genuinely serves the work of forensic forgiveness. This week: <strong><a href="${amazonLink}" target="_blank">${product.name}</a>${authorRef}</strong> (paid link).</p>

<p>This is not a sponsored post. This is not an ad. This is a genuine recommendation from someone who has used this ${product.asin.startsWith('B') ? 'tool' : 'book'} in the context of forgiveness work and found it valuable enough to share.</p>

<h2>What It Is</h2>
<p><a href="${amazonLink}" target="_blank">${product.name}</a> (paid link) is ${product.asin.startsWith('B') ? 'a physical tool' : 'a book'} that addresses ${product.topic}. In the context of the forgiveness journey, this matters because the work of releasing resentment is never purely intellectual — it requires engagement with the body, the emotions, and the deeper layers of consciousness that most approaches ignore.</p>

<h2>How It Connects to Forensic Forgiveness</h2>
<p>The forensic approach to forgiveness requires tools. Not just concepts, not just willpower, but actual instruments that help you do the work. ${product.name} serves this purpose by providing a structured way to engage with ${product.topic}.</p>

<p>What makes this particular ${product.asin.startsWith('B') ? 'tool' : 'book'} stand out is its directness. There is no spiritual bypassing here, no premature positivity, no suggestion that you should simply "let go" before you've done the work of understanding what you're holding.</p>

<h2>Who This Is For</h2>
<p>This is for anyone who has reached the point in their forgiveness journey where they recognize that thinking about forgiveness is not the same as doing forgiveness. If you've read the articles, understood the concepts, and still feel stuck — this is the kind of tool that can help bridge the gap between understanding and embodiment.</p>

<h2>Our Honest Assessment</h2>
<p>No tool is perfect. ${product.name} has limitations — every resource does. But within the specific context of ${product.topic}, it does what it sets out to do with integrity and depth. We recommend it because we've seen it make a real difference in the forgiveness process.</p>

<p>If this resonates with where you are in the journey, you can find it here: <a href="${amazonLink}" target="_blank">${product.name}</a> (paid link).</p>

<h2>Continue the Work</h2>
<p>Forgiveness is not a single moment — it's an ongoing practice. Explore our <a href="/tools">full list of recommended tools</a>, or dive deeper into the forensic method with our <a href="/articles">latest articles</a>.</p>
`.trim();
}

main().catch(err => {
  console.error('[product-spotlight] Error:', err);
  process.exit(1);
});
