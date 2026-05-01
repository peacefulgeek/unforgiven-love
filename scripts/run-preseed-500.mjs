/**
 * ONE-TIME PRE-SEED: Generate 500 articles with 1800+ words each.
 * - Uses DeepSeek V4-Pro via OpenAI-compatible client
 * - Quality gate enforced (1800+ words, 3-4 Amazon links, no banned words)
 * - All articles stored as status='queued' (NOT published)
 * - Each article gets a unique Bunny CDN WebP hero image
 * - Processes 5 articles concurrently for speed
 * 
 * THIS SCRIPT IS RUN ONCE MANUALLY. NOT SCHEDULED.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { assignHeroImage } from '../src/lib/image-pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_FILE = path.join(__dirname, '..', 'content', 'articles.json');
const AFFILIATE_TAG = 'spankyspinola-20';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

// ─── BANNED WORDS (must match quality gate) ───
const BANNED_WORDS = [
  'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy',
  'leverage', 'unlock', 'empower', 'pivotal', 'embark', 'underscore',
  'paramount', 'seamlessly', 'robust', 'beacon', 'foster', 'elevate',
  'curate', 'curated', 'bespoke', 'resonate', 'harness', 'intricate',
  'plethora', 'myriad', 'groundbreaking', 'innovative', 'cutting-edge',
  'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive',
  'transformative', 'holistic', 'nuanced', 'multifaceted', 'profound',
  'furthermore'
];

const BANNED_PHRASES = [
  "it's important to note that", "it's worth noting that",
  "in conclusion", "in summary", "a holistic approach",
  "in the realm of", "dive deep into", "at the end of the day",
  "in today's fast-paced world", "plays a crucial role"
];

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

// 500 unique topics
const TOPICS = [
  // THE LIE (100 topics)
  { topic: 'Why toxic positivity keeps you trapped in unforgiveness', category: 'the-lie' },
  { topic: 'The forgiveness myth that makes therapists cringe', category: 'the-lie' },
  { topic: 'How spiritual bypassing disguises itself as forgiveness', category: 'the-lie' },
  { topic: 'The dangerous lie that time heals all wounds', category: 'the-lie' },
  { topic: 'Why forgiving too fast is a form of self-betrayal', category: 'the-lie' },
  { topic: 'The cultural pressure to forgive before you are ready', category: 'the-lie' },
  { topic: 'How religion weaponizes forgiveness against victims', category: 'the-lie' },
  { topic: 'The myth that forgiveness means forgetting what happened', category: 'the-lie' },
  { topic: 'Why people-pleasing masquerades as forgiveness', category: 'the-lie' },
  { topic: 'The lie that anger is the opposite of forgiveness', category: 'the-lie' },
  { topic: 'How the self-help industry profits from premature forgiveness', category: 'the-lie' },
  { topic: 'The toxic belief that unforgiveness only hurts you', category: 'the-lie' },
  { topic: 'Why conditional forgiveness is not forgiveness at all', category: 'the-lie' },
  { topic: 'The myth that strong people forgive easily', category: 'the-lie' },
  { topic: 'How performative forgiveness damages your nervous system', category: 'the-lie' },
  { topic: 'The lie that you must forgive to be a good person', category: 'the-lie' },
  { topic: 'Why society punishes those who refuse to forgive', category: 'the-lie' },
  { topic: 'The dangerous conflation of forgiveness and reconciliation', category: 'the-lie' },
  { topic: 'How forced forgiveness creates deeper resentment', category: 'the-lie' },
  { topic: 'The myth that forgiveness is a one-time event', category: 'the-lie' },
  { topic: 'Why the forgiveness industrial complex exists', category: 'the-lie' },
  { topic: 'The lie that you owe your abuser forgiveness', category: 'the-lie' },
  { topic: 'How toxic forgiveness culture silences survivors', category: 'the-lie' },
  { topic: 'The myth that unforgiveness causes cancer', category: 'the-lie' },
  { topic: 'Why forgiveness without accountability enables abuse', category: 'the-lie' },
  { topic: 'The dangerous idea that all pain has a purpose', category: 'the-lie' },
  { topic: 'How the forgive and forget mantra erases your truth', category: 'the-lie' },
  { topic: 'The lie that holding boundaries is the same as holding grudges', category: 'the-lie' },
  { topic: 'Why premature closure is not the same as peace', category: 'the-lie' },
  { topic: 'The myth that forgiveness requires understanding the offender', category: 'the-lie' },
  { topic: 'How gaslighting hides inside forgiveness language', category: 'the-lie' },
  { topic: 'The lie that real forgiveness feels good immediately', category: 'the-lie' },
  { topic: 'Why the pressure to forgive parents is uniquely destructive', category: 'the-lie' },
  { topic: 'The myth that forgiveness means the relationship is healed', category: 'the-lie' },
  { topic: 'How spiritual teachers use forgiveness to avoid accountability', category: 'the-lie' },
  { topic: 'The lie that anger after forgiveness means you failed', category: 'the-lie' },
  { topic: 'Why forgiveness culture is a tool of oppression', category: 'the-lie' },
  { topic: 'The dangerous belief that victims attract their suffering', category: 'the-lie' },
  { topic: 'How the just world fallacy infects forgiveness narratives', category: 'the-lie' },
  { topic: 'The lie that you cannot heal without forgiving', category: 'the-lie' },
  { topic: 'Why cheap grace is the enemy of real healing', category: 'the-lie' },
  { topic: 'The myth that forgiveness is always the higher path', category: 'the-lie' },
  { topic: 'How toxic positivity and forgiveness culture reinforce each other', category: 'the-lie' },
  { topic: 'The lie that unforgiveness is a character flaw', category: 'the-lie' },
  { topic: 'Why the forgiveness timeline is a myth', category: 'the-lie' },
  { topic: 'The dangerous idea that you should forgive for your health', category: 'the-lie' },
  { topic: 'How forgiveness gets weaponized in family systems', category: 'the-lie' },
  { topic: 'The lie that forgiveness means trusting again', category: 'the-lie' },
  { topic: 'Why the word forgiveness has been corrupted beyond recognition', category: 'the-lie' },
  { topic: 'The myth that forgiveness is simple if you really want it', category: 'the-lie' },
  { topic: 'How the wellness industry sells forgiveness as a product', category: 'the-lie' },
  { topic: 'The lie that holding resentment makes you a bad person', category: 'the-lie' },
  { topic: 'Why forgiveness without grief is spiritual bypassing', category: 'the-lie' },
  { topic: 'The dangerous conflation of compassion and doormat behavior', category: 'the-lie' },
  { topic: 'How forgiveness narratives silence righteous anger', category: 'the-lie' },
  { topic: 'The lie that you should forgive because life is short', category: 'the-lie' },
  { topic: 'Why the pressure to forgive is a form of emotional labor', category: 'the-lie' },
  { topic: 'The myth that forgiveness is required for closure', category: 'the-lie' },
  { topic: 'How the church uses forgiveness to protect predators', category: 'the-lie' },
  { topic: 'The lie that unforgiveness blocks your blessings', category: 'the-lie' },
  { topic: 'Why forgiveness without justice is incomplete', category: 'the-lie' },
  { topic: 'The dangerous idea that you chose your trauma before birth', category: 'the-lie' },
  { topic: 'How forgiveness culture enables narcissistic abuse', category: 'the-lie' },
  { topic: 'The lie that real healing always includes the other person', category: 'the-lie' },
  { topic: 'Why the forgiveness imperative is gendered', category: 'the-lie' },
  { topic: 'The myth that forgiveness means the pain was worth it', category: 'the-lie' },
  { topic: 'How toxic forgiveness creates intergenerational trauma', category: 'the-lie' },
  { topic: 'The lie that you are bitter if you have not forgiven', category: 'the-lie' },
  { topic: 'Why forgiveness without boundaries is self-abandonment', category: 'the-lie' },
  { topic: 'The dangerous belief that forgiveness is always possible', category: 'the-lie' },
  { topic: 'How the language of forgiveness gets used to manipulate', category: 'the-lie' },
  { topic: 'The lie that unforgiveness is the same as hatred', category: 'the-lie' },
  { topic: 'Why the rush to forgive dishonors your experience', category: 'the-lie' },
  { topic: 'The myth that forgiveness is a sign of spiritual maturity', category: 'the-lie' },
  { topic: 'How forgiveness pressure retraumatizes survivors', category: 'the-lie' },
  { topic: 'The lie that you need to forgive yourself first', category: 'the-lie' },
  { topic: 'Why forgiveness without processing is repression', category: 'the-lie' },
  { topic: 'The dangerous idea that all relationships deserve second chances', category: 'the-lie' },
  { topic: 'How the concept of karma gets twisted into victim blaming', category: 'the-lie' },
  { topic: 'The lie that forgiveness is the only path to freedom', category: 'the-lie' },
  { topic: 'Why the forgiveness narrative centers the offender', category: 'the-lie' },
  { topic: 'The myth that you cannot be angry and forgiving at the same time', category: 'the-lie' },
  { topic: 'How toxic forgiveness erases the reality of evil', category: 'the-lie' },
  { topic: 'The lie that holding someone accountable is the same as revenge', category: 'the-lie' },
  { topic: 'Why forgiveness without safety is dangerous', category: 'the-lie' },
  { topic: 'The dangerous belief that love conquers all including abuse', category: 'the-lie' },
  { topic: 'How the forgiveness mandate silences collective trauma', category: 'the-lie' },
  { topic: 'The lie that unforgiveness is a prison you build yourself', category: 'the-lie' },
  { topic: 'Why the metaphor of carrying weight oversimplifies resentment', category: 'the-lie' },
  { topic: 'The myth that forgiveness means you were never really hurt', category: 'the-lie' },
  { topic: 'How premature forgiveness stunts emotional development', category: 'the-lie' },
  { topic: 'The lie that your inability to forgive means something is wrong with you', category: 'the-lie' },
  { topic: 'Why forgiveness culture is fundamentally dishonest about pain', category: 'the-lie' },
  { topic: 'The dangerous conflation of acceptance and approval', category: 'the-lie' },
  { topic: 'How the forgiveness industry profits from your shame', category: 'the-lie' },
  { topic: 'The lie that forgiveness is always an act of love', category: 'the-lie' },
  { topic: 'Why the binary of forgiven or unforgiven is false', category: 'the-lie' },
  { topic: 'The myth that forgiveness requires empathy for the abuser', category: 'the-lie' },
  { topic: 'How toxic forgiveness perpetuates cycles of abuse', category: 'the-lie' },
  { topic: 'The lie that you are responsible for your own suffering', category: 'the-lie' },
  { topic: 'Why the forgiveness conversation needs to be completely rebuilt', category: 'the-lie' },
  // THE FORENSIC METHOD (100 topics)
  { topic: 'How to document your resentment without drowning in it', category: 'the-forensic-method' },
  { topic: 'The forensic approach to examining what you are actually holding', category: 'the-forensic-method' },
  { topic: 'Why precision matters more than positivity in forgiveness work', category: 'the-forensic-method' },
  { topic: 'How to separate the facts from the story you built around them', category: 'the-forensic-method' },
  { topic: 'The practice of naming exactly what was taken from you', category: 'the-forensic-method' },
  { topic: 'How to inventory your losses without minimizing them', category: 'the-forensic-method' },
  { topic: 'The difference between understanding and excusing', category: 'the-forensic-method' },
  { topic: 'How to examine your resentment like a scientist', category: 'the-forensic-method' },
  { topic: 'The forensic method of tracing anger to its original source', category: 'the-forensic-method' },
  { topic: 'How to identify the specific moment trust was broken', category: 'the-forensic-method' },
  { topic: 'The practice of separating the person from the wound', category: 'the-forensic-method' },
  { topic: 'How to map the full impact of betrayal across your life', category: 'the-forensic-method' },
  { topic: 'The forensic examination of what you believed versus what was true', category: 'the-forensic-method' },
  { topic: 'How to identify which part of you is still waiting for an apology', category: 'the-forensic-method' },
  { topic: 'The practice of examining your own role without self-blame', category: 'the-forensic-method' },
  { topic: 'How to distinguish between grief and resentment', category: 'the-forensic-method' },
  { topic: 'The forensic approach to understanding why you stayed', category: 'the-forensic-method' },
  { topic: 'How to examine the beliefs that formed around your wound', category: 'the-forensic-method' },
  { topic: 'The practice of identifying what you made the betrayal mean about you', category: 'the-forensic-method' },
  { topic: 'How to trace your current triggers back to their origin', category: 'the-forensic-method' },
  { topic: 'The forensic method of examining family loyalty contracts', category: 'the-forensic-method' },
  { topic: 'How to identify the secondary gains of holding resentment', category: 'the-forensic-method' },
  { topic: 'The practice of examining what forgiveness would actually cost you', category: 'the-forensic-method' },
  { topic: 'How to document the ways you have been changed by what happened', category: 'the-forensic-method' },
  { topic: 'The forensic examination of your forgiveness resistance', category: 'the-forensic-method' },
  { topic: 'How to identify the difference between a boundary and a wall', category: 'the-forensic-method' },
  { topic: 'The practice of examining your anger without judgment', category: 'the-forensic-method' },
  { topic: 'How to trace the lineage of your resentment patterns', category: 'the-forensic-method' },
  { topic: 'The forensic approach to understanding emotional inheritance', category: 'the-forensic-method' },
  { topic: 'How to identify what you are protecting by not forgiving', category: 'the-forensic-method' },
  { topic: 'The practice of examining the gap between what happened and what you needed', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the moment you shut down', category: 'the-forensic-method' },
  { topic: 'The method of identifying your core wound beneath the resentment', category: 'the-forensic-method' },
  { topic: 'How to separate legitimate grievance from repetitive thought loops', category: 'the-forensic-method' },
  { topic: 'The forensic practice of examining your revenge fantasies', category: 'the-forensic-method' },
  { topic: 'How to identify the unmet needs driving your unforgiveness', category: 'the-forensic-method' },
  { topic: 'The practice of examining how resentment has shaped your identity', category: 'the-forensic-method' },
  { topic: 'How to forensically trace the impact on your capacity to trust', category: 'the-forensic-method' },
  { topic: 'The method of examining what you lost that can never be returned', category: 'the-forensic-method' },
  { topic: 'How to identify the specific promises that were broken', category: 'the-forensic-method' },
  { topic: 'The forensic approach to examining your shame around the wound', category: 'the-forensic-method' },
  { topic: 'How to document the ways you have compensated for what was done', category: 'the-forensic-method' },
  { topic: 'The practice of examining your relationship with the concept of justice', category: 'the-forensic-method' },
  { topic: 'How to identify the parts of you that formed in response to the wound', category: 'the-forensic-method' },
  { topic: 'The forensic method of examining your protective mechanisms', category: 'the-forensic-method' },
  { topic: 'How to trace the connection between your wound and your current relationships', category: 'the-forensic-method' },
  { topic: 'The practice of examining what you have built on top of your pain', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the narrative you tell about what happened', category: 'the-forensic-method' },
  { topic: 'The method of identifying where your story has calcified', category: 'the-forensic-method' },
  { topic: 'How to examine the difference between your wound and your wound story', category: 'the-forensic-method' },
  { topic: 'The forensic approach to understanding your attachment to suffering', category: 'the-forensic-method' },
  { topic: 'How to identify the beliefs about yourself that the wound created', category: 'the-forensic-method' },
  { topic: 'The practice of examining your expectations versus reality', category: 'the-forensic-method' },
  { topic: 'How to forensically trace the ripple effects of one betrayal', category: 'the-forensic-method' },
  { topic: 'The method of examining how you have used your wound', category: 'the-forensic-method' },
  { topic: 'How to identify the specific emotions hiding beneath your anger', category: 'the-forensic-method' },
  { topic: 'The forensic practice of examining your relationship with vulnerability', category: 'the-forensic-method' },
  { topic: 'How to document the timeline of your wound without retraumatizing yourself', category: 'the-forensic-method' },
  { topic: 'The method of examining what you are afraid will happen if you let go', category: 'the-forensic-method' },
  { topic: 'How to identify the difference between processing and ruminating', category: 'the-forensic-method' },
  { topic: 'The forensic approach to examining your forgiveness attempts that failed', category: 'the-forensic-method' },
  { topic: 'How to trace the connection between your wound and your self-worth', category: 'the-forensic-method' },
  { topic: 'The practice of examining the power dynamics in your resentment', category: 'the-forensic-method' },
  { topic: 'How to forensically examine what you have sacrificed to maintain your position', category: 'the-forensic-method' },
  { topic: 'The method of identifying your resentment triggers in daily life', category: 'the-forensic-method' },
  { topic: 'How to examine the cost of your unforgiveness on your body', category: 'the-forensic-method' },
  { topic: 'The forensic practice of examining your relationship with control', category: 'the-forensic-method' },
  { topic: 'How to identify what genuine accountability would look like to you', category: 'the-forensic-method' },
  { topic: 'The method of examining your fantasies about how things should have been', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the gap between who you were and who you became', category: 'the-forensic-method' },
  { topic: 'The practice of examining your relationship with the passage of time', category: 'the-forensic-method' },
  { topic: 'How to identify the specific ways your wound has limited your life', category: 'the-forensic-method' },
  { topic: 'The forensic approach to examining intergenerational resentment patterns', category: 'the-forensic-method' },
  { topic: 'How to document the ways your wound has also served you', category: 'the-forensic-method' },
  { topic: 'The method of examining your relationship with the person who hurt you now', category: 'the-forensic-method' },
  { topic: 'How to forensically examine what you would need to feel safe enough to release', category: 'the-forensic-method' },
  { topic: 'The practice of examining the difference between forgiveness and acceptance', category: 'the-forensic-method' },
  { topic: 'How to identify the specific moment you decided not to forgive', category: 'the-forensic-method' },
  { topic: 'The forensic method of examining your relationship with hope', category: 'the-forensic-method' },
  { topic: 'How to trace the connection between your wound and your worldview', category: 'the-forensic-method' },
  { topic: 'The practice of examining what you have taught others about your wound', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the role of witnesses in your healing', category: 'the-forensic-method' },
  { topic: 'The method of identifying what completion would feel like in your body', category: 'the-forensic-method' },
  { topic: 'How to examine the specific ways you have tried to make sense of what happened', category: 'the-forensic-method' },
  { topic: 'The forensic approach to understanding your relationship with letting go', category: 'the-forensic-method' },
  { topic: 'How to identify the difference between releasing and suppressing', category: 'the-forensic-method' },
  { topic: 'The practice of examining your wound without the need to fix it', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the stories others tell about your wound', category: 'the-forensic-method' },
  { topic: 'The method of examining your relationship with the concept of deserving', category: 'the-forensic-method' },
  { topic: 'How to identify what you are really asking for when you say you want an apology', category: 'the-forensic-method' },
  { topic: 'The forensic practice of examining your relationship with forgiveness itself', category: 'the-forensic-method' },
  { topic: 'How to trace the full cost of what happened across every area of your life', category: 'the-forensic-method' },
  { topic: 'The method of examining whether you are ready or just tired', category: 'the-forensic-method' },
  { topic: 'How to forensically examine the difference between healing and performing healing', category: 'the-forensic-method' },
  { topic: 'The practice of examining your relationship with the truth of what happened', category: 'the-forensic-method' },
  { topic: 'How to identify the specific conditions under which you could begin to release', category: 'the-forensic-method' },
  { topic: 'The forensic approach to examining what you have already forgiven without realizing it', category: 'the-forensic-method' },
  { topic: 'How to examine the relationship between your wound and your purpose', category: 'the-forensic-method' },
  { topic: 'The method of identifying what you need to grieve before you can forgive', category: 'the-forensic-method' },
  { topic: 'How to forensically examine your readiness for the next stage of release', category: 'the-forensic-method' },
  // THE BODY (100 topics)
  { topic: 'How resentment stores itself in your jaw and what to do about it', category: 'the-body' },
  { topic: 'The somatic signature of unforgiveness in your nervous system', category: 'the-body' },
  { topic: 'How your body knows you have not forgiven before your mind admits it', category: 'the-body' },
  { topic: 'The physical weight of carrying someone else s betrayal', category: 'the-body' },
  { topic: 'How chronic pain and unresolved resentment are connected', category: 'the-body' },
  { topic: 'The way your gut responds to the person who hurt you', category: 'the-body' },
  { topic: 'How unforgiveness affects your sleep architecture', category: 'the-body' },
  { topic: 'The relationship between held resentment and held breath', category: 'the-body' },
  { topic: 'How your body braces for contact with the person you have not forgiven', category: 'the-body' },
  { topic: 'The somatic experience of finally releasing a long-held grudge', category: 'the-body' },
  { topic: 'How resentment changes your posture over time', category: 'the-body' },
  { topic: 'The connection between unforgiveness and autoimmune responses', category: 'the-body' },
  { topic: 'How your body stores the memory of what your mind has tried to forget', category: 'the-body' },
  { topic: 'The physical symptoms that disappear after genuine forgiveness', category: 'the-body' },
  { topic: 'How your heart rate changes when you think about the person who hurt you', category: 'the-body' },
  { topic: 'The somatic markers of betrayal trauma in daily life', category: 'the-body' },
  { topic: 'How unforgiveness affects your digestion and gut health', category: 'the-body' },
  { topic: 'The way your body holds the shape of your oldest wound', category: 'the-body' },
  { topic: 'How chronic tension patterns map to unresolved emotional material', category: 'the-body' },
  { topic: 'The physical experience of anger that has nowhere to go', category: 'the-body' },
  { topic: 'How your nervous system responds to triggers years after the event', category: 'the-body' },
  { topic: 'The somatic practice of releasing resentment through breath', category: 'the-body' },
  { topic: 'How unforgiveness affects your immune system', category: 'the-body' },
  { topic: 'The body language of someone carrying unresolved betrayal', category: 'the-body' },
  { topic: 'How your shoulders carry the weight of what was never said', category: 'the-body' },
  { topic: 'The physical cost of maintaining a facade of having forgiven', category: 'the-body' },
  { topic: 'How somatic experiencing can release stored resentment', category: 'the-body' },
  { topic: 'The connection between unforgiveness and chronic fatigue', category: 'the-body' },
  { topic: 'How your body responds to the voice of the person who betrayed you', category: 'the-body' },
  { topic: 'The physical sensation of resentment dissolving in real time', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with physical intimacy', category: 'the-body' },
  { topic: 'The somatic markers that tell you forgiveness is happening', category: 'the-body' },
  { topic: 'How your body holds grief differently than it holds anger', category: 'the-body' },
  { topic: 'The physical practice of shaking to release stored trauma', category: 'the-body' },
  { topic: 'How unforgiveness affects your blood pressure over time', category: 'the-body' },
  { topic: 'The way your body communicates what your words cannot', category: 'the-body' },
  { topic: 'How chronic headaches connect to unresolved emotional conflicts', category: 'the-body' },
  { topic: 'The somatic experience of being triggered by a smell or sound', category: 'the-body' },
  { topic: 'How your body holds the imprint of every unfinished conversation', category: 'the-body' },
  { topic: 'The physical release that comes with speaking your truth', category: 'the-body' },
  { topic: 'How unforgiveness affects your cortisol levels', category: 'the-body' },
  { topic: 'The somatic practice of grounding when resentment surfaces', category: 'the-body' },
  { topic: 'How your body knows the difference between real and performed forgiveness', category: 'the-body' },
  { topic: 'The physical symptoms of suppressed rage', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with food', category: 'the-body' },
  { topic: 'The way your body responds to genuine safety after betrayal', category: 'the-body' },
  { topic: 'How somatic awareness can guide the forgiveness process', category: 'the-body' },
  { topic: 'The physical experience of your body releasing a decades-old wound', category: 'the-body' },
  { topic: 'How unforgiveness affects your capacity for pleasure', category: 'the-body' },
  { topic: 'The connection between your pelvic floor and stored emotional material', category: 'the-body' },
  { topic: 'How your body responds when you finally stop performing okayness', category: 'the-body' },
  { topic: 'The somatic cost of hypervigilance after betrayal', category: 'the-body' },
  { topic: 'How unforgiveness changes the way you move through space', category: 'the-body' },
  { topic: 'The physical practice of progressive muscle relaxation for resentment', category: 'the-body' },
  { topic: 'How your body stores the energy of words that were never spoken', category: 'the-body' },
  { topic: 'The somatic experience of compassion arising naturally', category: 'the-body' },
  { topic: 'How unforgiveness affects your vocal patterns', category: 'the-body' },
  { topic: 'The physical markers of someone who has genuinely released', category: 'the-body' },
  { topic: 'How your body responds to the anniversary of a betrayal', category: 'the-body' },
  { topic: 'The somatic practice of body scanning for held resentment', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with exercise', category: 'the-body' },
  { topic: 'The physical experience of your chest opening after years of guarding', category: 'the-body' },
  { topic: 'How your body communicates readiness for the next stage of healing', category: 'the-body' },
  { topic: 'The somatic cost of smiling when you are still in pain', category: 'the-body' },
  { topic: 'How unforgiveness affects your skin and physical appearance', category: 'the-body' },
  { topic: 'The physical practice of cold exposure for emotional reset', category: 'the-body' },
  { topic: 'How your body holds the memory of safety before the wound', category: 'the-body' },
  { topic: 'The somatic experience of your body trusting again', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with rest', category: 'the-body' },
  { topic: 'The physical sensation of grief moving through your body', category: 'the-body' },
  { topic: 'How your body responds when someone validates your experience', category: 'the-body' },
  { topic: 'The somatic practice of humming and vibration for emotional release', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with your own reflection', category: 'the-body' },
  { topic: 'The physical experience of your body after a genuine apology', category: 'the-body' },
  { topic: 'How your body holds the shape of protection long after the danger has passed', category: 'the-body' },
  { topic: 'The somatic markers of dissociation during forgiveness work', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with aging', category: 'the-body' },
  { topic: 'The physical practice of yoga for releasing stored resentment', category: 'the-body' },
  { topic: 'How your body responds to environments associated with the wound', category: 'the-body' },
  { topic: 'The somatic experience of boundaries being respected for the first time', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with crying', category: 'the-body' },
  { topic: 'The physical cost of maintaining emotional armor', category: 'the-body' },
  { topic: 'How your body knows when it is safe to begin releasing', category: 'the-body' },
  { topic: 'The somatic practice of orienting to safety in the present moment', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with being touched', category: 'the-body' },
  { topic: 'The physical experience of your body softening toward someone', category: 'the-body' },
  { topic: 'How your body responds to the death of the person you never forgave', category: 'the-body' },
  { topic: 'The somatic cost of performing strength when you are exhausted', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with deep breathing', category: 'the-body' },
  { topic: 'The physical practice of bilateral stimulation for processing resentment', category: 'the-body' },
  { topic: 'How your body holds the memory of every time you were not believed', category: 'the-body' },
  { topic: 'The somatic experience of your nervous system finally regulating', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with silence', category: 'the-body' },
  { topic: 'The physical sensation of your body choosing peace over protection', category: 'the-body' },
  { topic: 'How your body responds when you stop fighting what happened', category: 'the-body' },
  { topic: 'The somatic practice of pendulation between safety and activation', category: 'the-body' },
  { topic: 'How unforgiveness affects your relationship with your own heartbeat', category: 'the-body' },
  { topic: 'The physical experience of integration after somatic release', category: 'the-body' },
  { topic: 'How your body holds the wisdom of what it needs to complete the cycle', category: 'the-body' },
  { topic: 'The somatic cost of living in a body that never feels safe', category: 'the-body' },
  { topic: 'How unforgiveness affects the way you hold your hands', category: 'the-body' },
  { topic: 'The physical practice of self-massage for releasing emotional holding patterns', category: 'the-body' },
  // THE SPECIFIC (100 topics)
  { topic: 'How to forgive a parent who will never acknowledge what they did', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who has died', category: 'the-specific' },
  { topic: 'How to forgive yourself for staying too long', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving a sibling', category: 'the-specific' },
  { topic: 'How to forgive infidelity when you still love the person', category: 'the-specific' },
  { topic: 'The specific grief of forgiving a friend who chose someone else', category: 'the-specific' },
  { topic: 'How to forgive yourself for what you did when you were in survival mode', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who does not remember what they did', category: 'the-specific' },
  { topic: 'How to forgive a teacher or mentor who betrayed your trust', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for hurting your children', category: 'the-specific' },
  { topic: 'How to forgive a partner who left without explanation', category: 'the-specific' },
  { topic: 'The unique grief of forgiving someone who is still hurting others', category: 'the-specific' },
  { topic: 'How to forgive yourself for not leaving sooner', category: 'the-specific' },
  { topic: 'The specific pain of forgiving a parent with dementia', category: 'the-specific' },
  { topic: 'How to forgive someone who stole your childhood', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for an addiction', category: 'the-specific' },
  { topic: 'How to forgive a community that failed to protect you', category: 'the-specific' },
  { topic: 'The specific grief of forgiving someone you still have to see every day', category: 'the-specific' },
  { topic: 'How to forgive yourself for the person you became after the trauma', category: 'the-specific' },
  { topic: 'The unique pain of forgiving a best friend who betrayed you', category: 'the-specific' },
  { topic: 'How to forgive a parent who chose their new partner over you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for not protecting someone', category: 'the-specific' },
  { topic: 'How to forgive someone who gaslit you for years', category: 'the-specific' },
  { topic: 'The unique grief of forgiving a therapist who caused harm', category: 'the-specific' },
  { topic: 'How to forgive yourself for repeating the cycle', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who took credit for your work', category: 'the-specific' },
  { topic: 'How to forgive a parent who was never emotionally available', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for a failed marriage', category: 'the-specific' },
  { topic: 'How to forgive someone who turned others against you', category: 'the-specific' },
  { topic: 'The specific grief of forgiving a child who has cut you off', category: 'the-specific' },
  { topic: 'How to forgive yourself for not speaking up when it mattered', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who is genuinely sorry but the damage is done', category: 'the-specific' },
  { topic: 'How to forgive a system that was designed to fail you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for wasting years', category: 'the-specific' },
  { topic: 'How to forgive someone who violated your body', category: 'the-specific' },
  { topic: 'The unique grief of forgiving a parent who was also a victim', category: 'the-specific' },
  { topic: 'How to forgive yourself for the anger you showed your children', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who destroyed your reputation', category: 'the-specific' },
  { topic: 'How to forgive a partner who hid a secret life', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for not being there when someone died', category: 'the-specific' },
  { topic: 'How to forgive someone who stole your financial security', category: 'the-specific' },
  { topic: 'The specific grief of forgiving a parent who played favorites', category: 'the-specific' },
  { topic: 'How to forgive yourself for the lies you told to survive', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who weaponized your vulnerability', category: 'the-specific' },
  { topic: 'How to forgive a religious leader who abused their power', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for abandoning someone', category: 'the-specific' },
  { topic: 'How to forgive someone who ruined a milestone moment', category: 'the-specific' },
  { topic: 'The unique grief of forgiving a parent who chose substances over you', category: 'the-specific' },
  { topic: 'How to forgive yourself for not knowing what you did not know', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who never faced consequences', category: 'the-specific' },
  { topic: 'How to forgive a doctor who dismissed your pain', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for being naive', category: 'the-specific' },
  { topic: 'How to forgive someone who used your children as weapons', category: 'the-specific' },
  { topic: 'The specific grief of forgiving a twin or close sibling', category: 'the-specific' },
  { topic: 'How to forgive yourself for the opportunities you missed because of fear', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who apologized but changed nothing', category: 'the-specific' },
  { topic: 'How to forgive a boss who destroyed your career', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for your body', category: 'the-specific' },
  { topic: 'How to forgive someone who isolated you from everyone you loved', category: 'the-specific' },
  { topic: 'The unique grief of forgiving a parent who denied the abuse happened', category: 'the-specific' },
  { topic: 'How to forgive yourself for the relationship you destroyed', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who is now celebrated by others', category: 'the-specific' },
  { topic: 'How to forgive a friend who disappeared when you needed them most', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for your silence', category: 'the-specific' },
  { topic: 'How to forgive someone who made you doubt your own sanity', category: 'the-specific' },
  { topic: 'The specific grief of forgiving a parent on their deathbed', category: 'the-specific' },
  { topic: 'How to forgive yourself for becoming like the person who hurt you', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who hurt your child', category: 'the-specific' },
  { topic: 'How to forgive a culture that told you your pain was not valid', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for your jealousy', category: 'the-specific' },
  { topic: 'How to forgive someone who took advantage of your generosity', category: 'the-specific' },
  { topic: 'The unique grief of forgiving a parent who was mentally ill', category: 'the-specific' },
  { topic: 'How to forgive yourself for the things you said in anger', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who betrayed you publicly', category: 'the-specific' },
  { topic: 'How to forgive a partner who chose their family over you', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for your cowardice', category: 'the-specific' },
  { topic: 'How to forgive someone who promised to change and never did', category: 'the-specific' },
  { topic: 'The specific grief of forgiving a parent who was also your abuser', category: 'the-specific' },
  { topic: 'How to forgive yourself for not being the parent you wanted to be', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who does not think they did anything wrong', category: 'the-specific' },
  { topic: 'How to forgive a society that failed to protect the vulnerable', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for your perfectionism', category: 'the-specific' },
  { topic: 'How to forgive someone who stole your sense of safety', category: 'the-specific' },
  { topic: 'The unique grief of forgiving someone you still love deeply', category: 'the-specific' },
  { topic: 'How to forgive yourself for the years you spent numb', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who replaced you', category: 'the-specific' },
  { topic: 'How to forgive a parent who made you their emotional caretaker', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for your rage', category: 'the-specific' },
  { topic: 'How to forgive someone who broke a sacred promise', category: 'the-specific' },
  { topic: 'The specific grief of forgiving the version of yourself that allowed it', category: 'the-specific' },
  { topic: 'How to forgive yourself for not being stronger', category: 'the-specific' },
  { topic: 'The unique pain of forgiving someone who will never understand the impact', category: 'the-specific' },
  { topic: 'How to forgive a healthcare system that failed you', category: 'the-specific' },
  { topic: 'The specific challenge of forgiving yourself for your complicity', category: 'the-specific' },
  { topic: 'How to forgive someone who made you invisible', category: 'the-specific' },
  { topic: 'The unique grief of forgiving a parent who tried their best and it was not enough', category: 'the-specific' },
  { topic: 'How to forgive yourself for the love you withheld', category: 'the-specific' },
  { topic: 'The specific pain of forgiving someone who thrives while you struggle', category: 'the-specific' },
  { topic: 'How to forgive a God you feel abandoned you', category: 'the-specific' },
  { topic: 'The unique challenge of forgiving yourself for giving up on someone', category: 'the-specific' },
  // THE LIBERATION (100 topics)
  { topic: 'What actually happens in your body the moment you genuinely let go', category: 'the-liberation' },
  { topic: 'The unexpected grief that comes after real forgiveness', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with time', category: 'the-liberation' },
  { topic: 'The identity crisis that follows genuine forgiveness', category: 'the-liberation' },
  { topic: 'How real forgiveness changes the way you see the person who hurt you', category: 'the-liberation' },
  { topic: 'The surprising loneliness of having actually let go', category: 'the-liberation' },
  { topic: 'How liberation affects your relationship with other people s pain', category: 'the-liberation' },
  { topic: 'The disorientation of no longer being defined by your wound', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with anger', category: 'the-liberation' },
  { topic: 'The unexpected creativity that emerges after genuine release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your own past', category: 'the-liberation' },
  { topic: 'The physical lightness that follows emotional release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your capacity for intimacy', category: 'the-liberation' },
  { topic: 'The surprising boredom that follows the end of resentment', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with control', category: 'the-liberation' },
  { topic: 'The unexpected compassion that arises for the person who hurt you', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with boundaries', category: 'the-liberation' },
  { topic: 'The freedom of no longer needing the other person to change', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your own story', category: 'the-liberation' },
  { topic: 'The unexpected energy that returns after releasing resentment', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with trust', category: 'the-liberation' },
  { topic: 'The surprising clarity that comes after genuine release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with vulnerability', category: 'the-liberation' },
  { topic: 'The unexpected peace of accepting what cannot be changed', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with the future', category: 'the-liberation' },
  { topic: 'The surprising simplicity on the other side of forgiveness', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with joy', category: 'the-liberation' },
  { topic: 'The unexpected tenderness toward yourself after genuine release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with sleep', category: 'the-liberation' },
  { topic: 'The surprising indifference that replaces obsession after release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with solitude', category: 'the-liberation' },
  { topic: 'The unexpected humor that returns after genuine forgiveness', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with your body', category: 'the-liberation' },
  { topic: 'The surprising spaciousness in your mind after releasing a grudge', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with creativity', category: 'the-liberation' },
  { topic: 'The unexpected gratitude that arises after genuine release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with death', category: 'the-liberation' },
  { topic: 'The surprising ordinariness of life after liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with other peoples opinions', category: 'the-liberation' },
  { topic: 'The unexpected softness that replaces hardness after release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with money', category: 'the-liberation' },
  { topic: 'The surprising patience that develops after genuine forgiveness', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with nature', category: 'the-liberation' },
  { topic: 'The unexpected tears that come with genuine release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with food', category: 'the-liberation' },
  { topic: 'The surprising courage that emerges after liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with aging', category: 'the-liberation' },
  { topic: 'The unexpected stillness that follows the storm of release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with work', category: 'the-liberation' },
  { topic: 'The surprising generosity that arises after genuine release', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with spirituality', category: 'the-liberation' },
  { topic: 'The unexpected acceptance of imperfection after forgiveness', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with your parents', category: 'the-liberation' },
  { topic: 'The surprising relief of no longer performing forgiveness', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with uncertainty', category: 'the-liberation' },
  { topic: 'The unexpected wisdom that comes from having genuinely released', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with silence', category: 'the-liberation' },
  { topic: 'The surprising playfulness that returns after liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with commitment', category: 'the-liberation' },
  { topic: 'The unexpected depth of connection possible after genuine release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with pleasure', category: 'the-liberation' },
  { topic: 'The surprising self-trust that develops after liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with giving', category: 'the-liberation' },
  { topic: 'The unexpected beauty you notice after genuine release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with receiving help', category: 'the-liberation' },
  { topic: 'The surprising ease in relationships after liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your own needs', category: 'the-liberation' },
  { topic: 'The unexpected curiosity about life that returns after release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with being wrong', category: 'the-liberation' },
  { topic: 'The surprising physical changes after genuine liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with your own emotions', category: 'the-liberation' },
  { topic: 'The unexpected sense of home in your own body after release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with the present moment', category: 'the-liberation' },
  { topic: 'The surprising lack of drama after genuine liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with gratitude', category: 'the-liberation' },
  { topic: 'The unexpected capacity for love that opens after release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with your own power', category: 'the-liberation' },
  { topic: 'The surprising groundedness that comes after liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with the unknown', category: 'the-liberation' },
  { topic: 'The unexpected integration of all parts of yourself after release', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with hope', category: 'the-liberation' },
  { topic: 'The surprising ordinariness of freedom after genuine liberation', category: 'the-liberation' },
  { topic: 'How liberation changes everything you thought you knew about yourself', category: 'the-liberation' },
  { topic: 'The unexpected completeness that comes from genuine release', category: 'the-liberation' },
  { topic: 'How real forgiveness is the beginning of a life you never imagined', category: 'the-liberation' },
  { topic: 'The surprising truth that liberation is quieter than you expected', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with forgiveness itself', category: 'the-liberation' },
  { topic: 'The unexpected discovery that you are more than your wound', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with being alive', category: 'the-liberation' },
  { topic: 'The surprising gentleness toward yourself that follows liberation', category: 'the-liberation' },
  { topic: 'How liberation changes your relationship with what comes next', category: 'the-liberation' },
  { topic: 'The unexpected freedom of no longer needing to be understood', category: 'the-liberation' },
  { topic: 'How real forgiveness changes your relationship with impermanence', category: 'the-liberation' },
  { topic: 'The surprising wholeness that was always beneath the wound', category: 'the-liberation' },
  { topic: 'How liberation is not the end of the story but the real beginning', category: 'the-liberation' },
  { topic: 'The unexpected peace of having nothing left to prove', category: 'the-liberation' },
  { topic: 'How real forgiveness reveals who you actually are', category: 'the-liberation' },
  { topic: 'The life that becomes possible when you stop carrying what was never yours', category: 'the-liberation' },
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

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text) {
  const stripped = stripHtml(text);
  return stripped ? stripped.split(/\s+/).length : 0;
}

function localQualityGate(body) {
  const failures = [];

  // Fix em-dashes
  let cleaned = body.replace(/[\u2014\u2013]/g, ' - ');
  // Strip markdown code fences
  cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');

  // Word count: MINIMUM 1800 for pre-seed
  const words = countWords(cleaned);
  if (words < 1800) failures.push(`word-count-too-low:${words}`);
  if (words > 3000) failures.push(`word-count-too-high:${words}`);

  // Amazon links: exactly 3 or 4
  const links = (cleaned.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g) || []).length;
  if (links < 3) failures.push(`amazon-links-too-few:${links}`);
  if (links > 4) failures.push(`amazon-links-too-many:${links}`);

  // Banned words
  const lower = stripHtml(cleaned).toLowerCase();
  for (const word of BANNED_WORDS) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) {
      failures.push(`banned-word:${word}`);
    }
  }

  // Banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      failures.push(`banned-phrase:${phrase}`);
    }
  }

  // Em-dash survived
  if (cleaned.includes('\u2014') || cleaned.includes('\u2013')) {
    failures.push('em-dash-survived');
  }

  // Direct address check
  if (!/\byou\b/i.test(stripHtml(cleaned))) {
    failures.push('no-direct-address');
  }

  return { passed: failures.length === 0, failures, wordCount: words, cleaned };
}

async function generateArticle(topic, category, products) {
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

  const userPrompt = `Write a 1800-2400 word article about: "${topic}"

Category: ${category}

Requirements:
1. Write in HTML format (use <p>, <h2>, <h3>, <ul>, <li>, <blockquote> tags)
2. Include exactly ${products.length} Amazon affiliate links naturally woven into the text. Here are the links to include:
${productLinks.map((l, i) => `   ${i + 1}. ${l}`).join('\n')}
3. Start with a compelling hook - no generic opener
4. Use 2-3 dialogue markers naturally ("Right?!", "Know what I mean?", "Does that land?", "Here's the thing")
5. Vary sentence length dramatically (some 3-5 words, some 20+)
6. End with something that lands emotionally, not a summary
7. Do NOT use any banned words or phrases listed above
8. Use " - " (space-hyphen-space) instead of em-dashes
9. MINIMUM 1800 words, MAXIMUM 2400 words. This is non-negotiable.
10. Output ONLY HTML. No markdown, no code fences, no preamble.
11. CRITICAL: Do NOT use these words anywhere: framework, landscape, navigate, transformative, resonate, unlock, profound, holistic, nuanced, multifaceted, comprehensive, robust, beacon, foster, elevate, curate, bespoke, harness, intricate, plethora, myriad, groundbreaking, innovative, game-changer, stakeholders, ecosystem, paradigm, synergy, leverage, empower, pivotal, embark, underscore, paramount, seamlessly, furthermore, utilize, delve, tapestry, cutting-edge, state-of-the-art, ever-evolving, rapidly-evolving.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.72,
    max_tokens: 8000
  });

  return response.choices[0].message.content;
}

async function processOne(topicObj, existingSlugs) {
  const { topic, category } = topicObj;
  const slug = slugify(topic);

  if (existingSlugs.has(slug)) {
    return { status: 'skipped', slug };
  }

  const products = pickAsins(Math.random() < 0.5 ? 3 : 4);

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const raw = await generateArticle(topic, category, products);
      const gate = localQualityGate(raw);

      if (gate.passed) {
        // Assign Bunny CDN hero image
        const heroUrl = await assignHeroImage(slug);

        const now = new Date().toISOString();
        const article = {
          slug,
          title: topic,
          metaTitle: `${topic} | The Unforgiven`,
          metaDescription: `Kalesh explores ${topic.toLowerCase()} - a raw, honest look at what it takes to actually let go.`,
          category,
          dateISO: now.split('T')[0],
          readingTime: `${Math.ceil(gate.wordCount / 238)} min read`,
          heroAlt: topic,
          body: gate.cleaned,
          faqs: [],
          toc: [],
          excerpt: gate.cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) + '...',
          heroImage: heroUrl,
          ogImage: heroUrl,
          hasAffiliateLinks: true,
          status: 'queued',
          queued_at: now,
          published_at: null
        };

        return { status: 'generated', slug, article, wordCount: gate.wordCount };
      } else {
        console.log(`  [${slug}] Attempt ${attempt} failed: ${gate.failures.join(', ')}`);
      }
    } catch (err) {
      console.error(`  [${slug}] Attempt ${attempt} error: ${err.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  return { status: 'failed', slug };
}

async function main() {
  console.log('[preseed-500] Starting one-time 500-article pre-seed...');
  console.log(`[preseed-500] Model: ${MODEL}`);
  console.log(`[preseed-500] Topics: ${TOPICS.length}`);
  console.log(`[preseed-500] Min word count: 1800`);

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  const existingSlugs = new Set(articles.map(a => a.slug));

  let generated = 0;
  let failed = 0;
  let skipped = 0;

  // Process in batches of 5 for concurrency
  const BATCH_SIZE = 5;

  for (let i = 0; i < TOPICS.length; i += BATCH_SIZE) {
    const batch = TOPICS.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(TOPICS.length / BATCH_SIZE);

    console.log(`\n[preseed-500] Batch ${batchNum}/${totalBatches} (articles ${i + 1}-${Math.min(i + BATCH_SIZE, TOPICS.length)})`);

    const results = await Promise.all(
      batch.map(t => processOne(t, existingSlugs))
    );

    for (const result of results) {
      if (result.status === 'generated') {
        articles.push(result.article);
        existingSlugs.add(result.slug);
        generated++;
        console.log(`  ✓ ${result.slug} (${result.wordCount} words)`);
      } else if (result.status === 'skipped') {
        skipped++;
      } else {
        failed++;
        console.log(`  ✗ FAILED: ${result.slug}`);
      }
    }

    // Save checkpoint every 5 batches (25 articles)
    if (batchNum % 5 === 0 || i + BATCH_SIZE >= TOPICS.length) {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 0));
      console.log(`  [checkpoint] Saved. Generated: ${generated}, Failed: ${failed}, Skipped: ${skipped}`);
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < TOPICS.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Final save
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 0));
  
  console.log(`\n[preseed-500] ═══════════════════════════════════`);
  console.log(`[preseed-500] COMPLETE`);
  console.log(`[preseed-500]   Generated: ${generated}`);
  console.log(`[preseed-500]   Failed: ${failed}`);
  console.log(`[preseed-500]   Skipped: ${skipped}`);
  console.log(`[preseed-500]   Total articles in file: ${articles.length}`);
  console.log(`[preseed-500]   Published: ${articles.filter(a => a.status === 'published').length}`);
  console.log(`[preseed-500]   Queued: ${articles.filter(a => a.status === 'queued').length}`);
  console.log(`[preseed-500] ═══════════════════════════════════`);
}

main().catch(err => {
  console.error('[preseed-500] Fatal error:', err);
  process.exit(1);
});
