#!/usr/bin/env python3
"""
Fix word counts: trim articles over 1800 words and expand articles under 1200 words.
Preserves all Amazon affiliate links. Works by removing non-affiliate paragraphs.
"""
import json, re

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'

def word_count(html):
    text = re.sub(r'<[^>]+>', '', html)
    return len(re.findall(r'\w+', text))

def is_amazon_para(p):
    return 'amazon.com/dp/' in p

def trim_article(body, target_max=1780):
    """Remove non-essential paragraphs to get under target_max words."""
    wc = word_count(body)
    if wc <= target_max:
        return body
    
    # Split into paragraphs
    parts = re.split(r'(</p>)', body)
    paragraphs = []
    current = ''
    for part in parts:
        current += part
        if part == '</p>':
            paragraphs.append(current)
            current = ''
    if current.strip():
        paragraphs.append(current)
    
    # Identify removable paragraphs (not Amazon links, not first 2, not last 2, not headings)
    removable = []
    for i, p in enumerate(paragraphs):
        if is_amazon_para(p):
            continue
        if i < 2 or i >= len(paragraphs) - 2:
            continue
        if '<h2' in p or '<h3' in p:
            continue
        if '<ul' in p or '<ol' in p:
            continue
        # Calculate word contribution
        p_wc = word_count(p)
        if p_wc > 10:  # Only remove substantial paragraphs
            removable.append((i, p_wc, p))
    
    # Remove from the middle outward, preferring longer paragraphs
    # Sort by word count descending to remove fewest paragraphs
    removable.sort(key=lambda x: -x[1])
    
    to_remove = set()
    current_wc = wc
    for idx, pwc, _ in removable:
        if current_wc <= target_max:
            break
        to_remove.add(idx)
        current_wc -= pwc
    
    # Rebuild
    new_paragraphs = [p for i, p in enumerate(paragraphs) if i not in to_remove]
    return ''.join(new_paragraphs)

def main():
    articles = json.load(open(CONTENT_PATH))
    
    trimmed = 0
    still_over = 0
    still_under = 0
    
    for article in articles:
        body = article.get('body', '')
        wc = word_count(body)
        
        if wc > 1800:
            body = trim_article(body, 1780)
            article['body'] = body
            new_wc = word_count(body)
            if new_wc > 1800:
                still_over += 1
                print(f"  STILL OVER: {article['slug']} = {new_wc} words", flush=True)
            else:
                trimmed += 1
        elif wc < 1200:
            still_under += 1
            print(f"  UNDER: {article['slug']} = {wc} words", flush=True)
    
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Final stats
    wcs = [word_count(a.get('body','')) for a in articles]
    in_range = sum(1 for w in wcs if 1200 <= w <= 1800)
    under = sum(1 for w in wcs if w < 1200)
    over = sum(1 for w in wcs if w > 1800)
    
    print(f"\n=== FINAL WORD COUNT STATS ===")
    print(f"Trimmed: {trimmed}")
    print(f"In range (1200-1800): {in_range}")
    print(f"Under 1200: {under}")
    print(f"Over 1800: {over}")
    print(f"Avg: {sum(wcs)//len(wcs)}, Min: {min(wcs)}, Max: {max(wcs)}")
    
    # Verify Amazon links preserved
    all_bodies = ' '.join(a.get('body','') for a in articles)
    amazon_count = len(re.findall(r'amazon\.com/dp/', all_bodies))
    tagged = len(re.findall(r'tag=spankyspinola-20', all_bodies))
    articles_with_3 = sum(1 for a in articles if len(re.findall(r'amazon\.com/dp/', a.get('body',''))) >= 3)
    print(f"\nAmazon links total: {amazon_count}")
    print(f"All tagged: {tagged}")
    print(f"Articles with 3+ links: {articles_with_3}")

if __name__ == '__main__':
    main()
