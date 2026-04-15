#!/usr/bin/env python3
"""
Fix articles outside 1200-1800 word range.
For articles that were broken by v1, restore from backup first.
Uses more precise prompts with explicit word count targets.
"""
import json, re, time, threading, copy
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

client = OpenAI()
lock = threading.Lock()
sem = threading.Semaphore(2)

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'

def word_count(body):
    return len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', body)))

def post_process(body):
    body = body.replace('\u2014', ' - ').replace('\u2013', ' - ')
    body = body.replace('---', '...').replace('--', ' - ')
    if body.startswith('```'):
        body = re.sub(r'^```\w*\n?', '', body)
        body = re.sub(r'\n?```$', '', body)
    return body

def fix_article(article, wc):
    slug = article['slug']
    
    if wc < 1200:
        target_min, target_max = 1300, 1500
        instruction = f"""This article is only {wc} words. I need you to EXPAND it to exactly {target_min}-{target_max} words.

ADD:
- 2-3 new paragraphs with deeper examples and observations
- 1 new Kalesh phrase woven in naturally
- More specific, lived details
- Keep all existing content, just add depth"""
    elif wc > 1800:
        target_min, target_max = 1500, 1750
        instruction = f"""This article is {wc} words. I need you to REDUCE it to exactly {target_min}-{target_max} words.

REMOVE:
- Redundant sentences that say the same thing twice
- Overly long examples (keep the best one, cut the rest)
- Filler transitions
- Keep ALL headers, keep the core argument, keep Kalesh voice
- DO NOT cut below {target_min} words"""
    else:
        return None, wc

    prompt = f"""{instruction}

ABSOLUTE RULES:
- Final word count MUST be between {target_min} and {target_max} words. Count carefully.
- NEVER use em-dashes (—). Use commas, periods, ellipsis (...), or short hyphens.
- NEVER use: profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, resonate, embark, paradigm, leverage, utilize, facilitate, moreover, furthermore, nevertheless, seamlessly, pivotal, myriad, plethora, robust, foster, cultivate, navigate, landscape, realm, unveil, beacon, testament, cornerstone
- Voice: Kalesh - consciousness teacher. Long unfolding sentences with short drops.
- Output ONLY HTML body starting with <h2>. No code fences. No title.

CURRENT ARTICLE ({wc} words):
{article['body']}"""

    with sem:
        time.sleep(2)
        for attempt in range(3):
            try:
                response = client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[
                        {"role": "system", "content": f"You are editing an article. The final word count MUST be between {target_min} and {target_max} words. Count carefully. Never use em-dashes. Output only HTML."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.7,
                )
                new_body = post_process(response.choices[0].message.content.strip())
                new_wc = word_count(new_body)
                
                # If still out of range, try once more with stronger instruction
                if new_wc < 1200 or new_wc > 1800:
                    print(f"  {slug}: attempt {attempt+1} got {new_wc} words, retrying...", flush=True)
                    continue
                
                return new_body, new_wc
                
            except Exception as e:
                print(f"  Attempt {attempt+1} failed for {slug}: {e}", flush=True)
                time.sleep(15 * (attempt + 1))
    
    return None, 0

def main():
    articles = json.load(open(CONTENT_PATH))
    
    # First, check current state
    needs_fix = []
    for i, a in enumerate(articles):
        wc = word_count(a.get('body', ''))
        if wc < 1200 or wc > 1800:
            needs_fix.append((i, a, wc))
    
    print(f"Articles to fix: {len(needs_fix)}", flush=True)
    under = sum(1 for _,_,w in needs_fix if w < 1200)
    over = sum(1 for _,_,w in needs_fix if w > 1800)
    print(f"  Under 1200: {under}, Over 1800: {over}", flush=True)
    
    done = 0
    still_bad = 0
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {}
        for idx, article, wc in needs_fix:
            f = executor.submit(fix_article, article, wc)
            futures[f] = (idx, article, wc)
        
        for future in as_completed(futures):
            idx, article, old_wc = futures[future]
            try:
                new_body, new_wc = future.result()
                if new_body and 1100 <= new_wc <= 1900:
                    with lock:
                        articles[idx]['body'] = new_body
                    done += 1
                    status = "OK" if 1200 <= new_wc <= 1800 else "CLOSE"
                    print(f"  {status}: {article['slug']}: {old_wc} -> {new_wc}", flush=True)
                else:
                    still_bad += 1
                    print(f"  STILL BAD: {article['slug']}: {old_wc} -> {new_wc}", flush=True)
                
                if done % 10 == 0:
                    with lock:
                        json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
            except Exception as e:
                still_bad += 1
                print(f"  ERROR: {article['slug']}: {e}", flush=True)
    
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Final stats
    all_wc = [word_count(a.get('body','')) for a in articles]
    u = sum(1 for w in all_wc if w < 1200)
    o = sum(1 for w in all_wc if w > 1800)
    ir = sum(1 for w in all_wc if 1200 <= w <= 1800)
    em = sum(1 for a in articles if '\u2014' in a.get('body','') or '\u2013' in a.get('body',''))
    
    print(f"\n=== FINAL ===", flush=True)
    print(f"Fixed: {done}, Still bad: {still_bad}", flush=True)
    print(f"In range (1200-1800): {ir}, Under: {u}, Over: {o}", flush=True)
    print(f"Em-dashes: {em}", flush=True)
    print(f"Avg: {sum(all_wc)//len(all_wc)}, Min: {min(all_wc)}, Max: {max(all_wc)}", flush=True)

if __name__ == '__main__':
    main()
