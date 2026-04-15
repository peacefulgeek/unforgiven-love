#!/usr/bin/env python3
"""Fix articles outside 1200-1800 word range"""
import json, re, time, threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

client = OpenAI()
lock = threading.Lock()
sem = threading.Semaphore(2)

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'

def word_count(body):
    return len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', body)))

def fix_article(article, target):
    slug = article['slug']
    wc = word_count(article['body'])
    
    if target == 'expand':
        instruction = f"This article is {wc} words. Expand it to 1300-1500 words by adding more depth, examples, and Kalesh voice observations. Keep the same structure and headers."
    else:
        instruction = f"This article is {wc} words. Trim it to 1500-1700 words by removing redundancy and tightening prose. Keep the core message and all headers."
    
    prompt = f"""{instruction}

RULES:
- Target: 1200-1800 words (aim for 1400-1600)
- NEVER use em-dashes (—). Use commas, periods, ellipsis (...), or short hyphens.
- NEVER use: profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, resonate, embark, paradigm, leverage, utilize, facilitate, moreover, furthermore, nevertheless, seamlessly, pivotal, myriad, plethora, robust, foster, cultivate, navigate, landscape, realm, unveil, beacon, testament, cornerstone
- Voice: Kalesh - consciousness teacher. Long unfolding sentences with short drops. Contractions. Conversational.
- Output ONLY HTML body starting with <h2>. No code fences.

ARTICLE:
{article['body'][:6000]}"""

    with sem:
        time.sleep(1.5)
        for attempt in range(3):
            try:
                response = client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[
                        {"role": "system", "content": "You are Kalesh, a consciousness teacher. Adjust article length while maintaining voice. Never use em-dashes. Output only HTML."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.8,
                )
                new_body = response.choices[0].message.content.strip()
                new_body = re.sub(r'^```\w*\n?', '', new_body)
                new_body = re.sub(r'\n?```$', '', new_body)
                new_body = new_body.replace('\u2014', ' - ').replace('\u2013', ' - ')
                new_body = new_body.replace('---', '...').replace('--', ' - ')
                new_wc = word_count(new_body)
                return new_body, new_wc
            except Exception as e:
                print(f"  Attempt {attempt+1} failed for {slug}: {e}", flush=True)
                time.sleep(10 * (attempt + 1))
    return None, 0

def main():
    articles = json.load(open(CONTENT_PATH))
    
    needs_fix = []
    for i, a in enumerate(articles):
        wc = word_count(a.get('body', ''))
        if wc < 1200:
            needs_fix.append((i, a, 'expand', wc))
        elif wc > 1800:
            needs_fix.append((i, a, 'trim', wc))
    
    print(f"Articles to fix: {len(needs_fix)} ({sum(1 for _,_,t,_ in needs_fix if t=='expand')} expand, {sum(1 for _,_,t,_ in needs_fix if t=='trim')} trim)", flush=True)
    
    done = 0
    failed = []
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {}
        for idx, article, target, wc in needs_fix:
            f = executor.submit(fix_article, article, target)
            futures[f] = (idx, article, target, wc)
        
        for future in as_completed(futures):
            idx, article, target, old_wc = futures[future]
            try:
                new_body, new_wc = future.result()
                if new_body and new_wc >= 800:
                    with lock:
                        articles[idx]['body'] = new_body
                    done += 1
                    print(f"  Fixed {article['slug']}: {old_wc} -> {new_wc} ({target})", flush=True)
                    if done % 10 == 0:
                        with lock:
                            json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
                else:
                    failed.append(article['slug'])
                    print(f"  FAILED: {article['slug']}", flush=True)
            except Exception as e:
                failed.append(article['slug'])
                print(f"  ERROR: {article['slug']}: {e}", flush=True)
    
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Final stats
    all_wc = [word_count(a.get('body','')) for a in articles]
    under = sum(1 for w in all_wc if w < 1200)
    over = sum(1 for w in all_wc if w > 1800)
    in_range = sum(1 for w in all_wc if 1200 <= w <= 1800)
    emdash = sum(1 for a in articles if '\u2014' in a.get('body','') or '\u2013' in a.get('body',''))
    
    print(f"\n=== FINAL ===", flush=True)
    print(f"Fixed: {done}/{len(needs_fix)}, Failed: {len(failed)}", flush=True)
    print(f"In range: {in_range}, Under 1200: {under}, Over 1800: {over}", flush=True)
    print(f"Em-dashes: {emdash}", flush=True)
    print(f"Avg: {sum(all_wc)//len(all_wc)}, Min: {min(all_wc)}, Max: {max(all_wc)}", flush=True)

if __name__ == '__main__':
    main()
