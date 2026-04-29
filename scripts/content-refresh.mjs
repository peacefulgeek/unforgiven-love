/**
 * Content Refresh Worker
 * - 30-day cycle: Refresh meta descriptions, add new internal links, update product recommendations
 * - 90-day cycle: Full article rewrite with updated research, new Kalesh phrases, fresh opener
 * 
 * Runs monthly (1st 03:00 UTC) and quarterly (1st Jan/Apr/Jul/Oct 04:00 UTC).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_FILE = path.join(__dirname, '..', 'content', 'articles.json');
const AMAZON_TAG = 'spankyspinola-20';

// DeepSeek V4-Pro client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

// Amazon products for re-injection after rewrites
const AMAZON_PRODUCTS = [
  { asin: '0143128043', name: 'When Things Fall Apart', author: 'Pema Chodron', tags: ['grief','loss','buddhism','acceptance'] },
  { asin: '0062339346', name: 'The Untethered Soul', author: 'Michael A. Singer', tags: ['consciousness','freedom','awareness'] },
  { asin: '0553386697', name: 'The Power of Now', author: 'Eckhart Tolle', tags: ['presence','awareness','consciousness'] },
  { asin: '1401944612', name: 'You Can Heal Your Life', author: 'Louise Hay', tags: ['healing','self-love','affirmations'] },
  { asin: '0062517627', name: 'Forgive for Good', author: 'Dr. Fred Luskin', tags: ['forgiveness','method','science'] },
  { asin: '0399592520', name: 'The Body Keeps the Score', author: 'Bessel van der Kolk', tags: ['trauma','body','nervous-system'] },
  { asin: '0553380990', name: 'A New Earth', author: 'Eckhart Tolle', tags: ['ego','consciousness','awakening'] },
  { asin: '0062652559', name: 'Radical Acceptance', author: 'Tara Brach', tags: ['acceptance','self-compassion','buddhism'] },
  { asin: '1556439016', name: 'Forgiveness Is a Choice', author: 'Robert D. Enright', tags: ['forgiveness','choice','method'] },
  { asin: '1401945074', name: 'Letting Go', author: 'David R. Hawkins', tags: ['surrender','release','consciousness'] },
  { asin: '0062906585', name: 'What Happened to You?', author: 'Bruce D. Perry', tags: ['trauma','childhood','brain'] },
  { asin: '1501121685', name: 'It Didn\'t Start with You', author: 'Mark Wolynn', tags: ['ancestral','generational','family'] },
];

function buildAmazonLink(product) {
  return `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${product.name} by ${product.author} (paid link)</a>`;
}

function injectAmazonLinksAfterRewrite(body, title, category) {
  const existingLinks = (body.match(/amazon\.com\/dp\//g) || []).length;
  if (existingLinks >= 3) return body;

  const text = (title + ' ' + category + ' ' + body).toLowerCase();
  const scored = AMAZON_PRODUCTS.map(p => {
    let score = 0;
    for (const tag of p.tags) { if (text.includes(tag)) score += 3; }
    return { product: p, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const needed = 3 - existingLinks;
  const products = scored.slice(0, needed).map(s => s.product);
  const paragraphs = body.match(/<p>[\s\S]*?<\/p>/g) || [];

  if (paragraphs.length < 3) {
    for (const p of products) {
      body += `\n<p>I'd recommend picking up ${buildAmazonLink(p)} - it changed how I think about this work.</p>`;
    }
    return body;
  }

  const total = paragraphs.length;
  const positions = [Math.floor(total * 0.30), Math.floor(total * 0.55), Math.floor(total * 0.80)];
  for (let i = products.length - 1; i >= 0; i--) {
    const pos = Math.min(positions[i] || 2, paragraphs.length - 1);
    const target = paragraphs[pos];
    const recPara = `<p>One resource that really helped me here is ${buildAmazonLink(products[i])}.</p>`;
    const idx = body.indexOf(target);
    if (idx >= 0) {
      body = body.slice(0, idx + target.length) + '\n' + recPara + body.slice(idx + target.length);
    }
  }
  return body;
}

async function rewriteArticle(article) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are Kalesh, a consciousness teacher. Write in long unfolding sentences with short drops. Never use em-dashes (use " - " instead). Never use AI-flagged words (utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore). Output only HTML.'
      },
      {
        role: 'user',
        content: `Rewrite this article about "${article.title}" with fresh perspective, updated research references, and new examples. Keep 1200-2500 words. Never use em-dashes. Add 2-3 conversational interjections like "Right?!", "Know what I mean?", "Does that land?". Vary sentence lengths aggressively. Output only HTML body starting with <h2>.\n\nCurrent article:\n${article.body.substring(0, 4000)}`
      },
    ],
    temperature: 0.85,
  });

  let body = response.choices[0].message.content.trim();
  body = body.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  body = body.replace(/[\u2014\u2013]/g, ' - ');

  // Re-inject Amazon links if the rewrite lost them
  body = injectAmazonLinksAfterRewrite(body, article.title, article.category);

  return body;
}

async function refreshMeta(article) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: 'Generate a fresh meta description. Max 155 characters. No em-dashes. Conversational tone. Just the description text, nothing else.' },
      { role: 'user', content: `Write a new meta description for: "${article.title}". Current: "${article.metaDescription}"` },
    ],
    temperature: 0.8,
  });

  return { metaDescription: response.choices[0].message.content.trim().replace(/"/g, '') };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('[content-refresh] No OPENAI_API_KEY. Skipping.');
    return;
  }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  const now = new Date();
  let refreshed30 = 0;
  let refreshed90 = 0;

  for (const article of articles) {
    if (article.status !== 'published') continue;

    const pubDate = new Date(article.dateISO);
    const lastRefresh = article.lastRefreshed ? new Date(article.lastRefreshed) : pubDate;
    const daysSinceRefresh = Math.floor((now - lastRefresh) / (1000 * 60 * 60 * 24));
    const daysSincePublish = Math.floor((now - pubDate) / (1000 * 60 * 60 * 24));

    // 90-day full rewrite
    if (daysSincePublish >= 90 && daysSinceRefresh >= 85) {
      console.log(`[content-refresh] 90-day rewrite: ${article.slug}`);
      try {
        const newBody = await rewriteArticle(article);
        if (newBody) {
          article.body = newBody;
          article.lastRefreshed = now.toISOString();
          article.refreshCount = (article.refreshCount || 0) + 1;
          refreshed90++;
        }
      } catch (e) {
        console.error(`[content-refresh] Failed 90-day for ${article.slug}:`, e.message);
      }
      if (refreshed90 >= 3) break;
    }
    // 30-day meta refresh
    else if (daysSinceRefresh >= 28) {
      console.log(`[content-refresh] 30-day meta refresh: ${article.slug}`);
      try {
        const newMeta = await refreshMeta(article);
        if (newMeta) {
          article.metaDescription = newMeta.metaDescription || article.metaDescription;
          article.lastRefreshed = now.toISOString();
          refreshed30++;
        }
      } catch (e) {
        console.error(`[content-refresh] Failed 30-day for ${article.slug}:`, e.message);
      }
      if (refreshed30 >= 10) break;
    }
  }

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles));
  console.log(`[content-refresh] Done. 30-day: ${refreshed30}, 90-day: ${refreshed90}`);
}

main().catch(err => {
  console.error('[content-refresh] Error:', err);
  process.exit(1);
});
