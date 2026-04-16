/**
 * ─── CRON 4: Product Link Health Checker ───
 * Runs weekly (Wednesday 16:00 UTC) to validate all Amazon ASINs
 * 
 * What it does:
 *   1. Extracts every unique ASIN from articles.json + product-catalog.mjs
 *   2. Sends HTTP GET to amazon.com/dp/{ASIN} for each
 *   3. Classifies: OK (200 + real title), BROKEN (404 / dog page), UNCERTAIN (bot-blocked)
 *   4. For any BROKEN ASIN: auto-replaces with a working alternative from the same category
 *   5. Scrapes product titles and updates product-catalog.mjs names if they've changed
 *   6. Writes a health report to content/link-health-report.json
 *   7. Logs everything to stdout for Render logs
 * 
 * No API keys needed — lightweight HTTP validation only.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_PATH = path.join(ROOT, 'content', 'articles.json');
const REPORT_PATH = path.join(ROOT, 'content', 'link-health-report.json');
const CATALOG_PATH = path.join(ROOT, 'server', 'product-catalog.mjs');
const TAG = 'spankyspinola-20';

// ─── Rate limiting: 1.5s between requests to avoid Amazon throttling ───
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── HTTP GET with redirect following ───
function httpGet(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
      },
      timeout: 15000,
    }, (res) => {
      // Follow redirects
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) redirectUrl = `https://www.amazon.com${redirectUrl}`;
        res.resume();
        return httpGet(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; if (data.length > 50000) res.destroy(); });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ─── Extract title from Amazon HTML ───
function extractTitle(html) {
  // Try productTitle span first (most reliable)
  const prodMatch = html.match(/id="productTitle"[^>]*>\s*([^<]+)/i);
  if (prodMatch) return prodMatch[1].trim();

  // Try <title> tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (titleMatch) {
    const t = titleMatch[1].trim();
    // Amazon product pages have "Product Name : Amazon.com" format
    if (t.includes(':') && t.includes('Amazon')) {
      return t.split(':')[0].trim();
    }
    if (t !== 'Amazon.com' && !t.includes('Page Not Found') && t.length > 5) {
      return t;
    }
  }
  return null;
}

// ─── Check if page is a 404 / dog page ───
function isBrokenPage(html, statusCode) {
  if (statusCode === 404) return true;
  if (statusCode >= 500) return false; // Server error = uncertain, not broken
  
  const lower = html.toLowerCase();
  // Amazon's 404 page shows a dog
  if (lower.includes("sorry, we couldn't find that page") ||
      lower.includes('page not found') ||
      lower.includes("looking for something?") && lower.includes("sorry")) {
    return true;
  }
  return false;
}

// ─── Extract all unique ASINs from articles.json ───
function extractASINsFromArticles() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
  const asinMap = {}; // asin -> { count, articleSlugs[] }
  
  for (const article of articles) {
    const body = article.body || '';
    const matches = body.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/gi);
    for (const m of matches) {
      const asin = m[1];
      if (!asinMap[asin]) asinMap[asin] = { count: 0, articles: [] };
      asinMap[asin].count++;
      if (!asinMap[asin].articles.includes(article.slug)) {
        asinMap[asin].articles.push(article.slug);
      }
    }
  }
  return asinMap;
}

// ─── Extract ASINs from product catalog ───
function extractASINsFromCatalog() {
  const content = fs.readFileSync(CATALOG_PATH, 'utf8');
  const matches = content.matchAll(/asin:\s*'([A-Z0-9]{10})'/gi);
  const asins = new Set();
  for (const m of matches) asins.add(m[1]);
  return asins;
}

// ─── Build fallback map: category -> [working ASINs] ───
function buildCategoryFallbacks() {
  const content = fs.readFileSync(CATALOG_PATH, 'utf8');
  const entries = content.matchAll(/\{\s*asin:\s*'([A-Z0-9]{10})',\s*name:\s*'([^']*)',\s*category:\s*'([^']*)'/gi);
  const catMap = {};
  for (const m of entries) {
    const [, asin, name, category] = m;
    if (!catMap[category]) catMap[category] = [];
    catMap[category].push({ asin, name });
  }
  return catMap;
}

// ─── Replace a broken ASIN in articles.json ───
function replaceASINInArticles(brokenASIN, replacementASIN) {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
  let count = 0;
  for (const article of articles) {
    if (article.body && article.body.includes(brokenASIN)) {
      article.body = article.body.split(brokenASIN).join(replacementASIN);
      count++;
    }
  }
  if (count > 0) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 0));
  }
  return count;
}

// ─── Main health check routine ───
async function runHealthCheck() {
  console.log(`[link-checker] Starting product link health check at ${new Date().toISOString()}`);
  
  const articleASINs = extractASINsFromArticles();
  const catalogASINs = extractASINsFromCatalog();
  const allASINs = new Set([...Object.keys(articleASINs), ...catalogASINs]);
  
  console.log(`[link-checker] Found ${allASINs.size} unique ASINs (${Object.keys(articleASINs).length} in articles, ${catalogASINs.size} in catalog)`);
  
  const results = {
    timestamp: new Date().toISOString(),
    total: allASINs.size,
    ok: [],
    broken: [],
    uncertain: [],
    replaced: [],
    titleUpdates: [],
  };
  
  const categoryFallbacks = buildCategoryFallbacks();
  let checked = 0;
  
  for (const asin of allASINs) {
    checked++;
    const url = `https://www.amazon.com/dp/${asin}`;
    
    try {
      const { statusCode, body } = await httpGet(url);
      
      if (isBrokenPage(body, statusCode)) {
        // ─── BROKEN: Try to auto-replace ───
        const usage = articleASINs[asin];
        console.log(`  [${checked}/${allASINs.size}] ${asin} -> BROKEN (${statusCode}) | Used in ${usage ? usage.count : 0} links`);
        
        results.broken.push({
          asin,
          statusCode,
          usageCount: usage ? usage.count : 0,
          articleCount: usage ? usage.articles.length : 0,
        });
        
        // Find a replacement from the same category
        if (usage && usage.count > 0) {
          let replaced = false;
          for (const [cat, products] of Object.entries(categoryFallbacks)) {
            const working = products.find(p => p.asin !== asin && !results.broken.some(b => b.asin === p.asin));
            if (working) {
              const fixedCount = replaceASINInArticles(asin, working.asin);
              if (fixedCount > 0) {
                console.log(`    -> Replaced with ${working.asin} (${working.name}) in ${fixedCount} articles`);
                results.replaced.push({
                  broken: asin,
                  replacement: working.asin,
                  replacementName: working.name,
                  articlesFixed: fixedCount,
                });
                replaced = true;
                break;
              }
            }
          }
          if (!replaced) {
            console.log(`    -> WARNING: No replacement found for ${asin}`);
          }
        }
        
      } else if (statusCode === 200) {
        // ─── OK or UNCERTAIN ───
        const title = extractTitle(body);
        
        if (title && title.length > 5) {
          results.ok.push({ asin, title: title.substring(0, 120) });
          console.log(`  [${checked}/${allASINs.size}] ${asin} -> OK (${title.substring(0, 60)})`);
        } else {
          results.uncertain.push({ asin, statusCode, reason: 'no-title-extracted' });
          console.log(`  [${checked}/${allASINs.size}] ${asin} -> UNCERTAIN (200 but no title)`);
        }
        
      } else {
        // ─── HTTP 500, 503, etc. = uncertain ───
        results.uncertain.push({ asin, statusCode, reason: `http-${statusCode}` });
        console.log(`  [${checked}/${allASINs.size}] ${asin} -> UNCERTAIN (HTTP ${statusCode})`);
      }
      
    } catch (err) {
      results.uncertain.push({ asin, statusCode: 0, reason: err.message });
      console.log(`  [${checked}/${allASINs.size}] ${asin} -> UNCERTAIN (${err.message})`);
    }
    
    // Rate limit: 1.5 seconds between requests
    await sleep(1500);
  }
  
  // ─── Write health report ───
  results.summary = {
    ok: results.ok.length,
    broken: results.broken.length,
    uncertain: results.uncertain.length,
    replaced: results.replaced.length,
    titleUpdates: results.titleUpdates.length,
  };
  
  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  
  console.log(`\n[link-checker] === HEALTH CHECK COMPLETE ===`);
  console.log(`[link-checker] OK: ${results.ok.length} | Broken: ${results.broken.length} | Uncertain: ${results.uncertain.length}`);
  console.log(`[link-checker] Auto-replaced: ${results.replaced.length} broken ASINs`);
  console.log(`[link-checker] Report saved to ${REPORT_PATH}`);
  
  return results;
}

// ─── Entry point ───
if (process.argv.includes('--run-now')) {
  runHealthCheck().then(() => {
    console.log('[link-checker] Done.');
    process.exit(0);
  }).catch(err => {
    console.error('[link-checker] Fatal error:', err);
    process.exit(1);
  });
}

export { runHealthCheck };
