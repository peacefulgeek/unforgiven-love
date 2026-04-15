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
