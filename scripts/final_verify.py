#!/usr/bin/env python3
"""Final comprehensive verification of all articles."""
import json, re

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'
articles = json.load(open(CONTENT_PATH))

# Word counts
wcs = []
under = []
over = []
for a in articles:
    text = re.sub(r'<[^>]+>', '', a.get('body', ''))
    wc = len(re.findall(r'\w+', text))
    wcs.append(wc)
    if wc < 1200:
        under.append((a['slug'], wc))
    elif wc > 1800:
        over.append((a['slug'], wc))

print(f"=== WORD COUNTS ===")
print(f"Total articles: {len(articles)}")
print(f"In range (1200-1800): {len(articles) - len(under) - len(over)}")
print(f"Under 1200: {len(under)}")
for s, w in under:
    print(f"  {s}: {w}")
print(f"Over 1800: {len(over)}")
for s, w in over:
    print(f"  {s}: {w}")
print(f"Avg: {sum(wcs)//len(wcs)}, Min: {min(wcs)}, Max: {max(wcs)}")

# Amazon links
print(f"\n=== AMAZON LINKS ===")
articles_with_0 = 0
articles_with_1 = 0
articles_with_2 = 0
articles_with_3plus = 0
total_links = 0
total_tagged = 0
for a in articles:
    body = a.get('body', '')
    links = len(re.findall(r'amazon\.com/dp/', body))
    tagged = len(re.findall(r'tag=spankyspinola-20', body))
    total_links += links
    total_tagged += tagged
    if links == 0:
        articles_with_0 += 1
    elif links == 1:
        articles_with_1 += 1
    elif links == 2:
        articles_with_2 += 1
    else:
        articles_with_3plus += 1

print(f"Articles with 0 links: {articles_with_0}")
print(f"Articles with 1 link: {articles_with_1}")
print(f"Articles with 2 links: {articles_with_2}")
print(f"Articles with 3+ links: {articles_with_3plus}")
print(f"Total Amazon links: {total_links}")
print(f"Total with tag: {total_tagged}")
print(f"Untagged: {total_links - total_tagged}")

# Em-dashes
print(f"\n=== EM-DASHES ===")
em_count = 0
for a in articles:
    body = a.get('body', '')
    em = len(re.findall(r'[\u2014\u2013]|—|–', body))
    em_count += em
print(f"Total em-dashes: {em_count}")

# Banned AI words
print(f"\n=== BANNED AI WORDS ===")
banned = ['profound', 'transformative', 'holistic', 'nuanced', 'multifaceted', 'embark', 'realm', 'landscape', 'beacon', 'tapestry', 'delve', 'leverage', 'moreover', 'furthermore', 'in conclusion']
for word in banned:
    count = 0
    for a in articles:
        text = re.sub(r'<[^>]+>', '', a.get('body', '')).lower()
        count += len(re.findall(r'\b' + word + r'\b', text))
    if count > 0:
        print(f"  '{word}': {count} occurrences")
total_banned = sum(len(re.findall(r'\b' + w + r'\b', re.sub(r'<[^>]+>', '', a.get('body', '')).lower())) for a in articles for w in banned)
print(f"Total banned words: {total_banned}")

# Kalesh identity
print(f"\n=== IDENTITY ===")
all_text = json.dumps(articles)
krishna_count = len(re.findall(r'(?i)krishna(?!murti)', all_text))
paul_count = len(re.findall(r'(?i)paul\s*wagner', all_text))
shri_count = len(re.findall(r'(?i)shrikrishna', all_text))
kalesh_count = len(re.findall(r'(?i)kalesh', all_text))
print(f"Krishna refs: {krishna_count}")
print(f"Paul Wagner refs: {paul_count}")
print(f"shrikrishna refs: {shri_count}")
print(f"Kalesh refs: {kalesh_count}")

print(f"\n=== SUMMARY ===")
all_pass = True
if len(under) > 0 or len(over) > 0:
    print(f"FAIL: {len(under)} under, {len(over)} over word count")
    all_pass = False
if articles_with_3plus < 303:
    print(f"FAIL: Only {articles_with_3plus}/303 articles have 3+ Amazon links")
    all_pass = False
if total_links - total_tagged > 0:
    print(f"FAIL: {total_links - total_tagged} untagged Amazon links")
    all_pass = False
if em_count > 0:
    print(f"FAIL: {em_count} em-dashes remaining")
    all_pass = False
if krishna_count > 0 or paul_count > 0 or shri_count > 0:
    print(f"FAIL: Identity issues found")
    all_pass = False
if all_pass:
    print("ALL CHECKS PASS!")
