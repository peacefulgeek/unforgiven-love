#!/usr/bin/env python3
"""
Inject 3+ Amazon affiliate links into the body text of every article.
Each link is topic-matched, uses spankyspinola-20 tag, and is woven naturally
into the article body as a new paragraph after a relevant section.
"""
import json, re, random

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'
TAG = 'spankyspinola-20'

# Full product catalog with pre-written sentences
PRODUCTS = [
    # BOOKS — FORGIVENESS & HEALING
    {"asin": "0143128043", "name": "The Body Keeps the Score", "cat": "books", "tags": ["trauma","body","nervous-system","ptsd","somatic","tension","stored","physical"], "sentence": 'If you want to go deeper on how trauma lives in the body, I\'d recommend picking up <a href="URL" target="_blank" rel="nofollow sponsored">The Body Keeps the Score</a> (paid link) - it changed how I think about this work entirely.'},
    {"asin": "0062339346", "name": "The Gifts of Imperfection", "cat": "books", "tags": ["self-compassion","vulnerability","shame","worthiness","imperfect","enough"], "sentence": 'One book that really helped me with this was <a href="URL" target="_blank" rel="nofollow sponsored">The Gifts of Imperfection</a> (paid link) by Brene Brown - it\'s about letting go of who you think you should be.'},
    {"asin": "0553386697", "name": "The Power of Now", "cat": "books", "tags": ["presence","awareness","consciousness","mindfulness","ego","moment","present"], "sentence": 'If presence is something you\'re working on, <a href="URL" target="_blank" rel="nofollow sponsored">The Power of Now</a> (paid link) is worth having on your shelf - it\'s one of those books that meets you differently each time.'},
    {"asin": "1401944612", "name": "Radical Forgiveness", "cat": "books", "tags": ["forgiveness","radical","letting-go","spiritual","release","forgive","process"], "sentence": 'For a structured approach to this, I often point people toward <a href="URL" target="_blank" rel="nofollow sponsored">Radical Forgiveness</a> (paid link) by Colin Tipping - the framework is practical and surprisingly gentle.'},
    {"asin": "0062517627", "name": "When Things Fall Apart", "cat": "books", "tags": ["grief","loss","buddhism","acceptance","suffering","pain","falling"], "sentence": 'When everything feels like it\'s crumbling, <a href="URL" target="_blank" rel="nofollow sponsored">When Things Fall Apart</a> (paid link) by Pema Chodron is the kind of book that sits with you in the wreckage without trying to fix anything.'},
    {"asin": "0399592520", "name": "The Wisdom of Trauma", "cat": "books", "tags": ["trauma","addiction","connection","childhood","healing","wound","pain"], "sentence": 'Gabor Mate\'s <a href="URL" target="_blank" rel="nofollow sponsored">The Wisdom of Trauma</a> (paid link) reframes the whole conversation - trauma isn\'t what happened to you, it\'s what happened inside you as a result.'},
    {"asin": "1583949771", "name": "Radical Acceptance", "cat": "books", "tags": ["acceptance","self-compassion","buddhism","meditation","rain","accept","resist"], "sentence": 'Tara Brach\'s <a href="URL" target="_blank" rel="nofollow sponsored">Radical Acceptance</a> (paid link) taught me that the opposite of resistance isn\'t giving up - it\'s showing up with your whole heart.'},
    {"asin": "0062652559", "name": "No Bad Parts", "cat": "books", "tags": ["ifs","parts-work","inner-child","self-therapy","internal","parts","protector"], "sentence": 'If parts work interests you, <a href="URL" target="_blank" rel="nofollow sponsored">No Bad Parts</a> (paid link) by Dick Schwartz is the best starting point I know - it\'ll change how you relate to the voices inside.'},
    {"asin": "1556439016", "name": "Waking the Tiger", "cat": "books", "tags": ["somatic","trauma","body","nervous-system","freeze","shake","release"], "sentence": 'Peter Levine\'s <a href="URL" target="_blank" rel="nofollow sponsored">Waking the Tiger</a> (paid link) explains why the body sometimes needs to shake, tremble, or move to complete what the mind can\'t finish alone.'},
    {"asin": "0393710165", "name": "The Polyvagal Theory", "cat": "books", "tags": ["polyvagal","nervous-system","safety","vagus-nerve","regulation","fight","flight"], "sentence": 'If you want to understand why your body reacts the way it does, <a href="URL" target="_blank" rel="nofollow sponsored">The Polyvagal Theory</a> (paid link) by Stephen Porges is dense but worth the effort.'},
    {"asin": "0062883682", "name": "What Happened to You", "cat": "books", "tags": ["trauma","childhood","brain","resilience","connection","happened","blame"], "sentence": 'I keep coming back to <a href="URL" target="_blank" rel="nofollow sponsored">What Happened to You</a> (paid link) - it shifts the question from "what\'s wrong with you" to "what happened to you," and that shift changes everything.'},
    {"asin": "1401945074", "name": "Forgive for Good", "cat": "books", "tags": ["forgiveness","science","research","health","method","forgive","stanford"], "sentence": 'Fred Luskin\'s <a href="URL" target="_blank" rel="nofollow sponsored">Forgive for Good</a> (paid link) brings Stanford research to forgiveness - if you need evidence before you trust a process, start here.'},
    {"asin": "0062906585", "name": "My Grandmother's Hands", "cat": "books", "tags": ["body","racial-trauma","somatic","ancestral","generational","inherited","family"], "sentence": 'Resmaa Menakem\'s <a href="URL" target="_blank" rel="nofollow sponsored">My Grandmother\'s Hands</a> (paid link) shows how trauma travels through bodies across generations - it\'s uncomfortable reading, and it\'s necessary.'},
    {"asin": "0525509283", "name": "Set Boundaries Find Peace", "cat": "books", "tags": ["boundaries","relationships","self-care","communication","codependency","limit","protect"], "sentence": 'If boundaries are the piece you\'re missing, <a href="URL" target="_blank" rel="nofollow sponsored">Set Boundaries Find Peace</a> (paid link) by Nedra Tawwab is the most practical guide I\'ve found.'},
    {"asin": "0062457713", "name": "The Book of Forgiving", "cat": "books", "tags": ["forgiveness","reconciliation","justice","ubuntu","truth","forgive","path"], "sentence": 'Desmond Tutu\'s <a href="URL" target="_blank" rel="nofollow sponsored">The Book of Forgiving</a> (paid link) offers a fourfold path that\'s been tested in some of the hardest circumstances imaginable.'},
    {"asin": "1501121685", "name": "It Didn't Start with You", "cat": "books", "tags": ["ancestral","generational","epigenetics","family","inherited","parents","pattern"], "sentence": 'Mark Wolynn\'s <a href="URL" target="_blank" rel="nofollow sponsored">It Didn\'t Start with You</a> (paid link) traces emotional patterns back through family lines - sometimes what you\'re carrying isn\'t even yours.'},
    {"asin": "0062652710", "name": "Attached", "cat": "books", "tags": ["attachment","relationships","avoidant","anxious","secure","partner","love"], "sentence": 'If relationship patterns keep repeating, <a href="URL" target="_blank" rel="nofollow sponsored">Attached</a> (paid link) by Amir Levine explains attachment styles in a way that finally makes the pattern visible.'},
    {"asin": "0062378163", "name": "The Untethered Soul", "cat": "books", "tags": ["consciousness","awareness","ego","freedom","letting-go","witness","observer"], "sentence": 'Michael Singer\'s <a href="URL" target="_blank" rel="nofollow sponsored">The Untethered Soul</a> (paid link) maps the inner territory with unusual clarity - it\'s the kind of book you read three times and get something new each time.'},
    {"asin": "0062913697", "name": "Letting Go", "cat": "books", "tags": ["letting-go","surrender","consciousness","emotions","release","hold","grip"], "sentence": 'David Hawkins\' <a href="URL" target="_blank" rel="nofollow sponsored">Letting Go</a> (paid link) offers a mechanism for releasing emotional charge that\'s simpler than you\'d expect and harder than it sounds.'},
    {"asin": "0553380168", "name": "Man's Search for Meaning", "cat": "books", "tags": ["meaning","suffering","purpose","resilience","existential","survive","choice"], "sentence": 'Viktor Frankl\'s <a href="URL" target="_blank" rel="nofollow sponsored">Man\'s Search for Meaning</a> (paid link) is proof that even in the worst circumstances, the choice of how to respond remains yours.'},
    {"asin": "0062652435", "name": "Adult Children of Emotionally Immature Parents", "cat": "books", "tags": ["parents","childhood","emotional-neglect","family","healing","mother","father"], "sentence": 'If you\'re working through parental resentment, <a href="URL" target="_blank" rel="nofollow sponsored">Adult Children of Emotionally Immature Parents</a> (paid link) names what many people have felt but couldn\'t articulate.'},
    {"asin": "0062694669", "name": "Codependent No More", "cat": "books", "tags": ["codependency","boundaries","relationships","recovery","self-care","enable","pattern"], "sentence": 'Melody Beattie\'s <a href="URL" target="_blank" rel="nofollow sponsored">Codependent No More</a> (paid link) draws the line between compassion and self-abandonment - it\'s been around for decades because it still works.'},
    {"asin": "1250313570", "name": "What My Bones Know", "cat": "books", "tags": ["cptsd","memoir","trauma","healing","recovery","story","real"], "sentence": 'Stephanie Foo\'s <a href="URL" target="_blank" rel="nofollow sponsored">What My Bones Know</a> (paid link) reads like a friend telling you the truth about complex trauma - raw, honest, and ultimately hopeful.'},
    {"asin": "0593135202", "name": "Breath", "cat": "books", "tags": ["breathwork","breathing","science","health","nervous-system","exhale","inhale"], "sentence": 'James Nestor\'s <a href="URL" target="_blank" rel="nofollow sponsored">Breath</a> (paid link) will convince you that something as simple as how you breathe can change how you feel, think, and heal.'},
    {"asin": "0316299189", "name": "How to Do the Work", "cat": "books", "tags": ["self-healing","nervous-system","patterns","change","psychology","habit","cycle"], "sentence": 'Nicole LePera\'s <a href="URL" target="_blank" rel="nofollow sponsored">How to Do the Work</a> (paid link) is a practical guide to breaking free from the self-destructive patterns that resentment feeds.'},
    {"asin": "0735222517", "name": "Why We Sleep", "cat": "books", "tags": ["sleep","science","health","brain","recovery","rest","insomnia"], "sentence": 'Matthew Walker\'s <a href="URL" target="_blank" rel="nofollow sponsored">Why We Sleep</a> (paid link) makes it clear that sleep deprivation amplifies every emotional wound - if you\'re not sleeping, start here.'},
    {"asin": "0593139135", "name": "Anchored", "cat": "books", "tags": ["polyvagal","nervous-system","safety","regulation","exercises","vagus","calm"], "sentence": 'Deb Dana\'s <a href="URL" target="_blank" rel="nofollow sponsored">Anchored</a> (paid link) translates polyvagal theory into daily exercises you can actually use - it\'s the practical companion to the science.'},
    {"asin": "0593420462", "name": "The Extended Mind", "cat": "books", "tags": ["mind","body","environment","cognition","embodiment","thinking","brain"], "sentence": 'Annie Murphy Paul\'s <a href="URL" target="_blank" rel="nofollow sponsored">The Extended Mind</a> (paid link) explains why healing happens in the body and environment, not just between your ears.'},

    # JOURNALS & WORKBOOKS
    {"asin": "1648481388", "name": "The Forgiveness Workbook", "cat": "journals", "tags": ["forgiveness","workbook","exercises","writing","practice","forgive","guided"], "sentence": 'If you prefer working things out on paper, <a href="URL" target="_blank" rel="nofollow sponsored">The Forgiveness Workbook</a> (paid link) gives you guided exercises that take this from theory to practice.'},
    {"asin": "B0BHJCYP3K", "name": "Five Minute Journal", "cat": "journals", "tags": ["gratitude","journaling","daily","mindfulness","morning","routine","habit"], "sentence": 'The <a href="URL" target="_blank" rel="nofollow sponsored">Five Minute Journal</a> (paid link) takes the guesswork out of daily reflection - five minutes, morning and night, and something shifts over time.'},
    {"asin": "B0BX7GR3XG", "name": "Shadow Work Journal", "cat": "journals", "tags": ["shadow","inner-work","journaling","unconscious","self-discovery","hidden","dark"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Shadow Work Journal</a> (paid link) is designed for exactly this kind of exploration - the parts of yourself you tend to avoid are usually the ones holding the resentment.'},
    {"asin": "1572245379", "name": "DBT Skills Workbook", "cat": "journals", "tags": ["dbt","emotions","regulation","distress","mindfulness","skills","coping"], "sentence": 'The <a href="URL" target="_blank" rel="nofollow sponsored">DBT Skills Workbook</a> (paid link) teaches emotional regulation techniques that actually stick - it\'s structured, practical, and surprisingly accessible.'},
    {"asin": "1684033012", "name": "Self-Compassion Workbook", "cat": "journals", "tags": ["self-compassion","workbook","exercises","kindness","practice","gentle","self"], "sentence": 'Kristin Neff\'s <a href="URL" target="_blank" rel="nofollow sponsored">Self-Compassion Workbook</a> (paid link) is a practical guide to treating yourself with the same kindness you\'d offer someone you love.'},
    {"asin": "1684038480", "name": "Complex PTSD Workbook", "cat": "journals", "tags": ["cptsd","trauma","workbook","recovery","exercises","complex","relational"], "sentence": 'The <a href="URL" target="_blank" rel="nofollow sponsored">Complex PTSD Workbook</a> (paid link) by Arielle Schwartz addresses the specific challenges of relational trauma - it\'s thorough without being overwhelming.'},

    # MEDITATION & MINDFULNESS
    {"asin": "B07R3YPKQX", "name": "Tibetan Singing Bowl Set", "cat": "meditation", "tags": ["singing-bowl","meditation","sound","vibration","ritual","practice","calm"], "sentence": 'I started using a <a href="URL" target="_blank" rel="nofollow sponsored">Tibetan Singing Bowl</a> (paid link) during my own forgiveness practice, and the vibration anchors the work in a way that words alone can\'t.'},
    {"asin": "B08DFPC99N", "name": "Meditation Cushion", "cat": "meditation", "tags": ["meditation","cushion","sitting","practice","posture","comfort","zafu"], "sentence": 'A decent <a href="URL" target="_blank" rel="nofollow sponsored">Meditation Cushion</a> (paid link) makes a real difference - the body needs support when you ask it to be still with difficult material.'},
    {"asin": "B0D1HXWXHQ", "name": "Mala Beads 108", "cat": "meditation", "tags": ["mala","beads","mantra","meditation","counting","prayer","repetition"], "sentence": 'A set of <a href="URL" target="_blank" rel="nofollow sponsored">Mala Beads</a> (paid link) gives your hands something to do while your mind learns to settle - it\'s a small thing that makes a surprising difference.'},

    # BODY & SOMATIC
    {"asin": "B0BZK3MHXG", "name": "Theragun Mini", "cat": "body", "tags": ["massage","tension","body","release","muscle","physical","tight"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Theragun Mini</a> (paid link) targets the specific muscle tension that often accompanies unresolved resentment - jaw, shoulders, hips especially.'},
    {"asin": "B01A5KDKBM", "name": "Foam Roller", "cat": "body", "tags": ["foam-roller","body","tension","fascia","release","tight","muscle"], "sentence": 'A simple <a href="URL" target="_blank" rel="nofollow sponsored">Foam Roller</a> (paid link) can help release the fascial tension where the body stores what the mind tries to forget.'},
    {"asin": "B07PXLF7TC", "name": "Weighted Blanket", "cat": "body", "tags": ["weighted-blanket","anxiety","nervous-system","sleep","grounding","calm","safe"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Weighted Blanket</a> (paid link) provides the deep pressure stimulation that calms an activated nervous system - it\'s like a hug that doesn\'t ask anything of you.'},
    {"asin": "B08L5FM4JC", "name": "Acupressure Mat", "cat": "body", "tags": ["acupressure","body","tension","release","nervous-system","pressure","points"], "sentence": 'An <a href="URL" target="_blank" rel="nofollow sponsored">Acupressure Mat</a> (paid link) stimulates pressure points and helps release the physical tension that resentment creates - 15 minutes and you can feel the difference.'},

    # AROMATHERAPY
    {"asin": "B07RZDCQSC", "name": "Essential Oil Diffuser", "cat": "aromatherapy", "tags": ["diffuser","essential-oils","atmosphere","calm","ritual","scent","room"], "sentence": 'An <a href="URL" target="_blank" rel="nofollow sponsored">Essential Oil Diffuser</a> (paid link) can anchor your practice in a specific sensory experience - the body remembers scent faster than it remembers words.'},
    {"asin": "B07K2KL3NC", "name": "Lavender Essential Oil", "cat": "aromatherapy", "tags": ["lavender","calm","sleep","anxiety","relaxation","scent","soothe"], "sentence": '<a href="URL" target="_blank" rel="nofollow sponsored">Lavender Essential Oil</a> (paid link) has actual research behind it for reducing cortisol - I use it during evening practice and the difference is noticeable.'},
    {"asin": "B08NWGQKZ6", "name": "Palo Santo Sticks", "cat": "aromatherapy", "tags": ["palo-santo","ritual","cleansing","atmosphere","spiritual","ceremony","sacred"], "sentence": '<a href="URL" target="_blank" rel="nofollow sponsored">Palo Santo Sticks</a> (paid link) are traditionally used to clear stagnant energy - whether or not you believe in that, the ritual of lighting one marks a beginning.'},

    # SLEEP & RECOVERY
    {"asin": "B0CYB1K6SG", "name": "Magnesium Glycinate", "cat": "sleep", "tags": ["magnesium","sleep","nervous-system","calm","supplement","rest","night"], "sentence": '<a href="URL" target="_blank" rel="nofollow sponsored">Magnesium Glycinate</a> (paid link) supports nervous system regulation and the kind of deep sleep that chronic resentment tends to steal - it\'s one of the simplest interventions that actually works.'},
    {"asin": "B0BXNDS1VQ", "name": "Ashwagandha", "cat": "sleep", "tags": ["ashwagandha","stress","cortisol","adaptogen","calm","supplement","anxiety"], "sentence": '<a href="URL" target="_blank" rel="nofollow sponsored">Ashwagandha</a> (paid link) is an adaptogen that research suggests helps lower the cortisol levels that chronic resentment keeps elevated.'},
    {"asin": "B07PXLF7TC", "name": "Weighted Blanket", "cat": "sleep", "tags": ["weighted","blanket","sleep","anxiety","calm","pressure","rest"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Weighted Blanket</a> (paid link) provides deep pressure stimulation that tells your nervous system it\'s safe to rest - it sounds simple because it is.'},

    # BREATHWORK & NERVOUS SYSTEM
    {"asin": "B0C8JYR2PN", "name": "Breathing Exercise Device", "cat": "breathwork", "tags": ["breathwork","breathing","nervous-system","regulation","vagus","exhale","calm"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Breathing Exercise Device</a> (paid link) guides your exhale to activate the vagus nerve - it\'s a physical tool for something that feels entirely internal.'},
    {"asin": "B0BN4JQHVZ", "name": "Vagus Nerve Stimulator", "cat": "breathwork", "tags": ["vagus-nerve","stimulator","nervous-system","regulation","calm","fight","flight"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Vagus Nerve Stimulator</a> (paid link) can help regulate the fight-or-flight response that chronic resentment keeps activated - it\'s direct nervous system support.'},
    {"asin": "B0CXKQ7JXN", "name": "HRV Monitor", "cat": "breathwork", "tags": ["hrv","heart-rate","biofeedback","nervous-system","tracking","measure","data"], "sentence": 'An <a href="URL" target="_blank" rel="nofollow sponsored">HRV Monitor</a> (paid link) lets you actually see how your nervous system responds to forgiveness practices in real time - data makes the invisible visible.'},

    # THERAPY CARDS
    {"asin": "B0BN1LNKZ3", "name": "Therapy Cards", "cat": "cards", "tags": ["therapy","cards","self-reflection","questions","inner-work","prompt","explore"], "sentence": '<a href="URL" target="_blank" rel="nofollow sponsored">Therapy Cards for Self-Reflection</a> (paid link) offer a structured way to explore what you\'re carrying - sometimes the right question matters more than the right answer.'},
    {"asin": "B0CXJLXFHQ", "name": "Couples Therapy Card Game", "cat": "cards", "tags": ["couples","relationships","communication","connection","cards","partner","talk"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Couples Therapy Card Game</a> (paid link) creates space for the conversations that resentment makes difficult - it takes the pressure off by making it structured.'},
    {"asin": "B0CXJK7MQN", "name": "Inner Child Healing Cards", "cat": "cards", "tags": ["inner-child","healing","cards","childhood","reparenting","young","little"], "sentence": '<a href="URL" target="_blank" rel="nofollow sponsored">Inner Child Healing Cards</a> (paid link) are designed for reconnecting with the younger parts of yourself that still carry old wounds.'},

    # NATURE & GROUNDING
    {"asin": "B0CXJK9QMN", "name": "Grounding Mat", "cat": "nature", "tags": ["grounding","earthing","body","nature","nervous-system","earth","feet"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Grounding Mat</a> (paid link) brings the calming effects of earth contact indoors - your nervous system responds to it whether your mind believes in it or not.'},
    {"asin": "B0BN8KXQRN", "name": "Crystal Healing Set", "cat": "nature", "tags": ["crystals","healing","ritual","energy","meditation","stones","tactile"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Crystal Healing Set</a> (paid link) provides tactile anchors during meditation - holding something solid while processing something that feels formless can help.'},

    # ART & EXPRESSION
    {"asin": "B0CXJK8QMN", "name": "Mindfulness Coloring Book", "cat": "art", "tags": ["coloring","mindfulness","art","calm","expression","creative","hands"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Mindfulness Coloring Book</a> (paid link) engages the part of the brain that words can\'t reach - sometimes what you\'re processing needs your hands, not your mouth.'},
    {"asin": "B0BN9KXQRN", "name": "Watercolor Paint Set", "cat": "art", "tags": ["watercolor","art","expression","creativity","healing","paint","color"], "sentence": 'A <a href="URL" target="_blank" rel="nofollow sponsored">Watercolor Paint Set</a> (paid link) is worth trying because sometimes what you\'re carrying needs color and shape, not words.'},
]

# Topic keyword mapping for article matching
CATEGORY_KEYWORDS = {
    "the-body": ["body","somatic","tension","nervous","muscle","physical","cortisol","inflammation","jaw","shoulder","hip","stomach","chest","throat","breath","sleep","pain","stress","fascia","vagus","polyvagal"],
    "the-forensic-method": ["forensic","evidence","method","process","step","examine","investigate","detail","specific","document","record","pattern","analyze","approach","framework","protocol"],
    "the-lie": ["myth","lie","toxic","false","wrong","mistake","culture","society","religion","pressure","should","must","obligation","guilt","shame","blame","narrative","story"],
    "the-specific": ["parent","partner","spouse","friend","sibling","child","family","relationship","betrayal","infidelity","abuse","addiction","death","divorce","workplace","boss","church","therapist"],
    "the-liberation": ["liberation","freedom","release","letting","surrender","peace","joy","new","capacity","transform","after","beyond","emerge","light","open","expand","grow"]
}

def get_article_keywords(article):
    """Extract keywords from article title, category, and body."""
    title = article.get('title', '').lower()
    cat = article.get('category', '')
    body_text = re.sub(r'<[^>]+>', '', article.get('body', '')).lower()
    
    keywords = set()
    # Add words from title
    keywords.update(re.findall(r'\b[a-z]{4,}\b', title))
    # Add category keywords
    keywords.update(CATEGORY_KEYWORDS.get(cat, []))
    # Add frequent words from body (top 30)
    body_words = re.findall(r'\b[a-z]{4,}\b', body_text)
    from collections import Counter
    common = Counter(body_words).most_common(30)
    keywords.update(w for w, _ in common)
    
    return keywords

def score_product(product, article_keywords):
    """Score how well a product matches an article."""
    score = 0
    for tag in product['tags']:
        if tag in article_keywords:
            score += 3
        # Partial match
        for kw in article_keywords:
            if tag in kw or kw in tag:
                score += 1
    return score

def select_products(article, used_asins=None):
    """Select 3 best-matching products for an article, avoiding duplicates."""
    if used_asins is None:
        used_asins = set()
    
    keywords = get_article_keywords(article)
    
    scored = []
    for p in PRODUCTS:
        if p['asin'] in used_asins:
            continue
        s = score_product(p, keywords)
        scored.append((s, p))
    
    scored.sort(key=lambda x: -x[0])
    
    # Pick top 3, ensuring variety (different categories if possible)
    selected = []
    cats_used = set()
    
    for s, p in scored:
        if len(selected) >= 3:
            break
        if p['cat'] not in cats_used or len(selected) < 2:
            selected.append(p)
            cats_used.add(p['cat'])
    
    # If we still need more, just take top remaining
    if len(selected) < 3:
        for s, p in scored:
            if p not in selected and len(selected) < 3:
                selected.append(p)
    
    return selected[:3]

def inject_links(body, products):
    """Inject 3 product recommendation paragraphs into the article body at natural points."""
    # Find all paragraph breaks
    paragraphs = re.findall(r'<p>.*?</p>', body, re.DOTALL)
    
    if len(paragraphs) < 6:
        # Very short article - just append at end
        for p in products:
            url = f'https://www.amazon.com/dp/{p["asin"]}?tag={TAG}'
            sentence = p['sentence'].replace('URL', url)
            body += f'\n<p>{sentence}</p>'
        return body
    
    # Place links at roughly 30%, 55%, 80% through the article
    total = len(paragraphs)
    positions = [
        max(2, int(total * 0.30)),
        max(4, int(total * 0.55)),
        max(6, int(total * 0.80))
    ]
    
    # Ensure positions are unique and in order
    positions = sorted(set(positions))
    while len(positions) < 3:
        positions.append(positions[-1] + 1)
    
    # Build the new body by inserting after the target paragraphs
    inserted = 0
    new_body = body
    for i, prod in enumerate(products):
        if i >= len(positions):
            break
        pos = positions[i]
        if pos >= len(paragraphs):
            pos = len(paragraphs) - 1
        
        target_para = paragraphs[pos]
        url = f'https://www.amazon.com/dp/{prod["asin"]}?tag={TAG}'
        sentence = prod['sentence'].replace('URL', url)
        rec_para = f'<p>{sentence}</p>'
        
        # Insert after the target paragraph (only first occurrence)
        idx = new_body.find(target_para)
        if idx >= 0:
            insert_point = idx + len(target_para)
            new_body = new_body[:insert_point] + '\n' + rec_para + new_body[insert_point:]
    
    return new_body

def main():
    articles = json.load(open(CONTENT_PATH))
    
    # First, strip any existing Amazon links to avoid duplicates
    amazon_pattern = r'<p>[^<]*<a[^>]*amazon\.com[^>]*>.*?</a>[^<]*\(paid link\)[^<]*</p>'
    
    total_links_added = 0
    articles_with_3plus = 0
    
    for i, article in enumerate(articles):
        body = article.get('body', '')
        
        # Remove existing Amazon recommendation paragraphs to start fresh
        body = re.sub(amazon_pattern, '', body, flags=re.DOTALL)
        
        # Select 3 topic-matched products
        products = select_products(article)
        
        # Inject the 3 links
        body = inject_links(body, products)
        
        article['body'] = body
        article['hasAffiliateLinks'] = True
        
        # Count Amazon links in the result
        link_count = len(re.findall(r'amazon\.com/dp/', body))
        total_links_added += link_count
        if link_count >= 3:
            articles_with_3plus += 1
        
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(articles)}", flush=True)
    
    # Save
    json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
    
    # Final verification
    print(f"\n=== RESULTS ===")
    print(f"Total articles: {len(articles)}")
    print(f"Articles with 3+ Amazon links: {articles_with_3plus}")
    print(f"Total Amazon links injected: {total_links_added}")
    
    # Verify tag
    all_bodies = ' '.join(a.get('body','') for a in articles)
    tagged = len(re.findall(r'tag=spankyspinola-20', all_bodies))
    untagged_amazon = len(re.findall(r'amazon\.com/dp/', all_bodies)) - tagged
    print(f"Links with spankyspinola-20 tag: {tagged}")
    print(f"Untagged Amazon links: {untagged_amazon}")
    
    # Check word counts still in range
    wcs = [len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', a.get('body','')))) for a in articles]
    under = sum(1 for w in wcs if w < 1200)
    over = sum(1 for w in wcs if w > 1800)
    print(f"Word counts - In range: {sum(1 for w in wcs if 1200<=w<=1800)}, Under: {under}, Over: {over}")
    print(f"Avg: {sum(wcs)//len(wcs)}, Min: {min(wcs)}, Max: {max(wcs)}")

if __name__ == '__main__':
    main()
