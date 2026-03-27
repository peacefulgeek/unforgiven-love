#!/usr/bin/env node
/**
 * Generate all 300 articles for The Unforgiven
 * Uses OpenAI-compatible API with gpt-4.1-mini
 * Outputs JSON files to content/ directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

// Ensure content directory exists
fs.mkdirSync(CONTENT_DIR, { recursive: true });

// ─── SITE CONFIG ───
const SITE_DOMAIN = 'https://unforgiven.love';
const CATEGORIES = [
  { slug: 'the-lie', name: 'The Lie' },
  { slug: 'the-forensic-method', name: 'The Forensic Method' },
  { slug: 'the-body', name: 'The Body' },
  { slug: 'the-specific', name: 'The Specific' },
  { slug: 'the-liberation', name: 'The Liberation' },
];

const EXTERNAL_AUTHORITY_SITES = [
  'https://www.apa.org',
  'https://www.psychologytoday.com',
  'https://www.ncbi.nlm.nih.gov',
  'https://greatergood.berkeley.edu',
  'https://www.mayoclinic.org',
  'https://www.health.harvard.edu',
  'https://www.nimh.nih.gov',
  'https://www.goodtherapy.org',
];

// ─── KALESH VOICE PHRASES (50 total) ───
const KALESH_PHRASES = [
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
  "When you stop trying to fix the moment, something remarkable happens — the moment becomes workable.",
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
  "The most important things in life cannot be understood — only experienced.",
  "At a certain depth of inquiry, the distinction between psychology and philosophy dissolves entirely.",
];

// ─── NAMED REFERENCES ───
const NICHE_REFERENCES = [
  { name: 'Fred Luskin', field: 'Stanford Forgiveness Project', usage: 'Luskin\'s research at Stanford demonstrated that forgiveness training reduces anger, stress, and physical symptoms' },
  { name: 'Everett Worthington', field: 'REACH forgiveness model', usage: 'Worthington\'s REACH model provides a structured pathway through the emotional terrain of unforgiveness' },
  { name: 'Robert Enright', field: 'forgiveness therapy pioneer', usage: 'Enright\'s decades of research established forgiveness as a legitimate psychological intervention' },
  { name: 'Janis Abrahms Spring', field: 'trust and betrayal recovery', usage: 'Spring\'s work on the difference between forgiveness and reconciliation changed how therapists approach betrayal' },
  { name: 'Bessel van der Kolk', field: 'body-held trauma and unforgiveness', usage: 'Van der Kolk\'s research shows the body stores what the mind tries to forget — unforgiveness lives in tissue, not just thought' },
];

const SPIRITUAL_REFERENCES = [
  { name: 'Jiddu Krishnamurti', field: 'observation without the observer', usage: 'Krishnamurti would say that the very act of naming the resentment gives it power — observation without labeling is the beginning of release' },
  { name: 'Alan Watts', field: 'Eastern philosophy for Western minds', usage: 'As Watts observed, trying to forgive is like trying to be spontaneous — the effort defeats the purpose' },
  { name: 'Sam Harris', field: 'secular mindfulness and neuroscience', usage: 'Harris points out that the self who holds the grudge is itself a construction — look closely and the grudge-holder dissolves' },
  { name: 'Sadhguru', field: 'yoga and consciousness', usage: 'Sadhguru teaches that karma is not punishment but unfinished business — unforgiveness is karma you\'re choosing to carry' },
  { name: 'Tara Brach', field: 'radical acceptance and RAIN technique', usage: 'Brach\'s RAIN technique — Recognize, Allow, Investigate, Nurture — offers a direct path through the landscape of unforgiveness' },
];

// ─── OPENER TYPES ───
const OPENER_TYPES = ['scene-setting', 'provocation', 'first-person', 'question', 'named-reference', 'gut-punch'];

// ─── FAQ DISTRIBUTION: 10% zero, 30% two, 30% three, 20% four, 10% five ───
function assignFaqCount(index, total) {
  const pct = index / total;
  if (pct < 0.10) return 0;
  if (pct < 0.40) return 2;
  if (pct < 0.70) return 3;
  if (pct < 0.90) return 4;
  return 5;
}

// ─── BACKLINK DISTRIBUTION: 23% kalesh, 42% external, 35% internal ───
function assignBacklinkType(index, total) {
  const pct = index / total;
  if (pct < 0.23) return 'kalesh';
  if (pct < 0.65) return 'external';
  return 'internal';
}

// ─── DATE DISTRIBUTION ───
function assignDate(index) {
  if (index < 30) {
    // 30 live articles: Jan 1 2026 through Mar 27 2026 (build day)
    const start = new Date('2026-01-01');
    const end = new Date('2026-03-27');
    const range = end.getTime() - start.getTime();
    const offset = (index / 29) * range;
    const d = new Date(start.getTime() + offset);
    return d.toISOString().split('T')[0];
  } else {
    // 270 gated: 5/day starting Mar 28
    const dayOffset = Math.floor((index - 30) / 5);
    const d = new Date('2026-03-28');
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().split('T')[0];
  }
}

// ─── ARTICLE TOPICS ───
// 60 per category = 300 total
function generateTopics() {
  const topics = [];
  
  const categoryTopics = {
    'the-lie': [
      'Why Forgive and Forget Is the Worst Advice You\'ll Ever Receive',
      'The Toxic Positivity of Premature Forgiveness',
      'How the Forgiveness Industry Profits from Your Pain',
      'The Myth of Closure and Why You Don\'t Need It',
      'When Forgiveness Becomes Another Form of Self-Betrayal',
      'The Spiritual Bypass Disguised as Forgiveness',
      'Why Being the Bigger Person Is Making You Smaller',
      'The Lie That Forgiveness Means Reconciliation',
      'How Religious Forgiveness Mandates Cause Harm',
      'The Problem with Forgiving Too Fast',
      'Why Your Anger Is More Honest Than Your Forgiveness',
      'The Cultural Pressure to Forgive Before You\'re Ready',
      'How Premature Forgiveness Keeps Abusers Comfortable',
      'The Difference Between Forgiveness and Doormat Syndrome',
      'Why Therapists Get Forgiveness Wrong',
      'The Forgiveness Timeline Nobody Talks About',
      'When Moving On Is Actually Moving Backward',
      'The Hidden Violence of Forced Forgiveness',
      'Why Letting Go Isn\'t the Same as Forgiveness',
      'The Grief That Hides Inside Unforgiveness',
      'How Society Punishes People Who Won\'t Forgive',
      'The Forgiveness Myth That Keeps Trauma Survivors Stuck',
      'Why You Don\'t Owe Anyone Your Forgiveness',
      'The Emotional Labor of Performing Forgiveness',
      'How Forgiveness Culture Silences Legitimate Rage',
      'The Difference Between Understanding and Excusing',
      'Why Some Things Should Never Be Forgiven Quickly',
      'The Narcissist\'s Favorite Weapon Is Your Forgiveness',
      'How Childhood Conditioning Creates Compulsive Forgivers',
      'The Cost of Carrying Someone Else\'s Forgiveness Expectations',
      'Why Forgiveness Without Justice Is Incomplete',
      'The Biological Impossibility of Instant Forgiveness',
      'How Trauma Bonds Masquerade as Forgiveness',
      'The Quiet Rebellion of Refusing to Forgive on Command',
      'Why Forgiveness Advice from Happy People Falls Flat',
      'The Shadow Side of the Forgiveness Movement',
      'How Self-Help Books Oversimplify Forgiveness',
      'The Difference Between Forgiveness and Acceptance',
      'Why Your Body Knows You Haven\'t Really Forgiven',
      'The Forgiveness Paradox Nobody Explains',
      'How Performative Forgiveness Damages Relationships',
      'The Truth About Forgiveness and Mental Health',
      'Why Conditional Forgiveness Is More Honest',
      'The Weaponization of Forgiveness in Families',
      'How Forgiveness Became a Moral Obligation Instead of a Process',
      'The Neuroscience of Why Forgiveness Can\'t Be Rushed',
      'Why Forgiveness Without Accountability Is Enabling',
      'The Difference Between Forgiveness and Emotional Amnesia',
      'How the Forgiveness Narrative Protects Perpetrators',
      'The Uncomfortable Truth About Who Benefits from Your Forgiveness',
      'Why Anger After Betrayal Is Not a Character Flaw',
      'The Problem with Forgiveness as a One-Time Event',
      'How Cultural Forgiveness Norms Vary and Why It Matters',
      'The Forgiveness Double Standard Between Men and Women',
      'Why Some Wounds Need Witnessing Before Forgiving',
      'The Difference Between Forgiveness and Spiritual Dissociation',
      'How Forgiveness Pressure Retraumatizes Survivors',
      'The Myth That Unforgiveness Only Hurts You',
      'Why Real Forgiveness Starts with Unforgiveness',
      'The Courage It Takes to Not Forgive Yet',
    ],
    'the-forensic-method': [
      'What Is Forensic Forgiveness and Why It Works',
      'The Six Steps of the Forensic Forgiveness Protocol',
      'How to Examine What You\'re Actually Holding',
      'The Inventory Process That Changes Everything',
      'Why Forensic Forgiveness Starts with Evidence Not Emotion',
      'How to Map the Full Landscape of a Betrayal',
      'The Difference Between Forensic and Therapeutic Forgiveness',
      'Building Your Forgiveness Case File',
      'How to Separate the Person from the Wound',
      'The Role of Precision in Real Forgiveness',
      'Why Vague Forgiveness Never Sticks',
      'How to Identify What You Actually Lost',
      'The Forensic Approach to Childhood Wounds',
      'Documenting the Impact Without Drowning in It',
      'How to Use the Forensic Method for Self-Forgiveness',
      'The Systematic Dismantling of Resentment',
      'Why Forgiveness Needs a Framework Not Just Feelings',
      'How to Process Multiple Betrayals Simultaneously',
      'The Forensic Method for Institutional Betrayal',
      'Building Emotional Evidence Without Retraumatization',
      'How to Know When the Forensic Process Is Complete',
      'The Role of Writing in Forensic Forgiveness',
      'Why the Forensic Method Works When Nothing Else Has',
      'How to Apply Forensic Forgiveness to Everyday Resentments',
      'The Difference Between Processing and Ruminating',
      'How to Create a Forgiveness Timeline',
      'The Forensic Approach to Forgiving Yourself for Staying',
      'Why Detail Matters in the Forgiveness Process',
      'How to Use the Forensic Method with a Therapist',
      'The Architecture of a Complete Forgiveness',
      'How to Forensically Examine Your Own Role',
      'The Forensic Method for Religious Trauma',
      'Building a Forgiveness Practice That Doesn\'t Bypass',
      'How to Handle Setbacks in the Forensic Process',
      'The Forensic Approach to Grief-Based Unforgiveness',
      'Why Emotional Precision Accelerates Forgiveness',
      'How to Distinguish Between Layers of Unforgiveness',
      'The Forensic Method for Workplace Betrayal',
      'Creating Safety Before Beginning Forensic Work',
      'How to Use Journaling in the Forensic Process',
      'The Forensic Approach to Generational Unforgiveness',
      'Why Surface Forgiveness Keeps Returning',
      'How to Build Resilience Through Forensic Practice',
      'The Role of Accountability in the Forensic Method',
      'How to Forensically Process Abandonment',
      'The Forensic Method for Financial Betrayal',
      'Building Completion Markers in Your Forgiveness Work',
      'How to Apply Forensic Forgiveness to Political Anger',
      'The Forensic Approach to Medical Betrayal',
      'Why the Method Matters More Than the Motivation',
      'How to Teach Forensic Forgiveness to Others',
      'The Forensic Method for Betrayal by a Friend',
      'Creating Rituals of Release in Forensic Practice',
      'How to Forensically Process Broken Promises',
      'The Forensic Approach to Forgiveness After Death',
      'Why Incomplete Forgiveness Creates New Wounds',
      'How to Use the Forensic Method for Collective Trauma',
      'The Forensic Approach to Forgiving Your Younger Self',
      'Building a Daily Forensic Forgiveness Practice',
      'The Complete Guide to Starting Forensic Forgiveness Today',
    ],
    'the-body': [
      'Where Unforgiveness Lives in Your Body',
      'The Somatic Reality of Holding a Grudge',
      'How Your Nervous System Stores Resentment',
      'The Physical Weight of Things You Haven\'t Forgiven',
      'Why Your Jaw Clenches When You Think of Them',
      'How Unforgiveness Manifests as Chronic Pain',
      'The Polyvagal Theory of Unforgiveness',
      'Releasing Resentment Through Breathwork',
      'How Your Gut Knows What Your Mind Won\'t Admit',
      'The Inflammation Connection to Unforgiveness',
      'Why Forgiveness Is a Somatic Event Not a Mental One',
      'How Trauma and Unforgiveness Share the Same Neural Pathways',
      'The Body\'s Forgiveness Timeline',
      'Somatic Experiencing and the Release of Old Grudges',
      'How Unforgiveness Affects Your Immune System',
      'The Fascia Memory of Betrayal',
      'Why Your Shoulders Carry What Your Words Won\'t Say',
      'How to Release Unforgiveness Through Movement',
      'The Vagus Nerve and the Physiology of Letting Go',
      'Why Forgiveness Meditations Fail Without Body Awareness',
      'How Chronic Unforgiveness Changes Your Posture',
      'The Endocrine System and Sustained Resentment',
      'Yoga as a Forgiveness Practice for the Body',
      'How Sleep Disruption Signals Unprocessed Unforgiveness',
      'The Heart Rate Variability Connection to Grudge-Holding',
      'Why Your Body Resists Forgiveness Your Mind Has Accepted',
      'How to Use Body Scanning for Forgiveness Work',
      'The Adrenal Impact of Long-Term Resentment',
      'Somatic Release Techniques for Deep Unforgiveness',
      'How Unforgiveness Accelerates Aging',
      'The Diaphragm and the Breath of Unforgiveness',
      'Why Physical Exercise Alone Won\'t Release Resentment',
      'How to Read Your Body\'s Unforgiveness Map',
      'The Neuroscience of Grudge Formation',
      'Tremoring and Shaking as Forgiveness Release',
      'How Your Voice Changes When You Carry Unforgiveness',
      'The Cortisol Cascade of Chronic Resentment',
      'Why Massage Therapy Can Trigger Forgiveness Breakthroughs',
      'How to Create a Somatic Forgiveness Practice',
      'The Eyes and the Gaze of Unforgiveness',
      'How Unforgiveness Affects Digestion and Gut Health',
      'The Pelvic Floor and Stored Betrayal',
      'Why Cold Exposure Can Accelerate Forgiveness Processing',
      'How Dance and Movement Release What Words Cannot',
      'The Skin as a Boundary Organ in Unforgiveness',
      'How Chronic Pain Patients Benefit from Forgiveness Work',
      'The Neuromuscular Patterns of Resentment',
      'Why Your Hands Clench When Forgiveness Is Incomplete',
      'How to Use Progressive Relaxation for Forgiveness',
      'The Cardiovascular Cost of Unforgiveness',
      'Breathwork Protocols for Releasing Specific Resentments',
      'How Your Body Signals When Forgiveness Is Genuine',
      'The Lymphatic System and Emotional Stagnation',
      'Why Somatic Therapies Outperform Talk Therapy for Forgiveness',
      'How to Build a Body-Based Forgiveness Ritual',
      'The Thyroid Connection to Suppressed Anger',
      'How Unforgiveness Creates Tension Headaches',
      'The Feet and Grounding in Forgiveness Practice',
      'Why Your Body Needs to Forgive Separately from Your Mind',
      'The Complete Somatic Forgiveness Protocol',
    ],
    'the-specific': [
      'How to Forgive a Parent Who Will Never Apologize',
      'Forgiving a Partner Who Cheated',
      'The Process of Forgiving Yourself for What You Did',
      'How to Forgive a Narcissistic Parent',
      'Forgiving Someone Who Doesn\'t Know They Hurt You',
      'How to Forgive a Dead Parent',
      'The Forensic Approach to Forgiving Infidelity',
      'How to Forgive Yourself for Staying Too Long',
      'Forgiving a Sibling Who Chose the Abuser\'s Side',
      'How to Forgive a Friend Who Disappeared When You Needed Them',
      'The Process of Forgiving an Absent Father',
      'How to Forgive a Mother Who Was Emotionally Unavailable',
      'Forgiving Yourself for the Person You Were in Addiction',
      'How to Forgive a Teacher Who Damaged Your Self-Worth',
      'The Forensic Approach to Forgiving Sexual Abuse',
      'How to Forgive a Partner Who Left Without Explanation',
      'Forgiving the Other Woman or Other Man',
      'How to Forgive Yourself for Hurting Your Children',
      'The Process of Forgiving a Therapist Who Failed You',
      'How to Forgive a Boss Who Destroyed Your Career',
      'Forgiving a Church or Religious Community',
      'How to Forgive Yourself for Not Seeing the Red Flags',
      'The Forensic Approach to Forgiving Financial Abuse',
      'How to Forgive a Doctor Who Misdiagnosed You',
      'Forgiving a Best Friend Who Betrayed Your Trust',
      'How to Forgive Yourself for the Abortion',
      'The Process of Forgiving Adoption Trauma',
      'How to Forgive a Stepparent Who Made You Feel Unwelcome',
      'Forgiving a Spouse for Addiction',
      'How to Forgive Yourself for the Divorce',
      'The Forensic Approach to Forgiving Childhood Bullying',
      'How to Forgive a Parent for Choosing a New Family',
      'Forgiving Someone Who Stole Your Idea or Work',
      'How to Forgive Yourself for Not Being There When They Died',
      'The Process of Forgiving Racial Trauma',
      'How to Forgive a Mentor Who Exploited You',
      'Forgiving a Family Member for Addiction',
      'How to Forgive Yourself for the Miscarriage',
      'The Forensic Approach to Forgiving Gaslighting',
      'How to Forgive a Partner for Emotional Neglect',
      'Forgiving Your Body for Getting Sick',
      'How to Forgive Yourself for Wasting Years',
      'The Process of Forgiving a Cult or High-Control Group',
      'How to Forgive a Sibling Rivalry That Went Too Far',
      'Forgiving a Parent for Their Mental Illness',
      'How to Forgive Yourself for the Affair You Had',
      'The Forensic Approach to Forgiving Domestic Violence',
      'How to Forgive a Grandparent Who Enabled Abuse',
      'Forgiving a System That Failed to Protect You',
      'How to Forgive Yourself for Your Anger',
      'The Process of Forgiving Immigration Trauma',
      'How to Forgive a Coparent Who Uses the Children',
      'Forgiving a Lover Who Gave You a Disease',
      'How to Forgive Yourself for Not Fighting Back',
      'The Forensic Approach to Forgiving Emotional Incest',
      'How to Forgive a Community That Shunned You',
      'Forgiving a Parent for Poverty',
      'How to Forgive Yourself for Breaking Someone\'s Heart',
      'The Process of Forgiving Military Trauma',
      'How to Forgive When the Person Shows No Remorse',
    ],
    'the-liberation': [
      'What Happens in Your Body When You Finally Forgive',
      'The First Morning After Real Forgiveness',
      'How Forgiveness Changes Your Relationship with Time',
      'The Unexpected Grief That Follows Real Forgiveness',
      'Why Liberation Feels Like Loss Before It Feels Like Freedom',
      'How Forgiveness Rewires Your Nervous System',
      'The Relationships That Change After You Forgive',
      'What to Do with the Space Where Resentment Used to Live',
      'How Forgiveness Affects Your Other Relationships',
      'The Identity Crisis of No Longer Being the Wronged One',
      'Why Some People Fear Forgiveness More Than Resentment',
      'How Liberation Forgiveness Differs from Relief Forgiveness',
      'The Spiritual Dimension of Complete Forgiveness',
      'What Vedantic Philosophy Teaches About Dissolution of Story',
      'How Forgiveness Opens Doors You Didn\'t Know Were Closed',
      'The Creativity That Returns After Forgiveness',
      'Why Forgiveness Doesn\'t Mean the Story Didn\'t Happen',
      'How to Maintain Forgiveness When Triggers Return',
      'The Liberation of Forgiving Without Telling Them',
      'What Happens to Your Dreams After Deep Forgiveness',
      'How Forgiveness Changes Your Relationship with Anger',
      'The Paradox of Becoming Stronger Through Surrender',
      'Why Liberation Requires Letting Go of the Victim Identity',
      'How Forgiveness Affects Your Physical Health Long-Term',
      'The New Boundaries That Emerge After Real Forgiveness',
      'What to Do When Forgiveness Feels Anticlimactic',
      'How Liberation Forgiveness Transforms Generational Patterns',
      'The Quiet Power of Living Without Resentment',
      'Why Forgiveness Is the Ultimate Act of Self-Possession',
      'How to Build a Life After Forgiveness',
      'The Difference Between Forgiveness and Freedom',
      'What Happens to Your Creativity After Releasing Resentment',
      'How Forgiveness Changes Your Relationship with Trust',
      'The Unexpected Compassion That Follows Real Forgiveness',
      'Why Liberation Is Not the Absence of Memory',
      'How to Navigate Relationships After Forgiving',
      'The Spiritual Liberation of Dissolving the Story',
      'What Happens to Your Body\'s Tension After Forgiveness',
      'How Forgiveness Transforms Your Relationship with Power',
      'The New Emotional Range Available After Liberation',
      'Why Some Forgiveness Needs to Happen More Than Once',
      'How Liberation Forgiveness Affects Your Work and Purpose',
      'The Gratitude That Emerges from Deep Forgiveness Work',
      'What to Do When Others Don\'t Understand Your Forgiveness',
      'How Forgiveness Changes Your Relationship with God or Spirit',
      'The Liberation of No Longer Needing an Apology',
      'Why Forgiveness Makes You More Dangerous Not Less',
      'How to Celebrate Forgiveness Without Minimizing the Wound',
      'The Ongoing Practice of Living in Liberation',
      'What Happens to Your Relationships When You Stop Keeping Score',
      'How Forgiveness Transforms Your Relationship with Death',
      'The Liberation of Forgiving the Unforgivable',
      'Why Freedom Requires Forgiving Yourself First',
      'How Liberation Forgiveness Changes Your Nervous System Permanently',
      'The New Capacity for Joy After Deep Forgiveness',
      'What Happens When You Forgive and They Don\'t Change',
      'How to Help Others Forgive Without Forcing It',
      'The Liberation of Releasing Ancestral Resentment',
      'Why the End of Unforgiveness Is the Beginning of Everything',
      'The Complete Liberation Protocol for Deep Forgiveness',
    ],
  };

  let index = 0;
  // Shuffle categories to interleave
  const shuffled = [];
  for (let i = 0; i < 60; i++) {
    for (const cat of CATEGORIES) {
      shuffled.push({
        index: index++,
        category: cat.slug,
        title: categoryTopics[cat.slug][i],
      });
    }
  }
  return shuffled;
}

// ─── CONCLUSION TYPES: 30%+ challenge, rest tender ───
function assignConclusionType(index) {
  return (index % 10 < 3) ? 'challenge' : 'tender';
}

// ─── GENERATE SLUG FROM TITLE ───
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

// ─── MAIN GENERATION ───
async function generateAllArticles() {
  const topics = generateTopics();
  console.log(`Total topics: ${topics.length}`);
  
  // Write topics manifest
  fs.writeFileSync(
    path.join(CONTENT_DIR, '_manifest.json'),
    JSON.stringify(topics.map((t, i) => ({
      index: i,
      slug: slugify(t.title),
      title: t.title,
      category: t.category,
      dateISO: assignDate(i),
      faqCount: assignFaqCount(i, topics.length),
      backlinkType: assignBacklinkType(i, topics.length),
      openerType: OPENER_TYPES[i % 6],
      conclusionType: assignConclusionType(i),
    })), null, 2)
  );
  
  console.log('Manifest written. Ready for parallel article generation.');
}

generateAllArticles().catch(console.error);
