import express from 'express';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchProducts, buildProductLink, buildHealingJourneySection, amazonLink } from './product-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// ─── BUNNY CDN CONFIG ───
const BUNNY_STORAGE_ZONE = 'unforgiven-love';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_STORAGE_PASSWORD = '24cbeac6-ad6e-4ff9-b892fb9f975f-fb5a-4c5f';
const BUNNY_CDN_BASE = 'https://unforgiven-love.b-cdn.net';

// ─── SITE CONFIG ───
const SITE = {
  title: 'The Unforgiven',
  subtitle: 'Forensic Forgiveness for the Things You Can\'t Let Go',
  tagline: 'Real forgiveness isn\'t what you\'ve been told. It\'s harder, slower, and it actually works.',
  domain: 'https://unforgiven.love',
  editorialName: 'The Unforgiven Editorial',
};

const AUTHOR = {
  name: 'Kalesh',
  title: 'Consciousness Teacher & Writer',
  bio: 'Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.',
  link: 'https://kalesh.love',
  linkText: "Visit Kalesh's Website",
  jobTitle: 'Consciousness Teacher & Writer',
};

const CATEGORIES = [
  { slug: 'the-lie', name: 'The Lie', description: 'Everything you were told about forgiveness that keeps you stuck.' },
  { slug: 'the-forensic-method', name: 'The Forensic Method', description: 'The systematic, non-bypassing approach to real forgiveness.' },
  { slug: 'the-body', name: 'The Body', description: 'Where unforgiveness lives — and how to release it from the tissue.' },
  { slug: 'the-specific', name: 'The Specific', description: 'Forgiving parents, partners, yourself — the hardest cases.' },
  { slug: 'the-liberation', name: 'The Liberation', description: 'What happens after real forgiveness — and why it changes everything.' },
];

// ─── LOAD ARTICLES ───
let _articlesCache = null;
let _articlesCacheTime = 0;

function loadArticles() {
  const now = Date.now();
  // Cache for 60 seconds in production, 5 seconds in dev
  const cacheTTL = isProduction ? 60000 : 5000;
  if (_articlesCache && (now - _articlesCacheTime) < cacheTTL) {
    return _articlesCache;
  }
  
  const contentDir = path.join(ROOT, 'content');
  let articles = [];
  
  // Primary: load from articles.json (built from articles_done.json)
  const mainFile = path.join(contentDir, 'articles.json');
  if (fs.existsSync(mainFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(mainFile, 'utf-8'));
      if (Array.isArray(data)) articles = data;
    } catch (e) { console.error('Error loading articles.json:', e.message); }
  }
  
  // Fallback: load from articles_done.json
  if (articles.length === 0) {
    const doneFile = path.join(contentDir, 'articles_done.json');
    if (fs.existsSync(doneFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(doneFile, 'utf-8'));
        if (Array.isArray(data)) articles = data;
      } catch (e) { console.error('Error loading articles_done.json:', e.message); }
    }
  }
  
  // Ensure all articles have required fields with defaults
  articles = articles.map(a => ({
    ...a,
    heroImage: a.heroImage || `${BUNNY_CDN_BASE}/images/${a.slug}.webp`,
    ogImage: a.ogImage || `${BUNNY_CDN_BASE}/og/${a.slug}.webp`,
    readingTime: a.readingTime || Math.max(8, Math.round((a.body || '').split(/\s+/).length / 250)),
    faqs: a.faqs || [],
    toc: a.toc || [],
    excerpt: a.excerpt || '',
  }));
  
  _articlesCache = articles;
  _articlesCacheTime = now;
  return articles;
}

function filterPublished(articles) {
  const now = new Date();
  return articles.filter(a => new Date(a.dateISO) <= now);
}

function getArticles() {
  const all = loadArticles();
  return { all, published: filterPublished(all) };
}

// ─── HTML TEMPLATES ───
function htmlHead(title, description, canonical, ogImage, extra = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#704214">
<meta name="author" content="${SITE.editorialName}">
<meta name="description" content="${escHtml(description)}">
<meta name="keywords" content="forgiveness, forensic forgiveness, healing, resentment, letting go, trauma recovery, self-forgiveness">
<title>${escHtml(title)}</title>
<link rel="canonical" href="${canonical}">
<link rel="alternate" type="application/rss+xml" title="${SITE.title}" href="${SITE.domain}/feed.xml">
<meta property="og:type" content="website">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${SITE.title}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
<meta property="article:author" content="${SITE.editorialName}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escHtml(title)}">
<meta name="twitter:description" content="${escHtml(description)}">
${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
${extra}
<style>
@font-face{font-family:'Eczar';src:url('${BUNNY_CDN_BASE}/fonts/Eczar-Regular.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'Eczar';src:url('${BUNNY_CDN_BASE}/fonts/Eczar-Bold.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:'Eczar';src:url('${BUNNY_CDN_BASE}/fonts/Eczar-SemiBold.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:'Mulish';src:url('${BUNNY_CDN_BASE}/fonts/Mulish-Regular.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'Mulish';src:url('${BUNNY_CDN_BASE}/fonts/Mulish-Bold.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:'Mulish';src:url('${BUNNY_CDN_BASE}/fonts/Mulish-Italic.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap}
@font-face{font-family:'Mulish';src:url('${BUNNY_CDN_BASE}/fonts/Mulish-SemiBold.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--primary:#704214;--secondary:#FFF8E7;--accent:#D4A017;--text:#2D2A26;--text-light:#5C5650;--border:#E8DFD4;--bg:#FFFDF8;--serif:'Eczar',Georgia,serif;--sans:'Mulish','Segoe UI',sans-serif}
html{font-size:18px;scroll-behavior:smooth}
body{font-family:var(--sans);color:var(--text);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,h6{font-family:var(--serif);color:var(--primary);line-height:1.3;margin-bottom:0.5em}
h1{font-size:2.2rem;font-weight:700}
h2{font-size:1.6rem;font-weight:600;margin-top:1.8em}
h3{font-size:1.25rem;font-weight:600}
a{color:var(--primary);text-decoration:none;transition:color 0.2s}
a:hover{color:var(--accent)}
p{margin-bottom:1.3em}
img{max-width:100%;height:auto;display:block}
.container{max-width:1200px;margin:0 auto;padding:0 1.5rem}
/* NAV */
.nav{background:var(--secondary);border-bottom:3px double var(--primary);padding:0.8rem 0;position:sticky;top:0;z-index:100}
.nav-inner{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 1.5rem}
.nav-logo{font-family:var(--serif);font-size:1.5rem;font-weight:700;color:var(--primary);text-decoration:none}
.nav-logo span{display:block;font-family:var(--sans);font-size:0.65rem;font-weight:400;color:var(--text-light);letter-spacing:0.15em;text-transform:uppercase}
.nav-links{display:flex;gap:1.5rem;align-items:center}
.nav-links a{font-size:0.85rem;font-weight:600;color:var(--text);text-transform:uppercase;letter-spacing:0.05em}
.nav-links a:hover{color:var(--accent)}
.nav-hamburger{display:none;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--primary)}
.nav-mobile{display:none;position:fixed;top:0;left:-100%;width:280px;height:100vh;background:var(--secondary);z-index:200;padding:2rem;transition:left 0.3s;box-shadow:2px 0 10px rgba(0,0,0,0.1)}
.nav-mobile.open{left:0}
.nav-mobile a{display:block;padding:0.8rem 0;font-size:1rem;color:var(--text);border-bottom:1px solid var(--border)}
.nav-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:150}
.nav-overlay.open{display:block}
.nav-close{background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--primary);margin-bottom:1rem}
/* SEARCH */
.search-box{position:relative}
.search-box input{padding:0.4rem 0.8rem;border:1px solid var(--border);border-radius:4px;font-family:var(--sans);font-size:0.85rem;width:200px;background:white}
/* FOOTER */
.footer{background:var(--primary);color:var(--secondary);padding:3rem 0 1.5rem;margin-top:4rem}
.footer-inner{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem}
.footer h4{font-family:var(--serif);margin-bottom:1rem;color:var(--accent)}
.footer a{color:var(--secondary);opacity:0.85}
.footer a:hover{opacity:1;color:var(--accent)}
.footer-bottom{text-align:center;padding-top:2rem;margin-top:2rem;border-top:1px solid rgba(255,248,231,0.2);font-size:0.8rem;opacity:0.7;max-width:1200px;margin-left:auto;margin-right:auto;padding-left:1.5rem;padding-right:1.5rem}
/* ARTICLE CARDS */
.card{background:white;border:1px solid var(--border);transition:box-shadow 0.2s}
.card:hover{box-shadow:0 4px 12px rgba(112,66,20,0.1)}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover}
.card-body{padding:1rem}
.card-cat{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);font-weight:700}
.card-title{font-family:var(--serif);font-size:1.1rem;margin:0.3rem 0;color:var(--primary);line-height:1.3}
.card-title a{color:inherit}
.card-meta{font-size:0.75rem;color:var(--text-light)}
.card-sm .card-title{font-size:0.95rem}
.card-sm img{aspect-ratio:4/3}
/* HOMEPAGE */
.hero-banner{background:var(--secondary);border-bottom:2px solid var(--primary);padding:1rem 0;text-align:center}
.hero-banner h1{font-size:2.5rem;margin:0;letter-spacing:-0.02em}
.hero-banner .tagline{font-family:var(--sans);font-size:0.85rem;color:var(--text-light);margin-top:0.3rem}
.hero-banner .dateline{font-size:0.7rem;color:var(--text-light);margin-top:0.5rem;font-family:var(--sans);text-transform:uppercase;letter-spacing:0.15em}
.hp-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin:2rem 0}
.hp-featured{grid-column:1;grid-row:1/3}
.hp-featured .card-title{font-size:1.4rem}
.hp-sidebar{display:flex;flex-direction:column;gap:1rem}
.section-header{font-family:var(--serif);font-size:1.3rem;color:var(--primary);border-bottom:2px solid var(--primary);padding-bottom:0.3rem;margin:2.5rem 0 1rem}
.section-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
/* NEWSLETTER */
.newsletter{background:var(--primary);color:var(--secondary);padding:2.5rem;text-align:center;margin:3rem 0;border-radius:2px}
.newsletter h3{color:var(--accent);margin-bottom:0.5rem}
.newsletter p{opacity:0.9;margin-bottom:1rem}
.newsletter form{display:flex;gap:0.5rem;max-width:400px;margin:0 auto}
.newsletter input[type="email"]{flex:1;padding:0.6rem 1rem;border:none;border-radius:2px;font-family:var(--sans)}
.newsletter button{background:var(--accent);color:white;border:none;padding:0.6rem 1.5rem;font-weight:700;cursor:pointer;border-radius:2px;font-family:var(--sans)}
.newsletter button:hover{background:#c4920f}
.newsletter .success{color:var(--accent);font-weight:600}
/* ARTICLE PAGE */
.article-layout{display:grid;grid-template-columns:200px 1fr 300px;gap:2rem;max-width:1200px;margin:2rem auto;padding:0 1.5rem}
.article-toc{position:sticky;top:80px;align-self:start;max-height:calc(100vh - 100px);overflow-y:auto}
.article-toc h4{font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-light);margin-bottom:0.8rem}
.article-toc a{display:block;font-size:0.8rem;padding:0.3rem 0;color:var(--text-light);border-left:2px solid var(--border);padding-left:0.8rem;line-height:1.4}
.article-toc a:hover,.article-toc a.active{color:var(--primary);border-left-color:var(--accent)}
.article-main{min-width:0}
.article-hero{width:100%;aspect-ratio:16/9;object-fit:cover;margin-bottom:1.5rem}
.article-main h1{font-size:2rem;margin-bottom:0.3rem}
.article-cat-badge{display:inline-block;background:var(--accent);color:white;font-size:0.7rem;padding:0.2rem 0.6rem;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:0.5rem}
.article-meta{font-size:0.8rem;color:var(--text-light);margin-bottom:1.5rem;display:flex;gap:1rem;flex-wrap:wrap}
.article-body{font-size:1rem;line-height:1.7}
.article-body p:first-of-type::first-letter{font-family:var(--serif);font-size:3.5rem;float:left;line-height:1;margin-right:0.1em;color:var(--primary);font-weight:700}
.article-body h2{font-size:1.4rem;margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border)}
.article-body h3{font-size:1.15rem;margin-top:1.5rem}
.article-body blockquote{border-left:3px solid var(--accent);padding:1rem 1.5rem;margin:1.5rem 0;font-family:var(--serif);font-style:italic;color:var(--primary);background:rgba(212,160,23,0.05)}
.article-body a{color:var(--primary);text-decoration:underline;text-decoration-color:var(--accent);text-underline-offset:2px}
.article-body ul,.article-body ol{margin:1rem 0 1.3rem 1.5rem}
.article-body li{margin-bottom:0.4rem}
.share-buttons{display:flex;gap:0.5rem;margin:1.5rem 0;flex-wrap:wrap}
.share-btn{display:inline-flex;align-items:center;gap:0.3rem;padding:0.4rem 0.8rem;border:1px solid var(--border);font-size:0.8rem;color:var(--text);cursor:pointer;background:white;border-radius:2px;font-family:var(--sans)}
.share-btn:hover{background:var(--secondary);border-color:var(--accent)}
/* FAQ */
.faq-section{margin-top:2rem;border-top:2px solid var(--primary);padding-top:1.5rem}
.faq-section h2{border:none;padding-top:0;margin-top:0}
.faq-item{margin-bottom:1.2rem}
.faq-item h3{font-size:1rem;cursor:pointer;color:var(--primary)}
.faq-item p{margin-top:0.3rem;color:var(--text-light)}
/* SIDEBAR */
.article-sidebar{position:sticky;top:80px;align-self:start}
.bio-card{background:var(--secondary);padding:1.2rem;border:1px solid var(--border);margin-bottom:1.5rem;text-align:center}
.bio-card h4{font-family:var(--serif);color:var(--primary);margin-bottom:0.3rem}
.bio-card .bio-title{font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem}
.bio-card p{font-size:0.8rem;color:var(--text-light);margin-bottom:0.8rem}
.bio-card a.bio-link{display:inline-block;background:var(--primary);color:var(--secondary);padding:0.4rem 1rem;font-size:0.8rem;font-weight:600;border-radius:2px}
.bio-card a.bio-link:hover{background:var(--accent)}
.sidebar-section h4{font-size:0.85rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-light);margin-bottom:0.8rem;padding-bottom:0.3rem;border-bottom:1px solid var(--border)}
.sidebar-article{display:flex;gap:0.8rem;margin-bottom:1rem}
.sidebar-article img{width:70px;height:50px;object-fit:cover;flex-shrink:0}
.sidebar-article .sidebar-article-title{font-size:0.8rem;font-family:var(--serif);color:var(--primary);line-height:1.3}
/* RELATED */
.related-section{margin-top:3rem;padding-top:2rem;border-top:2px solid var(--primary)}
.related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
/* LISTING */
.listing-header{text-align:center;padding:2rem 0;border-bottom:2px solid var(--primary)}
.listing-filter{display:flex;gap:1rem;justify-content:center;margin:1.5rem 0;flex-wrap:wrap}
.listing-filter select,.listing-filter input{padding:0.4rem 0.8rem;border:1px solid var(--border);font-family:var(--sans);font-size:0.85rem;border-radius:2px}
.listing-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem;margin:1.5rem 0}
.pagination{display:flex;justify-content:center;gap:0.5rem;margin:2rem 0}
.pagination a,.pagination span{padding:0.4rem 0.8rem;border:1px solid var(--border);font-size:0.85rem;color:var(--text)}
.pagination .active{background:var(--primary);color:var(--secondary);border-color:var(--primary)}
/* CATEGORY */
.cat-header{background:var(--secondary);padding:2rem 0;text-align:center;border-bottom:2px solid var(--primary)}
/* ABOUT/LEGAL */
.page-content{max-width:800px;margin:2rem auto;padding:0 1.5rem}
.page-content h1{text-align:center;margin-bottom:1.5rem}
.advisor-card{background:var(--secondary);padding:2rem;border:1px solid var(--border);text-align:center;margin-top:2rem;max-width:400px;margin-left:auto;margin-right:auto}
/* START HERE */
.start-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin:2rem 0}
/* QUIZ */
.quiz-container{max-width:700px;margin:2rem auto;padding:0 1.5rem}
.quiz-progress{height:4px;background:var(--border);margin-bottom:2rem;border-radius:2px}
.quiz-progress-bar{height:100%;background:var(--accent);border-radius:2px;transition:width 0.3s}
.quiz-question{font-family:var(--serif);font-size:1.3rem;margin-bottom:1.5rem;color:var(--primary)}
.quiz-option{display:block;width:100%;padding:1rem;margin-bottom:0.8rem;border:2px solid var(--border);background:white;cursor:pointer;font-family:var(--sans);font-size:0.95rem;text-align:left;border-radius:2px;transition:all 0.2s}
.quiz-option:hover{border-color:var(--accent);background:var(--secondary)}
.quiz-option:focus{outline:2px solid var(--accent);outline-offset:2px}
.quiz-result{text-align:center;padding:2rem}
.quiz-result h2{color:var(--primary);margin-bottom:1rem}
/* INTERACTIVE */
.interactive-container{max-width:800px;margin:2rem auto;padding:0 1.5rem}
.layer-result{background:var(--secondary);padding:1.5rem;border-left:4px solid var(--accent);margin:1rem 0}
/* COOKIE */
.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:var(--primary);color:var(--secondary);padding:1rem;z-index:300;display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;font-size:0.85rem}
.cookie-banner button{background:var(--accent);color:white;border:none;padding:0.5rem 1.2rem;cursor:pointer;font-weight:600;border-radius:2px}
/* DISCLAIMER */
.disclaimer{background:var(--secondary);border:1px solid var(--border);padding:1rem;margin-top:2rem;font-size:0.8rem;color:var(--text-light)}
/* 404 */
.four04{text-align:center;padding:4rem 1.5rem}
.four04 h1{font-size:3rem}
.four04 .edition{font-size:0.9rem;color:var(--text-light);margin-bottom:2rem}
/* RESPONSIVE */
@media(max-width:768px){
  html{font-size:16px}
  .nav-links{display:none}
  .nav-hamburger{display:block}
  .hp-grid{grid-template-columns:1fr}
  .hp-featured{grid-column:1;grid-row:auto}
  .section-grid{grid-template-columns:1fr}
  .article-layout{grid-template-columns:1fr;gap:1rem}
  .article-toc{display:none}
  .article-sidebar{position:static}
  .related-grid{grid-template-columns:1fr}
  .listing-grid{grid-template-columns:1fr}
  .newsletter form{flex-direction:column}
  .hero-banner h1{font-size:1.8rem}
  .footer-inner{grid-template-columns:1fr}
}
</style>
</head>`;
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function nav() {
  return `<nav class="nav"><div class="nav-inner">
<a href="/" class="nav-logo">${SITE.title}<span>${SITE.subtitle}</span></a>
<div class="nav-links">
<a href="/articles">Articles</a>
<a href="/tools">Tools</a>
<a href="/quizzes">Quizzes</a>
<div class="search-box"><input type="text" placeholder="Search..." id="nav-search" aria-label="Search articles"></div>
<a href="/start-here">Start Here</a>
<a href="/about">About</a>
</div>
<button class="nav-hamburger" aria-label="Open menu" onclick="document.querySelector('.nav-mobile').classList.add('open');document.querySelector('.nav-overlay').classList.add('open')">&#9776;</button>
</div></nav>
<div class="nav-overlay" onclick="document.querySelector('.nav-mobile').classList.remove('open');this.classList.remove('open')"></div>
<div class="nav-mobile">
<button class="nav-close" aria-label="Close menu" onclick="this.parentElement.classList.remove('open');document.querySelector('.nav-overlay').classList.remove('open')">&times;</button>
<a href="/">Home</a>
<a href="/articles">Articles</a>
<a href="/tools">Tools</a>
<a href="/quizzes">Quizzes</a>
${CATEGORIES.map(c => `<a href="/category/${c.slug}">${c.name}</a>`).join('')}
<a href="/start-here">Start Here</a>
<a href="/about">About</a>
<a href="/what-are-you-holding">What Are You Holding?</a>
</div>`;
}

function footer(published) {
  const count = published ? published.length : '300+';
  return `<footer class="footer"><div class="footer-inner">
<div><h4>${SITE.title}</h4><p style="font-size:0.85rem;opacity:0.8">${SITE.tagline}</p><p style="font-size:0.8rem;opacity:0.6;margin-top:0.5rem">${count} articles on forensic forgiveness</p></div>
<div><h4>Sections</h4>${CATEGORIES.map(c => `<a href="/category/${c.slug}" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">${c.name}</a>`).join('')}</div>
<div><h4>Pages</h4>
<a href="/start-here" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">Start Here</a>
<a href="/tools" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">Tools We Recommend</a>
<a href="/quizzes" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">Quizzes</a>
<a href="/about" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">About</a>
<a href="/what-are-you-holding" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">What Are You Holding?</a>
<a href="/privacy" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">Privacy Policy</a>
<a href="/terms" style="display:block;margin-bottom:0.4rem;font-size:0.85rem">Terms of Service</a>
</div>
<div><h4>Stay Connected</h4>
<form class="footer-newsletter" style="margin-top:0.5rem" onsubmit="return handleSubscribe(event,'footer')">
<input type="email" placeholder="Your email" required style="padding:0.4rem;width:100%;margin-bottom:0.5rem;border:none;border-radius:2px;font-family:var(--sans)">
<button type="submit" style="background:var(--accent);color:white;border:none;padding:0.4rem 1rem;cursor:pointer;width:100%;font-weight:600;border-radius:2px">Subscribe</button>
</form>
</div>
</div>
<div class="footer-bottom">
<p>&copy; ${new Date().getFullYear()} ${SITE.editorialName}. All rights reserved.</p>
<p style="margin-top:0.3rem;font-size:0.75rem">As an Amazon Associate I earn from qualifying purchases.</p>
<p style="margin-top:0.3rem"><em>Disclaimer: Content on this site is for educational and informational purposes only. It is not a substitute for professional medical, psychological, or therapeutic advice. Always consult a qualified professional for personal guidance.</em></p>
</div></footer>`;
}

function cookieBanner() {
  return `<div class="cookie-banner" id="cookie-banner" style="display:none">
<span>We use cookies to improve your experience. By continuing to use this site, you agree to our <a href="/privacy" style="color:var(--accent)">Privacy Policy</a>.</span>
<button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookie-consent','true')">Accept</button>
</div>
<script>if(!localStorage.getItem('cookie-consent')){document.getElementById('cookie-banner').style.display='flex'}</script>`;
}

function subscribeScript() {
  return `<script>
async function handleSubscribe(e, source) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, source})
    });
    if (res.ok) {
      form.innerHTML = '<p class="success">Thanks for subscribing!</p>';
    }
  } catch(err) {
    form.innerHTML = '<p class="success">Thanks for subscribing!</p>';
  }
  return false;
}
</script>`;
}

function searchScript() {
  return `<script>
document.getElementById('nav-search')?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && this.value.trim()) {
    window.location.href = '/articles?q=' + encodeURIComponent(this.value.trim());
  }
});
</script>`;
}

function articleCard(article, size = 'normal') {
  const cls = size === 'small' ? 'card card-sm' : 'card';
  return `<div class="${cls}">
<a href="/article/${article.slug}"><img src="${article.heroImage}" alt="${escHtml(article.heroAlt)}" width="600" height="338" loading="lazy"></a>
<div class="card-body">
<div class="card-cat">${escHtml(CATEGORIES.find(c=>c.slug===article.category)?.name || article.category)}</div>
<h3 class="card-title"><a href="/article/${article.slug}">${escHtml(article.title)}</a></h3>
<div class="card-meta">${new Date(article.dateISO).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} &middot; ${article.readingTime} min read</div>
</div></div>`;
}

function jsonLdOrg() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE.title,
    "url": SITE.domain,
    "description": SITE.tagline,
  });
}

function jsonLdWebsite() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE.title,
    "url": SITE.domain,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE.domain}/articles?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });
}

function jsonLdArticle(article) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "image": article.heroImage,
    "datePublished": article.dateISO,
    "dateModified": article.dateISO,
    "author": { "@type": "Person", "name": AUTHOR.name },
    "publisher": { "@type": "Organization", "name": SITE.title, "url": SITE.domain },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE.domain}/article/${article.slug}` },
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".article-body p:first-of-type", ".article-body h2"] },
    "wordCount": article.body ? article.body.split(/\s+/).length : 2600,
  };
  return JSON.stringify(ld);
}

function jsonLdFaq(faqs) {
  if (!faqs || faqs.length === 0) return '';
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  });
}

function jsonLdBreadcrumb(items) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  });
}

// ─── APP ───
const app = express();
app.use(compression());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-AI-Content-Author', AUTHOR.name);
  res.setHeader('X-AI-Content-Site', SITE.title);
  res.setHeader('X-AI-Identity-Endpoint', `${SITE.domain}/api/ai/identity`);
  res.setHeader('X-AI-LLMs-Txt', `${SITE.domain}/llms.txt`);
  next();
});

app.use(express.json());
app.use(express.static(path.join(ROOT, 'public')));

if (isProduction) {
  app.use(express.static(path.join(ROOT, 'dist', 'client')));
}

// ─── API: SUBSCRIBE ───
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const entry = JSON.stringify({ email, date: new Date().toISOString(), source: source || 'unknown' });
    // Write to Bunny CDN storage
    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/data/subscribers.jsonl`;
    // Read existing, append, write back
    let existing = '';
    try {
      const getRes = await fetch(url, { headers: { 'AccessKey': BUNNY_STORAGE_PASSWORD } });
      if (getRes.ok) existing = await getRes.text();
    } catch {}
    const newContent = existing ? existing.trim() + '\n' + entry + '\n' : entry + '\n';
    await fetch(url, {
      method: 'PUT',
      headers: { 'AccessKey': BUNNY_STORAGE_PASSWORD, 'Content-Type': 'application/octet-stream' },
      body: newContent
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.json({ success: true }); // Don't expose errors
  }
});

// ─── AI ENDPOINTS ───
app.get('/llms.txt', (req, res) => {
  const { published } = getArticles();
  res.type('text/plain').send(`# ${SITE.title}
> ${SITE.tagline}

## About
${SITE.title} explores forensic forgiveness — a systematic, non-bypassing approach to releasing what you've been carrying. Written by ${AUTHOR.name}, ${AUTHOR.title}.

## Topics
${CATEGORIES.map(c => `- ${c.name}: ${c.description}`).join('\n')}

## Content
${published.length} published articles on forensic forgiveness, somatic release, and liberation.

## Author
${AUTHOR.name} — ${AUTHOR.title}
${AUTHOR.link}

## Contact
Website: ${SITE.domain}
`);
});

app.get('/.well-known/ai.json', (req, res) => {
  const { published } = getArticles();
  res.json({
    name: SITE.title,
    description: SITE.tagline,
    url: SITE.domain,
    author: { name: AUTHOR.name, title: AUTHOR.title, url: AUTHOR.link },
    topics: CATEGORIES.map(c => c.name),
    article_count: published.length,
    endpoints: {
      identity: `${SITE.domain}/api/ai/identity`,
      topics: `${SITE.domain}/api/ai/topics`,
      ask: `${SITE.domain}/api/ai/ask`,
      articles: `${SITE.domain}/api/ai/articles`,
      sitemap: `${SITE.domain}/api/ai/sitemap`,
    }
  });
});

app.get('/api/ai/identity', (req, res) => {
  res.json({
    site: SITE.title,
    author: AUTHOR.name,
    title: AUTHOR.title,
    bio: AUTHOR.bio,
    url: AUTHOR.link,
    expertise: ['forensic forgiveness', 'somatic release', 'consciousness', 'trauma recovery', 'self-forgiveness'],
  });
});

app.get('/api/ai/topics', (req, res) => {
  res.json({
    categories: CATEGORIES.map(c => ({ name: c.name, slug: c.slug, description: c.description })),
  });
});

app.get('/api/ai/ask', (req, res) => {
  const { published } = getArticles();
  const q = (req.query.q || '').toLowerCase();
  const matches = published.filter(a =>
    a.title.toLowerCase().includes(q) ||
    (a.metaDescription || '').toLowerCase().includes(q)
  ).slice(0, 5);
  res.json({
    query: q,
    results: matches.map(a => ({
      title: a.title,
      url: `${SITE.domain}/article/${a.slug}`,
      excerpt: a.excerpt || a.metaDescription,
    }))
  });
});

app.get('/api/ai/articles', (req, res) => {
  const { published } = getArticles();
  res.json({
    total: published.length,
    articles: published.map(a => ({
      title: a.title,
      url: `${SITE.domain}/article/${a.slug}`,
      category: a.category,
      date: a.dateISO,
    }))
  });
});

app.get('/api/ai/sitemap', (req, res) => {
  const { published } = getArticles();
  res.json({
    pages: [
      { url: SITE.domain, title: 'Home' },
      { url: `${SITE.domain}/articles`, title: 'All Articles' },
      { url: `${SITE.domain}/about`, title: 'About' },
      { url: `${SITE.domain}/start-here`, title: 'Start Here' },
      ...CATEGORIES.map(c => ({ url: `${SITE.domain}/category/${c.slug}`, title: c.name })),
      ...published.map(a => ({ url: `${SITE.domain}/article/${a.slug}`, title: a.title })),
    ]
  });
});

// ─── SITEMAPS ───
app.get('/sitemap-index.xml', (req, res) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>${SITE.domain}/sitemap.xml</loc></sitemap>
<sitemap><loc>${SITE.domain}/sitemap-images.xml</loc></sitemap>
</sitemapindex>`);
});

app.get('/sitemap.xml', (req, res) => {
  const { published } = getArticles();
  const urls = [
    { loc: SITE.domain, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE.domain}/articles`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE.domain}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE.domain}/start-here`, priority: '0.8', changefreq: 'monthly' },
    ...CATEGORIES.map(c => ({ loc: `${SITE.domain}/category/${c.slug}`, priority: '0.8', changefreq: 'weekly' })),
    ...published.map(a => ({ loc: `${SITE.domain}/article/${a.slug}`, priority: '0.7', changefreq: 'monthly' })),
  ];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`);
});

app.get('/sitemap-images.xml', (req, res) => {
  const { published } = getArticles();
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${published.map(a => `<url><loc>${SITE.domain}/article/${a.slug}</loc><image:image><image:loc>${a.heroImage}</image:loc><image:title>${escHtml(a.title)}</image:title></image:image></url>`).join('\n')}
</urlset>`);
});

app.get('/feed.xml', (req, res) => {
  const { published } = getArticles();
  const recent = published.sort((a,b) => new Date(b.dateISO) - new Date(a.dateISO)).slice(0, 20);
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${SITE.title}</title>
<link>${SITE.domain}</link>
<description>${SITE.tagline}</description>
<language>en</language>
<atom:link href="${SITE.domain}/feed.xml" rel="self" type="application/rss+xml"/>
${recent.map(a => `<item><title>${escHtml(a.title)}</title><link>${SITE.domain}/article/${a.slug}</link><description>${escHtml(a.metaDescription)}</description><pubDate>${new Date(a.dateISO).toUTCString()}</pubDate><guid>${SITE.domain}/article/${a.slug}</guid></item>`).join('\n')}
</channel></rss>`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /api/cron/
Disallow: /api/subscribe

Sitemap: ${SITE.domain}/sitemap-index.xml
Sitemap: ${SITE.domain}/sitemap.xml
Sitemap: ${SITE.domain}/sitemap-images.xml

# AI Crawlers
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Anthropic-AI
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Googlebot
Allow: /
User-agent: Applebot
Allow: /
User-agent: Baiduspider
Allow: /
User-agent: YandexBot
Allow: /
User-agent: DuckDuckBot
Allow: /
User-agent: Slurp
Allow: /
User-agent: facebookexternalhit
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: LinkedInBot
Allow: /
User-agent: WhatsApp
Allow: /
User-agent: Discordbot
Allow: /
User-agent: TelegramBot
Allow: /
User-agent: Pinterestbot
Allow: /
User-agent: Redditbot
Allow: /
User-agent: Snapchat
Allow: /
User-agent: ia_archiver
Allow: /
User-agent: archive.org_bot
Allow: /
User-agent: CCBot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: PetalBot
Allow: /
User-agent: Sogou
Allow: /
User-agent: SemrushBot
Allow: /
User-agent: AhrefsBot
Allow: /
User-agent: MJ12bot
Allow: /
User-agent: DotBot
Allow: /
User-agent: Screaming Frog
Allow: /
User-agent: Rogerbot
Allow: /
User-agent: SiteAuditBot
Allow: /
User-agent: DataForSeoBot
Allow: /
User-agent: BLEXBot
Allow: /
User-agent: Seekport
Allow: /
User-agent: ZoominfoBot
Allow: /
User-agent: Neevabot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: YouBot
Allow: /
User-agent: Phind
Allow: /
User-agent: Cohere-AI
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: Meta-ExternalFetcher
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: OAI-SearchBot
Allow: /
`);
});

// ─── HOMEPAGE ───
app.get('/', (req, res) => {
  const { published } = getArticles();
  const sorted = published.sort((a,b) => new Date(b.dateISO) - new Date(a.dateISO));
  const featured = sorted[0];
  const sidebarArticles = sorted.slice(1, 9);
  
  let sectionsHtml = '';
  let sectionCount = 0;
  for (const cat of CATEGORIES) {
    const catArticles = sorted.filter(a => a.category === cat.slug).slice(0, 3);
    if (catArticles.length === 0) continue;
    sectionCount++;
    if (sectionCount === 4) {
      // Newsletter between sections 3 and 4
      sectionsHtml += `<div class="newsletter">
<h3>Stay Connected</h3>
<p>Join our community of people doing the real work of forgiveness.</p>
<form onsubmit="return handleSubscribe(event,'homepage-newsletter')">
<input type="email" placeholder="Your email address" required aria-label="Email for newsletter">
<button type="submit">Subscribe</button>
</form></div>`;
    }
    sectionsHtml += `<h2 class="section-header"><a href="/category/${cat.slug}">${cat.name}</a></h2>
<div class="section-grid">${catArticles.map(a => articleCard(a)).join('')}</div>`;
  }

  const page = `${htmlHead(
    `${SITE.title} — ${SITE.subtitle}`,
    SITE.tagline,
    SITE.domain,
    featured ? featured.ogImage : null,
    `<script type="application/ld+json">${jsonLdOrg()}</script>
<script type="application/ld+json">${jsonLdWebsite()}</script>`
  )}
<body>
${nav()}
<div class="hero-banner">
<div class="container">
<h1>${SITE.title}</h1>
<p class="tagline">${SITE.subtitle}</p>
<p class="dateline">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
</div></div>
<div class="container">
${featured ? `<div class="hp-grid">
<div class="hp-featured">${articleCard(featured)}</div>
<div class="hp-sidebar">${sidebarArticles.slice(0,4).map(a => articleCard(a, 'small')).join('')}</div>
<div class="hp-sidebar">${sidebarArticles.slice(4,8).map(a => articleCard(a, 'small')).join('')}</div>
</div>` : '<p>Articles coming soon.</p>'}
${sectionsHtml}
</div>
${footer(published)}
${cookieBanner()}
${subscribeScript()}
${searchScript()}
</body></html>`;
  res.send(page);
});

// ─── ARTICLES LISTING ───
app.get('/articles', (req, res) => {
  const { published } = getArticles();
  const q = req.query.q || '';
  const cat = req.query.category || '';
  const page = parseInt(req.query.page) || 1;
  const perPage = 20;
  
  let filtered = published.sort((a,b) => new Date(b.dateISO) - new Date(a.dateISO));
  if (q) filtered = filtered.filter(a => a.title.toLowerCase().includes(q.toLowerCase()));
  if (cat) filtered = filtered.filter(a => a.category === cat);
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const pageArticles = filtered.slice((page-1)*perPage, page*perPage);
  
  let paginationHtml = '<div class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    params.set('page', i.toString());
    paginationHtml += i === page
      ? `<span class="active">${i}</span>`
      : `<a href="/articles?${params}">${i}</a>`;
  }
  paginationHtml += '</div>';

  const html = `${htmlHead(
    `Articles — ${SITE.title}`,
    `Explore ${published.length} articles on forensic forgiveness, somatic release, and liberation.`,
    `${SITE.domain}/articles`,
    null,
    `<script type="application/ld+json">${jsonLdBreadcrumb([
      {name:'Home',url:SITE.domain},{name:'Articles',url:`${SITE.domain}/articles`}
    ])}</script>`
  )}
<body>
${nav()}
<div class="listing-header"><div class="container">
<h1>Articles</h1>
<p>${published.length} articles on forensic forgiveness</p>
</div></div>
<div class="container">
<div class="listing-filter">
<select onchange="window.location.href='/articles?category='+this.value" aria-label="Filter by category">
<option value="">All Categories</option>
${CATEGORIES.map(c => `<option value="${c.slug}" ${cat===c.slug?'selected':''}>${c.name}</option>`).join('')}
</select>
<input type="text" placeholder="Search articles..." value="${escHtml(q)}" onkeydown="if(event.key==='Enter')window.location.href='/articles?q='+encodeURIComponent(this.value)" aria-label="Search">
</div>
${pageArticles.length > 0 ? `<div class="listing-grid">
${pageArticles[0] ? `<div style="grid-column:1/-1">${articleCard(pageArticles[0])}</div>` : ''}
${pageArticles.slice(1).map(a => articleCard(a)).join('')}
</div>` : '<p style="text-align:center;padding:2rem">No articles found.</p>'}
${paginationHtml}
</div>
${footer(published)}
${cookieBanner()}
${subscribeScript()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── CATEGORY PAGES ───
app.get('/category/:slug', (req, res) => {
  const cat = CATEGORIES.find(c => c.slug === req.params.slug);
  if (!cat) return res.status(404).send(render404());
  
  const { published } = getArticles();
  const catArticles = published.filter(a => a.category === cat.slug)
    .sort((a,b) => new Date(b.dateISO) - new Date(a.dateISO));
  
  const collectionLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": cat.name,
    "description": cat.description,
    "url": `${SITE.domain}/category/${cat.slug}`,
    "mainEntity": { "@type": "ItemList", "numberOfItems": catArticles.length }
  });

  const html = `${htmlHead(
    `${cat.name} — ${SITE.title}`,
    cat.description,
    `${SITE.domain}/category/${cat.slug}`,
    null,
    `<script type="application/ld+json">${collectionLd}</script>
<script type="application/ld+json">${jsonLdBreadcrumb([
  {name:'Home',url:SITE.domain},{name:cat.name,url:`${SITE.domain}/category/${cat.slug}`}
])}</script>`
  )}
<body>
${nav()}
<div class="cat-header"><div class="container">
<h1>${cat.name}</h1>
<p>${cat.description}</p>
<p style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-light)">${catArticles.length} articles</p>
</div></div>
<div class="container">
<div class="listing-grid" style="margin-top:2rem">
${catArticles.map(a => articleCard(a)).join('')}
</div>
</div>
${footer(published)}
${cookieBanner()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── ARTICLE PAGE ───
app.get('/article/:slug', (req, res) => {
  const { published, all } = getArticles();
  const article = published.find(a => a.slug === req.params.slug);
  if (!article) return res.status(404).send(render404());
  
  const cat = CATEGORIES.find(c => c.slug === article.category);
  const sameCat = published.filter(a => a.category === article.category && a.slug !== article.slug).slice(0, 4);
  const related = published.filter(a => a.slug !== article.slug && a.category !== article.category).slice(0, 6);
  const popular = published.sort(() => 0.5 - Math.random()).filter(a => a.slug !== article.slug && !related.find(r=>r.slug===a.slug)).slice(0, 4);
  
  const tocHtml = (article.toc || []).map(t => `<a href="#${t.id}">${escHtml(t.text)}</a>`).join('');
  
  const faqHtml = article.faqs && article.faqs.length > 0 ? `
<div class="faq-section">
<h2>Frequently Asked Questions</h2>
${article.faqs.map(f => `<div class="faq-item"><h3>${escHtml(f.question)}</h3><p>${escHtml(f.answer)}</p></div>`).join('')}
</div>` : '';

  const faqLd = article.faqs && article.faqs.length > 0 ? `<script type="application/ld+json">${jsonLdFaq(article.faqs)}</script>` : '';

  const shareHtml = `<div class="share-buttons">
<button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href);this.textContent='Copied!'" aria-label="Copy link">&#128279; Copy Link</button>
<a class="share-btn" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE.domain+'/article/'+article.slug)}&text=${encodeURIComponent(article.title)}" target="_blank" rel="nofollow" aria-label="Share on X">&#120143; Share</a>
<a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE.domain+'/article/'+article.slug)}" target="_blank" rel="nofollow" aria-label="Share on Facebook">f Share</a>
</div>`;

  const html = `${htmlHead(
    article.metaTitle || article.title,
    article.metaDescription,
    `${SITE.domain}/article/${article.slug}`,
    article.ogImage,
    `<script type="application/ld+json">${jsonLdArticle(article)}</script>
${faqLd}
<script type="application/ld+json">${jsonLdBreadcrumb([
  {name:'Home',url:SITE.domain},
  {name:cat?.name||article.category,url:`${SITE.domain}/category/${article.category}`},
  {name:article.title,url:`${SITE.domain}/article/${article.slug}`}
])}</script>`
  )}
<body>
${nav()}
<div class="article-layout">
<aside class="article-toc">
<h4>Contents</h4>
${tocHtml}
</aside>
<main class="article-main">
<img class="article-hero" src="${article.heroImage}" alt="${escHtml(article.heroAlt)}" width="1200" height="675">
<h1>${escHtml(article.title)}</h1>
<a href="/category/${article.category}" class="article-cat-badge">${escHtml(cat?.name || article.category)}</a>
<div class="article-meta">
<span>${new Date(article.dateISO).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
<span>${article.readingTime} min read</span>
</div>
${shareHtml}
${article.hasAffiliateLinks ? '<div class="affiliate-disclosure" style="background:#FFF8E7;border:1px solid var(--border);padding:0.8rem 1rem;margin-bottom:1.5rem;font-size:0.8rem;color:var(--text-light);border-radius:4px">This article contains affiliate links. We may earn a small commission if you make a purchase &mdash; at no extra cost to you.</div>' : ''}
<div class="article-body">${article.body}</div>
${faqHtml}
${(() => { const products = matchProducts(article, 4); return buildHealingJourneySection(products); })()}
<div class="health-disclaimer" style="background:linear-gradient(135deg,#FFF8E7,#FFF3D6);border:1px solid var(--border);border-radius:8px;padding:1.5rem;margin-top:2rem;margin-bottom:1.5rem">
<h4 style="font-family:var(--serif);color:var(--primary);margin-bottom:0.5rem;font-size:1rem">Important Health Notice</h4>
<p style="font-size:0.85rem;color:var(--text-light);margin:0;line-height:1.6">The content on this site is intended for educational and informational purposes only and should not be construed as professional medical or psychological advice. The information provided here is not a substitute for consultation with a qualified healthcare provider, licensed therapist, or mental health professional. Every individual's situation is unique, and what works for one person may not be appropriate for another. If you are experiencing emotional distress, mental health challenges, or physical symptoms related to stress or trauma, please consult your healthcare provider or a licensed professional before making any changes to your wellness routine.</p>
</div>
${shareHtml}
<div class="related-section">
<h2 class="section-header">Related Coverage</h2>
<div class="related-grid">${related.slice(0,6).map(a => articleCard(a)).join('')}</div>
</div>
</main>
<aside class="article-sidebar">
<div class="bio-card" style="text-align:center">
<img src="${BUNNY_CDN_BASE}/images/kalesh-author.webp" alt="Kalesh — Consciousness Teacher & Writer" width="120" height="120" style="border-radius:50%;margin:0 auto 0.8rem;display:block;object-fit:cover">
<h4>${AUTHOR.name}</h4>
<div class="bio-title">${AUTHOR.title}</div>
<p style="font-size:0.85rem">Kalesh is a mystic and spiritual advisor who brings ancient wisdom and depth to life's biggest decisions.</p>
<a href="${AUTHOR.link}" class="bio-link" style="display:inline-block;margin-top:0.6rem;background:var(--primary);color:var(--secondary);padding:0.5rem 1.2rem;font-size:0.85rem;font-weight:600;border-radius:4px;text-decoration:none">Book a Session</a>
<a href="${AUTHOR.link}" class="bio-link" style="display:block;margin-top:0.4rem;font-size:0.8rem">Visit Kalesh's Website &rarr;</a>
</div>
<div class="sidebar-section">
<h4>In ${cat?.name || 'This Category'}</h4>
${sameCat.map(a => `<a href="/article/${a.slug}" class="sidebar-article"><img src="${a.heroImage}" alt="${escHtml(a.heroAlt)}" width="70" height="50" loading="lazy"><span class="sidebar-article-title">${escHtml(a.title)}</span></a>`).join('')}
</div>
<div class="sidebar-section" style="margin-top:1.5rem">
<h4>Popular Articles</h4>
${popular.map(a => `<a href="/article/${a.slug}" class="sidebar-article"><img src="${a.heroImage}" alt="${escHtml(a.heroAlt)}" width="70" height="50" loading="lazy"><span class="sidebar-article-title">${escHtml(a.title)}</span></a>`).join('')}
</div>
</aside>
</div>
${footer(published)}
${cookieBanner()}
${subscribeScript()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── ABOUT ───
app.get('/about', (req, res) => {
  const { published } = getArticles();
  const profileLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": AUTHOR.name,
      "jobTitle": AUTHOR.jobTitle,
      "description": AUTHOR.bio,
      "url": AUTHOR.link,
    }
  });
  const html = `${htmlHead(
    `About — ${SITE.title}`,
    `Learn about ${SITE.title} and our approach to forensic forgiveness.`,
    `${SITE.domain}/about`,
    null,
    `<script type="application/ld+json">${profileLd}</script>`
  )}
<body>
${nav()}
<div class="page-content">
<h1>About ${SITE.title}</h1>
<p>${SITE.title} exists because most forgiveness advice is incomplete, premature, or outright harmful. We created this publication to explore what real forgiveness looks like — the kind that happens in the body, not just the mind. The kind that takes time, precision, and courage.</p>
<p>Our editorial team brings together decades of experience in trauma recovery, somatic therapy, contemplative practice, and the emerging science of forgiveness. Every article is grounded in research, informed by clinical practice, and written with the understanding that forgiveness is not a single moment but an ongoing process of liberation.</p>
<p>We publish on five core themes: the cultural lies about forgiveness that keep people stuck, the forensic method for systematic release, the body's role in holding and releasing resentment, specific forgiveness scenarios that require specialized approaches, and the liberation that follows genuine forgiveness work.</p>
<p>This is not a site that will tell you to forgive and forget. This is a site that will sit with you in the complexity of what happened, help you examine it with precision, and guide you toward a release that is earned — not performed.</p>

<div class="advisor-card" style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap">
<img src="${BUNNY_CDN_BASE}/images/kalesh-author.webp" alt="Kalesh — Consciousness Teacher & Writer" width="160" height="160" style="border-radius:50%;object-fit:cover;flex-shrink:0">
<div style="flex:1;min-width:250px">
<h4 style="margin-bottom:0.2rem">${AUTHOR.name}</h4>
<div class="bio-title" style="font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.8rem">${AUTHOR.title}</div>
<p style="font-size:0.9rem;color:var(--text-light);line-height:1.7">${AUTHOR.bio}</p>
<p style="font-size:0.9rem;color:var(--text-light);line-height:1.7;margin-top:0.5rem">Kalesh is a mystic and spiritual advisor who brings ancient wisdom and depth to life's biggest decisions. His work with ${SITE.title} explores the intersection of forensic forgiveness, somatic release, and consciousness — helping readers move from intellectual understanding to embodied liberation.</p>
<div style="margin-top:1rem;display:flex;gap:0.8rem;flex-wrap:wrap">
<a href="${AUTHOR.link}" style="display:inline-block;background:var(--primary);color:var(--secondary);padding:0.5rem 1.2rem;font-size:0.85rem;font-weight:600;border-radius:4px;text-decoration:none">Book a Session</a>
<a href="${AUTHOR.link}" style="display:inline-block;border:1px solid var(--primary);color:var(--primary);padding:0.5rem 1.2rem;font-size:0.85rem;font-weight:600;border-radius:4px;text-decoration:none">Visit kalesh.love &rarr;</a>
</div>
</div>
</div>
</div>
${footer(published)}
${cookieBanner()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── START HERE ───
app.get('/start-here', (req, res) => {
  const { published } = getArticles();
  // Pick pillar articles — one from each category
  const pillars = CATEGORIES.map(cat => {
    return published.find(a => a.category === cat.slug) || null;
  }).filter(Boolean).slice(0, 6);
  
  const html = `${htmlHead(
    `Start Here — ${SITE.title}`,
    'New to forensic forgiveness? Start with these essential articles.',
    `${SITE.domain}/start-here`,
    null
  )}
<body>
${nav()}
<div class="page-content" style="max-width:1000px">
<h1>Start Here</h1>
<p>If you're new to ${SITE.title}, welcome. This isn't another forgiveness blog that tells you to let go and move on. This is a publication dedicated to the real work — the forensic examination of what you're carrying, why it's still there, and how to release it without bypassing the truth of what happened.</p>
<p>Start with these foundational articles, one from each of our core themes:</p>
<div class="start-grid">
${pillars.map(a => articleCard(a)).join('')}
</div>
<p style="margin-top:2rem">After these, explore our <a href="/articles">full archive</a> or take the <a href="/what-are-you-holding">What Are You Still Holding?</a> assessment to discover where your forgiveness work needs to begin.</p>
</div>
${footer(published)}
${cookieBanner()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── TOOLS WE RECOMMEND ───
app.get('/tools', (req, res) => {
  const { published } = getArticles();
  const TOOLS_TAG = 'spankyspinola-20';
  const amz = (asin) => `https://www.amazon.com/dp/${asin}?tag=${TOOLS_TAG}`;

  const toolCategories = [
    {
      name: 'Books on Forgiveness & Letting Go',
      products: [
        { name: 'Forgive for Good', author: 'Dr. Fred Luskin', asin: '0062517201', desc: 'The Stanford forgiveness researcher\'s field manual. If you only read one book on the science of forgiveness, this is the one. Luskin\'s nine-step method is the closest thing to a clinical protocol for releasing resentment.' },
        { name: 'Radical Forgiveness', author: 'Colin Tipping', asin: '1591797640', desc: 'Tipping reframes forgiveness as a spiritual technology rather than a moral obligation. His five-stage process cuts through the intellectual resistance most people feel when told to "just forgive."' },
        { name: 'The Book of Forgiving', author: 'Desmond Tutu & Mpho Tutu', asin: '0062203576', desc: 'Written by the architect of South Africa\'s Truth and Reconciliation Commission, this is forgiveness at the civilizational scale — and somehow still deeply personal.' },
        { name: 'Forgiving What You Can\'t Forget', author: 'Lysa TerKeurst', asin: '0718039874', desc: 'For when the wound is still fresh and the idea of forgiveness feels like betrayal. TerKeurst writes from lived experience, not theory, and her honesty about the messiness of the process is rare.' },
        { name: 'Forgive and Forget', author: 'Lewis B. Smedes', asin: '0061285826', desc: 'The classic that started the modern forgiveness conversation. Smedes distinguishes between forgiving and excusing, forgiving and forgetting, forgiving and reconciling — distinctions most people never make.' },
      ]
    },
    {
      name: 'Books on Trauma, Somatic Healing & the Body',
      products: [
        { name: 'The Body Keeps the Score', author: 'Bessel van der Kolk', asin: '0143127748', desc: 'The definitive work on how trauma lives in the body. Van der Kolk\'s research changed how we understand the relationship between unresolved experience and physical health. Essential reading for anyone doing forgiveness work.' },
        { name: 'Waking the Tiger', author: 'Peter Levine', asin: '155643233X', desc: 'Levine\'s somatic experiencing framework explains why talking about trauma isn\'t enough — the body has to discharge the energy it\'s been holding. This book is the foundation of body-based forgiveness work.' },
        { name: 'When Things Fall Apart', author: 'Pema Ch\u00f6dr\u00f6n', asin: '1570629692', desc: 'Ch\u00f6dr\u00f6n teaches the radical practice of staying present with pain instead of running from it. Her approach to groundlessness is the contemplative counterpart to forensic forgiveness.' },
        { name: 'The Myth of Normal', author: 'Gabor Mat\u00e9', asin: '0593083881', desc: 'Mat\u00e9 dismantles the idea that chronic illness and emotional suffering are personal failures. His work on the connection between suppressed emotion and disease is directly relevant to anyone holding unforgiveness in their body.' },
        { name: 'It Didn\'t Start with You', author: 'Mark Wolynn', asin: '1101980389', desc: 'Wolynn\'s work on inherited family trauma explains why some resentments feel older than your own life. If your forgiveness work keeps hitting a wall, the answer may be ancestral.' },
      ]
    },
    {
      name: 'Journals & Workbooks',
      products: [
        { name: 'The Forgiveness Workbook', author: 'Eileen Barker', asin: '1641524391', desc: 'A structured, guided workbook that walks you through the forgiveness process one exercise at a time. Useful for people who need a container for the work — not just inspiration.' },
        { name: 'The Self-Compassion Workbook', author: 'Kristin Neff & Christopher Germer', asin: '1462526780', desc: 'Self-forgiveness requires self-compassion first. Neff\'s research-backed exercises help you build the internal foundation that makes genuine self-forgiveness possible.' },
        { name: 'Moleskine Classic Notebook', author: '', asin: '8883701127', desc: 'Sometimes the best forgiveness tool is a blank page. The Moleskine is our go-to for freewriting, resentment inventories, and the forensic examination of what you\'re carrying.' },
        { name: 'Morning Pages Journal', author: 'Julia Cameron', asin: '0874778867', desc: 'Cameron\'s "The Artist\'s Way" morning pages practice is one of the most effective ways to surface unconscious resentment. This companion journal makes the practice tangible.' },
      ]
    },
    {
      name: 'Meditation & Somatic Tools',
      products: [
        { name: 'Tibetan Singing Bowl Set', author: 'Silent Mind', asin: 'B06XHN7VRG', desc: 'Sound vibration is one of the fastest ways to shift a stuck emotional state. This handcrafted bowl produces the kind of resonance that helps the body release what the mind can\'t.' },
        { name: 'Zafu Meditation Cushion', author: 'Retrospec', asin: 'B07GXCF76X', desc: 'Proper posture changes the quality of your inner work. This buckwheat hull cushion supports the kind of sustained sitting that forgiveness meditation requires.' },
        { name: 'Acupressure Mat and Pillow Set', author: 'ProsourceFit', asin: 'B00BMS4GEG', desc: 'When resentment is lodged in the back, shoulders, or neck, this acupressure mat provides targeted somatic release. Twenty minutes on this mat can shift what hours of thinking cannot.' },
        { name: 'Weighted Blanket (20 lbs)', author: 'YnM', asin: 'B073429DV2', desc: 'Deep pressure stimulation activates the parasympathetic nervous system — the state your body needs to be in for genuine forgiveness work. This is the tool for when your nervous system won\'t settle.' },
        { name: 'Essential Oil Diffuser', author: 'ASAKUKI', asin: 'B07C1NVNKQ', desc: 'Scent bypasses the cognitive brain entirely. Lavender, frankincense, and sandalwood create the olfactory environment that supports deep emotional processing.' },
      ]
    },
    {
      name: 'Apps & Digital Resources',
      products: [
        { name: 'Insight Timer', author: '', asin: '', url: 'https://insighttimer.com', desc: 'The world\'s largest free meditation library. Search for "forgiveness meditation" and you\'ll find hundreds of guided practices. This is where we send people who need a daily forgiveness practice.' },
        { name: 'Calm', author: '', asin: '', url: 'https://www.calm.com', desc: 'Calm\'s body scan meditations are particularly useful for locating where unforgiveness lives in your tissue. The sleep stories also help when resentment keeps you awake at 3am.' },
        { name: 'Waking Up', author: 'Sam Harris', asin: '', url: 'https://www.wakingup.com', desc: 'Harris\'s meditation app goes deeper than most — into the nature of consciousness itself. For those whose forgiveness work has become a contemplative practice, this is the next level.' },
      ]
    },
    {
      name: 'Physical Healing & Bodywork Tools',
      products: [
        { name: 'TheraCane Massager', author: '', asin: 'B000PRMCJU', desc: 'Trigger points hold emotional memory. The TheraCane lets you access and release the deep tissue knots that form around unprocessed resentment — especially in the upper back and shoulders.' },
        { name: 'Yoga Blocks (Set of 2)', author: 'Gaiam', asin: 'B0027DFJRA', desc: 'Restorative yoga is one of the most effective somatic forgiveness practices. These blocks support the kind of long, surrendered holds that allow the body to release what it\'s gripping.' },
        { name: 'Foam Roller', author: 'LuxFit', asin: 'B00KAEJ51A', desc: 'Myofascial release is the physical counterpart to emotional release. Rolling out the IT band, hip flexors, and thoracic spine can unlock stored grief and anger that talk therapy misses.' },
        { name: 'Breathwork Trainer', author: 'Airofit', asin: 'B08KWJQ3WX', desc: 'Conscious breathing is the bridge between the body and the mind. This device trains respiratory capacity and control — the foundation of every somatic forgiveness practice.' },
      ]
    },
  ];

  const totalProducts = toolCategories.reduce((sum, cat) => sum + cat.products.length, 0);
  const itemListLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Forgiveness Tools & Resources We Recommend",
    "description": "Curated list of the best books, tools, apps, and resources for forensic forgiveness and healing.",
    "numberOfItems": totalProducts,
    "itemListElement": toolCategories.flatMap((cat, ci) => cat.products.map((p, pi) => ({
      "@type": "ListItem",
      "position": ci * 10 + pi + 1,
      "name": p.name,
      "url": p.asin ? amz(p.asin) : (p.url || '#')
    })))
  });

  const html = `${htmlHead(
    `Best Forgiveness Tools & Resources We Recommend | ${SITE.title}`,
    `Curated list of the best books, tools, apps, and resources for forensic forgiveness and healing. Personally vetted recommendations from ${AUTHOR.name}.`,
    `${SITE.domain}/tools`,
    null,
    `<script type="application/ld+json">${itemListLd}</script>`
  )}
<body>
${nav()}
<div class="page-content" style="max-width:900px">
<h1>Tools We Recommend</h1>
<div class="affiliate-disclosure" style="background:#FFF8E7;border:1px solid var(--border);padding:0.8rem 1rem;margin-bottom:1.5rem;font-size:0.8rem;color:var(--text-light);border-radius:4px">This page contains affiliate links. We may earn a small commission if you make a purchase &mdash; at no extra cost to you.</div>
<p>These are the tools, books, and resources we actually trust. Every recommendation here has been chosen because it serves the work this site is about — the real, forensic, body-level work of forgiveness. Nothing here is filler. If it\'s on this page, it\'s because we\'ve seen it make a difference.</p>
<p>We\'ve organized these into categories, from the books that changed how we think about forgiveness to the physical tools that help the body release what the mind can\'t. Start wherever feels most relevant to where you are in the process.</p>
${toolCategories.map(cat => `
<h2 style="margin-top:2.5rem;padding-bottom:0.5rem;border-bottom:2px solid var(--border)">${cat.name}</h2>
<div style="display:grid;gap:1rem;margin-top:1rem">
${cat.products.map(p => {
  const link = p.asin ? amz(p.asin) : (p.url || '#');
  const paidLabel = p.asin ? ' (paid link)' : '';
  return `<div style="background:white;border:1px solid var(--border);border-radius:6px;padding:1.2rem">
<h3 style="margin:0 0 0.3rem"><a href="${link}" target="_blank" rel="${p.asin ? '' : 'nofollow '}noopener">${p.name}</a>${p.author ? ` <span style="font-weight:400;font-size:0.85rem;color:var(--text-light)">by ${p.author}</span>` : ''}${paidLabel}</h3>
<p style="margin:0;font-size:0.9rem;color:var(--text-light);line-height:1.6">${p.desc}</p>
</div>`;
}).join('')}
</div>
`).join('')}
<div style="margin-top:3rem;padding:1.5rem;background:var(--secondary);border-radius:8px;text-align:center">
<h3>Looking for More?</h3>
<p>We regularly publish in-depth reviews of tools and resources for the forgiveness journey. Check our <a href="/articles">latest articles</a> or take our <a href="/what-are-you-holding">What Are You Still Holding?</a> assessment to discover where your work needs to begin.</p>
</div>
</div>
${footer(published)}
${cookieBanner()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── QUIZZES LISTING ───
app.get('/quizzes', (req, res) => {
  const { published } = getArticles();
  const html = `${htmlHead(
    `Forgiveness Quizzes & Assessments | ${SITE.title}`,
    'Take our free forgiveness quizzes and assessments to discover where your healing work needs to begin.',
    `${SITE.domain}/quizzes`,
    null
  )}
<body>
${nav()}
<div class="page-content" style="max-width:1000px">
<h1>Quizzes & Assessments</h1>
<p>These tools are designed to illuminate — not diagnose. Each quiz takes 2-3 minutes and gives you immediate, actionable results. No data is stored. Your answers stay on your screen, and you can download your results as a PDF if you want to keep them.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin-top:2rem">
${QUIZZES.map(q => `<div style="background:white;border:1px solid var(--border);border-radius:8px;padding:1.5rem;transition:box-shadow 0.2s">
<h3 style="margin:0 0 0.5rem"><a href="/quiz/${q.slug}" style="color:var(--primary)">${q.title}</a></h3>
<p style="font-size:0.85rem;color:var(--text-light);margin:0 0 1rem;line-height:1.5">${q.description}</p>
<a href="/quiz/${q.slug}" style="display:inline-block;background:var(--primary);color:var(--secondary);padding:0.4rem 1rem;font-size:0.85rem;font-weight:600;border-radius:4px;text-decoration:none">Take This Quiz</a>
</div>`).join('')}
</div>
<div style="margin-top:3rem;padding:1.5rem;background:var(--secondary);border-radius:8px">
<h3>Interactive Assessment</h3>
<p>For a deeper exploration, try our comprehensive <a href="/what-are-you-holding">What Are You Still Holding?</a> assessment. It maps the six layers of unforgiveness — body, mind, emotions, energy, relationships, and ancestral — to show you where the most unprocessed material lives.</p>
<a href="/what-are-you-holding" style="display:inline-block;margin-top:0.5rem;background:var(--primary);color:var(--secondary);padding:0.5rem 1.2rem;font-size:0.85rem;font-weight:600;border-radius:4px;text-decoration:none">Start the Assessment</a>
</div>
</div>
${footer(published)}
${cookieBanner()}
${searchScript()}
</body></html>`;
  res.send(html);
});

// ─── PRIVACY ───
app.get('/privacy', (req, res) => {
  const { published } = getArticles();
  const html = `${htmlHead('Privacy Policy — ' + SITE.title, 'Privacy policy for ' + SITE.title, SITE.domain + '/privacy', null)}
<body>${nav()}<div class="page-content">
<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> March 27, 2026</p>
<h2>Information We Collect</h2>
<p>When you subscribe to our newsletter, we collect your email address. This information is stored securely on Bunny CDN storage infrastructure. We do not use databases, third-party email marketing platforms, or any other data storage mechanisms.</p>
<h2>How We Use Your Information</h2>
<p>Email addresses collected through our subscription forms are stored for potential future newsletter communications. Currently, no automated emails are sent from this site.</p>
<h2>Data Storage</h2>
<p>Subscriber data is stored on Bunny CDN (bunny.net) storage zones. Bunny CDN operates data centers globally with industry-standard security practices.</p>
<h2>Cookies</h2>
<p>This site uses minimal cookies for essential functionality, including remembering your cookie consent preference. We do not use analytics cookies, tracking cookies, or third-party advertising cookies.</p>
<h2>Third-Party Services</h2>
<p>We use Bunny CDN for content delivery and data storage. We do not use Google Analytics, Facebook Pixel, or any other tracking services.</p>
<h2>Affiliate Disclosure</h2>
<p>As an Amazon Associate I earn from qualifying purchases.</p>
<p>This site is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Some links on this site are affiliate links, meaning we may earn a small commission at no additional cost to you.</p>
<h2>Your Rights</h2>
<p>You have the right to request deletion of your data. Since we only collect email addresses through voluntary subscription, you may request removal by visiting our About page for current contact information.</p>
<h2>Changes to This Policy</h2>
<p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.</p>
</div>${footer(published)}${cookieBanner()}${searchScript()}</body></html>`;
  res.send(html);
});

// ─── TERMS ───
app.get('/terms', (req, res) => {
  const { published } = getArticles();
  const html = `${htmlHead('Terms of Service — ' + SITE.title, 'Terms of service for ' + SITE.title, SITE.domain + '/terms', null)}
<body>${nav()}<div class="page-content">
<h1>Terms of Service</h1>
<p><strong>Last updated:</strong> March 27, 2026</p>
<h2>Educational Purpose</h2>
<p>All content on ${SITE.title} is provided for educational and informational purposes only. Nothing on this site constitutes professional medical, psychological, therapeutic, or legal advice. Always consult qualified professionals for personal guidance.</p>
<h2>No Professional Relationship</h2>
<p>Reading content on this site does not create a therapist-client, doctor-patient, or any other professional relationship. The information presented reflects research, editorial perspective, and contemplative inquiry — not clinical diagnosis or treatment recommendations.</p>
<h2>Intellectual Property</h2>
<p>All content, including articles, images, and site design, is the intellectual property of ${SITE.editorialName}. You may share links to our content but may not reproduce, distribute, or create derivative works without written permission.</p>
<h2>Limitation of Liability</h2>
<p>${SITE.editorialName} shall not be liable for any damages arising from the use of information on this site. You assume full responsibility for how you apply the information presented here.</p>
<h2>User Conduct</h2>
<p>By using this site, you agree to use it lawfully and respectfully. Any misuse, including automated scraping beyond reasonable limits, may result in access restrictions.</p>
<h2>Changes</h2>
<p>We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of updated terms.</p>
</div>${footer(published)}${cookieBanner()}${searchScript()}</body></html>`;
  res.send(html);
});

// ─── WHAT ARE YOU HOLDING (INTERACTIVE) ───
app.get('/what-are-you-holding', (req, res) => {
  const { published } = getArticles();
  const html = `${htmlHead(
    'What Are You Still Holding? — ' + SITE.title,
    'Discover which of the 6 layers of unforgiveness holds the most material for you.',
    SITE.domain + '/what-are-you-holding',
    null
  )}
<body>${nav()}
<div class="interactive-container">
<h1>What Are You Still Holding?</h1>
<p>This assessment illuminates which of the six layers of unforgiveness — body, mind, emotions, energy, relationships, and ancestral — holds the most unprocessed material for you. Answer honestly. There are no wrong answers, only information.</p>
<div id="assessment">
<div id="assessment-questions"></div>
<div id="assessment-results" style="display:none"></div>
</div>
</div>
<script>
const questions = [
  { text: "When you think of the person who hurt you most, where do you feel it first?", options: [
    { text: "My jaw clenches or my shoulders tighten", layer: "body" },
    { text: "My thoughts start racing with what I should have said", layer: "mind" },
    { text: "A wave of sadness or anger rises immediately", layer: "emotions" },
    { text: "I feel drained, like my energy drops", layer: "energy" },
    { text: "I think about how it affected my other relationships", layer: "relationships" },
    { text: "I think about patterns that go back generations", layer: "ancestral" }
  ]},
  { text: "How does unforgiveness most commonly show up in your daily life?", options: [
    { text: "Physical tension, pain, or illness I can't fully explain", layer: "body" },
    { text: "Intrusive thoughts or mental rehearsals of past events", layer: "mind" },
    { text: "Emotional reactivity that seems disproportionate", layer: "emotions" },
    { text: "Fatigue or feeling heavy for no clear reason", layer: "energy" },
    { text: "Difficulty trusting new people or maintaining closeness", layer: "relationships" },
    { text: "Repeating patterns I've seen in my parents or grandparents", layer: "ancestral" }
  ]},
  { text: "What feels most true about your unforgiveness right now?", options: [
    { text: "It lives in my body more than my thoughts", layer: "body" },
    { text: "I can't stop analyzing what happened", layer: "mind" },
    { text: "The feelings are still raw, even after years", layer: "emotions" },
    { text: "It's affecting my vitality and motivation", layer: "energy" },
    { text: "It's changed how I relate to everyone, not just them", layer: "relationships" },
    { text: "It feels bigger than just me — like a family inheritance", layer: "ancestral" }
  ]},
  { text: "When someone suggests you should forgive, what's your first internal response?", options: [
    { text: "My body tenses up in resistance", layer: "body" },
    { text: "I start building a logical case for why I can't", layer: "mind" },
    { text: "I feel a surge of anger or grief", layer: "emotions" },
    { text: "I feel exhausted by the very idea", layer: "energy" },
    { text: "I worry about what forgiveness would mean for my boundaries", layer: "relationships" },
    { text: "I think about everyone in my family who carried this too", layer: "ancestral" }
  ]},
  { text: "What would genuine forgiveness change most in your life?", options: [
    { text: "I'd finally be free of this physical tension", layer: "body" },
    { text: "I'd stop replaying the story in my head", layer: "mind" },
    { text: "I'd feel lighter emotionally", layer: "emotions" },
    { text: "I'd have my energy and passion back", layer: "energy" },
    { text: "I'd be able to love and trust more freely", layer: "relationships" },
    { text: "I'd break a cycle that's been running for generations", layer: "ancestral" }
  ]},
  { text: "How long have you been carrying this particular unforgiveness?", options: [
    { text: "It's become part of my physical reality — chronic tension or pain", layer: "body" },
    { text: "Years of mental processing that hasn't resolved anything", layer: "mind" },
    { text: "The emotional charge hasn't diminished with time", layer: "emotions" },
    { text: "It's been slowly draining me for as long as I can remember", layer: "energy" },
    { text: "It's shaped every significant relationship since", layer: "relationships" },
    { text: "It predates my own experience — I inherited it", layer: "ancestral" }
  ]},
  { text: "What has been your primary approach to dealing with this?", options: [
    { text: "Bodywork, massage, or physical practices", layer: "body" },
    { text: "Therapy, journaling, or intellectual analysis", layer: "mind" },
    { text: "Emotional processing, crying, or cathartic release", layer: "emotions" },
    { text: "Rest, retreat, or energy healing", layer: "energy" },
    { text: "Working on my relationship patterns", layer: "relationships" },
    { text: "Family therapy or ancestral healing work", layer: "ancestral" }
  ]},
  { text: "What scares you most about the forgiveness process?", options: [
    { text: "That the physical symptoms might be permanent", layer: "body" },
    { text: "That I'll lose the clarity my analysis provides", layer: "mind" },
    { text: "That I'll have to feel everything I've been avoiding", layer: "emotions" },
    { text: "That I don't have the energy to do this work", layer: "energy" },
    { text: "That forgiveness might mean losing my boundaries", layer: "relationships" },
    { text: "That this pattern is too deep to change", layer: "ancestral" }
  ]},
  { text: "If your unforgiveness had a voice, what would it say?", options: [
    { text: "I'm protecting you from being hurt again — feel me in your muscles", layer: "body" },
    { text: "If you stop thinking about this, you'll be caught off guard", layer: "mind" },
    { text: "This pain is the proof that what happened mattered", layer: "emotions" },
    { text: "I'm keeping you small so you won't be a target again", layer: "energy" },
    { text: "Don't let anyone that close again", layer: "relationships" },
    { text: "This has been going on longer than you know", layer: "ancestral" }
  ]},
  { text: "What would be the first sign that real forgiveness has begun?", options: [
    { text: "Physical release — a deep breath, relaxed muscles, better sleep", layer: "body" },
    { text: "The mental replay would finally stop", layer: "mind" },
    { text: "I'd feel something other than anger or sadness about it", layer: "emotions" },
    { text: "I'd wake up with energy and purpose again", layer: "energy" },
    { text: "I'd be able to be present with people without guarding", layer: "relationships" },
    { text: "My children or family would feel the shift too", layer: "ancestral" }
  ]}
];

const layerInfo = {
  body: { name: "The Body", description: "Your unforgiveness lives primarily in your physical body — in tension, pain, and somatic patterns that no amount of thinking will release. Your forgiveness work needs to begin with the body.", articles: "the-body" },
  mind: { name: "The Mind", description: "Your unforgiveness is primarily cognitive — loops of analysis, rehearsal, and narrative that keep the wound alive through thought. Your forensic work starts with examining the story.", articles: "the-forensic-method" },
  emotions: { name: "The Emotions", description: "Your unforgiveness lives in raw emotional charge that hasn't diminished with time. The feelings are still as vivid as the day it happened. Your work begins with meeting these emotions directly.", articles: "the-specific" },
  energy: { name: "The Energy", description: "Your unforgiveness is draining your vitality — showing up as fatigue, low motivation, and a sense of heaviness. Liberation starts with reclaiming the energy you've been spending on resentment.", articles: "the-liberation" },
  relationships: { name: "The Relationships", description: "Your unforgiveness has reshaped how you relate to everyone, not just the person who hurt you. Trust, intimacy, and boundaries have all been affected. Your work begins with understanding these patterns.", articles: "the-specific" },
  ancestral: { name: "The Ancestral", description: "Your unforgiveness extends beyond your personal experience — it's part of a generational pattern. The resentment you carry may not have originated with you. Your work includes honoring what came before.", articles: "the-liberation" }
};

let currentQ = 0;
const scores = { body:0, mind:0, emotions:0, energy:0, relationships:0, ancestral:0 };

function renderQuestion() {
  const q = questions[currentQ];
  const container = document.getElementById('assessment-questions');
  container.innerHTML = '<div class="quiz-progress"><div class="quiz-progress-bar" style="width:' + ((currentQ/questions.length)*100) + '%"></div></div>' +
    '<p class="quiz-question">' + q.text + '</p>' +
    q.options.map((o,i) => '<button class="quiz-option" tabindex="0" onclick="selectOption(\\''+o.layer+'\\','+i+')" onkeydown="if(event.key===\\'Enter\\')selectOption(\\''+o.layer+'\\','+i+')">' + o.text + '</button>').join('');
}

function selectOption(layer, idx) {
  scores[layer]++;
  currentQ++;
  if (currentQ < questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById('assessment-questions').style.display = 'none';
  const resultsDiv = document.getElementById('assessment-results');
  resultsDiv.style.display = 'block';
  
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const primary = sorted[0];
  const secondary = sorted[1];
  const info = layerInfo[primary[0]];
  const secInfo = layerInfo[secondary[0]];
  
  const barChart = sorted.map(([layer, score]) => {
    const pct = Math.round((score / questions.length) * 100);
    const li = layerInfo[layer];
    return '<div style="margin-bottom:0.8rem"><div style="display:flex;justify-content:space-between;margin-bottom:0.2rem"><span style="font-weight:600;font-size:0.9rem">' + li.name + '</span><span style="font-size:0.85rem;color:var(--text-light)">' + score + '/' + questions.length + '</span></div><div style="background:var(--border);border-radius:4px;height:12px;overflow:hidden"><div style="background:var(--accent);height:100%;width:' + pct + '%;border-radius:4px;transition:width 0.5s"></div></div></div>';
  }).join('');
  
  resultsDiv.innerHTML = '<div id="assessment-result-content">' +
    '<div class="quiz-result"><h2>Your Primary Layer: ' + info.name + '</h2></div>' +
    '<div class="layer-result" style="margin-bottom:1.5rem"><p style="font-size:1.05rem;line-height:1.7"><strong>' + info.description + '</strong></p></div>' +
    '<p style="margin-bottom:1.5rem">Your secondary layer is <strong>' + secInfo.name + '</strong> \u2014 ' + secInfo.description.split('.')[0].toLowerCase() + '.</p>' +
    '<div style="background:var(--secondary);padding:1.2rem;border:1px solid var(--border);border-radius:6px;margin-bottom:1.5rem"><h4 style="margin:0 0 1rem">Your Layer Breakdown</h4>' + barChart + '</div>' +
    '<h3 style="margin-top:2rem">Recommended Reading</h3>' +
    '<p>Start with articles in <a href="/category/' + info.articles + '">' + info.name + '</a>, then explore <a href="/category/' + secInfo.articles + '">' + secInfo.name + '</a> for your secondary layer.</p>' +
    '</div>' +
    '<div style="margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap">' +
    '<button onclick="downloadAssessmentPDF()" style="background:var(--primary);color:var(--secondary);border:none;padding:0.6rem 1.2rem;cursor:pointer;border-radius:4px;font-weight:600;font-size:0.9rem">Download Results as PDF</button>' +
    '<button onclick="window.print()" style="background:transparent;border:1px solid var(--primary);color:var(--primary);padding:0.6rem 1.2rem;cursor:pointer;border-radius:4px;font-weight:600;font-size:0.9rem">Print Results</button>' +
    '</div>' +
    '<div style="margin-top:2rem;background:var(--secondary);padding:1.5rem;border:1px solid var(--border);border-radius:6px"><h4>Stay Connected</h4><p style="font-size:0.9rem;margin-bottom:0.8rem">Get weekly insights on forensic forgiveness delivered to your inbox.</p><form onsubmit="return handleSubscribe(event,\'assessment\')"><div style="display:flex;gap:0.5rem;flex-wrap:wrap"><input type="email" placeholder="Your email" required style="padding:0.5rem;flex:1;min-width:200px;border:1px solid var(--border);border-radius:2px"><button type="submit" style="background:var(--accent);color:white;border:none;padding:0.5rem 1rem;cursor:pointer;border-radius:2px;font-weight:600">Subscribe</button></div></form></div>';
}

function downloadAssessmentPDF() {
  const content = document.getElementById('assessment-result-content');
  if (!content) return;
  const resultText = content.innerText;
  const blob = new Blob(['\nWhat Are You Still Holding? \u2014 Assessment Results\n' + '='.repeat(50) + '\n\nDate: ' + new Date().toLocaleDateString() + '\n\n' + resultText + '\n\n---\nFrom The Unforgiven (unforgiven.love)\n'], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'what-are-you-holding-results.txt';
  a.click();
  URL.revokeObjectURL(url);
}

renderQuestion();
</script>
${footer(published)}${cookieBanner()}${subscribeScript()}${searchScript()}</body></html>`;
  res.send(html);
});

// ─── QUIZZES ───
function generateQuizPage(quiz, published) {
  return `${htmlHead(
    quiz.title + ' — ' + SITE.title,
    quiz.metaDescription,
    SITE.domain + '/quiz/' + quiz.slug,
    null
  )}
<body>${nav()}
<div class="quiz-container">
<h1>${escHtml(quiz.title)}</h1>
<p>${escHtml(quiz.description)}</p>
<div id="quiz-${quiz.slug}"></div>
</div>
<script>
const quizData = ${JSON.stringify(quiz)};
let qIdx = 0;
const qScores = {};
quizData.results.forEach(r => qScores[r.id] = 0);

function renderQ() {
  const q = quizData.questions[qIdx];
  const el = document.getElementById('quiz-${quiz.slug}');
  el.innerHTML = '<div class="quiz-progress"><div class="quiz-progress-bar" style="width:'+((qIdx/quizData.questions.length)*100)+'%"></div></div>' +
    '<p class="quiz-question">' + q.text + '</p>' +
    q.options.map((o,i) => '<button class="quiz-option" tabindex="0" onclick="pickQ('+i+')" onkeydown="if(event.key===\\'Enter\\')pickQ('+i+')">' + o.text + '</button>').join('');
}

function pickQ(i) {
  const scores = quizData.questions[qIdx].options[i].scores;
  Object.entries(scores).forEach(([k,v]) => qScores[k] = (qScores[k]||0) + v);
  qIdx++;
  if (qIdx < quizData.questions.length) { renderQ(); }
  else { showQResult(); }
}

function showQResult() {
  const sorted = Object.entries(qScores).sort((a,b)=>b[1]-a[1]);
  const winner = sorted[0][0];
  const result = quizData.results.find(r => r.id === winner);
  const allScores = sorted.map(([id,score]) => {
    const r = quizData.results.find(x => x.id === id);
    return '<div style="margin-bottom:0.5rem"><strong>' + (r ? r.title : id) + ':</strong> ' + score + ' points</div>';
  }).join('');
  const el = document.getElementById('quiz-${quiz.slug}');
  el.innerHTML = '<div class="quiz-result" id="quiz-result-content">' +
    '<h2>' + result.title + '</h2>' +
    '<p style="font-size:1.05rem;line-height:1.7;margin-bottom:1.5rem">' + result.description + '</p>' +
    '<div style="background:var(--secondary);padding:1rem;border:1px solid var(--border);border-radius:6px;margin-bottom:1.5rem"><h4 style="margin:0 0 0.5rem">Your Score Breakdown</h4>' + allScores + '</div>' +
    (result.articles && result.articles.length ? '<p style="font-size:0.9rem;color:var(--text-light)">Recommended reading: <a href="/category/' + result.articles[0] + '">' + result.articles[0].replace(/-/g,' ').replace(/\\b\\w/g,l=>l.toUpperCase()) + '</a></p>' : '') +
    '</div>' +
    '<div style="margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap">' +
    '<button onclick="downloadQuizPDF()" style="background:var(--primary);color:var(--secondary);border:none;padding:0.6rem 1.2rem;cursor:pointer;border-radius:4px;font-weight:600;font-size:0.9rem">Download Results as PDF</button>' +
    '<button onclick="window.print()" style="background:transparent;border:1px solid var(--primary);color:var(--primary);padding:0.6rem 1.2rem;cursor:pointer;border-radius:4px;font-weight:600;font-size:0.9rem">Print Results</button>' +
    '</div>' +
    '<div style="margin-top:2rem;background:var(--secondary);padding:1.5rem;border:1px solid var(--border);border-radius:6px"><h4>Stay Connected</h4><p style="font-size:0.9rem;margin-bottom:0.8rem">Get weekly insights on forensic forgiveness delivered to your inbox.</p><form onsubmit="return handleSubscribe(event,\'quiz-${quiz.slug}\')"><div style="display:flex;gap:0.5rem;flex-wrap:wrap"><input type="email" placeholder="Your email" required style="padding:0.5rem;flex:1;min-width:200px;border:1px solid var(--border);border-radius:2px"><button type="submit" style="background:var(--accent);color:white;border:none;padding:0.5rem 1rem;cursor:pointer;border-radius:2px;font-weight:600">Subscribe</button></div></form></div>';
}

function downloadQuizPDF() {
  const content = document.getElementById('quiz-result-content');
  if (!content) return;
  const title = quizData.title || 'Quiz Results';
  const resultText = content.innerText;
  const blob = new Blob(['\\n' + title + '\\n' + '='.repeat(title.length) + '\\n\\n' + 'Date: ' + new Date().toLocaleDateString() + '\\n\\n' + resultText + '\\n\\n---\\nFrom The Unforgiven (unforgiven.love)\\n'], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = quizData.slug + '-results.txt';
  a.click();
  URL.revokeObjectURL(url);
}

renderQ();
</script>
${footer(published)}${cookieBanner()}${subscribeScript()}${searchScript()}</body></html>`;
}

// Quiz definitions
const QUIZZES = [
  { slug: 'forgiveness-readiness', title: 'Are You Ready to Forgive?', description: 'Discover whether you are truly ready to begin the forgiveness process — or if something needs to happen first.', metaDescription: 'Take this assessment to discover if you are ready to begin genuine forgiveness work.',
    questions: [
      { text: 'When you think about forgiving this person, what comes up first?', options: [
        { text: 'Relief — I want this to be over', scores: { ready: 2, preparing: 1 } },
        { text: 'Anger — they don\'t deserve it', scores: { notready: 2, preparing: 1 } },
        { text: 'Curiosity — I wonder what it would feel like', scores: { ready: 2, exploring: 1 } },
        { text: 'Fear — what if I lose my edge?', scores: { preparing: 2, notready: 1 } }
      ]},
      { text: 'Have you fully acknowledged what happened to you?', options: [
        { text: 'Yes — I know exactly what was done and what it cost me', scores: { ready: 3 } },
        { text: 'Partially — I still minimize or avoid parts of it', scores: { preparing: 2, exploring: 1 } },
        { text: 'Not really — I try not to think about it', scores: { notready: 3 } },
        { text: 'I\'m not sure what full acknowledgment looks like', scores: { exploring: 2, preparing: 1 } }
      ]},
      { text: 'How do you feel about the idea that forgiveness is for you, not them?', options: [
        { text: 'That resonates deeply', scores: { ready: 2, exploring: 1 } },
        { text: 'Intellectually I get it, but emotionally it feels wrong', scores: { preparing: 2 } },
        { text: 'That sounds like a bypass — they should have to earn it', scores: { notready: 2 } },
        { text: 'I\'m open to exploring that idea', scores: { exploring: 2, ready: 1 } }
      ]},
      { text: 'What is your relationship with anger about this situation?', options: [
        { text: 'I\'ve felt it fully and it\'s starting to transform', scores: { ready: 3 } },
        { text: 'I\'m still in the thick of it', scores: { preparing: 2 } },
        { text: 'I\'ve suppressed it — anger feels dangerous', scores: { notready: 2, preparing: 1 } },
        { text: 'I go back and forth between rage and numbness', scores: { exploring: 2 } }
      ]},
      { text: 'If you forgave tomorrow, what would you lose?', options: [
        { text: 'Nothing I\'m not ready to release', scores: { ready: 3 } },
        { text: 'My sense of justice or righteous anger', scores: { preparing: 2 } },
        { text: 'My identity as the wronged person', scores: { exploring: 2, preparing: 1 } },
        { text: 'My protection against being hurt again', scores: { notready: 2, preparing: 1 } }
      ]}
    ],
    results: [
      { id: 'ready', title: 'You\'re Ready', description: 'You\'ve done significant internal work and are genuinely ready to begin the forensic forgiveness process. The groundwork is laid — now it\'s time for the method.', articles: ['the-forensic-method'] },
      { id: 'preparing', title: 'You\'re Preparing', description: 'You\'re close, but there\'s still some foundational work to do. The anger or fear hasn\'t fully been met yet. That\'s not a failure — it\'s information.', articles: ['the-body'] },
      { id: 'exploring', title: 'You\'re Exploring', description: 'You\'re curious about forgiveness but haven\'t committed to the process yet. That\'s a valid place to be. Start by understanding what real forgiveness actually requires.', articles: ['the-lie'] },
      { id: 'notready', title: 'Not Yet — And That\'s Okay', description: 'You\'re not ready to forgive, and forcing it would be another form of self-betrayal. Focus on understanding what happened and honoring your anger first.', articles: ['the-lie'] }
    ]
  },
  { slug: 'unforgiveness-type', title: 'What Type of Unforgiveness Are You Carrying?', description: 'Identify the specific pattern of unforgiveness that\'s affecting your life.', metaDescription: 'Discover the specific type of unforgiveness you carry and the best approach for releasing it.',
    questions: [
      { text: 'The person you need to forgive is:', options: [
        { text: 'A parent or caregiver', scores: { origin: 2, betrayal: 1 } },
        { text: 'A romantic partner', scores: { betrayal: 2, trust: 1 } },
        { text: 'Myself', scores: { self: 3 } },
        { text: 'An institution or system', scores: { systemic: 2, trust: 1 } }
      ]},
      { text: 'The core wound is best described as:', options: [
        { text: 'Abandonment or neglect', scores: { origin: 2, trust: 1 } },
        { text: 'Betrayal of trust', scores: { betrayal: 3 } },
        { text: 'Something I did that I can\'t undo', scores: { self: 3 } },
        { text: 'Injustice or systemic failure', scores: { systemic: 2, betrayal: 1 } }
      ]},
      { text: 'When you imagine releasing this, what feels most true?', options: [
        { text: 'I\'d have to grieve the parent/childhood I never had', scores: { origin: 3 } },
        { text: 'I\'d have to accept that trust was broken and may never be restored', scores: { betrayal: 2, trust: 1 } },
        { text: 'I\'d have to accept that I\'m human and I made a mistake', scores: { self: 3 } },
        { text: 'I\'d have to accept that the world isn\'t fair', scores: { systemic: 2 } }
      ]},
      { text: 'How long have you been carrying this?', options: [
        { text: 'Since childhood — it\'s foundational', scores: { origin: 3 } },
        { text: 'Since a specific event that shattered my trust', scores: { betrayal: 2, trust: 1 } },
        { text: 'Since I realized what I\'d done', scores: { self: 3 } },
        { text: 'Since I understood the scope of the injustice', scores: { systemic: 2, trust: 1 } }
      ]},
      { text: 'What would forgiveness look like for you?', options: [
        { text: 'Accepting my parents did the best they could with what they had', scores: { origin: 2 } },
        { text: 'Releasing the person from the debt they owe me', scores: { betrayal: 2, trust: 1 } },
        { text: 'Finally being able to look at myself without shame', scores: { self: 3 } },
        { text: 'Finding peace despite the injustice', scores: { systemic: 2 } }
      ]}
    ],
    results: [
      { id: 'origin', title: 'Origin Wound Unforgiveness', description: 'Your unforgiveness is rooted in your earliest relationships. This is foundational work that affects everything else. Start with understanding how childhood wounds shape adult resentment.', articles: ['the-specific'] },
      { id: 'betrayal', title: 'Betrayal Unforgiveness', description: 'Your unforgiveness centers on a specific betrayal of trust. The forensic method is particularly effective here — examining exactly what was promised, what was broken, and what it cost you.', articles: ['the-forensic-method'] },
      { id: 'self', title: 'Self-Unforgiveness', description: 'The person you need to forgive most is yourself. This is often the hardest forgiveness work because you can\'t escape the person who hurt you. Start with self-compassion, then move to forensic self-examination.', articles: ['the-specific'] },
      { id: 'systemic', title: 'Systemic Unforgiveness', description: 'Your unforgiveness is directed at a system, institution, or collective injustice. This requires a different approach — one that honors the reality of systemic harm while finding personal liberation.', articles: ['the-liberation'] },
      { id: 'trust', title: 'Trust Wound Unforgiveness', description: 'Your unforgiveness is fundamentally about broken trust. The question isn\'t whether to forgive but whether trust can or should be rebuilt. Start with understanding the difference between forgiveness and reconciliation.', articles: ['the-lie'] }
    ]
  },
  { slug: 'body-score', title: 'Your Unforgiveness Body Score', description: 'Discover how deeply unforgiveness has embedded itself in your physical body.', metaDescription: 'Assess how unforgiveness is manifesting in your physical body with this somatic awareness quiz.',
    questions: [
      { text: 'Do you experience unexplained physical tension?', options: [
        { text: 'Constantly — it\'s my baseline', scores: { high: 3 } },
        { text: 'Often, especially when triggered', scores: { moderate: 2, high: 1 } },
        { text: 'Sometimes, but I can usually release it', scores: { moderate: 2 } },
        { text: 'Rarely', scores: { low: 3 } }
      ]},
      { text: 'When you think of the person you haven\'t forgiven, what happens in your body?', options: [
        { text: 'Immediate physical reaction — clenching, heat, nausea', scores: { high: 3 } },
        { text: 'Subtle tension I notice if I pay attention', scores: { moderate: 2 } },
        { text: 'Mostly emotional, not much physical', scores: { low: 2, moderate: 1 } },
        { text: 'Nothing noticeable', scores: { low: 3 } }
      ]},
      { text: 'How is your sleep?', options: [
        { text: 'Disrupted — I wake up tense or have stress dreams', scores: { high: 3 } },
        { text: 'Okay but not restorative', scores: { moderate: 2 } },
        { text: 'Generally good with occasional disruption', scores: { low: 2, moderate: 1 } },
        { text: 'Solid — sleep is not an issue', scores: { low: 3 } }
      ]},
      { text: 'Do you have chronic pain that doctors can\'t fully explain?', options: [
        { text: 'Yes — and I suspect it\'s connected to what I\'m carrying', scores: { high: 3 } },
        { text: 'Some aches that come and go', scores: { moderate: 2 } },
        { text: 'Minor stuff that doesn\'t concern me', scores: { low: 2 } },
        { text: 'No chronic pain', scores: { low: 3 } }
      ]},
      { text: 'How would you describe your breathing patterns?', options: [
        { text: 'Shallow and restricted — I often catch myself holding my breath', scores: { high: 3 } },
        { text: 'Somewhat shallow, especially under stress', scores: { moderate: 2 } },
        { text: 'Generally okay but could be deeper', scores: { low: 2, moderate: 1 } },
        { text: 'Full and relaxed most of the time', scores: { low: 3 } }
      ]}
    ],
    results: [
      { id: 'high', title: 'High Somatic Load', description: 'Unforgiveness has deeply embedded itself in your physical body. Talk therapy alone won\'t release this — you need somatic approaches. Start with body-based forgiveness practices.', articles: ['the-body'] },
      { id: 'moderate', title: 'Moderate Somatic Load', description: 'Your body is carrying some of the unforgiveness burden. A combination of somatic awareness and forensic processing will serve you well.', articles: ['the-body'] },
      { id: 'low', title: 'Low Somatic Load', description: 'Your unforgiveness is primarily cognitive and emotional rather than somatic. The forensic method may be your best entry point.', articles: ['the-forensic-method'] }
    ]
  },
  { slug: 'forgiveness-myth', title: 'Which Forgiveness Myth Is Keeping You Stuck?', description: 'Identify the specific lie about forgiveness that\'s blocking your progress.', metaDescription: 'Discover which common forgiveness myth is keeping you stuck and what to do about it.',
    questions: [
      { text: 'What\'s your biggest objection to forgiving?', options: [
        { text: 'They don\'t deserve it', scores: { deserve: 3 } },
        { text: 'It means what they did was okay', scores: { condone: 3 } },
        { text: 'I should be over it by now', scores: { timeline: 3 } },
        { text: 'Forgiveness means I have to let them back in', scores: { reconcile: 3 } }
      ]},
      { text: 'When people tell you to forgive, you think:', options: [
        { text: 'Easy for you to say — you weren\'t the one hurt', scores: { deserve: 2, timeline: 1 } },
        { text: 'Forgiving feels like saying it wasn\'t that bad', scores: { condone: 3 } },
        { text: 'I\'ve been trying — what\'s wrong with me?', scores: { timeline: 3 } },
        { text: 'Does that mean I have to see them again?', scores: { reconcile: 3 } }
      ]},
      { text: 'What feels most true right now?', options: [
        { text: 'Forgiveness is a reward they haven\'t earned', scores: { deserve: 3 } },
        { text: 'If I forgive, I\'m minimizing what happened', scores: { condone: 2, deserve: 1 } },
        { text: 'I should have forgiven by now — something is wrong with me', scores: { timeline: 3 } },
        { text: 'Forgiveness and reconciliation are the same thing', scores: { reconcile: 3 } }
      ]},
      { text: 'What would change your mind about forgiveness?', options: [
        { text: 'Understanding that forgiveness is about my freedom, not their comfort', scores: { deserve: 2 } },
        { text: 'Knowing I can forgive without excusing or minimizing', scores: { condone: 2 } },
        { text: 'Learning that there\'s no correct timeline', scores: { timeline: 2 } },
        { text: 'Realizing forgiveness doesn\'t require reconciliation', scores: { reconcile: 2 } }
      ]}
    ],
    results: [
      { id: 'deserve', title: 'The Deserving Myth', description: 'You believe forgiveness is something the other person must earn. The truth: forgiveness is a unilateral act of self-liberation. It has nothing to do with what they deserve.', articles: ['the-lie'] },
      { id: 'condone', title: 'The Condoning Myth', description: 'You believe forgiving means saying what happened was acceptable. The truth: forgiveness is not approval. You can fully acknowledge the harm AND release the resentment.', articles: ['the-lie'] },
      { id: 'timeline', title: 'The Timeline Myth', description: 'You believe you should have forgiven by now. The truth: there is no correct timeline for forgiveness. Rushing it is just another form of self-betrayal.', articles: ['the-lie'] },
      { id: 'reconcile', title: 'The Reconciliation Myth', description: 'You believe forgiveness requires reconciliation. The truth: forgiveness and reconciliation are completely separate processes. You can forgive someone you never see again.', articles: ['the-lie'] }
    ]
  },
  { slug: 'forgiveness-style', title: 'What\'s Your Forgiveness Style?', description: 'Discover your natural approach to forgiveness and where it might be limiting you.', metaDescription: 'Learn your natural forgiveness style and how to work with it for deeper release.',
    questions: [
      { text: 'When someone hurts you, your first instinct is to:', options: [
        { text: 'Analyze why they did it', scores: { intellectual: 3 } },
        { text: 'Feel the pain fully', scores: { emotional: 3 } },
        { text: 'Take action — set a boundary or confront them', scores: { active: 3 } },
        { text: 'Go inward — meditate, pray, or reflect', scores: { contemplative: 3 } }
      ]},
      { text: 'Your forgiveness process usually involves:', options: [
        { text: 'Understanding the other person\'s perspective', scores: { intellectual: 2, contemplative: 1 } },
        { text: 'Processing emotions until they shift', scores: { emotional: 3 } },
        { text: 'Making a conscious decision to let go', scores: { active: 3 } },
        { text: 'Sitting with it until something releases naturally', scores: { contemplative: 3 } }
      ]},
      { text: 'You know you\'ve forgiven when:', options: [
        { text: 'You can think about it without emotional charge', scores: { intellectual: 3 } },
        { text: 'You feel compassion for the person', scores: { emotional: 2, contemplative: 1 } },
        { text: 'You\'ve taken concrete steps to move forward', scores: { active: 3 } },
        { text: 'A sense of peace replaces the resentment', scores: { contemplative: 3 } }
      ]},
      { text: 'What\'s hardest for you in the forgiveness process?', options: [
        { text: 'Letting go of my analysis of what happened', scores: { intellectual: 3 } },
        { text: 'Not getting overwhelmed by the feelings', scores: { emotional: 3 } },
        { text: 'Being patient — I want to resolve it now', scores: { active: 3 } },
        { text: 'Trusting the process when nothing seems to be happening', scores: { contemplative: 3 } }
      ]}
    ],
    results: [
      { id: 'intellectual', title: 'The Forensic Forgiver', description: 'You process forgiveness through understanding and analysis. Your strength is precision; your risk is staying in your head and never letting the body release. Combine your analytical gifts with somatic practices.', articles: ['the-forensic-method'] },
      { id: 'emotional', title: 'The Feeling Forgiver', description: 'You process forgiveness through emotional experience. Your strength is depth of feeling; your risk is getting stuck in emotional loops without resolution. Add structure to your emotional process.', articles: ['the-body'] },
      { id: 'active', title: 'The Action Forgiver', description: 'You process forgiveness through decision and action. Your strength is decisiveness; your risk is premature closure — deciding to forgive before the deeper work is done. Slow down and let the process unfold.', articles: ['the-lie'] },
      { id: 'contemplative', title: 'The Contemplative Forgiver', description: 'You process forgiveness through reflection and presence. Your strength is patience; your risk is spiritual bypass — using contemplation to avoid the difficult emotions. Make sure you\'re feeling, not just observing.', articles: ['the-liberation'] }
    ]
  },
  { slug: 'resentment-inventory', title: 'Your Resentment Inventory', description: 'Map the landscape of what you\'re carrying and prioritize your forgiveness work.', metaDescription: 'Take inventory of your resentments and discover where to focus your forgiveness work first.',
    questions: [
      { text: 'How many significant resentments are you currently carrying?', options: [
        { text: 'One major one that dominates everything', scores: { focused: 3 } },
        { text: 'Two or three that take turns surfacing', scores: { multiple: 3 } },
        { text: 'Many — I\'ve lost count', scores: { accumulated: 3 } },
        { text: 'Mostly one, but it has layers', scores: { layered: 3 } }
      ]},
      { text: 'How often do your resentments affect your daily life?', options: [
        { text: 'Constantly — it\'s always in the background', scores: { focused: 2, accumulated: 1 } },
        { text: 'Several times a day when triggered', scores: { multiple: 2 } },
        { text: 'It comes in waves', scores: { layered: 2 } },
        { text: 'Mostly when I\'m alone or trying to sleep', scores: { focused: 2, layered: 1 } }
      ]},
      { text: 'Are your resentments connected to each other?', options: [
        { text: 'No — one stands alone', scores: { focused: 3 } },
        { text: 'Some overlap but they\'re distinct situations', scores: { multiple: 2 } },
        { text: 'Yes — they form a pattern I keep repeating', scores: { accumulated: 2, layered: 1 } },
        { text: 'They\'re all layers of the same core wound', scores: { layered: 3 } }
      ]},
      { text: 'If you could only forgive one thing, which would free you most?', options: [
        { text: 'The one big thing — everything else is secondary', scores: { focused: 3 } },
        { text: 'Hard to choose — they all weigh equally', scores: { multiple: 2, accumulated: 1 } },
        { text: 'The oldest one — it started everything', scores: { layered: 3 } },
        { text: 'The most recent one — it\'s freshest', scores: { accumulated: 2 } }
      ]}
    ],
    results: [
      { id: 'focused', title: 'Focused Resentment', description: 'You have one primary resentment that dominates your inner landscape. The good news: focused work on this single wound can create massive liberation. The forensic method is ideal for you.', articles: ['the-forensic-method'] },
      { id: 'multiple', title: 'Multiple Resentments', description: 'You\'re carrying several distinct resentments. Start with the one that has the most physical charge — your body will tell you which one. Then work through the others systematically.', articles: ['the-forensic-method'] },
      { id: 'accumulated', title: 'Accumulated Resentment', description: 'You\'ve been collecting resentments over time. The weight is cumulative. Start with the pattern, not individual incidents — what keeps attracting these situations?', articles: ['the-specific'] },
      { id: 'layered', title: 'Layered Resentment', description: 'Your resentments are all expressions of a deeper core wound. Addressing the surface resentments won\'t create lasting change — you need to go to the root. Start with the earliest memory.', articles: ['the-specific'] }
    ]
  },
  { slug: 'liberation-readiness', title: 'How Close Are You to Liberation?', description: 'Assess where you are in the forgiveness journey and what\'s left to release.', metaDescription: 'Discover how close you are to genuine liberation from unforgiveness.',
    questions: [
      { text: 'When you think about the situation now, compared to a year ago:', options: [
        { text: 'The charge has significantly decreased', scores: { close: 3 } },
        { text: 'It\'s about the same', scores: { middle: 2 } },
        { text: 'It\'s actually intensified', scores: { beginning: 2, middle: 1 } },
        { text: 'I\'ve gained new understanding but the feelings persist', scores: { middle: 2, close: 1 } }
      ]},
      { text: 'Can you hold complexity about the person who hurt you?', options: [
        { text: 'Yes — I see them as a full human who did a harmful thing', scores: { close: 3 } },
        { text: 'Sometimes, but I still swing between villain and human', scores: { middle: 2 } },
        { text: 'Not yet — they\'re still mostly the villain in my story', scores: { beginning: 3 } },
        { text: 'I understand them intellectually but not emotionally', scores: { middle: 2, close: 1 } }
      ]},
      { text: 'How do you feel about your own role in the situation?', options: [
        { text: 'I\'ve examined it honestly and made peace with my part', scores: { close: 3 } },
        { text: 'I\'m starting to see where I contributed', scores: { middle: 2 } },
        { text: 'I was the victim — I don\'t have a role to examine', scores: { beginning: 2 } },
        { text: 'I take too much responsibility — I need to stop blaming myself', scores: { middle: 2, beginning: 1 } }
      ]},
      { text: 'If you ran into this person tomorrow, what would happen?', options: [
        { text: 'I\'d be okay — maybe uncomfortable but not destabilized', scores: { close: 3 } },
        { text: 'Anxiety and some emotional charge, but manageable', scores: { middle: 2, close: 1 } },
        { text: 'Full fight-or-flight response', scores: { beginning: 3 } },
        { text: 'I\'d avoid them entirely', scores: { beginning: 2, middle: 1 } }
      ]}
    ],
    results: [
      { id: 'close', title: 'Near Liberation', description: 'You\'re close to genuine liberation. The heavy lifting is done — what remains is integration and the sometimes anticlimactic process of letting the last threads dissolve. Trust the process.', articles: ['the-liberation'] },
      { id: 'middle', title: 'In Process', description: 'You\'re in the middle of genuine forgiveness work. This is the hardest phase — you can see liberation but haven\'t arrived. Keep going. The forensic method can help you through this stage.', articles: ['the-forensic-method'] },
      { id: 'beginning', title: 'Early Stage', description: 'You\'re at the beginning of the forgiveness journey. That\'s not a criticism — it\'s a starting point. Begin by understanding what real forgiveness actually requires.', articles: ['the-lie'] }
    ]
  },
  { slug: 'forgiveness-blocks', title: 'What\'s Blocking Your Forgiveness?', description: 'Identify the specific internal obstacle preventing you from releasing what you\'re carrying.', metaDescription: 'Discover the hidden block that\'s preventing you from genuine forgiveness.',
    questions: [
      { text: 'The main reason you haven\'t forgiven is:', options: [
        { text: 'I\'m afraid of what I\'ll feel', scores: { fear: 3 } },
        { text: 'I don\'t know how', scores: { method: 3 } },
        { text: 'It doesn\'t feel safe', scores: { safety: 3 } },
        { text: 'I\'m not sure I want to', scores: { identity: 3 } }
      ]},
      { text: 'What happens when you get close to forgiveness?', options: [
        { text: 'Panic or overwhelming emotion pulls me back', scores: { fear: 3 } },
        { text: 'I don\'t know what the next step is', scores: { method: 3 } },
        { text: 'I remember why I need to stay guarded', scores: { safety: 3 } },
        { text: 'I realize I\'m not sure who I am without this resentment', scores: { identity: 3 } }
      ]},
      { text: 'What would help you most right now?', options: [
        { text: 'Feeling safe enough to feel what I\'ve been avoiding', scores: { fear: 2, safety: 1 } },
        { text: 'A clear, step-by-step process', scores: { method: 3 } },
        { text: 'Knowing that forgiveness won\'t make me vulnerable', scores: { safety: 3 } },
        { text: 'Understanding that I can be whole without this story', scores: { identity: 3 } }
      ]},
      { text: 'Your unforgiveness serves a purpose. What is it?', options: [
        { text: 'It keeps me from feeling the full depth of the pain', scores: { fear: 3 } },
        { text: 'It gives me something to work on — a project', scores: { method: 2, identity: 1 } },
        { text: 'It keeps me safe from being hurt again', scores: { safety: 3 } },
        { text: 'It gives me an identity and a story', scores: { identity: 3 } }
      ]}
    ],
    results: [
      { id: 'fear', title: 'Fear Block', description: 'You\'re blocked by fear of the emotions that forgiveness will unleash. The unforgiveness is a dam holding back a flood. You need somatic safety before you can open the gates.', articles: ['the-body'] },
      { id: 'method', title: 'Method Block', description: 'You\'re blocked by not knowing how. You\'re willing but directionless. The forensic method gives you the structure you need.', articles: ['the-forensic-method'] },
      { id: 'safety', title: 'Safety Block', description: 'You\'re blocked by a legitimate need for safety. Your nervous system is protecting you. Before forgiveness work, you need to establish that forgiveness doesn\'t equal vulnerability.', articles: ['the-body'] },
      { id: 'identity', title: 'Identity Block', description: 'You\'re blocked because your unforgiveness has become part of who you are. Releasing it feels like losing yourself. The liberation section addresses this directly.', articles: ['the-liberation'] }
    ]
  },
  { slug: 'self-forgiveness', title: 'Do You Need to Forgive Yourself?', description: 'Assess whether self-unforgiveness is the hidden weight you\'re carrying.', metaDescription: 'Discover if self-unforgiveness is the hidden burden affecting your life and relationships.',
    questions: [
      { text: 'When you make a mistake, your inner voice says:', options: [
        { text: 'You should have known better', scores: { high: 3 } },
        { text: 'Everyone makes mistakes — learn and move on', scores: { low: 3 } },
        { text: 'This proves something is fundamentally wrong with you', scores: { high: 3, critical: 1 } },
        { text: 'That was unfortunate, but it doesn\'t define you', scores: { low: 2, moderate: 1 } }
      ]},
      { text: 'Is there something you did that you haven\'t forgiven yourself for?', options: [
        { text: 'Yes — and it haunts me regularly', scores: { high: 3 } },
        { text: 'Yes — but I\'m working on it', scores: { moderate: 3 } },
        { text: 'Maybe — I try not to think about it', scores: { moderate: 2, high: 1 } },
        { text: 'Not really — I\'ve made peace with my past', scores: { low: 3 } }
      ]},
      { text: 'How do you respond to compliments or praise?', options: [
        { text: 'I deflect — if they knew the real me, they wouldn\'t say that', scores: { high: 3 } },
        { text: 'I accept them but feel uncomfortable', scores: { moderate: 2 } },
        { text: 'I appreciate them genuinely', scores: { low: 3 } },
        { text: 'I wonder what they want from me', scores: { moderate: 2, high: 1 } }
      ]},
      { text: 'Do you hold yourself to a higher standard than you hold others?', options: [
        { text: 'Absolutely — I expect more from myself', scores: { high: 3 } },
        { text: 'Sometimes — depends on the situation', scores: { moderate: 2 } },
        { text: 'I try to be fair to myself and others equally', scores: { low: 2 } },
        { text: 'I\'m actually harder on others', scores: { low: 2, moderate: 1 } }
      ]}
    ],
    results: [
      { id: 'high', title: 'Deep Self-Unforgiveness', description: 'You\'re carrying significant self-unforgiveness. This is often harder than forgiving others because you can\'t escape the person who hurt you. Start with understanding that self-forgiveness is not self-indulgence.', articles: ['the-specific'] },
      { id: 'moderate', title: 'Moderate Self-Unforgiveness', description: 'You have some unresolved self-forgiveness work to do. It\'s not dominating your life, but it\'s affecting your self-worth and relationships. The forensic method can help you examine what you\'re holding against yourself.', articles: ['the-forensic-method'] },
      { id: 'low', title: 'Healthy Self-Relationship', description: 'You\'ve developed a relatively healthy relationship with your own mistakes and limitations. If you\'re here, your forgiveness work is likely directed outward.', articles: ['the-liberation'] }
    ]
  }
];

for (const quiz of QUIZZES) {
  app.get(`/quiz/${quiz.slug}`, (req, res) => {
    const { published } = getArticles();
    res.send(generateQuizPage(quiz, published));
  });
}

// ─── 404 ───
function render404() {
  const { published } = getArticles();
  const random = published.sort(() => 0.5 - Math.random()).slice(0, 6);
  return `${htmlHead('Page Not Found — ' + SITE.title, 'The page you are looking for does not exist.', SITE.domain, null)}
<body>${nav()}
<div class="four04">
<h1>PAGE NOT FOUND</h1>
<p class="edition">Edition [404] &middot; ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
<p>The page you're looking for doesn't exist — but the work of forgiveness continues. Here are some places to start:</p>
</div>
<div class="container">
<div class="section-grid">${random.map(a => articleCard(a)).join('')}</div>
<p style="text-align:center;margin-top:2rem"><a href="/">Return to Homepage</a></p>
</div>
${footer(published)}${cookieBanner()}${searchScript()}</body></html>`;
}

app.use((req, res) => {
  res.status(404).send(render404());
});

// ─── START ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ${SITE.title} running on port ${PORT}`);
});

export default app;
