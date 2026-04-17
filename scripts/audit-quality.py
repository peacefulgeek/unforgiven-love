#!/usr/bin/env python3
"""Run the quality gate logic on all articles and report failures."""
import json, re, sys

# Load articles
with open('content/articles.json') as f:
    articles = json.load(f)

# AI flagged words (same list as article-quality-gate.mjs)
AI_WORDS = [
    'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock', 'empower',
    'utilize', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
    'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke',
    'resonate', 'harness', 'intricate', 'plethora', 'myriad', 'comprehensive',
    'transformative', 'groundbreaking', 'innovative', 'cutting-edge', 'revolutionary',
    'state-of-the-art', 'ever-evolving', 'game-changing', 'next-level', 'world-class',
    'unparalleled', 'unprecedented', 'remarkable', 'extraordinary', 'exceptional',
    'profound', 'holistic', 'nuanced', 'multifaceted', 'stakeholders',
    'ecosystem', 'landscape', 'realm', 'sphere', 'domain',
    'arguably', 'notably', 'crucially', 'importantly', 'essentially',
    'fundamentally', 'inherently', 'intrinsically', 'substantively',
    'streamline', 'optimize', 'facilitate', 'amplify', 'catalyze',
    'propel', 'spearhead', 'orchestrate', 'navigate', 'traverse',
    'furthermore', 'moreover', 'additionally', 'consequently', 'subsequently',
    'thereby', 'thusly', 'wherein', 'whereby'
]

AI_PHRASES = [
    "it's important to note that", "it's worth noting that", "it's worth mentioning",
    "it's crucial to", "it is essential to", "in conclusion,", "in summary,",
    "to summarize,", "a holistic approach", "unlock your potential", "unlock the power",
    "in the realm of", "in the world of", "dive deep into", "dive into", "delve into",
    "at the end of the day", "in today's fast-paced world", "in today's digital age",
    "in today's modern world", "in this digital age", "when it comes to",
    "navigate the complexities", "a testament to", "speaks volumes",
    "the power of", "the beauty of", "the art of", "the journey of",
    "the key lies in", "plays a crucial role", "plays a vital role",
    "plays a significant role", "plays a pivotal role", "a wide array of",
    "a wide range of", "a plethora of", "a myriad of", "stands as a",
    "serves as a", "acts as a", "has emerged as", "continues to evolve",
    "has revolutionized", "cannot be overstated", "it goes without saying",
    "needless to say", "last but not least", "first and foremost"
]

def strip_html(text):
    return re.sub(r'<[^>]+>', ' ', text)

def count_words(text):
    stripped = strip_html(text).strip()
    return len(stripped.split()) if stripped else 0

def count_amazon_links(text):
    return len(re.findall(r'https://www\.amazon\.com/dp/[A-Z0-9]{10}', text))

def has_emdash(text):
    return '\u2014' in text

def find_flagged_words(text):
    stripped = strip_html(text).lower()
    found = []
    for w in AI_WORDS:
        if re.search(r'\b' + re.escape(w) + r'\b', stripped):
            found.append(w)
    return found

def find_flagged_phrases(text):
    stripped = strip_html(text).lower().replace('\n', ' ')
    stripped = re.sub(r'\s+', ' ', stripped)
    return [p for p in AI_PHRASES if p in stripped]

# Run audit
total = len(articles)
failures = []
word_issues = []
link_issues = []
emdash_issues = []
word_issues_list = []
phrase_issues = []

all_flagged_words = {}
all_flagged_phrases = {}

for a in articles:
    body = a.get('body', '')
    slug = a.get('slug', 'unknown')
    issues = []
    
    wc = count_words(body)
    if wc < 1200: 
        issues.append(f'words-too-low:{wc}')
        word_issues.append(slug)
    if wc > 2500: 
        issues.append(f'words-too-high:{wc}')
        word_issues.append(slug)
    
    links = count_amazon_links(body)
    if links < 3:
        issues.append(f'amazon-links-too-few:{links}')
        link_issues.append(slug)
    
    if has_emdash(body):
        issues.append('contains-em-dash')
        emdash_issues.append(slug)
    
    fw = find_flagged_words(body)
    if fw:
        issues.append(f'ai-words:{",".join(fw)}')
        word_issues_list.append(slug)
        for w in fw:
            all_flagged_words[w] = all_flagged_words.get(w, 0) + 1
    
    fp = find_flagged_phrases(body)
    if fp:
        issues.append(f'ai-phrases:{"|".join(fp)}')
        phrase_issues.append(slug)
        for p in fp:
            all_flagged_phrases[p] = all_flagged_phrases.get(p, 0) + 1
    
    if issues:
        failures.append({'slug': slug, 'issues': issues})

# Report
print(f"\n{'='*60}")
print(f"QUALITY GATE AUDIT — {total} articles")
print(f"{'='*60}")
print(f"Passed:          {total - len(failures)}/{total}")
print(f"Failed:          {len(failures)}/{total}")
print(f"Word count:      {len(word_issues)} issues")
print(f"Amazon links:    {len(link_issues)} issues")
print(f"Em-dashes:       {len(emdash_issues)} issues")
print(f"AI words:        {len(word_issues_list)} articles")
print(f"AI phrases:      {len(phrase_issues)} articles")

if all_flagged_words:
    print(f"\nTop flagged words:")
    for w, c in sorted(all_flagged_words.items(), key=lambda x: -x[1])[:20]:
        print(f"  {w}: {c}")

if all_flagged_phrases:
    print(f"\nTop flagged phrases:")
    for p, c in sorted(all_flagged_phrases.items(), key=lambda x: -x[1])[:10]:
        print(f"  \"{p}\": {c}")

if failures:
    print(f"\nFailed articles:")
    for f in failures[:30]:
        print(f"  {f['slug']}: {', '.join(f['issues'])}")
    if len(failures) > 30:
        print(f"  ... and {len(failures) - 30} more")

# Save full report
with open('content/quality-report.json', 'w') as f:
    json.dump({'total': total, 'passed': total - len(failures), 'failed': len(failures), 
               'failures': failures, 'flagged_words': all_flagged_words, 
               'flagged_phrases': all_flagged_phrases}, f, indent=2)
print(f"\nFull report saved to content/quality-report.json")
