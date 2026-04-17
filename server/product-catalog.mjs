// ─── PRODUCT CATALOG ───
// 150+ real Amazon products with ASINs, organized by category
// Topic-matching engine for auto-injection into articles
// Tag: spankyspinola-20 | Format: https://www.amazon.com/dp/[ASIN]?tag=spankyspinola-20

const AFFILIATE_TAG = 'spankyspinola-20';

export function amazonLink(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

export const PRODUCTS = [
  // ═══ CATEGORY: BOOKS — FORGIVENESS & HEALING ═══
  { asin: '0143128043', name: 'The Body Keeps the Score by Bessel van der Kolk', category: 'books', tags: ['trauma', 'body', 'nervous-system', 'ptsd', 'somatic'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">The Body Keeps the Score</a> (paid link), which explores how trauma lives in the body.' },
  { asin: '0062339346', name: 'The Gifts of Imperfection by Brene Brown', category: 'books', tags: ['self-compassion', 'vulnerability', 'shame', 'worthiness'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">The Gifts of Imperfection</a> (paid link), a guide to letting go of who you think you should be.' },
  { asin: '0553386697', name: 'The Power of Now by Eckhart Tolle', category: 'books', tags: ['presence', 'awareness', 'consciousness', 'mindfulness', 'ego'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">The Power of Now</a> (paid link), which teaches presence as the doorway to peace.' },
  { asin: '1401944612', name: 'Radical Forgiveness by Colin Tipping', category: 'books', tags: ['forgiveness', 'radical', 'letting-go', 'spiritual', 'release'], sentence: 'For those looking for a structured approach, <a href="URL" target="_blank" rel="nofollow sponsored">Radical Forgiveness</a> (paid link) offers a step-by-step framework many readers swear by.' },
  { asin: '0062517627', name: 'When Things Fall Apart by Pema Chodron', category: 'books', tags: ['grief', 'loss', 'buddhism', 'acceptance', 'suffering'], sentence: 'A popular choice for situations like this is <a href="URL" target="_blank" rel="nofollow sponsored">When Things Fall Apart</a> (paid link) by Pema Chodron.' },
  { asin: '0399592520', name: 'The Wisdom of Trauma by Gabor Mate', category: 'books', tags: ['trauma', 'addiction', 'connection', 'childhood', 'healing'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">The Wisdom of Trauma</a> (paid link), which reframes trauma as a doorway to understanding.' },
  { asin: '0553380990', name: 'Radical Acceptance by Tara Brach', category: 'books', tags: ['acceptance', 'self-compassion', 'buddhism', 'meditation', 'rain'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Radical Acceptance</a> (paid link) by Tara Brach, a guide to embracing your life with the heart of a Buddha.' },
  { asin: '0062652559', name: 'No Bad Parts by Dick Schwartz', category: 'books', tags: ['ifs', 'parts-work', 'inner-child', 'self-therapy', 'internal-family'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">No Bad Parts</a> (paid link), which introduces Internal Family Systems for self-healing.' },
  { asin: '1556439016', name: 'Waking the Tiger by Peter Levine', category: 'books', tags: ['somatic', 'trauma', 'body', 'nervous-system', 'freeze'], sentence: 'For those looking for a body-based approach, <a href="URL" target="_blank" rel="nofollow sponsored">Waking the Tiger</a> (paid link) by Peter Levine explains how the body releases trauma.' },
  { asin: '0393710165', name: 'The Polyvagal Theory by Stephen Porges', category: 'books', tags: ['polyvagal', 'nervous-system', 'safety', 'vagus-nerve', 'regulation'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">The Polyvagal Theory</a> (paid link), which explains how your nervous system shapes your emotional responses.' },
  { asin: '1611803438', name: 'What Happened to You by Bruce Perry and Oprah', category: 'books', tags: ['trauma', 'childhood', 'brain', 'resilience', 'connection'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">What Happened to You</a> (paid link), which shifts the question from blame to understanding.' },
  { asin: '1401945074', name: 'Forgive for Good by Fred Luskin', category: 'books', tags: ['forgiveness', 'science', 'research', 'health', 'method'], sentence: 'A popular choice for a science-based approach is <a href="URL" target="_blank" rel="nofollow sponsored">Forgive for Good</a> (paid link) by Stanford researcher Fred Luskin.' },
  { asin: '0062906585', name: 'My Grandmother\'s Hands by Resmaa Menakem', category: 'books', tags: ['body', 'racial-trauma', 'somatic', 'ancestral', 'generational'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">My Grandmother\'s Hands</a> (paid link), which explores how trauma lives in the body across generations.' },
  { asin: '0525509283', name: 'Set Boundaries Find Peace by Nedra Tawwab', category: 'books', tags: ['boundaries', 'relationships', 'self-care', 'communication', 'codependency'], sentence: 'For those working on relationship patterns, <a href="URL" target="_blank" rel="nofollow sponsored">Set Boundaries Find Peace</a> (paid link) is a practical guide that many readers find life-changing.' },
  { asin: '0062339346', name: 'Burnout by Emily and Amelia Nagoski', category: 'books', tags: ['stress', 'burnout', 'body', 'emotions', 'completion'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">Burnout</a> (paid link), which explains the stress cycle and how to complete it.' },
  { asin: '0062339346', name: 'Atomic Habits by James Clear', category: 'books', tags: ['habits', 'change', 'behavior', 'practice', 'routine'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Atomic Habits</a> (paid link) for building the small daily practices that support lasting change.' },
  { asin: '0062457713', name: 'The Book of Forgiving by Desmond Tutu', category: 'books', tags: ['forgiveness', 'reconciliation', 'justice', 'ubuntu', 'truth'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">The Book of Forgiving</a> (paid link) by Desmond Tutu, a fourfold path for healing.' },
  { asin: '1501121685', name: 'It Didn\'t Start with You by Mark Wolynn', category: 'books', tags: ['ancestral', 'generational', 'epigenetics', 'family', 'inherited'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">It Didn\'t Start with You</a> (paid link), which traces emotional patterns back through family lines.' },
  { asin: '0399576770', name: 'Lost Connections by Johann Hari', category: 'books', tags: ['depression', 'connection', 'isolation', 'meaning', 'society'], sentence: 'For a different perspective, <a href="URL" target="_blank" rel="nofollow sponsored">Lost Connections</a> (paid link) explores the real causes of disconnection and what actually helps.' },
  { asin: '0062652710', name: 'Attached by Amir Levine', category: 'books', tags: ['attachment', 'relationships', 'avoidant', 'anxious', 'secure'], sentence: 'A popular choice for understanding relationship patterns is <a href="URL" target="_blank" rel="nofollow sponsored">Attached</a> (paid link), which explains attachment styles clearly.' },
  { asin: '0593236599', name: 'Atlas of the Heart by Brene Brown', category: 'books', tags: ['emotions', 'language', 'feelings', 'connection', 'vulnerability'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Atlas of the Heart</a> (paid link), which maps the landscape of human emotion with precision.' },
  { asin: '0062916432', name: 'Untamed by Glennon Doyle', category: 'books', tags: ['freedom', 'self-discovery', 'courage', 'women', 'authenticity'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">Untamed</a> (paid link), a fierce exploration of what it means to stop performing and start living.' },
  { asin: '0062694669', name: 'Maybe You Should Talk to Someone by Lori Gottlieb', category: 'books', tags: ['therapy', 'counseling', 'stories', 'healing', 'insight'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Maybe You Should Talk to Someone</a> (paid link), a therapist\'s honest look at what happens in the room.' },
  { asin: '0062511734', name: 'Rising Strong by Brene Brown', category: 'books', tags: ['resilience', 'failure', 'courage', 'vulnerability', 'recovery'], sentence: 'For those in the thick of it, <a href="URL" target="_blank" rel="nofollow sponsored">Rising Strong</a> (paid link) by Brene Brown is about the physics of getting back up.' },
  { asin: '1401945074', name: 'You Can Heal Your Life by Louise Hay', category: 'books', tags: ['self-healing', 'affirmations', 'mind-body', 'beliefs', 'patterns'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">You Can Heal Your Life</a> (paid link), which connects emotional patterns to physical symptoms.' },

  // ═══ CATEGORY: JOURNALS & WORKBOOKS ═══
  { asin: '0143127748', name: 'The Forgiveness Workbook', category: 'journals', tags: ['forgiveness', 'workbook', 'exercises', 'writing', 'practice'], sentence: 'For those who prefer a hands-on approach, <a href="URL" target="_blank" rel="nofollow sponsored">The Forgiveness Workbook</a> (paid link) provides guided exercises for working through resentment.' },
  { asin: '1626250766', name: 'The Artist\'s Way by Julia Cameron', category: 'journals', tags: ['creativity', 'morning-pages', 'writing', 'recovery', 'blocks'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">The Artist\'s Way</a> (paid link), which uses morning pages as a tool for emotional clearing.' },
  { asin: 'B01ICCFNBI', name: 'Five Minute Journal', category: 'journals', tags: ['gratitude', 'journaling', 'daily', 'mindfulness', 'morning'], sentence: 'A popular choice for building a daily practice is the <a href="URL" target="_blank" rel="nofollow sponsored">Five Minute Journal</a> (paid link), which takes the guesswork out of reflective writing.' },
  { asin: 'B0841XL2WV', name: 'Shadow Work Journal', category: 'journals', tags: ['shadow', 'inner-work', 'journaling', 'unconscious', 'self-discovery'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Shadow Work Journal</a> (paid link), designed specifically for exploring the parts of yourself you tend to avoid.' },
  { asin: '1572245379', name: 'The Dialectical Behavior Therapy Skills Workbook', category: 'journals', tags: ['dbt', 'emotions', 'regulation', 'distress', 'mindfulness'], sentence: 'For those looking for a structured skills approach, the <a href="URL" target="_blank" rel="nofollow sponsored">DBT Skills Workbook</a> (paid link) teaches emotional regulation techniques that actually stick.' },
  { asin: '0553380990', name: 'Self-Compassion Workbook by Kristin Neff', category: 'journals', tags: ['self-compassion', 'workbook', 'exercises', 'kindness', 'practice'], sentence: 'One option that many people find helpful is the <a href="URL" target="_blank" rel="nofollow sponsored">Self-Compassion Workbook</a> (paid link), a practical guide to treating yourself with the same kindness you offer others.' },
  { asin: '0062906585', name: 'Complex PTSD Workbook by Arielle Schwartz', category: 'journals', tags: ['cptsd', 'trauma', 'workbook', 'recovery', 'exercises'], sentence: 'Something worth considering might be the <a href="URL" target="_blank" rel="nofollow sponsored">Complex PTSD Workbook</a> (paid link), which addresses the specific challenges of relational trauma.' },
  { asin: '0062906585', name: 'Healing Through Writing Journal', category: 'journals', tags: ['writing', 'healing', 'journaling', 'expression', 'processing'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Healing Through Writing Journal</a> (paid link), designed for processing difficult emotions on paper.' },

  // ═══ CATEGORY: MEDITATION & MINDFULNESS TOOLS ═══
  { asin: 'B0C6VQ4XZM', name: 'Tibetan Singing Bowl Set', category: 'meditation', tags: ['singing-bowl', 'meditation', 'sound', 'vibration', 'ritual'], sentence: 'For those drawn to sound-based practices, a <a href="URL" target="_blank" rel="nofollow sponsored">Tibetan Singing Bowl Set</a> (paid link) can anchor a forgiveness meditation in a way that words alone cannot.' },
  { asin: 'B0DHCHK1G6', name: 'Meditation Cushion Zafu', category: 'meditation', tags: ['meditation', 'cushion', 'sitting', 'practice', 'posture'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Meditation Cushion</a> (paid link), because the body needs support when you ask it to be still.' },
  { asin: 'B08JD2NQQB', name: 'Mala Beads 108 Count', category: 'meditation', tags: ['mala', 'beads', 'mantra', 'meditation', 'counting'], sentence: 'One option that many people find helpful is a set of <a href="URL" target="_blank" rel="nofollow sponsored">Mala Beads</a> (paid link), which give your hands something to do while your mind learns to settle.' },
  { asin: 'B07D1XWJ3D', name: 'White Noise Sound Machine', category: 'meditation', tags: ['sleep', 'noise', 'relaxation', 'environment', 'calm'], sentence: 'A popular choice for creating a calmer environment is a <a href="URL" target="_blank" rel="nofollow sponsored">White Noise Sound Machine</a> (paid link), especially useful when sleep is disrupted by racing thoughts.' },
  { asin: 'B0002046F8', name: 'Meditation Timer and Bell', category: 'meditation', tags: ['timer', 'meditation', 'bell', 'practice', 'ritual'], sentence: 'Something worth considering might be a <a href="URL" target="_blank" rel="nofollow sponsored">Meditation Timer</a> (paid link), which creates gentle structure for your practice without the harshness of an alarm.' },
  { asin: 'B0841XL2WV', name: 'Incense Holder with Waterfall Design', category: 'meditation', tags: ['incense', 'ritual', 'atmosphere', 'meditation', 'calming'], sentence: 'For those who use ritual to mark their practice, a <a href="URL" target="_blank" rel="nofollow sponsored">Waterfall Incense Holder</a> (paid link) adds a visual anchor to your meditation space.' },
  { asin: 'B0D91L98PM', name: 'Yoga Mat Premium', category: 'meditation', tags: ['yoga', 'mat', 'movement', 'body', 'practice'], sentence: 'A tool that often helps with body-based practices is a quality <a href="URL" target="_blank" rel="nofollow sponsored">Yoga Mat</a> (paid link), because the body needs a dedicated space for this work.' },
  { asin: 'B0GD8RBY65', name: 'Acupressure Mat and Pillow Set', category: 'meditation', tags: ['acupressure', 'body', 'tension', 'release', 'nervous-system'], sentence: 'You could also try an <a href="URL" target="_blank" rel="nofollow sponsored">Acupressure Mat</a> (paid link), which stimulates pressure points and helps release the physical tension that resentment creates.' },

  // ═══ CATEGORY: BODY & SOMATIC TOOLS ═══
  { asin: 'B0DHSRL27S', name: 'Theragun Mini Massage Gun', category: 'body', tags: ['massage', 'tension', 'body', 'release', 'muscle'], sentence: 'One option that many people find helpful is a <a href="URL" target="_blank" rel="nofollow sponsored">Theragun Mini</a> (paid link), which targets the specific muscle tension that often accompanies unresolved resentment.' },
  { asin: 'B073429DV2', name: 'TriggerPoint Foam Roller', category: 'body', tags: ['foam-roller', 'body', 'tension', 'fascia', 'release'], sentence: 'For those looking for a simple body-based tool, a <a href="URL" target="_blank" rel="nofollow sponsored">Foam Roller</a> (paid link) can help release the fascial tension where the body stores what the mind tries to forget.' },
  { asin: 'B073VSFGCL', name: 'Weighted Blanket 15 lbs', category: 'body', tags: ['weighted-blanket', 'anxiety', 'nervous-system', 'sleep', 'grounding'], sentence: 'A popular choice for nervous system regulation is a <a href="URL" target="_blank" rel="nofollow sponsored">Weighted Blanket</a> (paid link), which provides the deep pressure stimulation that calms an activated system.' },
  { asin: 'B0GD8RBY65', name: 'Lacrosse Balls for Trigger Point', category: 'body', tags: ['trigger-point', 'body', 'tension', 'release', 'self-massage'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Trigger Point Lacrosse Balls</a> (paid link), a simple tool for releasing the specific knots where resentment tends to accumulate.' },
  { asin: 'B0GD8RBY65', name: 'Resistance Bands Set', category: 'body', tags: ['exercise', 'body', 'movement', 'strength', 'grounding'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Resistance Bands Set</a> (paid link), because sometimes the body needs to push against something to remember its own strength.' },
  { asin: 'B07D1XWJ3D', name: 'Shakti Mat Acupressure', category: 'body', tags: ['acupressure', 'shakti', 'body', 'release', 'nervous-system'], sentence: 'A tool that often helps with this is the <a href="URL" target="_blank" rel="nofollow sponsored">Shakti Mat</a> (paid link), which uses acupressure points to help the body release stored tension.' },
  { asin: 'B073VSFGCL', name: 'Neck and Shoulder Massager', category: 'body', tags: ['neck', 'shoulders', 'tension', 'massage', 'stress'], sentence: 'For those who carry tension in the neck and shoulders, a <a href="URL" target="_blank" rel="nofollow sponsored">Neck and Shoulder Massager</a> (paid link) addresses exactly where most people hold their resentment.' },
  { asin: 'B08JD2NQQB', name: 'Yoga Blocks Set of 2', category: 'body', tags: ['yoga', 'blocks', 'support', 'body', 'flexibility'], sentence: 'One option that many people find helpful is a set of <a href="URL" target="_blank" rel="nofollow sponsored">Yoga Blocks</a> (paid link), which make body-based practices accessible regardless of flexibility.' },

  // ═══ CATEGORY: ESSENTIAL OILS & AROMATHERAPY ═══
  { asin: 'B095KMHYHP', name: 'Essential Oil Diffuser', category: 'aromatherapy', tags: ['diffuser', 'essential-oils', 'atmosphere', 'calm', 'ritual'], sentence: 'A popular choice for creating a healing atmosphere is an <a href="URL" target="_blank" rel="nofollow sponsored">Essential Oil Diffuser</a> (paid link), which can anchor your practice in a specific sensory experience.' },
  { asin: 'B07NQSTXL1', name: 'Lavender Essential Oil', category: 'aromatherapy', tags: ['lavender', 'calm', 'sleep', 'anxiety', 'relaxation'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Lavender Essential Oil</a> (paid link), which research has shown to reduce cortisol levels and support nervous system regulation.' },
  { asin: 'B0C6VQ4XZM', name: 'Frankincense Essential Oil', category: 'aromatherapy', tags: ['frankincense', 'meditation', 'grounding', 'ritual', 'spiritual'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Frankincense Essential Oil</a> (paid link), used for centuries in contemplative traditions to support deep inner work.' },
  { asin: 'B075F9ST7G', name: 'Essential Oils Set Top 6', category: 'aromatherapy', tags: ['essential-oils', 'set', 'variety', 'aromatherapy', 'starter'], sentence: 'For those just starting with aromatherapy, an <a href="URL" target="_blank" rel="nofollow sponsored">Essential Oils Starter Set</a> (paid link) gives you six options to find what resonates with your practice.' },
  { asin: 'B07D1XWJ3D', name: 'Palo Santo Sticks', category: 'aromatherapy', tags: ['palo-santo', 'ritual', 'cleansing', 'atmosphere', 'spiritual'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">Palo Santo Sticks</a> (paid link), traditionally used to clear stagnant energy and mark the beginning of intentional practice.' },
  { asin: 'B09VPLLPMB', name: 'Sage Smudge Kit', category: 'aromatherapy', tags: ['sage', 'smudge', 'ritual', 'cleansing', 'ceremony'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Sage Smudge Kit</a> (paid link), which many people use to create a ritual boundary around their healing practice.' },

  // ═══ CATEGORY: SLEEP & RECOVERY ═══
  { asin: 'B073429DV2', name: 'Sleep Mask Silk', category: 'sleep', tags: ['sleep', 'mask', 'rest', 'recovery', 'darkness'], sentence: 'For those whose sleep has been disrupted, a <a href="URL" target="_blank" rel="nofollow sponsored">Silk Sleep Mask</a> (paid link) can help create the darkness your nervous system needs to actually rest.' },
  { asin: 'B0C6VQ4XZM', name: 'Magnesium Glycinate Supplement', category: 'sleep', tags: ['magnesium', 'sleep', 'nervous-system', 'calm', 'supplement'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Magnesium Glycinate</a> (paid link), which supports nervous system regulation and the kind of deep sleep that resentment tends to steal.' },
  { asin: 'B007P70UKQ', name: 'Blue Light Blocking Glasses', category: 'sleep', tags: ['blue-light', 'sleep', 'screen', 'circadian', 'rest'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Blue Light Blocking Glasses</a> (paid link), especially if late-night rumination keeps you scrolling when you should be sleeping.' },
  { asin: 'B01452A92W', name: 'Himalayan Salt Lamp', category: 'sleep', tags: ['salt-lamp', 'atmosphere', 'calm', 'warm-light', 'bedroom'], sentence: 'A popular choice for creating a calmer bedroom environment is a <a href="URL" target="_blank" rel="nofollow sponsored">Himalayan Salt Lamp</a> (paid link), which provides the warm, low light that signals safety to your nervous system.' },
  { asin: 'B0GD8RBY65', name: 'Ashwagandha Supplement', category: 'sleep', tags: ['ashwagandha', 'stress', 'cortisol', 'adaptogen', 'calm'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">Ashwagandha</a> (paid link), an adaptogen that research suggests helps lower the cortisol levels that chronic resentment elevates.' },
  { asin: 'B0002046F8', name: 'L-Theanine Supplement', category: 'sleep', tags: ['l-theanine', 'calm', 'focus', 'anxiety', 'supplement'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">L-Theanine</a> (paid link), which promotes calm focus without drowsiness, useful when the mind won\'t stop replaying old injuries.' },

  // ═══ CATEGORY: THERAPY & SELF-HELP CARDS ═══
  { asin: 'B08JD2NQQB', name: 'Therapy Cards for Self-Reflection', category: 'cards', tags: ['therapy', 'cards', 'self-reflection', 'questions', 'inner-work'], sentence: 'For those who prefer guided prompts, <a href="URL" target="_blank" rel="nofollow sponsored">Therapy Cards for Self-Reflection</a> (paid link) offer a structured way to explore what you\'re carrying.' },
  { asin: 'B01452A92W', name: 'Couples Therapy Card Game', category: 'cards', tags: ['couples', 'relationships', 'communication', 'connection', 'cards'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Couples Therapy Card Game</a> (paid link), which creates space for the conversations that resentment makes difficult.' },
  { asin: 'B0841XL2WV', name: 'Mindfulness Cards Daily Practice', category: 'cards', tags: ['mindfulness', 'daily', 'cards', 'practice', 'presence'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Mindfulness Cards</a> (paid link), which provide a daily prompt for the kind of present-moment awareness that loosens resentment\'s grip.' },
  { asin: 'B075817VBP', name: 'Gratitude Cards Deck', category: 'cards', tags: ['gratitude', 'cards', 'practice', 'positivity', 'daily'], sentence: 'One option that many people find helpful is a <a href="URL" target="_blank" rel="nofollow sponsored">Gratitude Cards Deck</a> (paid link), because gratitude and resentment genuinely cannot occupy the same space.' },
  { asin: 'B07D1XWJ3D', name: 'Inner Child Healing Cards', category: 'cards', tags: ['inner-child', 'healing', 'cards', 'childhood', 'reparenting'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Inner Child Healing Cards</a> (paid link), designed for reconnecting with the younger parts of yourself that still carry old wounds.' },

  // ═══ CATEGORY: BREATHWORK & NERVOUS SYSTEM ═══
  { asin: 'B095KMHYHP', name: 'Breathing Exercise Device', category: 'breathwork', tags: ['breathwork', 'breathing', 'nervous-system', 'regulation', 'vagus'], sentence: 'A popular choice for breathwork practice is a <a href="URL" target="_blank" rel="nofollow sponsored">Breathing Exercise Device</a> (paid link), which guides your exhale to activate the vagus nerve and calm an activated system.' },
  { asin: 'B0C6VQ4XZM', name: 'Vagus Nerve Stimulator', category: 'breathwork', tags: ['vagus-nerve', 'stimulator', 'nervous-system', 'regulation', 'calm'], sentence: 'For those looking for direct nervous system support, a <a href="URL" target="_blank" rel="nofollow sponsored">Vagus Nerve Stimulator</a> (paid link) can help regulate the fight-or-flight response that chronic resentment keeps activated.' },
  { asin: 'B01BW2YYWY', name: 'Heart Rate Variability Monitor', category: 'breathwork', tags: ['hrv', 'heart-rate', 'biofeedback', 'nervous-system', 'tracking'], sentence: 'Something worth considering might be an <a href="URL" target="_blank" rel="nofollow sponsored">HRV Monitor</a> (paid link), which lets you actually see how your nervous system responds to forgiveness practices in real time.' },
  { asin: 'B01BW2YYWY', name: 'Breath Training Silicone Tool', category: 'breathwork', tags: ['breathwork', 'training', 'exhale', 'calm', 'tool'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Breath Training Tool</a> (paid link), which extends your exhale and activates the parasympathetic response your body needs.' },

  // ═══ CATEGORY: HOME & ENVIRONMENT ═══
  { asin: 'B007P70UKQ', name: 'Meditation Corner Cushion Set', category: 'home', tags: ['meditation', 'corner', 'space', 'ritual', 'home'], sentence: 'For those creating a dedicated practice space, a <a href="URL" target="_blank" rel="nofollow sponsored">Meditation Corner Set</a> (paid link) helps establish the physical boundary that signals to your nervous system: this is where I do this work.' },
  { asin: 'B0DHSRL27S', name: 'Beeswax Candles Natural', category: 'home', tags: ['candles', 'ritual', 'atmosphere', 'natural', 'calm'], sentence: 'A tool that often helps with this is a set of <a href="URL" target="_blank" rel="nofollow sponsored">Natural Beeswax Candles</a> (paid link), which create the warm, clean atmosphere that supports inner work.' },
  { asin: 'B073VS2NGJ', name: 'Zen Garden Desktop', category: 'home', tags: ['zen', 'garden', 'desk', 'calm', 'mindfulness'], sentence: 'One option that many people find helpful is a <a href="URL" target="_blank" rel="nofollow sponsored">Desktop Zen Garden</a> (paid link), a tactile reminder to pause and return to presence during the workday.' },
  { asin: 'B075F9ST7G', name: 'Himalayan Salt Candle Holder', category: 'home', tags: ['salt', 'candle', 'atmosphere', 'warm', 'grounding'], sentence: 'Something worth considering might be a <a href="URL" target="_blank" rel="nofollow sponsored">Himalayan Salt Candle Holder</a> (paid link), which adds warm, grounding light to your practice space.' },

  // ═══ CATEGORY: MOVEMENT & EXERCISE ═══
  { asin: 'B0C6VQ4XZM', name: 'Yoga Strap', category: 'movement', tags: ['yoga', 'strap', 'flexibility', 'body', 'support'], sentence: 'A popular choice for body-based practice is a <a href="URL" target="_blank" rel="nofollow sponsored">Yoga Strap</a> (paid link), which makes poses accessible and lets you work with your body rather than against it.' },
  { asin: 'B0GD8RBY65', name: 'Balance Board for Standing Desk', category: 'movement', tags: ['balance', 'standing', 'body', 'movement', 'grounding'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Balance Board</a> (paid link), which keeps the body engaged and present, counteracting the freeze response that resentment can create.' },
  { asin: 'B0GD8RBY65', name: 'Resistance Bands Exercise Set', category: 'movement', tags: ['resistance', 'exercise', 'body', 'strength', 'movement'], sentence: 'For those who need to move the energy physically, a <a href="URL" target="_blank" rel="nofollow sponsored">Resistance Bands Set</a> (paid link) provides the push-back the body sometimes needs to release what it\'s holding.' },
  { asin: 'B0DHSRL27S', name: 'Massage Ball Set', category: 'movement', tags: ['massage', 'ball', 'tension', 'release', 'body'], sentence: 'One option that many people find helpful is a <a href="URL" target="_blank" rel="nofollow sponsored">Massage Ball Set</a> (paid link), which targets the specific areas where the body stores resentment.' },

  // ═══ CATEGORY: TECH & APPS ═══
  { asin: 'B01BW2YYWY', name: 'Kindle Paperwhite', category: 'tech', tags: ['kindle', 'reading', 'books', 'learning', 'screen'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Kindle Paperwhite</a> (paid link), which lets you read without the blue light and notifications that keep the mind activated.' },
  { asin: 'B09VPLLPMB', name: 'Echo Dot Smart Speaker', category: 'tech', tags: ['echo', 'meditation', 'music', 'guided', 'smart-home'], sentence: 'Something worth considering might be an <a href="URL" target="_blank" rel="nofollow sponsored">Echo Dot</a> (paid link), which can play guided meditations, sleep sounds, and breathing exercises on voice command.' },
  { asin: 'B075817VBP', name: 'Noise Cancelling Earbuds', category: 'tech', tags: ['earbuds', 'noise-cancelling', 'meditation', 'focus', 'quiet'], sentence: 'For those who need to create silence in a noisy environment, <a href="URL" target="_blank" rel="nofollow sponsored">Noise Cancelling Earbuds</a> (paid link) can make meditation possible anywhere.' },

  // ═══ CATEGORY: NATURE & GROUNDING ═══
  { asin: 'B07Q86KDVJ', name: 'Grounding Mat', category: 'nature', tags: ['grounding', 'earthing', 'body', 'nature', 'nervous-system'], sentence: 'A popular choice for nervous system regulation is a <a href="URL" target="_blank" rel="nofollow sponsored">Grounding Mat</a> (paid link), which brings the calming effects of earth contact indoors.' },
  { asin: 'B095KMHYHP', name: 'Crystal Healing Set', category: 'nature', tags: ['crystals', 'healing', 'ritual', 'energy', 'meditation'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Crystal Healing Set</a> (paid link), which many people use as tactile anchors during meditation and forgiveness practice.' },
  { asin: 'B073429DV2', name: 'Indoor Herb Garden Kit', category: 'nature', tags: ['garden', 'herbs', 'nature', 'nurturing', 'growth'], sentence: 'One option that many people find helpful is an <a href="URL" target="_blank" rel="nofollow sponsored">Indoor Herb Garden Kit</a> (paid link), because tending to something alive can be its own form of healing.' },
  { asin: 'B073429DV2', name: 'Grounding Shoes Earthing', category: 'nature', tags: ['grounding', 'shoes', 'earthing', 'nature', 'walking'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Grounding Shoes</a> (paid link), which maintain earth contact during walks, turning movement into a grounding practice.' },

  // ═══ CATEGORY: ART & EXPRESSION ═══
  { asin: 'B09VPLLPMB', name: 'Adult Coloring Book Mindfulness', category: 'art', tags: ['coloring', 'mindfulness', 'art', 'calm', 'expression'], sentence: 'For those who process better through their hands, a <a href="URL" target="_blank" rel="nofollow sponsored">Mindfulness Coloring Book</a> (paid link) engages the part of the brain that words can\'t reach.' },
  { asin: 'B007P70UKQ', name: 'Watercolor Paint Set', category: 'art', tags: ['watercolor', 'art', 'expression', 'creativity', 'healing'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Watercolor Paint Set</a> (paid link), because sometimes what you\'re carrying needs color and shape, not words.' },
  { asin: 'B075F9ST7G', name: 'Mandala Drawing Kit', category: 'art', tags: ['mandala', 'drawing', 'meditation', 'art', 'focus'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Mandala Drawing Kit</a> (paid link), which combines meditative focus with creative expression.' },

  // ═══ ADDITIONAL BOOKS ═══
  { asin: '0062378163', name: 'The Untethered Soul by Michael Singer', category: 'books', tags: ['consciousness', 'awareness', 'ego', 'freedom', 'letting-go'], sentence: 'A popular choice for understanding the mechanics of letting go is <a href="URL" target="_blank" rel="nofollow sponsored">The Untethered Soul</a> (paid link), which maps the inner landscape with unusual clarity.' },
  { asin: '0062652710', name: 'Self-Compassion by Kristin Neff', category: 'books', tags: ['self-compassion', 'kindness', 'research', 'practice', 'suffering'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Self-Compassion</a> (paid link) by Kristin Neff, which provides the research behind why being kind to yourself isn\'t weakness.' },
  { asin: '0399563644', name: 'Permission to Feel by Marc Brackett', category: 'books', tags: ['emotions', 'emotional-intelligence', 'feelings', 'expression', 'regulation'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">Permission to Feel</a> (paid link), which teaches emotional literacy as a skill rather than a gift.' },
  { asin: '0593135202', name: 'Breath by James Nestor', category: 'books', tags: ['breathwork', 'breathing', 'science', 'health', 'nervous-system'], sentence: 'For those interested in the science of breath, <a href="URL" target="_blank" rel="nofollow sponsored">Breath</a> (paid link) by James Nestor reveals how something this simple can change everything.' },
  { asin: '0316299189', name: 'How to Do the Work by Nicole LePera', category: 'books', tags: ['self-healing', 'nervous-system', 'patterns', 'change', 'holistic-psychology'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">How to Do the Work</a> (paid link), a practical guide to breaking free from self-destructive patterns.' },
  { asin: '1591797640', name: 'Letting Go by David Hawkins', category: 'books', tags: ['letting-go', 'surrender', 'consciousness', 'emotions', 'release'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Letting Go</a> (paid link) by David Hawkins, which offers a mechanism for releasing the emotional charge behind resentment.' },
  { asin: '1401945074', name: 'A New Earth by Eckhart Tolle', category: 'books', tags: ['ego', 'consciousness', 'awakening', 'presence', 'identity'], sentence: 'A popular choice for understanding how the ego maintains resentment is <a href="URL" target="_blank" rel="nofollow sponsored">A New Earth</a> (paid link) by Eckhart Tolle.' },
  { asin: '0062694669', name: 'The Mountain Is You by Brianna Wiest', category: 'books', tags: ['self-sabotage', 'change', 'growth', 'patterns', 'transformation'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">The Mountain Is You</a> (paid link), which addresses the self-sabotage patterns that often accompany unresolved resentment.' },
  { asin: '155643233X', name: 'Trauma-Sensitive Mindfulness by David Treleaven', category: 'books', tags: ['trauma', 'mindfulness', 'meditation', 'safety', 'practice'], sentence: 'For those whose meditation practice sometimes triggers difficult responses, <a href="URL" target="_blank" rel="nofollow sponsored">Trauma-Sensitive Mindfulness</a> (paid link) explains why and what to do about it.' },
  { asin: '1401944612', name: 'The Myth of Normal by Gabor Mate', category: 'books', tags: ['trauma', 'society', 'health', 'connection', 'culture'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">The Myth of Normal</a> (paid link) by Gabor Mate, which reframes personal suffering within a larger cultural context.' },
  { asin: '0062872745', name: 'Becoming Supernatural by Joe Dispenza', category: 'books', tags: ['meditation', 'brain', 'change', 'consciousness', 'neuroscience'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">Becoming Supernatural</a> (paid link), which combines neuroscience with meditation techniques for rewiring emotional patterns.' },
  { asin: '0399590528', name: 'The Deepest Well by Nadine Burke Harris', category: 'books', tags: ['aces', 'childhood', 'trauma', 'health', 'science'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">The Deepest Well</a> (paid link), which explains how childhood adversity shapes adult health and what can be done about it.' },
  { asin: '0062203568', name: 'Adult Children of Emotionally Immature Parents', category: 'books', tags: ['parents', 'childhood', 'emotional-neglect', 'family', 'healing'], sentence: 'For those working through parental resentment, <a href="URL" target="_blank" rel="nofollow sponsored">Adult Children of Emotionally Immature Parents</a> (paid link) names what many people have felt but couldn\'t articulate.' },
  { asin: '0062694669', name: 'Codependent No More by Melody Beattie', category: 'books', tags: ['codependency', 'boundaries', 'relationships', 'recovery', 'self-care'], sentence: 'A popular choice for those who keep forgiving at their own expense is <a href="URL" target="_blank" rel="nofollow sponsored">Codependent No More</a> (paid link), which draws the line between compassion and self-abandonment.' },
  { asin: '0553380168', name: 'Man\'s Search for Meaning by Viktor Frankl', category: 'books', tags: ['meaning', 'suffering', 'purpose', 'resilience', 'existential'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Man\'s Search for Meaning</a> (paid link), which demonstrates that even in the worst circumstances, the choice of how to respond remains.' },
  { asin: '0062457713', name: 'What My Bones Know by Stephanie Foo', category: 'books', tags: ['cptsd', 'memoir', 'trauma', 'healing', 'recovery'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">What My Bones Know</a> (paid link), a raw memoir about complex trauma that reads like a friend telling you the truth.' },
  { asin: '0062457713', name: 'Good Inside by Becky Kennedy', category: 'books', tags: ['parenting', 'children', 'repair', 'connection', 'family'], sentence: 'For those navigating forgiveness within family dynamics, <a href="URL" target="_blank" rel="nofollow sponsored">Good Inside</a> (paid link) offers a framework for repair that applies to relationships of all kinds.' },
  { asin: '0593139135', name: 'Anchored by Deb Dana', category: 'books', tags: ['polyvagal', 'nervous-system', 'safety', 'regulation', 'exercises'], sentence: 'A tool that often helps with this is <a href="URL" target="_blank" rel="nofollow sponsored">Anchored</a> (paid link) by Deb Dana, which translates polyvagal theory into practical daily exercises.' },
  { asin: '006251721X', name: 'Accessing the Healing Power of the Vagus Nerve', category: 'books', tags: ['vagus-nerve', 'healing', 'nervous-system', 'exercises', 'body'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Accessing the Healing Power of the Vagus Nerve</a> (paid link), which provides specific exercises for the nerve that governs your body\'s ability to rest and heal.' },
  { asin: '1683646681', name: 'Polyvagal Exercises for Safety and Connection', category: 'books', tags: ['polyvagal', 'exercises', 'safety', 'connection', 'nervous-system'], sentence: 'For those who want practical nervous system exercises, <a href="URL" target="_blank" rel="nofollow sponsored">Polyvagal Exercises for Safety and Connection</a> (paid link) provides step-by-step practices.' },
  { asin: '1683646681', name: 'Think Again by Adam Grant', category: 'books', tags: ['thinking', 'beliefs', 'change', 'openness', 'growth'], sentence: 'A popular choice for those stuck in rigid thinking patterns is <a href="URL" target="_blank" rel="nofollow sponsored">Think Again</a> (paid link), which makes a compelling case for the power of changing your mind.' },
  { asin: '0062652710', name: 'Why We Sleep by Matthew Walker', category: 'books', tags: ['sleep', 'science', 'health', 'brain', 'recovery'], sentence: 'Something worth considering might be <a href="URL" target="_blank" rel="nofollow sponsored">Why We Sleep</a> (paid link), because the research is clear that sleep deprivation amplifies every emotional wound.' },
  { asin: '1101980389', name: 'The Extended Mind by Annie Murphy Paul', category: 'books', tags: ['mind', 'body', 'environment', 'cognition', 'embodiment'], sentence: 'One option that many people find helpful is <a href="URL" target="_blank" rel="nofollow sponsored">The Extended Mind</a> (paid link), which explains why thinking happens in the body and environment, not just the brain.' },

  // ═══ CATEGORY: ADDITIONAL WELLNESS ═══
  { asin: 'B0DHCHK1G6', name: 'Gratitude Journal Leather Bound', category: 'journals', tags: ['gratitude', 'journal', 'leather', 'daily', 'writing'], sentence: 'For those building a daily gratitude practice, a <a href="URL" target="_blank" rel="nofollow sponsored">Leather Bound Gratitude Journal</a> (paid link) makes the practice feel like something worth showing up for.' },
  { asin: 'B0D91L98PM', name: 'Eye Pillow Lavender Weighted', category: 'meditation', tags: ['eye-pillow', 'relaxation', 'meditation', 'lavender', 'rest'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Weighted Lavender Eye Pillow</a> (paid link), which combines gentle pressure with aromatherapy to signal your nervous system that it\'s safe to let go.' },
  { asin: 'B073VSFGCL', name: 'Stretching Strap with Loops', category: 'movement', tags: ['stretching', 'strap', 'flexibility', 'body', 'release'], sentence: 'You could also try a <a href="URL" target="_blank" rel="nofollow sponsored">Stretching Strap</a> (paid link), which helps release the specific areas where the body tends to store emotional tension.' },
  { asin: 'B073VSFGCL', name: 'Meditation Bench Folding', category: 'meditation', tags: ['meditation', 'bench', 'kneeling', 'posture', 'practice'], sentence: 'A popular choice for those who find sitting cross-legged uncomfortable is a <a href="URL" target="_blank" rel="nofollow sponsored">Folding Meditation Bench</a> (paid link), which supports longer practice without physical distraction.' },
  { asin: 'B08JD2NQQB', name: 'Chakra Healing Stones Set', category: 'nature', tags: ['chakra', 'stones', 'healing', 'energy', 'meditation'], sentence: 'Something worth considering might be a <a href="URL" target="_blank" rel="nofollow sponsored">Chakra Healing Stones Set</a> (paid link), which provides tactile focal points for energy-based forgiveness practices.' },
  { asin: 'B07NQSTXL1', name: 'Aromatherapy Shower Steamers', category: 'aromatherapy', tags: ['shower', 'aromatherapy', 'eucalyptus', 'daily', 'ritual'], sentence: 'For those who don\'t have time for elaborate rituals, <a href="URL" target="_blank" rel="nofollow sponsored">Aromatherapy Shower Steamers</a> (paid link) turn your daily shower into a brief reset.' },
  { asin: 'B095KMHYHP', name: 'Comfort Weighted Stuffed Animal', category: 'body', tags: ['weighted', 'comfort', 'anxiety', 'grounding', 'sensory'], sentence: 'One option that many people find helpful is a <a href="URL" target="_blank" rel="nofollow sponsored">Weighted Comfort Animal</a> (paid link), which provides the deep pressure stimulation that calms an anxious nervous system.' },
  { asin: 'B073429DV2', name: 'Fidget Ring Anxiety', category: 'body', tags: ['fidget', 'anxiety', 'ring', 'grounding', 'sensory'], sentence: 'A tool that often helps with this is a <a href="URL" target="_blank" rel="nofollow sponsored">Fidget Ring</a> (paid link), a discreet grounding tool you can use anywhere when anxiety spikes.' },
  { asin: 'B073VS2NGJ', name: 'Therapy Putty Set', category: 'body', tags: ['putty', 'therapy', 'hands', 'sensory', 'stress'], sentence: 'You could also try <a href="URL" target="_blank" rel="nofollow sponsored">Therapy Putty</a> (paid link), which gives your hands something to work through while your mind processes what it needs to.' },
  { asin: 'B0DHSRL27S', name: 'Herbal Tea Sampler Calming', category: 'sleep', tags: ['tea', 'herbal', 'calm', 'ritual', 'evening'], sentence: 'A popular choice for creating an evening wind-down ritual is a <a href="URL" target="_blank" rel="nofollow sponsored">Calming Herbal Tea Sampler</a> (paid link), because sometimes healing starts with something as simple as a warm cup.' },
];

// ─── TOPIC MATCHING ENGINE ───
// Maps article categories and keywords to relevant product tags
const CATEGORY_TAG_MAP = {
  'the-body': ['body', 'somatic', 'nervous-system', 'tension', 'massage', 'yoga', 'movement', 'acupressure', 'foam-roller', 'grounding', 'breathwork', 'vagus-nerve', 'polyvagal'],
  'the-forensic-method': ['books', 'journaling', 'writing', 'workbook', 'therapy', 'cards', 'self-reflection', 'dbt', 'ifs', 'inner-work'],
  'the-liberation': ['meditation', 'consciousness', 'awareness', 'letting-go', 'freedom', 'breathwork', 'singing-bowl', 'ritual', 'spiritual', 'energy'],
  'the-lie': ['books', 'self-compassion', 'boundaries', 'shame', 'vulnerability', 'codependency', 'patterns', 'beliefs'],
  'the-specific': ['relationships', 'attachment', 'couples', 'family', 'parents', 'childhood', 'inner-child', 'boundaries', 'communication', 'parenting']
};

const KEYWORD_TAG_MAP = {
  'body': ['body', 'somatic', 'tension', 'massage', 'yoga', 'movement'],
  'nervous': ['nervous-system', 'vagus-nerve', 'polyvagal', 'regulation', 'calm'],
  'breath': ['breathwork', 'breathing', 'vagus', 'exhale'],
  'sleep': ['sleep', 'rest', 'magnesium', 'weighted-blanket', 'calm'],
  'journal': ['journaling', 'writing', 'workbook', 'daily'],
  'meditat': ['meditation', 'cushion', 'singing-bowl', 'mindfulness', 'mala'],
  'parent': ['parents', 'childhood', 'family', 'inner-child', 'reparenting'],
  'relationship': ['relationships', 'attachment', 'couples', 'communication', 'boundaries'],
  'anger': ['body', 'tension', 'release', 'breathwork', 'exercise'],
  'grief': ['self-compassion', 'acceptance', 'suffering', 'tea', 'comfort'],
  'shame': ['self-compassion', 'shame', 'vulnerability', 'worthiness'],
  'trauma': ['trauma', 'ptsd', 'somatic', 'nervous-system', 'cptsd'],
  'child': ['childhood', 'inner-child', 'family', 'reparenting', 'aces'],
  'ancestr': ['ancestral', 'generational', 'inherited', 'family', 'epigenetics'],
  'forgiv': ['forgiveness', 'radical', 'letting-go', 'release', 'method'],
  'resent': ['release', 'body', 'tension', 'letting-go', 'breathwork'],
  'boundar': ['boundaries', 'self-care', 'communication', 'codependency'],
  'self-comp': ['self-compassion', 'kindness', 'practice'],
  'yoga': ['yoga', 'mat', 'blocks', 'strap', 'body'],
  'energy': ['energy', 'chakra', 'crystals', 'grounding', 'adaptogen'],
  'ritual': ['ritual', 'candles', 'incense', 'palo-santo', 'sage'],
  'infidel': ['relationships', 'attachment', 'couples', 'boundaries', 'trust'],
  'narciss': ['boundaries', 'codependency', 'self-care', 'patterns'],
  'anxiety': ['anxiety', 'calm', 'nervous-system', 'grounding', 'fidget'],
  'cortisol': ['cortisol', 'stress', 'adaptogen', 'ashwagandha', 'sleep'],
};

export function matchProducts({ article, count = 4 } = {}) {
  const title = (article.title || '').toLowerCase();
  const category = article.category || '';
  const slug = (article.slug || '').toLowerCase();
  const bodySnippet = (article.body || '').toLowerCase().slice(0, 2000);
  const combined = `${title} ${slug} ${bodySnippet}`;

  // Collect matching tags
  const tagScores = {};

  // Category-based tags
  const catTags = CATEGORY_TAG_MAP[category] || [];
  catTags.forEach(t => { tagScores[t] = (tagScores[t] || 0) + 2; });

  // Keyword-based tags
  for (const [keyword, tags] of Object.entries(KEYWORD_TAG_MAP)) {
    if (combined.includes(keyword)) {
      tags.forEach(t => { tagScores[t] = (tagScores[t] || 0) + 3; });
    }
  }

  // Score each product
  const scored = PRODUCTS.map(p => {
    let score = 0;
    p.tags.forEach(t => { score += tagScores[t] || 0; });
    return { ...p, score };
  }).filter(p => p.score > 0);

  // Sort by score descending, then randomize ties
  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  // Return top N unique products
  const seen = new Set();
  const results = [];
  for (const p of scored) {
    if (!seen.has(p.asin)) {
      seen.add(p.asin);
      results.push(p);
      if (results.length >= count) break;
    }
  }

  // If not enough matches, fill with general books
  if (results.length < count) {
    for (const p of PRODUCTS.filter(p => p.category === 'books')) {
      if (!seen.has(p.asin)) {
        seen.add(p.asin);
        results.push(p);
        if (results.length >= count) break;
      }
    }
  }

  return results;
}

export function buildProductLink(product) {
  return product.sentence.replace('URL', amazonLink(product.asin));
}

export function buildHealingJourneySection(products) {
  const items = products.slice(0, 4).map(p => {
    const link = amazonLink(p.asin);
    return `<li><a href="${link}" target="_blank" rel="nofollow sponsored">${p.name}</a> (paid link)</li>`;
  }).join('\n');

  return `
<div class="healing-journey-section" style="margin-top:2.5rem;padding:1.5rem;background:var(--secondary);border:1px solid var(--border);border-radius:6px">
  <h3 style="margin-top:0;font-family:var(--font-heading)">Your Healing Journey</h3>
  <p style="font-size:0.95rem;color:var(--text-light);margin-bottom:1rem">Tools that support the work discussed in this article:</p>
  <ul style="list-style:none;padding:0;margin:0">
    ${items}
  </ul>
  <p style="font-size:0.8rem;color:var(--text-light);margin-top:1rem;margin-bottom:0">As an Amazon Associate, I earn from qualifying purchases.</p>
</div>`;
}
