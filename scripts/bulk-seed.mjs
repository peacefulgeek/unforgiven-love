/**
 * Bulk Seed Script — 500 Article Queue
 * Generates 500 articles using DeepSeek V4-Pro, passes each through the Quality Gate,
 * and inserts them into articles.json with status='queued'.
 * 
 * Run: npm run bulk-seed (or: node scripts/bulk-seed.mjs)
 * Railway: Configure as a one-off command
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_FILE = path.join(__dirname, '..', 'content', 'articles.json');
const AFFILIATE_TAG = 'spankyspinola-20';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

// ASIN pool
const ASIN_POOL = [
  { asin: '0143128043', name: 'When Things Fall Apart', author: 'Pema Chodron' },
  { asin: '0062339346', name: 'The Untethered Soul', author: 'Michael A. Singer' },
  { asin: '0553386697', name: 'The Power of Now', author: 'Eckhart Tolle' },
  { asin: '1401944612', name: 'You Can Heal Your Life', author: 'Louise Hay' },
  { asin: '0062517627', name: 'Forgive for Good', author: 'Dr. Fred Luskin' },
  { asin: '0399592520', name: 'The Body Keeps the Score', author: 'Bessel van der Kolk' },
  { asin: '0553380990', name: 'A New Earth', author: 'Eckhart Tolle' },
  { asin: '0062652559', name: 'Radical Acceptance', author: 'Tara Brach' },
  { asin: '1556439016', name: 'Forgiveness Is a Choice', author: 'Robert D. Enright' },
  { asin: '0393710165', name: 'The Deepest Well', author: 'Nadine Burke Harris' },
  { asin: '1611803438', name: 'Real Love', author: 'Sharon Salzberg' },
  { asin: '1401945074', name: 'Letting Go', author: 'David R. Hawkins' },
  { asin: '0062906585', name: 'What Happened to You?', author: 'Bruce D. Perry' },
  { asin: '0525509283', name: 'Maybe You Should Talk to Someone', author: 'Lori Gottlieb' },
  { asin: '0062457713', name: 'Rising Strong', author: 'Brene Brown' },
  { asin: '1501121685', name: 'It Didn\'t Start with You', author: 'Mark Wolynn' },
  { asin: '0399576770', name: 'Waking the Tiger', author: 'Peter A. Levine' },
  { asin: '0062652710', name: 'True Refuge', author: 'Tara Brach' },
  { asin: '0593236599', name: 'Set Boundaries Find Peace', author: 'Nedra Glover Tawwab' },
  { asin: '0062916432', name: 'Untamed', author: 'Glennon Doyle' },
  { asin: '0062694669', name: 'The Book of Forgiving', author: 'Desmond Tutu' },
  { asin: '0062511734', name: 'Daring Greatly', author: 'Brene Brown' },
  { asin: '0143127748', name: 'The Body Keeps the Score (paperback)', author: 'Bessel van der Kolk' },
  { asin: '1626250766', name: 'Complex PTSD: From Surviving to Thriving', author: 'Pete Walker' },
];

const CATEGORIES = ['the-lie', 'the-forensic-method', 'the-body', 'the-specific', 'the-liberation'];

// 500 unique topics organized by category
const TOPICS = [
  // THE LIE (100 topics)
  { topic: 'Why toxic positivity keeps you trapped in unforgiveness', category: 'the-lie' },
  { topic: 'The forgiveness myth that makes therapists cringe', category: 'the-lie' },
  { topic: 'How spiritual bypassing disguises itself as forgiveness', category: 'the-lie' },
  { topic: 'The dangerous lie that forgiveness means reconciliation', category: 'the-lie' },
  { topic: 'Why being told to just let it go is emotional violence', category: 'the-lie' },
  { topic: 'The cultural programming that makes forgiveness feel mandatory', category: 'the-lie' },
  { topic: 'How religion weaponized forgiveness against victims', category: 'the-lie' },
  { topic: 'The difference between performing forgiveness and feeling it', category: 'the-lie' },
  { topic: 'Why premature forgiveness is a form of self-abandonment', category: 'the-lie' },
  { topic: 'The lie that holding grudges makes you a bad person', category: 'the-lie' },
  { topic: 'How the self-help industry profits from your inability to forgive', category: 'the-lie' },
  { topic: 'Why forgiveness timelines are complete nonsense', category: 'the-lie' },
  { topic: 'The myth that anger and forgiveness cannot coexist', category: 'the-lie' },
  { topic: 'How forced forgiveness creates dissociation', category: 'the-lie' },
  { topic: 'The toxic belief that forgiving means forgetting', category: 'the-lie' },
  { topic: 'Why people-pleasers fake forgiveness to keep the peace', category: 'the-lie' },
  { topic: 'The lie that real forgiveness happens in a single moment', category: 'the-lie' },
  { topic: 'How conditional forgiveness keeps you in a power struggle', category: 'the-lie' },
  { topic: 'The myth that you need to understand someone to forgive them', category: 'the-lie' },
  { topic: 'Why forgiveness without accountability enables abuse', category: 'the-lie' },
  { topic: 'The dangerous assumption that everyone deserves forgiveness', category: 'the-lie' },
  { topic: 'How the forgiveness industrial complex silences victims', category: 'the-lie' },
  { topic: 'The lie that unforgiveness only hurts you', category: 'the-lie' },
  { topic: 'Why being the bigger person is actually making you smaller', category: 'the-lie' },
  { topic: 'The myth that forgiveness is always the high road', category: 'the-lie' },
  { topic: 'How society punishes people who refuse to forgive', category: 'the-lie' },
  { topic: 'The lie that time heals all wounds without effort', category: 'the-lie' },
  { topic: 'Why forgiveness pressure creates shame spirals', category: 'the-lie' },
  { topic: 'The toxic narrative that victims owe their abusers forgiveness', category: 'the-lie' },
  { topic: 'How Instagram forgiveness quotes do more harm than good', category: 'the-lie' },
  { topic: 'The lie that you can think your way into forgiveness', category: 'the-lie' },
  { topic: 'Why forgiveness culture gaslights trauma survivors', category: 'the-lie' },
  { topic: 'The myth that forgiveness means the relationship is fixed', category: 'the-lie' },
  { topic: 'How performative forgiveness damages your nervous system', category: 'the-lie' },
  { topic: 'The lie that unforgiveness is always about the other person', category: 'the-lie' },
  { topic: 'Why the forgive and move on advice ignores grief', category: 'the-lie' },
  { topic: 'The dangerous myth that forgiveness prevents future harm', category: 'the-lie' },
  { topic: 'How childhood conditioning creates forgiveness guilt', category: 'the-lie' },
  { topic: 'The lie that real healing requires forgiving everyone', category: 'the-lie' },
  { topic: 'Why forgiveness without boundaries is just submission', category: 'the-lie' },
  { topic: 'The myth that spiritual people forgive easily', category: 'the-lie' },
  { topic: 'How the forgiveness narrative protects perpetrators', category: 'the-lie' },
  { topic: 'The lie that you are broken if you cannot forgive', category: 'the-lie' },
  { topic: 'Why rushing forgiveness creates emotional debt', category: 'the-lie' },
  { topic: 'The toxic positivity behind every forgiveness meme', category: 'the-lie' },
  { topic: 'How family systems weaponize forgiveness to maintain control', category: 'the-lie' },
  { topic: 'The lie that forgiveness is a one-time event', category: 'the-lie' },
  { topic: 'Why the just pray about it approach fails trauma survivors', category: 'the-lie' },
  { topic: 'The myth that unforgiveness causes all your health problems', category: 'the-lie' },
  { topic: 'How therapists sometimes push forgiveness too early', category: 'the-lie' },
  { topic: 'The lie that you need closure to forgive', category: 'the-lie' },
  { topic: 'Why forgiveness culture dismisses righteous anger', category: 'the-lie' },
  { topic: 'The myth that forgiveness is always about the other person', category: 'the-lie' },
  { topic: 'How the forgiveness timeline myth creates unnecessary shame', category: 'the-lie' },
  { topic: 'The lie that holding pain means you are choosing suffering', category: 'the-lie' },
  { topic: 'Why the forgiveness conversation ignores power dynamics', category: 'the-lie' },
  { topic: 'The dangerous belief that forgiveness erases consequences', category: 'the-lie' },
  { topic: 'How toxic forgiveness culture mirrors codependency', category: 'the-lie' },
  { topic: 'The lie that you should forgive for your own peace', category: 'the-lie' },
  { topic: 'Why the forgiveness mandate is a form of emotional labor', category: 'the-lie' },
  { topic: 'The myth that children should always forgive their parents', category: 'the-lie' },
  { topic: 'How forgiveness pressure retraumatizes abuse survivors', category: 'the-lie' },
  { topic: 'The lie that unforgiveness makes you bitter', category: 'the-lie' },
  { topic: 'Why the just let it go advice is intellectually lazy', category: 'the-lie' },
  { topic: 'The myth that forgiveness requires empathy for the offender', category: 'the-lie' },
  { topic: 'How society conflates forgiveness with weakness', category: 'the-lie' },
  { topic: 'The lie that you cannot heal without forgiving', category: 'the-lie' },
  { topic: 'Why forgiveness shaming is a form of emotional abuse', category: 'the-lie' },
  { topic: 'The myth that all religions agree on what forgiveness means', category: 'the-lie' },
  { topic: 'How the forgiveness narrative erases the victim experience', category: 'the-lie' },
  { topic: 'The lie that anger at your abuser means you have not healed', category: 'the-lie' },
  { topic: 'Why the forgiveness conversation needs a complete overhaul', category: 'the-lie' },
  { topic: 'The myth that forgiveness is the opposite of justice', category: 'the-lie' },
  { topic: 'How toxic forgiveness enables generational trauma cycles', category: 'the-lie' },
  { topic: 'The lie that you are selfish for not forgiving', category: 'the-lie' },
  { topic: 'Why forgiveness without grief is just emotional avoidance', category: 'the-lie' },
  { topic: 'The myth that forgiving means you condone what happened', category: 'the-lie' },
  { topic: 'How the forgiveness industry ignores neuroscience', category: 'the-lie' },
  { topic: 'The lie that real forgiveness feels good immediately', category: 'the-lie' },
  { topic: 'Why the forgiveness conversation excludes marginalized voices', category: 'the-lie' },
  { topic: 'The myth that you can forgive someone who is still hurting you', category: 'the-lie' },
  { topic: 'How forgiveness pressure creates hidden resentment', category: 'the-lie' },
  { topic: 'The lie that unforgiveness blocks your spiritual growth', category: 'the-lie' },
  { topic: 'Why the be the bigger person narrative is manipulation', category: 'the-lie' },
  { topic: 'The myth that forgiveness is always a gift to yourself', category: 'the-lie' },
  { topic: 'How the forgiveness mandate silences legitimate grievances', category: 'the-lie' },
  { topic: 'The lie that you are holding yourself hostage by not forgiving', category: 'the-lie' },
  { topic: 'Why forgiveness culture ignores the body entirely', category: 'the-lie' },
  { topic: 'The myth that once you forgive the pain disappears', category: 'the-lie' },
  { topic: 'How the forgiveness narrative was built by people in power', category: 'the-lie' },
  { topic: 'The lie that choosing not to forgive is choosing bitterness', category: 'the-lie' },
  { topic: 'Why the forgiveness conversation needs to include consent', category: 'the-lie' },
  { topic: 'The myth that forgiveness is simple if you really want it', category: 'the-lie' },
  { topic: 'How premature forgiveness prevents real intimacy', category: 'the-lie' },
  { topic: 'The lie that your inability to forgive means something is wrong with you', category: 'the-lie' },
  { topic: 'Why forgiveness without safety is just another betrayal', category: 'the-lie' },
  { topic: 'The myth that forgiveness always leads to reconciliation', category: 'the-lie' },
  { topic: 'How the forgiveness narrative ignores systemic harm', category: 'the-lie' },
  { topic: 'The lie that unforgiveness is always a choice', category: 'the-lie' },
  { topic: 'Why the forgiveness conversation needs to start with honesty', category: 'the-lie' },

  // THE FORENSIC METHOD (100 topics)
  { topic: 'What forensic forgiveness actually looks like in practice', category: 'the-forensic-method' },
  { topic: 'The evidence-gathering phase of real forgiveness', category: 'the-forensic-method' },
  { topic: 'How to map the full territory of a betrayal', category: 'the-forensic-method' },
  { topic: 'The forensic approach to forgiving without bypassing', category: 'the-forensic-method' },
  { topic: 'Why real forgiveness starts with documentation not emotion', category: 'the-forensic-method' },
  { topic: 'How to conduct an honest inventory of what was taken from you', category: 'the-forensic-method' },
  { topic: 'The systematic dismantling of a resentment', category: 'the-forensic-method' },
  { topic: 'How to separate the person from the wound they created', category: 'the-forensic-method' },
  { topic: 'The forensic timeline method for processing betrayal', category: 'the-forensic-method' },
  { topic: 'Why precision matters more than speed in forgiveness work', category: 'the-forensic-method' },
  { topic: 'How to identify the exact moment trust was broken', category: 'the-forensic-method' },
  { topic: 'The difference between forensic and therapeutic forgiveness', category: 'the-forensic-method' },
  { topic: 'How to examine what you are actually holding onto', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing childhood wounds', category: 'the-forensic-method' },
  { topic: 'Why naming the specific harm is the first step to release', category: 'the-forensic-method' },
  { topic: 'How to build a forgiveness case file for your own healing', category: 'the-forensic-method' },
  { topic: 'The step-by-step process of forensic emotional release', category: 'the-forensic-method' },
  { topic: 'How to identify secondary wounds from a primary betrayal', category: 'the-forensic-method' },
  { topic: 'The forensic approach to self-forgiveness', category: 'the-forensic-method' },
  { topic: 'Why most forgiveness methods skip the most important step', category: 'the-forensic-method' },
  { topic: 'How to create a witness statement for your own pain', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing grief within resentment', category: 'the-forensic-method' },
  { topic: 'How to identify the beliefs that formed around the wound', category: 'the-forensic-method' },
  { topic: 'The evidence review phase of forgiveness work', category: 'the-forensic-method' },
  { topic: 'Why writing the full story is essential before releasing it', category: 'the-forensic-method' },
  { topic: 'How to distinguish between the story and the sensation', category: 'the-forensic-method' },
  { topic: 'The forensic approach to forgiving repeated offenses', category: 'the-forensic-method' },
  { topic: 'How to identify what you lost versus what was taken', category: 'the-forensic-method' },
  { topic: 'The structured inquiry method for processing resentment', category: 'the-forensic-method' },
  { topic: 'Why the forensic method works when affirmations fail', category: 'the-forensic-method' },
  { topic: 'How to conduct a cost analysis of holding your resentment', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing institutional betrayal', category: 'the-forensic-method' },
  { topic: 'How to identify the unmet needs beneath the anger', category: 'the-forensic-method' },
  { topic: 'The role of precision in emotional processing', category: 'the-forensic-method' },
  { topic: 'Why vague forgiveness attempts always fail', category: 'the-forensic-method' },
  { topic: 'How to forensically examine your own role without self-blame', category: 'the-forensic-method' },
  { topic: 'The structured approach to processing complex betrayals', category: 'the-forensic-method' },
  { topic: 'How to identify the ripple effects of a single wound', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing financial betrayal', category: 'the-forensic-method' },
  { topic: 'Why specificity is the antidote to stuck resentment', category: 'the-forensic-method' },
  { topic: 'How to create a timeline of trust erosion', category: 'the-forensic-method' },
  { topic: 'The forensic approach to forgiving a pattern of behavior', category: 'the-forensic-method' },
  { topic: 'How to identify what forgiveness would actually require', category: 'the-forensic-method' },
  { topic: 'The evidence-based case for structured forgiveness work', category: 'the-forensic-method' },
  { topic: 'Why emotional precision prevents re-traumatization', category: 'the-forensic-method' },
  { topic: 'How to forensically process a betrayal you participated in', category: 'the-forensic-method' },
  { topic: 'The structured method for releasing attachment to outcomes', category: 'the-forensic-method' },
  { topic: 'How to identify the difference between pain and suffering in forgiveness', category: 'the-forensic-method' },
  { topic: 'The forensic approach to processing gaslighting damage', category: 'the-forensic-method' },
  { topic: 'Why the forensic method respects your intelligence', category: 'the-forensic-method' },
  { topic: 'How to build a release protocol for specific resentments', category: 'the-forensic-method' },
  { topic: 'The structured approach to forgiving someone you still love', category: 'the-forensic-method' },
  { topic: 'How to identify the protective function of your resentment', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing abandonment wounds', category: 'the-forensic-method' },
  { topic: 'Why most people skip the investigation phase entirely', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the impact on your identity', category: 'the-forensic-method' },
  { topic: 'The structured approach to processing broken promises', category: 'the-forensic-method' },
  { topic: 'How to identify what you need before you can release', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing emotional neglect', category: 'the-forensic-method' },
  { topic: 'Why documentation is not rumination', category: 'the-forensic-method' },
  { topic: 'How to create a structured release ceremony', category: 'the-forensic-method' },
  { topic: 'The forensic approach to forgiving yourself for what you tolerated', category: 'the-forensic-method' },
  { topic: 'How to identify the difference between acceptance and forgiveness', category: 'the-forensic-method' },
  { topic: 'The structured method for processing betrayal by a friend', category: 'the-forensic-method' },
  { topic: 'Why the forensic method includes compassion as a final step', category: 'the-forensic-method' },
  { topic: 'How to forensically process the loss of who you thought someone was', category: 'the-forensic-method' },
  { topic: 'The structured approach to forgiving systemic failures', category: 'the-forensic-method' },
  { topic: 'How to identify when forgiveness work is actually avoidance', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing medical betrayal', category: 'the-forensic-method' },
  { topic: 'Why the forensic approach honors your experience', category: 'the-forensic-method' },
  { topic: 'How to build a forgiveness practice that respects your pace', category: 'the-forensic-method' },
  { topic: 'The structured method for processing workplace betrayal', category: 'the-forensic-method' },
  { topic: 'How to identify the layers within a single resentment', category: 'the-forensic-method' },
  { topic: 'The forensic approach to processing religious trauma', category: 'the-forensic-method' },
  { topic: 'Why the forensic method works for people who hate woo', category: 'the-forensic-method' },
  { topic: 'How to create accountability without requiring an apology', category: 'the-forensic-method' },
  { topic: 'The structured approach to forgiving someone who died', category: 'the-forensic-method' },
  { topic: 'How to identify the grief hiding inside your anger', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing sexual betrayal', category: 'the-forensic-method' },
  { topic: 'Why the forensic approach does not require the other person', category: 'the-forensic-method' },
  { topic: 'How to build a structured practice for ongoing forgiveness', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing parental favoritism', category: 'the-forensic-method' },
  { topic: 'How to identify what you are protecting by not forgiving', category: 'the-forensic-method' },
  { topic: 'The structured approach to processing collective betrayal', category: 'the-forensic-method' },
  { topic: 'Why the forensic method is not cold or clinical', category: 'the-forensic-method' },
  { topic: 'How to forensically process a betrayal you saw coming', category: 'the-forensic-method' },
  { topic: 'The structured method for forgiving a version of yourself', category: 'the-forensic-method' },
  { topic: 'How to identify the exact cost of your unforgiveness', category: 'the-forensic-method' },
  { topic: 'The forensic approach to processing emotional manipulation', category: 'the-forensic-method' },
  { topic: 'Why precision in naming harm prevents future vulnerability', category: 'the-forensic-method' },
  { topic: 'How to build a forensic forgiveness journal practice', category: 'the-forensic-method' },
  { topic: 'The structured method for processing betrayal during illness', category: 'the-forensic-method' },
  { topic: 'How to identify the difference between forgiveness and acceptance', category: 'the-forensic-method' },
  { topic: 'The forensic approach to processing cultural betrayal', category: 'the-forensic-method' },
  { topic: 'Why the forensic method includes body awareness', category: 'the-forensic-method' },
  { topic: 'How to create a structured forgiveness timeline for complex trauma', category: 'the-forensic-method' },
  { topic: 'The forensic method for processing betrayal by a mentor', category: 'the-forensic-method' },
  { topic: 'How to identify what resolution actually looks like for you', category: 'the-forensic-method' },
  { topic: 'The structured approach to forgiving without condoning', category: 'the-forensic-method' },
  { topic: 'Why the forensic method prevents spiritual bypassing', category: 'the-forensic-method' },
  { topic: 'How to forensically process the loss of your innocence', category: 'the-forensic-method' },
  { topic: 'The structured method for processing betrayal in community', category: 'the-forensic-method' },

  // THE BODY (100 topics)
  { topic: 'Where exactly resentment lives in your physical body', category: 'the-body' },
  { topic: 'How unforgiveness manifests as chronic jaw tension', category: 'the-body' },
  { topic: 'The somatic reality of carrying a grudge for decades', category: 'the-body' },
  { topic: 'How your nervous system stores betrayal trauma', category: 'the-body' },
  { topic: 'Why your shoulders carry the weight of unforgiveness', category: 'the-body' },
  { topic: 'The connection between resentment and digestive problems', category: 'the-body' },
  { topic: 'How unforgiveness creates chronic inflammation', category: 'the-body' },
  { topic: 'The physical weight of things you have not forgiven', category: 'the-body' },
  { topic: 'How your body keeps score of every unprocessed betrayal', category: 'the-body' },
  { topic: 'Why breathwork is essential for forgiveness release', category: 'the-body' },
  { topic: 'The vagus nerve connection to forgiveness and release', category: 'the-body' },
  { topic: 'How resentment creates patterns of chronic pain', category: 'the-body' },
  { topic: 'The somatic markers of unprocessed anger', category: 'the-body' },
  { topic: 'How your hip flexors store unprocessed grief', category: 'the-body' },
  { topic: 'Why your throat tightens when you think about them', category: 'the-body' },
  { topic: 'The neuroscience of how resentment rewires your brain', category: 'the-body' },
  { topic: 'How unforgiveness affects your sleep architecture', category: 'the-body' },
  { topic: 'The connection between holding grudges and heart disease', category: 'the-body' },
  { topic: 'How your body signals when it is ready to release', category: 'the-body' },
  { topic: 'Why somatic experiencing works for forgiveness', category: 'the-body' },
  { topic: 'The physical sensation of finally letting something go', category: 'the-body' },
  { topic: 'How resentment affects your immune system', category: 'the-body' },
  { topic: 'The body-based approach to releasing old wounds', category: 'the-body' },
  { topic: 'How your posture reflects what you are holding', category: 'the-body' },
  { topic: 'Why your stomach drops when you see their name', category: 'the-body' },
  { topic: 'The connection between unforgiveness and autoimmune conditions', category: 'the-body' },
  { topic: 'How trauma-informed yoga supports forgiveness work', category: 'the-body' },
  { topic: 'The physical release that happens during real forgiveness', category: 'the-body' },
  { topic: 'How your body holds the memory of what your mind forgot', category: 'the-body' },
  { topic: 'Why shaking and tremoring are signs of release', category: 'the-body' },
  { topic: 'The somatic cost of performing forgiveness you do not feel', category: 'the-body' },
  { topic: 'How resentment creates tension headaches and migraines', category: 'the-body' },
  { topic: 'The body-mind connection in processing betrayal', category: 'the-body' },
  { topic: 'How your nervous system knows before your mind does', category: 'the-body' },
  { topic: 'Why cold exposure can support emotional release', category: 'the-body' },
  { topic: 'The physical markers of someone who has truly forgiven', category: 'the-body' },
  { topic: 'How resentment affects your cortisol and stress hormones', category: 'the-body' },
  { topic: 'The somatic approach to processing anger safely', category: 'the-body' },
  { topic: 'How your body creates armor around unprocessed wounds', category: 'the-body' },
  { topic: 'Why movement is medicine for stuck resentment', category: 'the-body' },
  { topic: 'The connection between jaw clenching and suppressed rage', category: 'the-body' },
  { topic: 'How unforgiveness affects your breathing patterns', category: 'the-body' },
  { topic: 'The body-based signs that forgiveness is happening', category: 'the-body' },
  { topic: 'How your fascia stores emotional memory', category: 'the-body' },
  { topic: 'Why massage can trigger emotional release', category: 'the-body' },
  { topic: 'The physical exhaustion of maintaining resentment', category: 'the-body' },
  { topic: 'How resentment affects your sexual response', category: 'the-body' },
  { topic: 'The somatic markers of readiness to forgive', category: 'the-body' },
  { topic: 'How your body communicates what your words cannot', category: 'the-body' },
  { topic: 'Why grounding practices support forgiveness work', category: 'the-body' },
  { topic: 'The connection between unforgiveness and chronic fatigue', category: 'the-body' },
  { topic: 'How sound healing supports emotional release', category: 'the-body' },
  { topic: 'The physical sensation of grief beneath anger', category: 'the-body' },
  { topic: 'How your body holds different betrayals in different places', category: 'the-body' },
  { topic: 'Why tears are a sign of the body releasing resentment', category: 'the-body' },
  { topic: 'The neuroscience of how forgiveness changes brain structure', category: 'the-body' },
  { topic: 'How resentment creates patterns of muscle guarding', category: 'the-body' },
  { topic: 'The body-based approach to processing complex trauma', category: 'the-body' },
  { topic: 'How your heart rate variability reflects your forgiveness state', category: 'the-body' },
  { topic: 'Why acupuncture can support forgiveness release', category: 'the-body' },
  { topic: 'The physical weight loss that follows emotional release', category: 'the-body' },
  { topic: 'How resentment affects your gut microbiome', category: 'the-body' },
  { topic: 'The somatic approach to releasing inherited resentment', category: 'the-body' },
  { topic: 'How your body stores the resentment your mind denies', category: 'the-body' },
  { topic: 'Why physical exercise alone cannot release emotional holding', category: 'the-body' },
  { topic: 'The connection between unforgiveness and skin conditions', category: 'the-body' },
  { topic: 'How breathwork patterns reveal what you are holding', category: 'the-body' },
  { topic: 'The physical signs of a forgiveness breakthrough', category: 'the-body' },
  { topic: 'How your body protects you by holding onto resentment', category: 'the-body' },
  { topic: 'Why the body must be included in any forgiveness process', category: 'the-body' },
  { topic: 'The connection between unforgiveness and back pain', category: 'the-body' },
  { topic: 'How somatic tracking supports forgiveness work', category: 'the-body' },
  { topic: 'The physical sensation of carrying someone else burden', category: 'the-body' },
  { topic: 'How your body knows the difference between real and performed forgiveness', category: 'the-body' },
  { topic: 'Why body-based approaches work when talk therapy stalls', category: 'the-body' },
  { topic: 'The connection between unforgiveness and blood pressure', category: 'the-body' },
  { topic: 'How dance and movement therapy support emotional release', category: 'the-body' },
  { topic: 'The physical aftermath of a major forgiveness event', category: 'the-body' },
  { topic: 'How your body creates physical boundaries around old wounds', category: 'the-body' },
  { topic: 'Why the body needs time to catch up with mental forgiveness', category: 'the-body' },
  { topic: 'The connection between unforgiveness and hormonal imbalance', category: 'the-body' },
  { topic: 'How cold water immersion supports nervous system reset', category: 'the-body' },
  { topic: 'The physical sensation of releasing a decades-old grudge', category: 'the-body' },
  { topic: 'How your body stores the trauma of witnessing harm', category: 'the-body' },
  { topic: 'Why proprioception matters in forgiveness work', category: 'the-body' },
  { topic: 'The connection between unforgiveness and weight gain', category: 'the-body' },
  { topic: 'How craniosacral therapy supports forgiveness release', category: 'the-body' },
  { topic: 'The physical markers of someone still carrying old pain', category: 'the-body' },
  { topic: 'How your body responds to the presence of someone you have not forgiven', category: 'the-body' },
  { topic: 'Why the body keeps the evidence your mind tries to dismiss', category: 'the-body' },
  { topic: 'The connection between unforgiveness and insomnia', category: 'the-body' },
  { topic: 'How EMDR supports the body in forgiveness processing', category: 'the-body' },
  { topic: 'The physical sensation of your nervous system finally relaxing', category: 'the-body' },
  { topic: 'How your body holds intergenerational resentment', category: 'the-body' },
  { topic: 'Why the freeze response is connected to unforgiveness', category: 'the-body' },
  { topic: 'The connection between unforgiveness and chronic tension', category: 'the-body' },
  { topic: 'How singing and vocalization support emotional release', category: 'the-body' },
  { topic: 'The physical transformation that follows genuine forgiveness', category: 'the-body' },
  { topic: 'How your body creates symptoms to get your attention about unprocessed pain', category: 'the-body' },
  { topic: 'Why the body is the final frontier of forgiveness work', category: 'the-body' },

  // THE SPECIFIC (100 topics)
  { topic: 'How to forgive a parent who will never acknowledge what they did', category: 'the-specific' },
  { topic: 'The process of forgiving yourself for staying too long', category: 'the-specific' },
  { topic: 'How to forgive a partner who cheated and you chose to stay', category: 'the-specific' },
  { topic: 'Forgiving a friend who disappeared when you needed them most', category: 'the-specific' },
  { topic: 'How to forgive yourself for the person you became in survival mode', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving a narcissistic parent', category: 'the-specific' },
  { topic: 'How to forgive someone who is still in your life', category: 'the-specific' },
  { topic: 'Forgiving yourself for the opportunities you missed because of fear', category: 'the-specific' },
  { topic: 'How to forgive a parent who chose their new family over you', category: 'the-specific' },
  { topic: 'The process of forgiving a sibling who sided with your abuser', category: 'the-specific' },
  { topic: 'How to forgive yourself for repeating your parents patterns', category: 'the-specific' },
  { topic: 'Forgiving a therapist who caused more harm than healing', category: 'the-specific' },
  { topic: 'How to forgive a partner who left without explanation', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving someone who has died', category: 'the-specific' },
  { topic: 'How to forgive yourself for what you did while drinking', category: 'the-specific' },
  { topic: 'Forgiving a parent who was emotionally absent your entire childhood', category: 'the-specific' },
  { topic: 'How to forgive a boss who destroyed your career', category: 'the-specific' },
  { topic: 'The process of forgiving yourself for hurting your children', category: 'the-specific' },
  { topic: 'How to forgive a partner who lied about who they were', category: 'the-specific' },
  { topic: 'Forgiving a religious leader who abused their authority', category: 'the-specific' },
  { topic: 'How to forgive yourself for not leaving sooner', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving a parent with mental illness', category: 'the-specific' },
  { topic: 'How to forgive someone who took credit for your work', category: 'the-specific' },
  { topic: 'Forgiving yourself for the relationships you destroyed', category: 'the-specific' },
  { topic: 'How to forgive a parent who parentified you as a child', category: 'the-specific' },
  { topic: 'The process of forgiving a doctor who missed your diagnosis', category: 'the-specific' },
  { topic: 'How to forgive yourself for not protecting someone you love', category: 'the-specific' },
  { topic: 'Forgiving a partner who financially devastated you', category: 'the-specific' },
  { topic: 'How to forgive a friend who betrayed your confidence', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for an abortion', category: 'the-specific' },
  { topic: 'How to forgive a parent who was physically abusive', category: 'the-specific' },
  { topic: 'Forgiving yourself for the years you wasted being angry', category: 'the-specific' },
  { topic: 'How to forgive a partner who gave you a disease', category: 'the-specific' },
  { topic: 'The process of forgiving a teacher who humiliated you', category: 'the-specific' },
  { topic: 'How to forgive yourself for abandoning your own dreams', category: 'the-specific' },
  { topic: 'Forgiving a parent who chose addiction over their children', category: 'the-specific' },
  { topic: 'How to forgive a system that failed to protect you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for infidelity', category: 'the-specific' },
  { topic: 'How to forgive a sibling who stole your inheritance', category: 'the-specific' },
  { topic: 'Forgiving yourself for not being there when someone died', category: 'the-specific' },
  { topic: 'How to forgive a partner who weaponized your vulnerability', category: 'the-specific' },
  { topic: 'The process of forgiving a parent who denied your reality', category: 'the-specific' },
  { topic: 'How to forgive yourself for the lies you told to survive', category: 'the-specific' },
  { topic: 'Forgiving a friend who chose your ex over you', category: 'the-specific' },
  { topic: 'How to forgive a parent who made you their emotional caretaker', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for addiction', category: 'the-specific' },
  { topic: 'How to forgive a partner who isolated you from everyone', category: 'the-specific' },
  { topic: 'Forgiving yourself for not seeing the red flags', category: 'the-specific' },
  { topic: 'How to forgive a parent who compared you to your siblings', category: 'the-specific' },
  { topic: 'The process of forgiving a community that ostracized you', category: 'the-specific' },
  { topic: 'How to forgive yourself for the anger you showed your kids', category: 'the-specific' },
  { topic: 'Forgiving a partner who was unfaithful during your pregnancy', category: 'the-specific' },
  { topic: 'How to forgive a parent who never said I love you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for a suicide attempt', category: 'the-specific' },
  { topic: 'How to forgive a friend who spread lies about you', category: 'the-specific' },
  { topic: 'Forgiving yourself for the boundaries you failed to set', category: 'the-specific' },
  { topic: 'How to forgive a parent who was emotionally incestuous', category: 'the-specific' },
  { topic: 'The process of forgiving a partner who controlled your finances', category: 'the-specific' },
  { topic: 'How to forgive yourself for losing custody of your children', category: 'the-specific' },
  { topic: 'Forgiving a sibling who enabled your parents abuse', category: 'the-specific' },
  { topic: 'How to forgive a partner who turned your children against you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for a DUI', category: 'the-specific' },
  { topic: 'How to forgive a parent who weaponized money', category: 'the-specific' },
  { topic: 'Forgiving yourself for the people you ghosted', category: 'the-specific' },
  { topic: 'How to forgive a partner who was emotionally unavailable', category: 'the-specific' },
  { topic: 'The process of forgiving a family member who molested you', category: 'the-specific' },
  { topic: 'How to forgive yourself for not fighting back', category: 'the-specific' },
  { topic: 'Forgiving a parent who remarried someone who hurt you', category: 'the-specific' },
  { topic: 'How to forgive a friend who stole from you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for an affair that ended a marriage', category: 'the-specific' },
  { topic: 'How to forgive a partner who lied about wanting children', category: 'the-specific' },
  { topic: 'Forgiving yourself for the words you can never take back', category: 'the-specific' },
  { topic: 'How to forgive a parent who kicked you out as a teenager', category: 'the-specific' },
  { topic: 'The process of forgiving a doctor who dismissed your pain', category: 'the-specific' },
  { topic: 'How to forgive yourself for breaking someone heart', category: 'the-specific' },
  { topic: 'Forgiving a partner who was secretly living a double life', category: 'the-specific' },
  { topic: 'How to forgive a parent who chose their religion over you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for wasting your potential', category: 'the-specific' },
  { topic: 'How to forgive a friend who abandoned you during cancer', category: 'the-specific' },
  { topic: 'Forgiving yourself for the version of you that hurt people', category: 'the-specific' },
  { topic: 'How to forgive a partner who was abusive only behind closed doors', category: 'the-specific' },
  { topic: 'The process of forgiving a parent who played favorites', category: 'the-specific' },
  { topic: 'How to forgive yourself for not being the parent you wanted to be', category: 'the-specific' },
  { topic: 'Forgiving a sibling who cut you off without explanation', category: 'the-specific' },
  { topic: 'How to forgive a partner who blamed you for their problems', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for a miscarriage you blame yourself for', category: 'the-specific' },
  { topic: 'How to forgive a parent who made you responsible for their happiness', category: 'the-specific' },
  { topic: 'Forgiving yourself for the times you chose comfort over courage', category: 'the-specific' },
  { topic: 'How to forgive a partner who was kind to everyone except you', category: 'the-specific' },
  { topic: 'The process of forgiving a mentor who exploited you', category: 'the-specific' },
  { topic: 'How to forgive yourself for not visiting before they died', category: 'the-specific' },
  { topic: 'Forgiving a parent who denied your sexual orientation', category: 'the-specific' },
  { topic: 'How to forgive a friend who slept with your partner', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for giving up on someone', category: 'the-specific' },
  { topic: 'How to forgive a partner who promised to change but never did', category: 'the-specific' },
  { topic: 'Forgiving yourself for the childhood you gave your kids', category: 'the-specific' },
  { topic: 'How to forgive a parent who was wonderful to everyone else', category: 'the-specific' },
  { topic: 'The process of forgiving yourself for a decision that changed everything', category: 'the-specific' },
  { topic: 'How to forgive a partner who used your trauma against you', category: 'the-specific' },
  { topic: 'Forgiving a parent who refuses to acknowledge your experience', category: 'the-specific' },

  // THE LIBERATION (100 topics)
  { topic: 'What happens in your body the morning after real forgiveness', category: 'the-liberation' },
  { topic: 'The unexpected grief that follows genuine forgiveness', category: 'the-liberation' },
  { topic: 'How forgiveness changes your relationship with time', category: 'the-liberation' },
  { topic: 'The strange emptiness after releasing a decades-old grudge', category: 'the-liberation' },
  { topic: 'How real forgiveness rewires your nervous system permanently', category: 'the-liberation' },
  { topic: 'What to do with the space where resentment used to live', category: 'the-liberation' },
  { topic: 'The identity crisis that follows genuine forgiveness', category: 'the-liberation' },
  { topic: 'How forgiveness changes the way you see everyone', category: 'the-liberation' },
  { topic: 'The unexpected creativity that emerges after release', category: 'the-liberation' },
  { topic: 'How your relationships transform after real forgiveness work', category: 'the-liberation' },
  { topic: 'The physical lightness that follows emotional release', category: 'the-liberation' },
  { topic: 'How forgiveness changes your capacity for intimacy', category: 'the-liberation' },
  { topic: 'The surprising anger that surfaces after forgiveness', category: 'the-liberation' },
  { topic: 'How liberation feels like loss before it feels like freedom', category: 'the-liberation' },
  { topic: 'The way forgiveness changes your dreams and sleep', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more discerning not less', category: 'the-liberation' },
  { topic: 'The energy that returns when you stop maintaining resentment', category: 'the-liberation' },
  { topic: 'How forgiveness changes your relationship with your body', category: 'the-liberation' },
  { topic: 'The unexpected compassion that arises after release', category: 'the-liberation' },
  { topic: 'How liberation changes the stories you tell about yourself', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your relationship with food', category: 'the-liberation' },
  { topic: 'How real forgiveness makes boundaries easier not harder', category: 'the-liberation' },
  { topic: 'The creative explosion that follows emotional liberation', category: 'the-liberation' },
  { topic: 'How forgiveness changes your tolerance for dishonesty', category: 'the-liberation' },
  { topic: 'The unexpected tears that come with genuine release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with money', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your parenting', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less patient with bullshit', category: 'the-liberation' },
  { topic: 'The physical changes people notice after forgiveness work', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with pleasure', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your career and ambition', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more honest not less', category: 'the-liberation' },
  { topic: 'The unexpected humor that emerges after release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with solitude', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your friendships', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you trust yourself more', category: 'the-liberation' },
  { topic: 'The physical healing that follows emotional liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with aging', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your spiritual practice', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less afraid of conflict', category: 'the-liberation' },
  { topic: 'The unexpected clarity that comes with genuine release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with rest', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your romantic relationships', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more present', category: 'the-liberation' },
  { topic: 'The energy shift others notice after your forgiveness work', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with vulnerability', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your relationship with nature', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less reactive', category: 'the-liberation' },
  { topic: 'The unexpected gratitude that emerges after release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your past', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your daily habits', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more selective with your time', category: 'the-liberation' },
  { topic: 'The physical vitality that returns after emotional release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with joy', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your relationship with death', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less interested in being right', category: 'the-liberation' },
  { topic: 'The unexpected peace that comes without trying', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with creativity', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your relationship with anger', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more compassionate toward yourself', category: 'the-liberation' },
  { topic: 'The surprising strength that emerges after vulnerability', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with control', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your capacity for wonder', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less attached to outcomes', category: 'the-liberation' },
  { topic: 'The unexpected freedom in no longer needing an apology', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with uncertainty', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your morning routine', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more alive', category: 'the-liberation' },
  { topic: 'The physical relaxation that follows decades of holding', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with trust', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your sense of humor', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less defensive', category: 'the-liberation' },
  { topic: 'The unexpected lightness of not carrying their story anymore', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with silence', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your physical appearance', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more generous', category: 'the-liberation' },
  { topic: 'The surprising relief of accepting what happened', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your family', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your decision making', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less afraid of being hurt again', category: 'the-liberation' },
  { topic: 'The unexpected power in choosing to release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your work', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your nervous system baseline', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more curious about people', category: 'the-liberation' },
  { topic: 'The physical changes in your face after emotional release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with receiving', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your capacity for deep listening', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less interested in revenge', category: 'the-liberation' },
  { topic: 'The unexpected tenderness that follows genuine release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your own needs', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your experience of the present moment', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you more willing to be seen', category: 'the-liberation' },
  { topic: 'The surprising ease that comes after the hardest work', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with gratitude', category: 'the-liberation' },
  { topic: 'The way forgiveness affects your physical energy levels', category: 'the-liberation' },
  { topic: 'How real forgiveness makes you less afraid of your own emotions', category: 'the-liberation' },
  { topic: 'The unexpected wisdom that comes from having forgiven', category: 'the-liberation' },
  { topic: 'How liberation changes everything you thought you knew about love', category: 'the-liberation' },
  { topic: 'The way forgiveness transforms your relationship with yourself', category: 'the-liberation' },
  { topic: 'How real forgiveness is the beginning not the end', category: 'the-liberation' },
  { topic: 'The life that becomes possible after genuine liberation', category: 'the-liberation' },
];

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function pickAsins(count = 3) {
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildAmazonLink(product) {
  return `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}" target="_blank" rel="nofollow sponsored">${product.name} by ${product.author} (paid link)</a>`;
}

async function generateArticle(topic, category) {
  const products = pickAsins(Math.random() < 0.5 ? 3 : 4);
  const productLinks = products.map(p => buildAmazonLink(p));

  const systemPrompt = `You are Kalesh, a consciousness teacher and writer. You write about forgiveness, resentment, healing, and liberation with raw honesty. Your voice is:
- Direct address ("you") throughout
- Contractions everywhere (don't, can't, it's, won't, you're)
- Compassionate but never saccharine
- 2-3 conversational dialogue markers like "Right?!", "Know what I mean?", "Does that land?", "Here's the thing", "Look,"
- Short punchy sentences mixed with longer flowing ones
- First person ("I") mixed with second person ("you")
- NO em-dashes (use " - " instead)
- NO words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore
- NO phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"`;

  const userPrompt = `Write a 1400-2000 word article about: "${topic}"

Category: ${category}

Requirements:
1. Write in HTML format (use <p>, <h2>, <h3>, <ul>, <li>, <blockquote> tags)
2. Include exactly ${products.length} Amazon affiliate links naturally woven into the text. Here are the links to include:
${productLinks.map((l, i) => `   ${i + 1}. ${l}`).join('\n')}
3. Start with a compelling hook - no generic opener
4. Use 2-3 dialogue markers naturally
5. Vary sentence length dramatically (some 3-5 words, some 20+)
6. End with something that lands emotionally, not a summary
7. Do NOT use any banned words or phrases
8. Use " - " (space-hyphen-space) instead of em-dashes`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.72
  });

  return response.choices[0].message.content;
}

async function main() {
  console.log('[bulk-seed] Starting 500-article bulk generation...');
  console.log(`[bulk-seed] Model: ${MODEL}`);
  console.log(`[bulk-seed] Topics: ${TOPICS.length}`);

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  const existingSlugs = new Set(articles.map(a => a.slug));

  let generated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const { topic, category } = TOPICS[i];
    const slug = slugify(topic);

    if (existingSlugs.has(slug)) {
      console.log(`[${i + 1}/${TOPICS.length}] SKIP (exists): ${slug}`);
      skipped++;
      continue;
    }

    let body = null;
    let gateResult = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`[${i + 1}/${TOPICS.length}] Attempt ${attempt}/4: ${topic}`);
        const raw = await generateArticle(topic, category);
        gateResult = runQualityGate(raw);

        if (gateResult.passed) {
          body = gateResult.cleaned;
          break;
        } else {
          console.log(`  Gate failed: ${gateResult.failures.join(', ')}`);
        }
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        // Wait before retry
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    if (!body) {
      console.log(`  FAILED after 4 attempts: ${topic}`);
      failed++;
      continue;
    }

    const now = new Date().toISOString();
    const article = {
      slug,
      title: topic,
      metaTitle: `${topic} | The Unforgiven`,
      metaDescription: `Kalesh explores ${topic.toLowerCase()} - a raw, honest look at what it takes to actually let go.`,
      category,
      dateISO: now.split('T')[0],
      readingTime: `${Math.ceil(gateResult.wordCount / 238)} min read`,
      heroAlt: topic,
      body,
      faqs: [],
      toc: [],
      excerpt: body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) + '...',
      heroImage: '',
      ogImage: '',
      hasAffiliateLinks: true,
      status: 'queued',
      queued_at: now,
      published_at: null
    };

    articles.push(article);
    existingSlugs.add(slug);
    generated++;

    // Save every 10 articles
    if (generated % 10 === 0) {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 0));
      console.log(`  [checkpoint] Saved. Generated: ${generated}, Failed: ${failed}, Skipped: ${skipped}`);
    }

    // Rate limiting: wait 2 seconds between generations
    await new Promise(r => setTimeout(r, 2000));
  }

  // Final save
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 0));
  console.log(`\n[bulk-seed] COMPLETE`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total articles in file: ${articles.length}`);
}

main().catch(err => {
  console.error('[bulk-seed] Fatal error:', err);
  process.exit(1);
});
