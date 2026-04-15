#!/usr/bin/env python3
"""Programmatically trim the 5 remaining articles over 1800 words by removing the longest non-essential paragraphs."""
import json, re

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'

def word_count(text):
    return len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', text)))

def trim_article(body, target_max=1780):
    """Remove the longest non-header paragraphs until under target_max words."""
    wc = word_count(body)
    if wc <= target_max:
        return body
    
    # Split into blocks (paragraphs, headers, divs, etc.)
    # We'll identify <p>...</p> blocks that can be safely removed
    paragraphs = re.findall(r'<p>.*?</p>', body, re.DOTALL)
    
    # Sort paragraphs by word count (longest first) - these are candidates for removal
    para_wcs = [(p, word_count(p)) for p in paragraphs]
    # Skip very short paragraphs (likely important transitions) and the first/last paragraphs
    removable = [(p, wc_p) for p, wc_p in para_wcs[1:-1] if wc_p > 30]
    removable.sort(key=lambda x: -x[1])  # longest first
    
    for para, para_wc in removable:
        if word_count(body) <= target_max:
            break
        # Remove this paragraph (only first occurrence)
        body = body.replace(para, '', 1)
    
    # Clean up double newlines
    body = re.sub(r'\n{3,}', '\n\n', body)
    
    return body

def main():
    articles = json.load(open(CONTENT_PATH))
    
    fixed = 0
    for a in articles:
        wc = word_count(a.get('body', ''))
        if wc > 1800:
            old_wc = wc
            a['body'] = trim_article(a['body'])
            new_wc = word_count(a['body'])
            print(f"  Trimmed {a['slug']}: {old_wc} -> {new_wc}")
            fixed += 1
    
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Final stats
    all_wc = [word_count(a.get('body','')) for a in articles]
    under = sum(1 for w in all_wc if w < 1200)
    over = sum(1 for w in all_wc if w > 1800)
    ir = sum(1 for w in all_wc if 1200 <= w <= 1800)
    em = sum(1 for a in articles if '\u2014' in a.get('body','') or '\u2013' in a.get('body',''))
    
    print(f"\nFinal: In range: {ir}, Under: {under}, Over: {over}")
    print(f"Em-dashes: {em}")
    print(f"Avg: {sum(all_wc)//len(all_wc)}, Min: {min(all_wc)}, Max: {max(all_wc)}")

if __name__ == '__main__':
    main()
