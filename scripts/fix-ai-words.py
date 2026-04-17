#!/usr/bin/env python3
"""Replace all AI-flagged words and phrases in articles with natural alternatives."""
import json, re, random

random.seed(42)

# Word replacements — each flagged word maps to a list of natural alternatives
WORD_REPLACEMENTS = {
    'intricate': ['complex', 'layered', 'tangled', 'knotted', 'detailed', 'woven', 'messy', 'complicated'],
    'thereby': ['and so', 'which means', 'and that', 'so', 'because of that', 'which'],
    'fundamentally': ['at its core', 'really', 'at the root', 'deeply', 'in truth', 'basically'],
    'remarkable': ['striking', 'surprising', 'real', 'honest', 'unexpected', 'noticeable', 'clear'],
    'unlock': ['open', 'reach', 'find', 'access', 'discover', 'get to', 'release'],
    'inherently': ['naturally', 'by nature', 'at its core', 'in itself', 'on its own'],
    'ecosystem': ['system', 'network', 'web', 'world', 'environment', 'space'],
    'paramount': ['critical', 'vital', 'central', 'necessary', 'what matters most'],
    'importantly': ['what matters here is', 'the thing is', 'and here is the key', 'more to the point'],
    'crucially': ['and this is key', 'what matters is', 'the critical piece is', 'here is what counts'],
    'extraordinary': ['unusual', 'rare', 'surprising', 'uncommon', 'something different', 'real'],
    'essentially': ['really', 'at its core', 'in practice', 'basically', 'when you get down to it'],
    'empower': ['strengthen', 'support', 'give you room to', 'help you', 'free you to'],
    'revolutionary': ['different', 'new', 'fresh', 'a shift', 'something that changes things'],
    'amplify': ['increase', 'intensify', 'make louder', 'strengthen', 'deepen'],
    'consequently': ['and so', 'because of that', 'as a result', 'which means'],
    'sphere': ['area', 'space', 'part', 'corner', 'piece'],
    'orchestrate': ['arrange', 'organize', 'put together', 'coordinate', 'manage'],
    'domain': ['area', 'territory', 'space', 'field', 'part'],
    'comprehensive': ['full', 'complete', 'thorough', 'wide-ranging', 'all-around'],
    'delve': ['dig', 'look', 'explore', 'get into', 'examine'],
    'tapestry': ['fabric', 'weave', 'pattern', 'mix', 'blend'],
    'paradigm': ['model', 'framework', 'way of thinking', 'approach', 'pattern'],
    'synergy': ['connection', 'combination', 'working together', 'blend'],
    'leverage': ['use', 'draw on', 'work with', 'apply', 'lean on'],
    'utilize': ['use', 'work with', 'apply', 'draw on'],
    'pivotal': ['key', 'turning', 'critical', 'central', 'decisive'],
    'embark': ['start', 'begin', 'set out on', 'step into'],
    'underscore': ['highlight', 'show', 'point to', 'reveal', 'make clear'],
    'seamlessly': ['smoothly', 'naturally', 'easily', 'without friction'],
    'robust': ['strong', 'solid', 'sturdy', 'reliable', 'built to last'],
    'beacon': ['light', 'signal', 'guide', 'reminder'],
    'foster': ['build', 'grow', 'encourage', 'create space for', 'support'],
    'elevate': ['lift', 'raise', 'improve', 'deepen', 'bring up'],
    'curate': ['choose', 'select', 'gather', 'pick', 'put together'],
    'curated': ['chosen', 'selected', 'gathered', 'picked', 'hand-picked'],
    'bespoke': ['custom', 'personal', 'tailored', 'made for you'],
    'resonate': ['connect', 'land', 'hit home', 'ring true', 'feel right'],
    'harness': ['use', 'channel', 'direct', 'work with', 'draw on'],
    'plethora': ['many', 'a lot of', 'plenty of', 'loads of'],
    'myriad': ['many', 'countless', 'all kinds of', 'a range of'],
    'transformative': ['life-changing', 'real', 'deep', 'meaningful', 'something that shifts things'],
    'groundbreaking': ['new', 'fresh', 'original', 'first of its kind'],
    'innovative': ['creative', 'new', 'fresh', 'original'],
    'cutting-edge': ['new', 'modern', 'current', 'fresh'],
    'state-of-the-art': ['modern', 'current', 'latest', 'up-to-date'],
    'ever-evolving': ['always changing', 'shifting', 'moving', 'growing'],
    'game-changing': ['different', 'a real shift', 'something new'],
    'next-level': ['deeper', 'further', 'more advanced', 'bigger'],
    'world-class': ['top-quality', 'excellent', 'first-rate'],
    'unparalleled': ['rare', 'unusual', 'one of a kind', 'unlike anything else'],
    'unprecedented': ['never seen before', 'new', 'first-time', 'unusual'],
    'exceptional': ['unusual', 'rare', 'uncommon', 'special'],
    'profound': ['deep', 'real', 'honest', 'meaningful', 'heavy'],
    'holistic': ['whole-person', 'full-picture', 'complete', 'all-around'],
    'nuanced': ['layered', 'subtle', 'complex', 'detailed'],
    'multifaceted': ['layered', 'complex', 'many-sided', 'complicated'],
    'stakeholders': ['people involved', 'everyone affected', 'those with skin in the game'],
    'landscape': ['terrain', 'territory', 'ground', 'field', 'picture'],
    'realm': ['space', 'area', 'world', 'territory'],
    'arguably': ['you could say', 'some would say', 'it could be said'],
    'notably': ['especially', 'in particular', 'worth noting'],
    'substantively': ['meaningfully', 'in real ways', 'concretely'],
    'streamline': ['simplify', 'clean up', 'make easier'],
    'optimize': ['improve', 'fine-tune', 'adjust', 'make better'],
    'facilitate': ['help', 'support', 'make possible', 'allow'],
    'catalyze': ['spark', 'trigger', 'start', 'set off'],
    'propel': ['push', 'drive', 'move', 'carry'],
    'spearhead': ['lead', 'start', 'drive', 'push forward'],
    'navigate': ['move through', 'work through', 'find your way through', 'handle'],
    'traverse': ['cross', 'move through', 'walk through', 'get through'],
    'furthermore': ['and', 'also', 'on top of that', 'plus'],
    'moreover': ['and', 'also', 'on top of that', 'what is more'],
    'additionally': ['also', 'and', 'plus', 'on top of that'],
    'subsequently': ['later', 'after that', 'then', 'next'],
    'thusly': ['so', 'in that way', 'like that'],
    'wherein': ['where', 'in which', 'and there'],
    'whereby': ['where', 'through which', 'by which'],
}

# Phrase replacements
PHRASE_REPLACEMENTS = {
    "it's important to note that": ["here is the thing -", "what matters here is", "pay attention to this -", "and this is worth sitting with -"],
    "it's worth noting that": ["here is something -", "and this matters -", "notice this -"],
    "it's worth mentioning": ["and this matters -", "here is something -"],
    "it's crucial to": ["you need to", "it matters that you", "the real work is to"],
    "it is essential to": ["you need to", "what matters is", "the work here is to"],
    "in conclusion,": ["so.", "here is where it lands.", "and so.", "what it comes down to is this."],
    "in summary,": ["so.", "here is the short version.", "to put it simply,"],
    "to summarize,": ["so.", "in short,", "the short version:"],
    "a holistic approach": ["a whole-person approach", "looking at the full picture", "taking everything into account"],
    "unlock your potential": ["find what you are capable of", "grow into yourself", "discover what is possible"],
    "unlock the power": ["find the strength in", "discover what happens when", "tap into"],
    "in the realm of": ["in", "when it comes to", "in the space of"],
    "in the world of": ["in", "when we talk about", "inside"],
    "dive deep into": ["look closely at", "really examine", "get honest about"],
    "dive into": ["look at", "explore", "get into", "examine"],
    "delve into": ["look at", "explore", "dig into", "examine"],
    "at the end of the day": ["when it all shakes out", "when you strip it down", "in the end"],
    "in today's fast-paced world": ["in the way we live now", "with how fast things move", "in modern life"],
    "in today's digital age": ["now", "these days", "in the world we live in"],
    "in today's modern world": ["now", "these days", "in the world we live in"],
    "in this digital age": ["now", "these days", "today"],
    "when it comes to": ["with", "around", "regarding", "in terms of"],
    "navigate the complexities": ["work through the mess", "handle the complicated parts", "find your way through"],
    "a testament to": ["proof of", "evidence of", "a sign of", "showing"],
    "speaks volumes": ["says a lot", "tells you something", "shows you something real"],
    "the power of": ["what happens when you", "the weight of", "the force of", "how"],
    "the beauty of": ["what is good about", "the gift in", "the surprising thing about"],
    "the art of": ["the practice of", "the skill of", "learning to", "how to"],
    "the journey of": ["the process of", "the path of", "the work of", "walking through"],
    "the key lies in": ["what matters is", "the real work is", "it starts with"],
    "plays a crucial role": ["matters a lot", "is central", "carries real weight", "is a big part of this"],
    "plays a vital role": ["matters deeply", "is essential", "carries weight"],
    "plays a significant role": ["matters", "is part of this", "has real weight"],
    "plays a pivotal role": ["is central", "matters deeply", "is at the center of this"],
    "a wide array of": ["many", "all kinds of", "a range of"],
    "a wide range of": ["many", "all kinds of", "a range of"],
    "a plethora of": ["many", "plenty of", "a lot of"],
    "a myriad of": ["many", "all kinds of", "countless"],
    "stands as a": ["is", "remains", "works as"],
    "serves as a": ["is", "works as", "acts like", "functions as"],
    "acts as a": ["is", "works like", "becomes", "functions as"],
    "has emerged as": ["has become", "turned into", "grown into"],
    "continues to evolve": ["keeps changing", "keeps shifting", "is still growing"],
    "has revolutionized": ["has changed", "has shifted", "has transformed"],
    "cannot be overstated": ["is hard to overstate", "matters more than you think", "is bigger than it sounds"],
    "it goes without saying": ["obviously", "clearly", "you already know"],
    "needless to say": ["obviously", "clearly", "of course"],
    "last but not least": ["and finally", "and one more thing", "also"],
    "first and foremost": ["first", "before anything else", "the first thing"],
}

# Load articles
with open('content/articles.json') as f:
    articles = json.load(f)

total_word_fixes = 0
total_phrase_fixes = 0

for article in articles:
    body = article.get('body', '')
    original = body
    
    # Fix phrases first (longer matches before shorter)
    for phrase, replacements in sorted(PHRASE_REPLACEMENTS.items(), key=lambda x: -len(x[0])):
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        matches = pattern.findall(body)
        for match in matches:
            replacement = random.choice(replacements)
            # Preserve capitalization
            if match[0].isupper():
                replacement = replacement[0].upper() + replacement[1:]
            body = body.replace(match, replacement, 1)
            total_phrase_fixes += 1
    
    # Fix words
    for word, replacements in WORD_REPLACEMENTS.items():
        pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
        matches = list(pattern.finditer(body))
        for match in reversed(matches):  # reverse to preserve positions
            replacement = random.choice(replacements)
            original_word = match.group()
            if original_word[0].isupper():
                replacement = replacement[0].upper() + replacement[1:]
            body = body[:match.start()] + replacement + body[match.end():]
            total_word_fixes += 1
    
    article['body'] = body

# Save
with open('content/articles.json', 'w') as f:
    json.dump(articles, f, indent=2)

print(f"Fixed {total_word_fixes} flagged words and {total_phrase_fixes} flagged phrases across {len(articles)} articles")
