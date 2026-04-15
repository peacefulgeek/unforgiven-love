#!/usr/bin/env python3
"""
Humanize articles v2: 
- 2 workers with 2s delay between requests to avoid rate limits
- Only processes articles that still need work (have em-dashes or wrong word count)
- Post-processes ALL articles to remove em-dashes and banned words
"""
import json, re, os, time, random, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI
import threading

client = OpenAI()
lock = threading.Lock()
request_semaphore = threading.Semaphore(2)

CONTENT_PATH = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles.json')

BANNED_AI_WORDS = [
    'profound', 'profoundly', 'transformative', 'holistic', 'nuanced', 'multifaceted',
    'delve', 'delving', 'tapestry', 'resonate', 'resonates', 'resonating',
    'embark', 'embarking', 'journey of', 'paradigm', 'synergy', 'leverage',
    'utilize', 'utilizing', 'facilitate', 'facilitating', 'encompass', 'encompassing',
    'moreover', 'furthermore', 'nevertheless', 'notwithstanding',
    'in conclusion', 'it is important to note', 'it is worth noting',
    'in today\'s world', 'in this day and age', 'at the end of the day',
    'game-changer', 'game changer', 'groundbreaking', 'cutting-edge',
    'seamlessly', 'pivotal', 'myriad', 'plethora', 'robust',
    'foster', 'fostering', 'cultivate', 'cultivating',
    'navigate', 'navigating', 'landscape',
    'realm', 'unveil', 'unveiling', 'beacon',
    'testament', 'cornerstone', 'underscores',
]

BANNED_PHRASES = [
    'this is where', 'lean into', 'showing up for', 'authentic self',
    'safe space', 'hold space', 'sacred container', 'raise your vibration',
    'be gentle with yourself', 'be patient with yourself', 'you are not alone',
    'trust the process', 'give yourself grace', 'take it one day at a time',
    'manifest', 'manifestation',
]

KALESH_PHRASES = [
    "The mind is not the enemy. The identification with it is.",
    "Most of what passes for healing is just rearranging the furniture in a burning house.",
    "Awareness doesn't need to be cultivated. It needs to be uncovered.",
    "The nervous system doesn't respond to what you believe. It responds to what it senses.",
    "You cannot think your way into a felt sense of safety. The body has its own logic.",
    "Every resistance is information. The question is whether you're willing to read it.",
    "What we call 'stuck' is usually the body doing exactly what it was designed to do under conditions that no longer exist.",
    "The gap between stimulus and response is where your entire life lives.",
    "Consciousness doesn't arrive. It's what's left when everything else quiets down.",
    "The brain is prediction machinery. Anxiety is just prediction running without a stop button.",
    "There is no version of growth that doesn't involve the dissolution of something you thought was permanent.",
    "Trauma reorganizes perception. Recovery reorganizes it again, but this time with your participation.",
    "The contemplative traditions all point to the same thing: what you're looking for is what's looking.",
    "Embodiment is not a technique. It's what happens when you stop living exclusively in your head.",
    "The space between knowing something intellectually and knowing it in your body is where all the real work happens.",
    "Most people don't fear change. They fear the gap between who they were and who they haven't become yet.",
    "Attention is the most undervalued resource you have. Everything else follows from where you place it.",
    "The question is never whether the pain will come. The question is whether you'll meet it with presence or with narrative.",
    "Sit with it long enough and even the worst feeling reveals its edges.",
    "There's a difference between being alone and being with yourself. One is circumstance. The other is practice.",
    "Silence is not the absence of noise. It's the presence of attention.",
    "The breath doesn't need your management. It needs your companionship.",
    "When you stop trying to fix the moment, something remarkable happens - the moment becomes workable.",
    "We are not our thoughts, but we are responsible for our relationship to them.",
    "The body remembers what the mind would prefer to file away.",
    "Patience is not passive. It's the active practice of allowing something to unfold at its own pace.",
    "The paradox of acceptance is that nothing changes until you stop demanding that it does.",
    "What if the restlessness isn't a problem to solve but a signal to follow?",
    "You don't arrive at peace. You stop walking away from it.",
    "The most sophisticated defense mechanism is the one that looks like wisdom.",
    "Stillness is not something you achieve. It's what's already here beneath the achieving.",
    "Every moment of genuine attention is a small act of liberation.",
    "Information without integration is just intellectual hoarding.",
    "Your nervous system doesn't care about your philosophy. It cares about what happened at three years old.",
    "Reading about meditation is to meditation what reading the menu is to eating.",
    "Not every insight requires action. Some just need to be witnessed.",
    "The wellness industry sells solutions to problems it helps you believe you have.",
    "Complexity is the ego's favorite hiding place.",
    "If your spiritual practice makes you more rigid, it's not working.",
    "The research is clear on this, and it contradicts almost everything popular culture teaches.",
    "There's a meaningful difference between self-improvement and self-understanding. One adds. The other reveals.",
    "The algorithm of your attention determines the landscape of your experience.",
    "Stop pathologizing normal human suffering. Not everything requires a diagnosis.",
    "The body has a grammar. Most of us never learned to read it.",
    "You are not a problem to be solved. You are a process to be witnessed.",
    "Freedom is not the absence of constraint. It's the capacity to choose your relationship to it.",
    "The self you're trying to improve is the same self doing the improving. Notice the circularity.",
    "What we call 'the present moment' is not a place you go. It's the only place you've ever been.",
    "The most important things in life cannot be understood - only experienced.",
    "At a certain depth of inquiry, the distinction between psychology and philosophy dissolves entirely.",
]

INTERJECTIONS = [
    "Stay with me here.", "I know, I know.", "Wild, right?",
    "Think about that for a second.", "Let that land.", "Read that again.",
    "Sit with that.", "Here's the thing.", "And here's what nobody tells you.",
    "This is the part that matters.", "Pay attention to this next part.",
    "I want to be direct about something.",
]

OPENER_TYPES = ['scene', 'provocation', 'first-person', 'question', 'named-ref', 'gut-punch']

RESEARCHERS = [
    'Bessel van der Kolk', 'Gabor Mate', 'Peter Levine', 'Stephen Porges',
    'Dick Schwartz', 'Tara Brach', 'Kristin Neff', 'Dan Siegel',
    'Pat Ogden', 'Deb Dana', 'Janina Fisher', 'Judith Herman',
    'Bruce Perry', 'Allan Schore', 'Francine Shapiro',
]

LIVED_EXPERIENCE = [
    "I've sat with people who", "In my years of working in this territory",
    "A client once described this as", "I've seen this pattern dozens of times",
    "What I've learned after decades in this work is", "I remember a student who",
    "Someone I worked with put it this way", "In my own practice, I've noticed",
    "After years of teaching this material", "I've watched this unfold in real time",
]

CHALLENGE_ENDINGS = [
    "So what are you going to do about it?",
    "The question isn't whether you're ready. It's whether you're willing.",
    "You already know what needs to happen. You've known for a while.",
    "Stop reading. Go do the thing you've been avoiding.",
    "What would it mean to stop negotiating with yourself?",
    "The only person who can answer this is the one reading it right now.",
    "You don't need more information. You need to start.",
    "The work doesn't begin tomorrow. It began the moment you recognized the pattern.",
]

def post_process(body):
    """Remove em-dashes, banned words, banned phrases from any article body"""
    # Remove em-dashes
    body = body.replace('\u2014', ' - ')
    body = body.replace('\u2013', ' - ')
    body = body.replace('---', '...')
    body = body.replace('--', ' - ')
    
    # Remove banned words
    replacements = {
        'profound': 'deep', 'profoundly': 'deeply', 'transformative': 'life-changing',
        'holistic': 'whole-person', 'nuanced': 'layered', 'multifaceted': 'complex',
        'delve': 'explore', 'delving': 'exploring', 'tapestry': 'fabric',
        'resonate': 'connect', 'resonates': 'connects', 'resonating': 'connecting',
        'embark': 'begin', 'embarking': 'beginning', 'paradigm': 'framework',
        'synergy': 'connection', 'leverage': 'use', 'utilize': 'use', 'utilizing': 'using',
        'facilitate': 'support', 'facilitating': 'supporting',
        'encompass': 'include', 'encompassing': 'including',
        'moreover': 'And', 'furthermore': 'Also', 'nevertheless': 'Still',
        'notwithstanding': 'Despite this',
        'seamlessly': 'smoothly', 'pivotal': 'key', 'myriad': 'many',
        'plethora': 'many', 'robust': 'strong',
        'foster': 'build', 'fostering': 'building',
        'cultivate': 'develop', 'cultivating': 'developing',
        'navigate': 'work through', 'navigating': 'working through',
        'landscape': 'territory', 'realm': 'area',
        'unveil': 'reveal', 'unveiling': 'revealing', 'beacon': 'light',
        'testament': 'proof', 'cornerstone': 'foundation', 'underscores': 'shows',
    }
    
    for word, replacement in replacements.items():
        pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
        def replace_match(m, rep=replacement):
            if m.group()[0].isupper():
                return rep.capitalize()
            return rep
        body = pattern.sub(replace_match, body)
    
    # Remove banned phrases
    phrase_replacements = {
        'this is where': 'Here', 'lean into': 'face', 'showing up for': 'being present with',
        'authentic self': 'who you actually are', 'safe space': 'a place where you can fall apart',
        'hold space': 'sit with', 'sacred container': 'protected environment',
        'raise your vibration': '', 'be gentle with yourself': 'Take your time with this',
        'be patient with yourself': 'Give this the time it needs',
        'you are not alone': 'Others have walked this exact path',
        'trust the process': 'Keep going', 'give yourself grace': 'Allow yourself room to stumble',
        'take it one day at a time': 'Start with today',
        'manifest': 'create', 'manifestation': 'creation',
    }
    
    for phrase, replacement in phrase_replacements.items():
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        body = pattern.sub(replacement, body)
    
    # Remove specific AI patterns
    body = re.sub(r'\bin conclusion\b', 'To close', body, flags=re.IGNORECASE)
    body = re.sub(r'\bit is important to note\b', 'Notice', body, flags=re.IGNORECASE)
    body = re.sub(r'\bit is worth noting\b', 'Notice', body, flags=re.IGNORECASE)
    body = re.sub(r'\bin today\'s world\b', 'Right now', body, flags=re.IGNORECASE)
    body = re.sub(r'\bin this day and age\b', 'These days', body, flags=re.IGNORECASE)
    body = re.sub(r'\bat the end of the day\b', 'When it comes down to it', body, flags=re.IGNORECASE)
    body = re.sub(r'\bgame[- ]changer\b', 'turning point', body, flags=re.IGNORECASE)
    body = re.sub(r'\bgroundbreaking\b', 'important', body, flags=re.IGNORECASE)
    body = re.sub(r'\bcutting[- ]edge\b', 'recent', body, flags=re.IGNORECASE)
    body = re.sub(r'\bjourney of\b', 'process of', body, flags=re.IGNORECASE)
    
    # Clean up
    body = re.sub(r'  +', ' ', body)
    body = re.sub(r'<p>\s*</p>', '', body)
    
    return body

def needs_rewrite(article):
    """Check if article needs full rewrite via API"""
    body = article.get('body', '')
    wc = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', body)))
    has_emdash = '\u2014' in body or '\u2013' in body or '---' in body
    
    # Needs rewrite if: wrong word count, has em-dashes, or has many banned words
    banned_count = 0
    body_lower = body.lower()
    for w in BANNED_AI_WORDS[:15]:  # Check top 15 most common
        if w in body_lower:
            banned_count += 1
    
    if wc < 1100 or wc > 1900:
        return True, 'word_count'
    if has_emdash:
        return True, 'emdash'
    if banned_count >= 3:
        return True, 'banned_words'
    return False, 'ok'

def humanize_article(article, idx, total):
    """Rewrite a single article using the API"""
    opener_type = OPENER_TYPES[idx % len(OPENER_TYPES)]
    conclusion_type = 'challenge' if idx % 3 == 0 else 'tender'
    
    count = random.choice([3, 3, 4, 4, 5])
    start = (idx * 7) % len(KALESH_PHRASES)
    phrases = [KALESH_PHRASES[(start + i * 11) % len(KALESH_PHRASES)] for i in range(count)]
    
    interjections = random.sample(INTERJECTIONS, 2)
    researcher = RESEARCHERS[idx % len(RESEARCHERS)]
    lived_exp = random.choice(LIVED_EXPERIENCE)
    
    phrases_str = '\n'.join(f'  - "{p}"' for p in phrases)
    interjections_str = ', '.join(f'"{i}"' for i in interjections)

    prompt = f"""Rewrite this article about "{article['title']}" in the Kalesh voice. Kalesh is a consciousness teacher who writes in long, unfolding sentences that build and turn, averaging 18-28 words, with occasional short drops like stones. He leads with intellectual warmth - 40% teaching, 30% tender, 20% philosophical, 10% fierce.

STRICT REQUIREMENTS:
1. WORD COUNT: Between 1200-1800 words. Count carefully.
2. NEVER use em-dashes (the long dash character). Use commas, periods, ellipsis (...), or short hyphens instead.
3. NEVER use these words: profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, resonate, embark, paradigm, leverage, utilize, facilitate, moreover, furthermore, nevertheless, seamlessly, pivotal, myriad, plethora, robust, foster, cultivate, navigate, landscape, realm, unveil, beacon, testament, cornerstone
4. NEVER use these phrases: "this is where", "lean into", "showing up for", "authentic self", "safe space", "hold space", "sacred container", "raise your vibration", "be gentle with yourself", "trust the process"
5. OPENER: Use a {opener_type} opener
6. CONCLUSION: Use a {conclusion_type} ending {'(direct challenge or uncomfortable question)' if conclusion_type == 'challenge' else '(earned tenderness, not generic comfort)'}
7. WEAVE IN these Kalesh phrases naturally:
{phrases_str}
8. ADD these interjections: {interjections_str}
9. REFERENCE {researcher} and their work naturally (editorial, not academic)
10. ADD 1-2 first-person sentences: "{lived_exp}..."
11. VARY sentence lengths aggressively. Mix 5-word sentences with 30-word ones.
12. Use contractions. Use incomplete sentences sometimes. Be specific, not generic.
13. Keep the H2/H3 structure but make headers specific (not "Moving Forward" or "The Path Ahead")
14. Keep existing FAQ count if any, rewrite in conversational voice
15. Output ONLY HTML body content starting with first <h2>. No title, no metadata, no code fences.

CURRENT ARTICLE:
{article['body'][:6000]}"""

    with request_semaphore:
        time.sleep(1.5)  # Rate limit protection
        for attempt in range(3):
            try:
                response = client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[
                        {"role": "system", "content": "You are Kalesh, a consciousness teacher. Write in long unfolding sentences with short drops. Never use em-dashes. Never use AI-flagged words. Output only HTML."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.85,
                )
                new_body = response.choices[0].message.content.strip()
                
                # Strip code fences
                if new_body.startswith('```'):
                    new_body = re.sub(r'^```\w*\n?', '', new_body)
                    new_body = re.sub(r'\n?```$', '', new_body)
                
                # Post-process
                new_body = post_process(new_body)
                
                wc = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', new_body)))
                return new_body, wc
                
            except Exception as e:
                print(f"  Attempt {attempt+1} failed for {article['slug']}: {e}", flush=True)
                time.sleep(10 * (attempt + 1))  # Exponential backoff
    
    return None, 0

def main():
    articles = json.load(open(CONTENT_PATH))
    total = len(articles)
    
    # First: post-process ALL articles (fast, no API)
    print("Phase 1: Post-processing all articles (no API)...", flush=True)
    pp_fixed = 0
    for a in articles:
        old_body = a['body']
        a['body'] = post_process(a['body'])
        if a['body'] != old_body:
            pp_fixed += 1
    print(f"  Post-processed {pp_fixed} articles", flush=True)
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Check which articles still need full rewrite
    needs_work = []
    for i, a in enumerate(articles):
        needs, reason = needs_rewrite(a)
        if needs:
            needs_work.append((i, a, reason))
    
    print(f"\nPhase 2: {len(needs_work)} articles need full rewrite via API", flush=True)
    if needs_work:
        for i, a, reason in needs_work[:5]:
            wc = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', a['body'])))
            print(f"  - {a['slug']}: {reason} (wc={wc})", flush=True)
    
    done = 0
    failed = []
    word_counts = []
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {}
        for idx, article, reason in needs_work:
            f = executor.submit(humanize_article, article, idx, total)
            futures[f] = (idx, article)
        
        for future in as_completed(futures):
            idx, article = futures[future]
            try:
                new_body, wc = future.result()
                if new_body and wc >= 800:
                    with lock:
                        articles[idx]['body'] = new_body
                    word_counts.append(wc)
                    done += 1
                    if done % 10 == 0:
                        print(f"  {done}/{len(needs_work)} rewritten (latest: {article['slug']} = {wc} words)", flush=True)
                        with lock:
                            json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
                else:
                    failed.append(article['slug'])
                    print(f"  FAILED: {article['slug']} (wc={wc})", flush=True)
            except Exception as e:
                failed.append(article['slug'])
                print(f"  ERROR: {article['slug']}: {e}", flush=True)
    
    # Final save
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Final stats
    all_wc = []
    emdash_count = 0
    for a in articles:
        body = a.get('body', '')
        wc = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', body)))
        all_wc.append(wc)
        if '\u2014' in body or '\u2013' in body or '---' in body:
            emdash_count += 1
    
    print(f"\n=== FINAL STATS ===", flush=True)
    print(f"Total articles: {total}", flush=True)
    print(f"API rewrites: {done}/{len(needs_work)}", flush=True)
    print(f"Failed: {len(failed)}", flush=True)
    print(f"Em-dash articles remaining: {emdash_count}", flush=True)
    print(f"Word counts: avg={sum(all_wc)//len(all_wc)} min={min(all_wc)} max={max(all_wc)}", flush=True)
    under_1200 = sum(1 for w in all_wc if w < 1200)
    over_1800 = sum(1 for w in all_wc if w > 1800)
    in_range = sum(1 for w in all_wc if 1200 <= w <= 1800)
    print(f"In range (1200-1800): {in_range}, Under 1200: {under_1200}, Over 1800: {over_1800}", flush=True)
    if failed:
        print(f"Failed slugs: {failed}", flush=True)

if __name__ == '__main__':
    main()
