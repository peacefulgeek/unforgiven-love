/**
 * Content Refresh Worker
 * - 30-day cycle: Refresh meta descriptions, add new internal links, update product recommendations
 * - 90-day cycle: Full article rewrite with updated research, new Kalesh phrases, fresh opener
 * 
 * Runs weekly on Sunday 10:00 UTC. Checks article ages and refreshes as needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_FILE = path.join(__dirname, '..', 'content', 'articles.json');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function main() {
  if (!OPENAI_API_KEY) {
    console.log('[content-refresh] No OPENAI_API_KEY. Skipping.');
    return;
  }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  const now = new Date();
  let refreshed30 = 0;
  let refreshed90 = 0;

  for (const article of articles) {
    if (article.status === 'gated') continue;

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
      // Rate limit: max 3 full rewrites per run
      if (refreshed90 >= 3) break;
    }
    // 30-day meta refresh
    else if (daysSinceRefresh >= 28) {
      console.log(`[content-refresh] 30-day meta refresh: ${article.slug}`);
      try {
        const newMeta = await refreshMeta(article, articles);
        if (newMeta) {
          article.metaDescription = newMeta.metaDescription || article.metaDescription;
          article.lastRefreshed = now.toISOString();
          refreshed30++;
        }
      } catch (e) {
        console.error(`[content-refresh] Failed 30-day for ${article.slug}:`, e.message);
      }
      // Rate limit: max 10 meta refreshes per run
      if (refreshed30 >= 10) break;
    }
  }

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles));
  console.log(`[content-refresh] Done. 30-day: ${refreshed30}, 90-day: ${refreshed90}`);
}

// Amazon product catalog for re-injection after rewrites
const AMAZON_TAG = 'spankyspinola-20';
const AMAZON_PRODUCTS = [
  { asin: '0143128043', name: 'The Body Keeps the Score', tags: ['trauma','body','nervous-system','somatic'], sentence: "If you want to go deeper on how trauma lives in the body, I'd recommend picking up <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Body Keeps the Score</a> (paid link) - it changed how I think about this work entirely." },
  { asin: '0062339346', name: 'The Gifts of Imperfection', tags: ['self-compassion','vulnerability','shame'], sentence: "One book that really helped me with this was <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Gifts of Imperfection</a> (paid link) by Brene Brown." },
  { asin: '0553386697', name: 'The Power of Now', tags: ['presence','awareness','consciousness','mindfulness'], sentence: "If presence is something you're working on, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Power of Now</a> (paid link) is worth having on your shelf." },
  { asin: '1401944612', name: 'Radical Forgiveness', tags: ['forgiveness','radical','letting-go','spiritual'], sentence: "For a structured approach to this, I often point people toward <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Radical Forgiveness</a> (paid link) by Colin Tipping." },
  { asin: '0062517627', name: 'When Things Fall Apart', tags: ['grief','loss','buddhism','acceptance'], sentence: "When everything feels like it's crumbling, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">When Things Fall Apart</a> (paid link) by Pema Chodron sits with you in the wreckage." },
  { asin: '0399592520', name: 'The Wisdom of Trauma', tags: ['trauma','addiction','connection','childhood'], sentence: "Gabor Mate's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">The Wisdom of Trauma</a> (paid link) reframes the whole conversation." },
  { asin: '1583949771', name: 'Radical Acceptance', tags: ['acceptance','self-compassion','buddhism'], sentence: "Tara Brach's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Radical Acceptance</a> (paid link) taught me that the opposite of resistance isn't giving up." },
  { asin: '0062652559', name: 'No Bad Parts', tags: ['ifs','parts-work','inner-child'], sentence: "If parts work interests you, <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">No Bad Parts</a> (paid link) by Dick Schwartz is the best starting point I know." },
  { asin: '1556439016', name: 'Waking the Tiger', tags: ['somatic','trauma','body','freeze'], sentence: "Peter Levine's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Waking the Tiger</a> (paid link) explains why the body sometimes needs to shake to complete what the mind can't finish alone." },
  { asin: 'B07R3YPKQX', name: 'Tibetan Singing Bowl Set', tags: ['singing-bowl','meditation','sound','vibration'], sentence: "I started using a <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Tibetan Singing Bowl</a> (paid link) during my own forgiveness practice." },
  { asin: 'B07PXLF7TC', name: 'Weighted Blanket', tags: ['weighted-blanket','anxiety','nervous-system','sleep'], sentence: "A <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">Weighted Blanket</a> (paid link) provides deep pressure stimulation that calms an activated nervous system." },
  { asin: '1501121685', name: "It Didn't Start with You", tags: ['ancestral','generational','epigenetics','family'], sentence: "Mark Wolynn's <a href=\"URL\" target=\"_blank\" rel=\"nofollow sponsored\">It Didn't Start with You</a> (paid link) traces emotional patterns back through family lines." },
];

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
      const url = `https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}`;
      body += `\n<p>${p.sentence.replace('URL', url)}</p>`;
    }
    return body;
  }
  
  const total = paragraphs.length;
  const positions = [Math.floor(total * 0.30), Math.floor(total * 0.55), Math.floor(total * 0.80)];
  for (let i = products.length - 1; i >= 0; i--) {
    const pos = Math.min(positions[i] || 2, paragraphs.length - 1);
    const target = paragraphs[pos];
    const url = `https://www.amazon.com/dp/${products[i].asin}?tag=${AMAZON_TAG}`;
    const recPara = `<p>${products[i].sentence.replace('URL', url)}</p>`;
    const idx = body.indexOf(target);
    if (idx >= 0) {
      body = body.slice(0, idx + target.length) + '\n' + recPara + body.slice(idx + target.length);
    }
  }
  return body;
}

async function rewriteArticle(article) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are Kalesh, a consciousness teacher. Write in long unfolding sentences with short drops. Never use em-dashes. Never use AI-flagged words (profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, resonate, embark, paradigm, leverage, utilize, facilitate, moreover, furthermore, nevertheless, seamlessly, pivotal, myriad, plethora, robust, foster, cultivate, navigate, landscape, realm, unveil, beacon, testament, cornerstone). Output only HTML.' },
        { role: 'user', content: `Rewrite this article about "${article.title}" with fresh perspective, updated research references, and new examples. Keep 1200-1800 words. Never use em-dashes. Add 2 conversational interjections. Vary sentence lengths aggressively. Output only HTML body starting with <h2>.\n\nCurrent article:\n${article.body.substring(0, 4000)}` },
      ],
      max_tokens: 4000,
      temperature: 0.85,
    }),
  });

  const data = await response.json();
  let body = data.choices[0].message.content.trim();
  body = body.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  body = body.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');
  
  // Re-inject Amazon links if the rewrite lost them
  body = injectAmazonLinksAfterRewrite(body, article.title, article.category);
  
  return body;
}

async function refreshMeta(article, allArticles) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'Generate a fresh meta description. Max 155 characters. No em-dashes. Conversational tone.' },
        { role: 'user', content: `Write a new meta description for: "${article.title}". Current: "${article.metaDescription}"` },
      ],
      max_tokens: 100,
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  return { metaDescription: data.choices[0].message.content.trim().replace(/"/g, '') };
}

main().catch(err => {
  console.error('[content-refresh] Error:', err);
  process.exit(1);
});
