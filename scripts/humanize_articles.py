#!/usr/bin/env python3
"""
Humanize all articles: rewrite to 1200-1800 words, Kalesh voice,
no em-dashes, no AI words, conversational interjections, varied sentences,
all 9 REDO fixes applied.
"""
import json, re, os, time, random, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

client = OpenAI()

CONTENT_PATH = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles.json')

# ─── BANNED WORDS & PHRASES ───
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

# ─── KALESH VOICE PHRASES (50 total) ───
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
    "Stay with me here.",
    "I know, I know.",
    "Wild, right?",
    "Think about that for a second.",
    "Let that land.",
    "Read that again.",
    "Sit with that.",
    "Here's the thing.",
    "And here's what nobody tells you.",
    "This is the part that matters.",
    "Pay attention to this next part.",
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
    "I've sat with people who",
    "In my years of working in this territory",
    "A client once described this as",
    "I've seen this pattern dozens of times",
    "What I've learned after decades in this work is",
    "I remember a student who",
    "Someone I worked with put it this way",
    "In my own practice, I've noticed",
    "After years of teaching this material",
    "I've watched this unfold in real time",
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

def get_opener_type(idx, total):
    """Distribute opener types evenly across all articles"""
    return OPENER_TYPES[idx % len(OPENER_TYPES)]

def get_conclusion_type(idx, total):
    """30%+ challenge endings, rest tender"""
    return 'challenge' if idx % 3 == 0 else 'tender'

def get_phrases_for_article(idx):
    """Select 3-5 unique phrases from the 50 Kalesh phrases"""
    count = random.choice([3, 3, 4, 4, 5])
    start = (idx * 5) % len(KALESH_PHRASES)
    selected = []
    for i in range(count):
        selected.append(KALESH_PHRASES[(start + i * 7) % len(KALESH_PHRASES)])
    return selected

def get_interjections():
    """Select exactly 2 random interjections"""
    return random.sample(INTERJECTIONS, 2)

def get_researcher(idx):
    """Select a researcher for this article"""
    return RESEARCHERS[idx % len(RESEARCHERS)]

def get_lived_exp():
    """Select a lived experience phrase"""
    return random.choice(LIVED_EXPERIENCE)

def build_humanize_prompt(article, idx, total):
    opener_type = get_opener_type(idx, total)
    conclusion_type = get_conclusion_type(idx, total)
    phrases = get_phrases_for_article(idx)
    interjections = get_interjections()
    researcher = get_researcher(idx)
    lived_exp = get_lived_exp()

    phrases_str = '\n'.join(f'  - "{p}"' for p in phrases)
    interjections_str = ', '.join(f'"{i}"' for i in interjections)

    banned_words_str = ', '.join(BANNED_AI_WORDS[:30])
    banned_phrases_str = ', '.join(f'"{p}"' for p in BANNED_PHRASES)

    return f"""Rewrite this article about "{article['title']}" in the Kalesh voice. Kalesh is a consciousness teacher who writes in long, unfolding sentences that build and turn, averaging 18-28 words, with occasional short drops like stones. He leads with intellectual warmth - 40% teaching, 30% tender, 20% philosophical, 10% fierce.

STRICT REQUIREMENTS:
1. WORD COUNT: Exactly 1200-1800 words. No more. No less. Count carefully.
2. NO EM-DASHES (---, --, or the character \u2014). Replace with: ... or - or ~ or commas or periods. Mix them up.
3. BANNED WORDS (zero tolerance): {banned_words_str}
4. BANNED PHRASES (zero tolerance): {banned_phrases_str}
5. OPENER TYPE: {opener_type}
   - scene: Start with a vivid scene. "Three weeks out. The fridge hums."
   - provocation: Start with a provocative statement. "Nobody warns you about this part."
   - first-person: Start with "I've sat across from..." or similar
   - question: Start with a question that hooks
   - named-ref: Start with a researcher reference. "{researcher} called it..."
   - gut-punch: Start with a short, hard truth
6. CONCLUSION TYPE: {conclusion_type}
   - challenge: End with a direct challenge or uncomfortable question
   - tender: End with earned tenderness using a Kalesh phrase (not generic comfort)
7. INJECT these exact Kalesh phrases naturally into the body (as quotes, pull-quotes, or woven in):
{phrases_str}
8. ADD these exact 2 conversational interjections somewhere in the body: {interjections_str}
9. INCLUDE at least one reference to {researcher} and their work, woven naturally (editorial style, not academic)
10. INCLUDE 1-2 first-person lived experience sentences using variations of: "{lived_exp}"
11. VARY sentence lengths aggressively. Mix 5-word sentences with 30-word sentences. No more than 2 sentences in a row of similar length.
12. DO NOT start more than 2 sentences with "This" in the entire article.
13. DO NOT use "This is" or "This means" or "This creates" as sentence starters.
14. Keep the same H2/H3 structure but rename any generic headers ("The Path Ahead", "Moving Forward", "The Bottom Line") to something specific.
15. Keep existing FAQs if any (same count), but rewrite them in conversational voice.
16. Output ONLY the HTML body content (starting with the first <h2>). No title, no metadata.
17. Make every <a> tag in the body clickable HTML (not raw text).
18. Write like a real human with decades of experience. Google should never flag this as AI. Use contractions. Use incomplete sentences occasionally. Reference specific details. Be specific, not generic.

CURRENT ARTICLE BODY:
{article['body'][:8000]}"""

def humanize_article(article, idx, total):
    """Rewrite a single article using the API"""
    prompt = build_humanize_prompt(article, idx, total)

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are Kalesh, a consciousness teacher and writer. You write in long, unfolding sentences with occasional short drops. You are warm but intellectually rigorous. You never use em-dashes. You never use AI-flagged words. You write like a real human with decades of contemplative experience. Output only HTML body content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.85,
            )
            new_body = response.choices[0].message.content.strip()

            # Strip markdown code fences if present
            if new_body.startswith('```'):
                new_body = re.sub(r'^```\w*\n?', '', new_body)
                new_body = re.sub(r'\n?```$', '', new_body)

            # Post-process: remove any remaining em-dashes
            new_body = new_body.replace('\u2014', ' - ')
            new_body = new_body.replace('\u2013', ' - ')
            new_body = new_body.replace('---', '...')
            new_body = new_body.replace('--', ' - ')

            # Post-process: remove banned words (case-insensitive replacement)
            for word in BANNED_AI_WORDS:
                pattern = re.compile(re.escape(word), re.IGNORECASE)
                if word in ['profound', 'profoundly']:
                    new_body = pattern.sub('deep', new_body)
                elif word in ['transformative']:
                    new_body = pattern.sub('life-changing', new_body)
                elif word in ['holistic']:
                    new_body = pattern.sub('whole-person', new_body)
                elif word in ['nuanced']:
                    new_body = pattern.sub('layered', new_body)
                elif word in ['multifaceted']:
                    new_body = pattern.sub('complex', new_body)
                elif word in ['navigate', 'navigating']:
                    new_body = pattern.sub('work through', new_body)
                elif word in ['landscape']:
                    new_body = pattern.sub('territory', new_body)
                elif word in ['foster', 'fostering']:
                    new_body = pattern.sub('build', new_body)
                elif word in ['cultivate', 'cultivating']:
                    new_body = pattern.sub('develop', new_body)
                elif word in ['utilize', 'utilizing']:
                    new_body = pattern.sub('use', new_body)
                elif word in ['facilitate', 'facilitating']:
                    new_body = pattern.sub('support', new_body)
                elif word in ['moreover']:
                    new_body = pattern.sub('And', new_body)
                elif word in ['furthermore']:
                    new_body = pattern.sub('Also', new_body)
                elif word in ['nevertheless']:
                    new_body = pattern.sub('Still', new_body)
                else:
                    new_body = pattern.sub('', new_body)

            # Remove banned phrases
            for phrase in BANNED_PHRASES:
                pattern = re.compile(re.escape(phrase), re.IGNORECASE)
                if phrase == 'this is where':
                    new_body = pattern.sub('Here', new_body)
                elif phrase == 'lean into':
                    new_body = pattern.sub('face', new_body)
                elif phrase == 'showing up for':
                    new_body = pattern.sub('being present with', new_body)
                elif phrase == 'authentic self':
                    new_body = pattern.sub('who you actually are', new_body)
                elif phrase == 'safe space':
                    new_body = pattern.sub('a place where you can fall apart', new_body)
                elif phrase == 'hold space':
                    new_body = pattern.sub('sit with', new_body)
                elif phrase == 'sacred container':
                    new_body = pattern.sub('protected environment', new_body)
                elif phrase == 'raise your vibration':
                    new_body = pattern.sub('', new_body)
                else:
                    new_body = pattern.sub('', new_body)

            # Clean up double spaces
            new_body = re.sub(r'  +', ' ', new_body)
            new_body = re.sub(r'<p>\s*</p>', '', new_body)

            # Word count check
            word_count = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', new_body)))

            return new_body, word_count

        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {article['slug']}: {e}", flush=True)
            time.sleep(5)

    return None, 0

def main():
    articles = json.load(open(CONTENT_PATH))
    total = len(articles)
    print(f"Humanizing {total} articles...", flush=True)

    done = 0
    failed = []
    word_counts = []
    opener_dist = {t: 0 for t in OPENER_TYPES}
    conclusion_dist = {'challenge': 0, 'tender': 0}

    # Process with 4 parallel workers
    def process_one(args):
        idx, article = args
        new_body, wc = humanize_article(article, idx, total)
        return idx, new_body, wc

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(process_one, (i, a)): i for i, a in enumerate(articles)}

        for future in as_completed(futures):
            idx = futures[future]
            try:
                idx, new_body, wc = future.result()
                if new_body and wc >= 800:  # Accept if at least 800 words (will flag if under 1200)
                    articles[idx]['body'] = new_body
                    word_counts.append(wc)
                    opener_dist[get_opener_type(idx, total)] += 1
                    conclusion_dist[get_conclusion_type(idx, total)] += 1
                    done += 1
                    if done % 10 == 0:
                        print(f"  {done}/{total} done (latest: {articles[idx]['slug']} = {wc} words)", flush=True)
                        # Save progress
                        json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
                else:
                    failed.append(articles[idx]['slug'])
                    print(f"  FAILED: {articles[idx]['slug']} (wc={wc})", flush=True)
            except Exception as e:
                failed.append(articles[futures[future]]['slug'])
                print(f"  ERROR: {articles[futures[future]]['slug']}: {e}", flush=True)

    # Final save
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)

    # Stats
    print(f"\n=== HUMANIZATION COMPLETE ===", flush=True)
    print(f"Total rewritten: {done}/{total}", flush=True)
    print(f"Failed: {len(failed)}", flush=True)
    if word_counts:
        print(f"Word counts: avg={sum(word_counts)//len(word_counts)} min={min(word_counts)} max={max(word_counts)}", flush=True)
        under_1200 = sum(1 for w in word_counts if w < 1200)
        over_1800 = sum(1 for w in word_counts if w > 1800)
        print(f"Under 1200: {under_1200}, Over 1800: {over_1800}", flush=True)
    print(f"Opener distribution: {opener_dist}", flush=True)
    print(f"Conclusion distribution: {conclusion_dist}", flush=True)
    if failed:
        print(f"Failed slugs: {failed}", flush=True)

if __name__ == '__main__':
    main()
