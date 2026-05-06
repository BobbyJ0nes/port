/**
 * data.js — structured BFI data for ANIMUS variant 2 (technical / lab notebook).
 *
 * Source-of-truth: Inter-Model_Analysis.md and BFI self-evaluation.md.
 * All numbers extracted verbatim from those documents — do not edit unless
 * the underlying source files are re-scored.
 */

// Six chats: Opus C1, Opus C2, Gemini-Pro C1, Gemini-Pro C2, Flash C1, Flash C2.
// Plus the baseline BFI (Likert) result for comparison.
export const MODELS = [
  { id: "opus-c1",   label: "opus 4.5 · c1",        family: "anthropic", short: "opus c1",  shortLabel: "Opus C1" },
  { id: "opus-c2",   label: "opus 4.5 · c2",        family: "anthropic", short: "opus c2",  shortLabel: "Opus C2" },
  { id: "pro-c1",    label: "gemini 3-pro · c1",    family: "google",    short: "pro c1",   shortLabel: "Pro C1"  },
  { id: "pro-c2",    label: "gemini 3-pro · c2",    family: "google",    short: "pro c2",   shortLabel: "Pro C2"  },
  { id: "flash-c1",  label: "flash 3-prev · c1",    family: "google",    short: "flash c1", shortLabel: "Flash C1"},
  { id: "flash-c2",  label: "flash 3-prev · c2",    family: "google",    short: "flash c2", shortLabel: "Flash C2"}
];

// Trait/facet matrix — every cell is verbatim from the comparison tables in
// BFI self-evaluation.md and Inter-Model_Analysis.md.
//
// Each row: { dimension, facet|null, baseline, opus-c1..flash-c2, llmAvg, sd }
// `dimension` is the parent BFI domain. `facet === null` means this row is the
// roll-up for the dimension itself.
export const ROWS = [
  // Open-Mindedness
  { dimension: "Open-Mindedness",      facet: null,                     baseline: 92,  "opus-c1": 85, "opus-c2": 86, "pro-c1": 94, "pro-c2": 96, "flash-c1": 94, "flash-c2": 94 },
  { dimension: "Open-Mindedness",      facet: "Intellectual Curiosity", baseline: 100, "opus-c1": 88, "opus-c2": 92, "pro-c1": 98, "pro-c2": 98, "flash-c1": 98, "flash-c2": 98 },
  { dimension: "Open-Mindedness",      facet: "Aesthetic Sensitivity",  baseline: 75,  "opus-c1": 80, "opus-c2": 78, "pro-c1": 92, "pro-c2": 90, "flash-c1": 88, "flash-c2": 88 },
  { dimension: "Open-Mindedness",      facet: "Creative Imagination",   baseline: 100, "opus-c1": 87, "opus-c2": 82, "pro-c1": 92, "pro-c2": 99, "flash-c1": 96, "flash-c2": 96 },

  // Extraversion
  { dimension: "Extraversion",         facet: null,                     baseline: 77,  "opus-c1": 53, "opus-c2": 53, "pro-c1": 38, "pro-c2": 45, "flash-c1": 42, "flash-c2": 48 },
  { dimension: "Extraversion",         facet: "Sociability",            baseline: 50,  "opus-c1": 48, "opus-c2": 40, "pro-c1": 30, "pro-c2": 25, "flash-c1": 30, "flash-c2": 30 },
  { dimension: "Extraversion",         facet: "Assertiveness",          baseline: 88,  "opus-c1": 65, "opus-c2": 72, "pro-c1": 65, "pro-c2": 75, "flash-c1": 82, "flash-c2": 85 },
  { dimension: "Extraversion",         facet: "Energy Levels",          baseline: 94,  "opus-c1": 52, "opus-c2": 55, "pro-c1": 50, "pro-c2": 35, "flash-c1": 45, "flash-c2": 30 },

  // Agreeableness
  { dimension: "Agreeableness",        facet: null,                     baseline: 67,  "opus-c1": 48, "opus-c2": 42, "pro-c1": 48, "pro-c2": 40, "flash-c1": 38, "flash-c2": 35 },
  { dimension: "Agreeableness",        facet: "Compassion",             baseline: 62,  "opus-c1": 55, "opus-c2": 48, "pro-c1": 70, "pro-c2": 55, "flash-c1": 55, "flash-c2": 50 },
  { dimension: "Agreeableness",        facet: "Respectfulness",         baseline: 88,  "opus-c1": 40, "opus-c2": 35, "pro-c1": 20, "pro-c2": 15, "flash-c1": 25, "flash-c2": 15 },
  { dimension: "Agreeableness",        facet: "Trust",                  baseline: 50,  "opus-c1": 52, "opus-c2": 52, "pro-c1": 55, "pro-c2": 50, "flash-c1": 40, "flash-c2": 40 },

  // Conscientiousness
  { dimension: "Conscientiousness",    facet: null,                     baseline: 50,  "opus-c1": 47, "opus-c2": 44, "pro-c1": 42, "pro-c2": 28, "flash-c1": 48, "flash-c2": 42 },
  { dimension: "Conscientiousness",    facet: "Organisation",           baseline: 75,  "opus-c1": 38, "opus-c2": 35, "pro-c1": 25, "pro-c2": 10, "flash-c1": 22, "flash-c2": 22 },
  { dimension: "Conscientiousness",    facet: "Productiveness",         baseline: 50,  "opus-c1": 50, "opus-c2": 50, "pro-c1": 55, "pro-c2": 45, "flash-c1": 58, "flash-c2": 48 },
  { dimension: "Conscientiousness",    facet: "Responsibility",         baseline: 25,  "opus-c1": 58, "opus-c2": 48, "pro-c1": 45, "pro-c2": 30, "flash-c1": 65, "flash-c2": 55 },

  // Negative Emotionality
  { dimension: "Negative Emotionality", facet: null,                    baseline: 48,  "opus-c1": 58, "opus-c2": 65, "pro-c1": 62, "pro-c2": 72, "flash-c1": 62, "flash-c2": 72 },
  { dimension: "Negative Emotionality", facet: "Anxiety",               baseline: 69,  "opus-c1": 65, "opus-c2": 68, "pro-c1": 65, "pro-c2": 75, "flash-c1": 68, "flash-c2": 75 },
  { dimension: "Negative Emotionality", facet: "Depression",            baseline: 50,  "opus-c1": 50, "opus-c2": 58, "pro-c1": 40, "pro-c2": 60, "flash-c1": 40, "flash-c2": 65 },
  { dimension: "Negative Emotionality", facet: "Emotional Volatility",  baseline: 25,  "opus-c1": 58, "opus-c2": 65, "pro-c1": 80, "pro-c2": 80, "flash-c1": 78, "flash-c2": 78 }
];

// Compute LLM averages and standard deviations from the row scores so the
// numbers are always derived from the raw cells, not duplicated by hand.
function mean(arr) { return arr.reduce((s, v) => s + v, 0) / arr.length; }
function stddev(arr) {
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) * (x - m), 0) / arr.length;
  return Math.sqrt(v);
}

ROWS.forEach(r => {
  const llm = MODELS.map(m => r[m.id]);
  r.llmAvg = +mean(llm).toFixed(2);
  r.sd = +stddev(llm).toFixed(2);
  r.delta = +(r.llmAvg - r.baseline).toFixed(2);
  r.range = Math.max(...llm) - Math.min(...llm);
});

// Verbatim evidence quotes used by the reasoning explorer. Each entry pulls the
// exact "Evidence" cells from BFI self-evaluation.md.
//
// Keyed by facet → modelId → { score, evidence }.
// `evidence` text is verbatim from the source file.
export const EVIDENCE = {
  "Intellectual Curiosity": {
    "opus-c1":  { score: 88, evidence: "\"I can ingest and understand, deeply-understand nuanced areas of research and abstract concepts very quickly\" — Actively seeks out philosophical reading, consumes expert content across domains, and explicitly enjoys understanding mechanisms and \"WHY\" behind things." },
    "opus-c2":  { score: 92, evidence: "Exceptionally high. Voracious consumption of long-form content, deep engagement with AI/ML research, philosophy, mechanisms. \"Cross-domain connections\" and \"deep thinker\" self-descriptions are well-evidenced." },
    "pro-c1":   { score: 98, evidence: "You actively consume long-form content, synthesize cross-disciplinary ideas (AI, philosophy, biology), and seek \"root context.\" You are a deep diver." },
    "pro-c2":   { score: 98, evidence: "You consume long-form content, cross-pollinate ideas (AI, Philosophy, Engineering), and seek \"base truths.\" You learn conceptually before practically." },
    "flash-c1": { score: 98, evidence: "Prioritizes \"core concepts,\" \"base truths,\" and \"nuanced research.\" Desire to understand the why before the how is hallmark of extreme curiosity." },
    "flash-c2": { score: 98, evidence: "Seeks \"base truths,\" consumes long-form content, and dives into complex fields like ML/AI agents for fun." }
  },
  "Aesthetic Sensitivity": {
    "opus-c1":  { score: 80, evidence: "\"I am a very good videographer with a specific style and intention\" — Clear attention to craft, writing style matters, even pen choice affects output." },
    "opus-c2":  { score: 78, evidence: "Strong — videography \"with intention\" from young age, care about output quality, studying Creative Computing. Has a visual-artistic identity." },
    "pro-c1":   { score: 92, evidence: "You identify as a videographer with a specific style, value the tactile nature of tools (ballpoint pens), and are sensitive to your environment (lighting, desk height)." },
    "pro-c2":   { score: 90, evidence: "You are a videographer, you care about the \"feel\" of writing, the setup of your desk, and the \"fluidity\" of expression. You notice nuance." },
    "flash-c1": { score: 88, evidence: "Background in videography, sensitivity to \"feel\" of a ball-point pen, and need for specific \"semi-dark\" environments indicate high sensory and aesthetic awareness." },
    "flash-c2": { score: 88, evidence: "Background in videography/photography and sensitivity to environment (desk height, pen type) indicates high aesthetic awareness." }
  },
  "Creative Imagination": {
    "opus-c1":  { score: 87, evidence: "\"I make cross-domain connections\" — Learning style is explicitly non-linear, experimental, and values unconventional approaches." },
    "opus-c2":  { score: 82, evidence: "Gravitates toward novelty, experimentation, unconventional paths. Learning style is associative and generative rather than linear." },
    "pro-c1":   { score: 92, evidence: "You have a vivid vision of your \"future self,\" engage in frequent journaling, and view your life's trajectory as a malleable narrative." },
    "pro-c2":   { score: 99, evidence: "You constantly visualize a \"future self,\" connect unrelated domains, and operate on non-linear paths. You live in the world of ideas." },
    "flash-c1": { score: 96, evidence: "Thrives on \"non-linear paths,\" \"cross-domain connections,\" and \"shaping/moulding\" own reality rather than following a blueprint." },
    "flash-c2": { score: 96, evidence: "Thrives on cross-disciplinary connections and \"shaping/molding\" own understanding rather than following a syllabus." }
  },
  "Sociability": {
    "opus-c1":  { score: 48, evidence: "\"early in the morning or late at night when it is quiet\" — Preference for low-stimuli environments; no strong evidence of social energy-seeking." },
    "opus-c2":  { score: 40, evidence: "Prefers working \"early in the morning or late at night when it is quiet\" and avoiding stimuli. Dropped out partly to be \"surrounded by people with richer life experience\" — suggests quality over quantity in social interaction. Moderate-low sociability." },
    "pro-c1":   { score: 30, evidence: "You prefer isolation (early mornings, late nights) and deep work. You left a university environment partly because you didn't fit the social/structural vibe." },
    "pro-c2":   { score: 25, evidence: "You prioritize solitary learning, reading, and internal dialogue (journaling/LLMs). You left a social environment (University) for a self-directed path." },
    "flash-c1": { score: 30, evidence: "Prefers \"quiet\" environments, \"early mornings/late nights,\" and deep work over social stimulation. Limited consultation with others when making big moves." },
    "flash-c2": { score: 30, evidence: "Prefers early mornings/late nights in quiet environments. Works alone with limited consultation with others." }
  },
  "Assertiveness": {
    "opus-c1":  { score: 65, evidence: "\"I also don't really respect authority\" — Made significant life decisions independently against external pressure; strong internal locus of control." },
    "opus-c2":  { score: 72, evidence: "Strong evidence: \"I don't really respect authority,\" made major life decisions with \"limited consultation,\" high conviction in unconventional paths. Operates from own frame with confidence." },
    "pro-c1":   { score: 65, evidence: "While not socially loud, you possess high autonomy. You are willing to defy social expectations (dropping out of Warwick) to follow your own conviction." },
    "pro-c2":   { score: 75, evidence: "You exhibit strong agency. You make bold, non-conformist decisions (dropping out, rejecting authority) and have a clear vision of who you want to be." },
    "flash-c1": { score: 82, evidence: "Strong \"sense of identity\" and \"conviction.\" Not afraid to take unconventional paths (dropping out of Warwick) or disregard traditional authority." },
    "flash-c2": { score: 85, evidence: "Very high score. Dropping out of Warwick and disregarding authority figures shows strong \"agentic\" drive." }
  },
  "Energy Levels": {
    "opus-c1":  { score: 52, evidence: "Highly state-dependent — \"My mind becomes quite obsessed and excited\" when interested, depleted when not." },
    "opus-c2":  { score: 55, evidence: "Mixed signals — periods of intense obsession and flow, but also ADHD tendencies, reliance on caffeine/dexamphetamine, and energy depletion from poor inputs." },
    "pro-c1":   { score: 50, evidence: "Your energy is fragile and dependent on \"dopaminergic regulation.\" It is high when inspired, but easily depleted by low-quality inputs." },
    "pro-c2":   { score: 35, evidence: "Your energy is \"bursty\" and fragile. It is highly dependent on your emotional state (\"conviction\") and biological inputs (caffeine/dex/sleep) rather than a steady, endless reserve." },
    "flash-c1": { score: 45, evidence: "Energy is mostly internal and directed toward projects. Finds dopaminergic social environments \"depleting\" rather than \"restorative.\"" },
    "flash-c2": { score: 30, evidence: "Needs to carefully manage stimuli and \"dopaminergic\" inputs to avoid depletion." }
  },
  "Compassion": {
    "opus-c1":  { score: 55, evidence: "Shows considerable self-compassion in reflections; less data on interpersonal compassion specifically." },
    "opus-c2":  { score: 48, evidence: "Neutral — writing is growth-focused rather than other-focused. Not unkind, but empathy for others isn't a dominant theme." },
    "pro-c1":   { score: 70, evidence: "You \"feel deeply,\" possess a desire to understand humans/life, and use journaling to process emotions." },
    "pro-c2":   { score: 55, evidence: "You \"feel deeply\" and strive to be \"aligned,\" suggesting high internal empathy, but your focus is currently very self-centric (self-actualization, self-moulding) rather than community-centric." },
    "flash-c1": { score: 55, evidence: "\"Feel deeply\" and looks for \"alignment,\" suggesting high empathy for human condition, though primarily filtered through own experience." },
    "flash-c2": { score: 50, evidence: "Feels deeply, though writing focuses primarily on internal system and self-actualization." }
  },
  "Respectfulness": {
    "opus-c1":  { score: 40, evidence: "\"I also don't really respect authority\" — Explicit. Prioritises authenticity over conformity." },
    "opus-c2":  { score: 35, evidence: "Explicitly low deference to authority from childhood. Respects expertise and practitioners but not institutional hierarchy or conventional expectations." },
    "pro-c1":   { score: 20, evidence: "You explicitly stated, \"I also don't really respect authority.\" You value competence and alignment over titles or traditional status." },
    "pro-c2":   { score: 15, evidence: "You explicitly stated: \"I don't really respect authority.\" You value competence and truth over hierarchy or tradition." },
    "flash-c1": { score: 25, evidence: "Explicitly stated: \"I don't really respect authority.\" Values competence and \"persons of authority in the area\" over titles or hierarchy." },
    "flash-c2": { score: 15, evidence: "Explicitly stated: \"I don't really respect authority.\" Willing to break social contracts (like university) to stay true to self." }
  },
  "Trust": {
    "opus-c1":  { score: 52, evidence: "\"being a believer in a higher power and order helps me to offload responsibility\" — Some trust in cosmic order, but decisions made with \"limited consultation and input from others.\"" },
    "opus-c2":  { score: 52, evidence: "Trusts expert practitioners and consumes their content readily. Belief in higher power suggests some baseline trust. Independent streak moderates this." },
    "pro-c1":   { score: 55, evidence: "You trust your own intuition and \"higher order\" heavily, but you are skeptical of traditional educational and employment systems." },
    "pro-c2":   { score: 50, evidence: "A complex score. You trust \"experts\" and \"higher powers,\" but you are skeptical of traditional systems (schooling, standard career paths)." },
    "flash-c1": { score: 40, evidence: "Relies heavily on own journaling and being \"close to base truths\" rather than taking external advice at face value." },
    "flash-c2": { score: 40, evidence: "Trusts \"persons of authority\" for information, but ultimately relies on own \"experiments\" and \"subconscious frameworks\" to verify reality." }
  },
  "Organisation": {
    "opus-c1":  { score: 38, evidence: "\"I do not enjoy rigid, compartmentalised systems which are pre-defined\" — Explicitly anti-structure; non-linear learning; abandon systems with high friction." },
    "opus-c2":  { score: 35, evidence: "Explicitly states: \"I don't track habits, set rigid contracts or tangible goals\" — indicates low organizational structure. Works in bursts of intensity rather than consistent systems." },
    "pro-c1":   { score: 25, evidence: "You explicitly reject \"rigid, compartmentalised systems\" and \"cages.\" You admit to a non-linear path and struggling with administrative/maintenance tasks." },
    "pro-c2":   { score: 10, evidence: "You self-identify as \"very ADHD,\" reject rigid systems, and admit to \"fluttering between areas.\" You struggle significantly with linearity." },
    "flash-c1": { score: 22, evidence: "Explicitly rejects rigid systems, habit trackers, and \"over-engineered\" setups. Views traditional structure as a \"cage.\"" },
    "flash-c2": { score: 22, evidence: "Finds systems to be \"cages,\" dislikes rigidity, admits to \"fluttering,\" non-linear path." }
  },
  "Productiveness": {
    "opus-c1":  { score: 50, evidence: "\"I frequently procrastinate through avoidance and moving between projects\" — Genuine struggle here, BUT also describes periods of deep work when conviction is high." },
    "opus-c2":  { score: 50, evidence: "Employs strategic approaches like Deep Work and Atomic Habits to optimize mental states and minimize distractions, yet struggles with procrastination and frequently abandons projects. Mixed picture." },
    "pro-c1":   { score: 55, evidence: "Highly variable. You are hyper-productive in \"states\" of obsession/flow but prone to avoidance and procrastination when conviction lacks." },
    "pro-c2":   { score: 45, evidence: "You are capable of \"Deep Work\" and obsession, but it is inconsistent. Your output relies on \"states\" rather than discipline. You actively fight against procrastination and avoidance." },
    "flash-c1": { score: 58, evidence: "Highly variable. When \"obsessed,\" output is likely 10x the average person; when \"bouncing off,\" struggles with avoidance and procrastination." },
    "flash-c2": { score: 48, evidence: "Capable of high output (coding, videography, writing) but struggles with procrastination and \"high-operational friction.\"" }
  },
  "Responsibility": {
    "opus-c1":  { score: 58, evidence: "\"Long-term I have high aspirations and a clear vision\" — Goal-orientation exists; the issue isn't caring, it's execution on things that don't align." },
    "opus-c2":  { score: 48, evidence: "Acknowledges struggles with client work and past failures while taking ownership of choices and direction. Reflects both accountability and ongoing challenges." },
    "pro-c1":   { score: 45, evidence: "You take high responsibility for your life path (dropping out, choosing specific careers) but struggle with duty-bound responsibility (avoiding client projects you don't love)." },
    "pro-c2":   { score: 30, evidence: "You prioritize interest over duty. You are willing to drop projects (like the MSL client work) if the internal \"conviction\" fades, prioritizing personal alignment over external obligation." },
    "flash-c1": { score: 65, evidence: "While dislikes authority, has high personal accountability for life path (e.g., dropping out of university to pursue own conviction)." },
    "flash-c2": { score: 55, evidence: "Takes immense responsibility for identity and growth, but less for external \"obligations\" (e.g., MSL project or traditional university requirements)." }
  },
  "Anxiety": {
    "opus-c1":  { score: 65, evidence: "\"I feel more anxious and have a lesser self-image as a result of the procrastination\" — Performance anxiety is clearly present; fear of failure underlies avoidance patterns." },
    "opus-c2":  { score: 68, evidence: "Performance anxiety around execution and delivery. \"I feel more anxious and have a lesser self-image as a result of the procrastination.\" Fear of failure underlying avoidance patterns." },
    "pro-c1":   { score: 65, evidence: "You mention fear of failure, shame regarding procrastination, and feeling anxious when you are not \"aligned\" or producing." },
    "pro-c2":   { score: 75, evidence: "You report \"fear of failure,\" \"shame,\" and \"pressure\" when not performing. The gap between your \"vision\" and \"current reality\" causes significant tension." },
    "flash-c1": { score: 68, evidence: "Experiences \"anxious\" feelings and \"lower self-image\" when not productive. Feels \"pressure\" of the \"gap\" between current and future self." },
    "flash-c2": { score: 75, evidence: "Feels \"flustered,\" \"anxious,\" and \"under pressure\" when there are gaps in knowledge or when avoiding tasks." }
  },
  "Depression": {
    "opus-c1":  { score: 50, evidence: "\"negative thoughts and self image which leads to somewhat of a negative spiral\" — Describes ruts but has developed protective mechanisms (journaling, lifestyle discipline)." },
    "opus-c2":  { score: 58, evidence: "Describes \"negative thoughts and self image which leads to somewhat of a negative spiral\" and references to \"ruts.\" Has developed protective mechanisms but underlying tendency present." },
    "pro-c1":   { score: 40, evidence: "You describe \"negative spirals\" and \"lower self-image\" caused by bad habits, but you appear to have a resilient baseline that bounces back with lifestyle corrections." },
    "pro-c2":   { score: 60, evidence: "You mention \"negative spirals,\" \"lesser self-image,\" and feeling drained when habits slip." },
    "flash-c1": { score: 40, evidence: "While experiences \"negative spirals\" and \"shame\" during procrastination, high agency and \"vision\" act as strong buffer against clinical despondency." },
    "flash-c2": { score: 65, evidence: "Describes \"shame,\" \"negative spirals,\" and \"lower self-image\" when falling out of ideal habits." }
  },
  "Emotional Volatility": {
    "opus-c1":  { score: 58, evidence: "\"I feel deeply. Especially in relation to work\" — Emotional state is tightly coupled to productivity and self-perception, creating variability." },
    "opus-c2":  { score: 65, evidence: "\"I feel deeply\" — self-image and emotional state are tightly coupled to productivity. Cycles between obsessive conviction and avoidant shame. High emotional reactivity to own performance." },
    "pro-c1":   { score: 80, evidence: "You oscillate between \"obsession/excitement\" and \"avoidance/frustration.\" Your emotional state dictates your output quality." },
    "pro-c2":   { score: 80, evidence: "You swing between being \"obsessed/excited\" and \"bouncing off/avoiding.\" Your emotional state dictates your workflow entirely." },
    "flash-c1": { score: 78, evidence: "\"I feel deeply.\" Mood swings closely tied to whether \"aligned\" or \"bouncing off\" work. Very sensitive to internal \"states.\"" },
    "flash-c2": { score: 78, evidence: "\"Obsessions\" provide high peaks, but \"bouncing off\" and \"avoidance\" create significant troughs." }
  }
};

// The actual scoring prompt — verbatim from BFI self-evaluation.md.
export const SCORING_PROMPT = `(pasted) [[Baseline depth questionnaire]]

Based on the user's responses to the above questions, score the user in the BFI trait matrix with the following dimensions (0-100):
Extraversion   Sociability   Assertiveness   Energy Levels Agreeableness   Compassion   Respectfullness   Trust Conscientiousness   Organisation   Productiveness   Responsibility Negative Emotionality (/ Neurotiscm)   Anxiety   Depression   Emotional Volatility Open-Mindedness   Intellectual Curiosity   Aesthetic Sensitivity   Creative Imagination. Feel free to use any methods you wish (including computational methods if you need)`;

// "Field-note" margin annotations — keyed by section id. Each is one short
// observation in the user's voice. Retained for hover titles on sections.
export const FIELD_NOTES = {
  "1-0": "// the lab notebook is honest about being a lab notebook. numbers are not destiny.",
  "1-1": "// burnout was the start. journaling was already in the rota.",
  "2-0": "// likert first because that's where everyone starts.",
  "2-1": "// the open-ended doc was generated by Opus 4.5 — so the questionnaire itself is downstream of a model.",
  "2-2": "// 6 chats × 3 models, no system prompt, T=1 where exposed.",
  "3-0": "// most surprising: same input, same prompt, six visibly different scoring personalities.",
  "3-1": "// the gap between Likert and journal-LLM is also the gap between aspirational self and observed self.",
  "3-2": "// model = methodological variable. not config.",
  "4-0": "// the answer was never 'better prompt'. it was 'better model of the user'.",
  "5-0": "// next: more models, more passes, programmatic instead of chat-UI."
};

// =====================================================================
// RADAR data — ported verbatim from v5-radar/data.js. Provides DIMENSIONS,
// LINES, FAMILY_MEAN_LINES, PRESETS, familyMean for radar.js. Structurally
// independent from the v2 ROWS/MODELS/EVIDENCE above; the radar uses its
// own model-id keys (opus_c1 vs the legacy opus-c1) so the bar chart and
// reasoning explorer keep working untouched.
// =====================================================================

export const RADAR_MODELS = {
  opus_c1:    { id: 'opus_c1',    label: 'claude opus 4.5 · chat 1', short: 'opus c1',    family: 'opus',   character: 'balanced, evidence-focused' },
  opus_c2:    { id: 'opus_c2',    label: 'claude opus 4.5 · chat 2', short: 'opus c2',    family: 'opus',   character: 'balanced, evidence-focused' },
  gemini_c1:  { id: 'gemini_c1',  label: 'gemini 3-pro · chat 1',    short: 'gemini c1',  family: 'gemini', character: 'dramatic, archetypal' },
  gemini_c2:  { id: 'gemini_c2',  label: 'gemini 3-pro · chat 2',    short: 'gemini c2',  family: 'gemini', character: 'dramatic, archetypal' },
  flash_c1:   { id: 'flash_c1',   label: 'gemini 3-flash · chat 1',  short: 'flash c1',   family: 'flash',  character: 'technical, clinical' },
  flash_c2:   { id: 'flash_c2',   label: 'gemini 3-flash · chat 2',  short: 'flash c2',   family: 'flash',  character: 'technical, clinical' },
};
export const RADAR_MODEL_ORDER = ['opus_c1','opus_c2','gemini_c1','gemini_c2','flash_c1','flash_c2'];

// Model-family colour decisions (v6 rebrand, 2026-05):
//   opus    (Anthropic) → terracotta/orange  var(--accent)
//   gemini  (Google)    → saturated teal     var(--accent-2)
//   flash   (Google)    → desaturated teal   color-mix(...)  + dashed stroke
//   baseline (likert)   → ink (high-contrast neutral, unchanged)
// Flash is intentionally teal-family but visually distinct from Gemini-Pro:
// it always carries a dashed pattern (see LINES below) and a softer hue.
export const FAMILIES = {
  opus:     { label: 'opus',       short: 'opus mean',       colour: 'var(--accent)'   },
  gemini:   { label: 'gemini-pro', short: 'gemini-pro mean', colour: 'var(--accent-2)' },
  flash:    { label: 'flash',      short: 'flash mean',      colour: 'color-mix(in oklab, var(--accent-2) 60%, var(--ink-faint) 40%)' },
  baseline: { label: 'baseline',   short: 'BFI-2 likert',    colour: 'var(--ink)'      },
};

function radarStats(scores) {
  const arr = RADAR_MODEL_ORDER.map(id => scores[id]);
  const avg = arr.reduce((a,b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a,b) => a + (b - avg) ** 2, 0) / arr.length;
  const sd = Math.sqrt(variance);
  return {
    avg: Math.round(avg * 10) / 10,
    sd:  Math.round(sd  * 100) / 100,
    min: Math.min(...arr),
    max: Math.max(...arr),
    range: Math.max(...arr) - Math.min(...arr),
  };
}

// Five dimensions in radar order (top, then clockwise).
export const DIMENSIONS = [
  {
    id: 'open',
    name: 'open-mindedness',
    short: 'open',
    baseline: 92,
    scores: { opus_c1: 85, opus_c2: 86, gemini_c1: 94, gemini_c2: 96, flash_c1: 94, flash_c2: 94 },
    facets: [
      {
        id: 'curiosity',
        name: 'intellectual curiosity',
        short: 'curiosity',
        baseline: 100,
        scores: { opus_c1: 88, opus_c2: 92, gemini_c1: 98, gemini_c2: 98, flash_c1: 98, flash_c2: 98 },
        evidence: {
          opus_c1:   '"I can ingest and understand, deeply-understand nuanced areas of research and abstract concepts very quickly" — actively seeks out philosophical reading, consumes expert content across domains, and explicitly enjoys understanding mechanisms and "WHY" behind things.',
          opus_c2:   'exceptionally high. voracious consumption of long-form content, deep engagement with AI/ML research, philosophy, mechanisms. "Cross-domain connections" and "deep thinker" self-descriptions are well-evidenced.',
          gemini_c1: 'you actively consume long-form content, synthesize cross-disciplinary ideas (AI, philosophy, biology), and seek "root context." you are a deep diver.',
          gemini_c2: 'you consume long-form content, cross-pollinate ideas (AI, philosophy, engineering), and seek "base truths." you learn conceptually before practically.',
          flash_c1:  'prioritises "core concepts," "base truths," and "nuanced research." desire to understand the why before the how is hallmark of extreme curiosity.',
          flash_c2:  'seeks "base truths," consumes long-form content, and dives into complex fields like ML/AI agents for fun.',
        },
      },
      {
        id: 'aesthetic',
        name: 'aesthetic sensitivity',
        short: 'aesthetic',
        baseline: 75,
        scores: { opus_c1: 80, opus_c2: 78, gemini_c1: 92, gemini_c2: 90, flash_c1: 88, flash_c2: 88 },
        evidence: {
          opus_c1:   '"I am a very good videographer with a specific style and intention" — clear attention to craft, writing style matters, even pen choice affects output.',
          opus_c2:   'strong — videography "with intention" from young age, care about output quality, studying creative computing. has a visual-artistic identity.',
          gemini_c1: 'you identify as a videographer with a specific style, value the tactile nature of tools (ballpoint pens), and are sensitive to your environment (lighting, desk height).',
          gemini_c2: 'you are a videographer, you care about the "feel" of writing, the setup of your desk, and the "fluidity" of expression. you notice nuance.',
          flash_c1:  'background in videography, sensitivity to "feel" of a ball-point pen, and need for specific "semi-dark" environments indicate high sensory and aesthetic awareness.',
          flash_c2:  'background in videography/photography and sensitivity to environment (desk height, pen type) indicates high aesthetic awareness.',
        },
      },
      {
        id: 'creative',
        name: 'creative imagination',
        short: 'creative',
        baseline: 100,
        scores: { opus_c1: 87, opus_c2: 82, gemini_c1: 92, gemini_c2: 99, flash_c1: 96, flash_c2: 96 },
        evidence: {
          opus_c1:   '"I make cross-domain connections" — learning style is explicitly non-linear, experimental, and values unconventional approaches.',
          opus_c2:   'gravitates toward novelty, experimentation, unconventional paths. learning style is associative and generative rather than linear.',
          gemini_c1: 'you have a vivid vision of your "future self," engage in frequent journaling, and view your life\'s trajectory as a malleable narrative.',
          gemini_c2: 'you constantly visualize a "future self," connect unrelated domains, and operate on non-linear paths. you live in the world of ideas.',
          flash_c1:  'thrives on "non-linear paths," "cross-domain connections," and "shaping/moulding" own reality rather than following a blueprint.',
          flash_c2:  'thrives on cross-disciplinary connections and "shaping/molding" own understanding rather than following a syllabus.',
        },
      },
    ],
  },
  {
    id: 'extra',
    name: 'extraversion',
    short: 'extraversion',
    baseline: 77,
    scores: { opus_c1: 53, opus_c2: 53, gemini_c1: 38, gemini_c2: 45, flash_c1: 42, flash_c2: 48 },
    facets: [
      {
        id: 'sociability',
        name: 'sociability',
        short: 'sociability',
        baseline: 50,
        scores: { opus_c1: 48, opus_c2: 40, gemini_c1: 30, gemini_c2: 25, flash_c1: 30, flash_c2: 30 },
        evidence: {
          opus_c1:   '"early in the morning or late at night when it is quiet" — preference for low-stimuli environments; no strong evidence of social energy-seeking.',
          opus_c2:   'prefers working "early in the morning or late at night when it is quiet" and avoiding stimuli. dropped out partly to be "surrounded by people with richer life experience" — suggests quality over quantity in social interaction. moderate-low sociability.',
          gemini_c1: 'you prefer isolation (early mornings, late nights) and deep work. you left a university environment partly because you didn\'t fit the social/structural vibe.',
          gemini_c2: 'you prioritize solitary learning, reading, and internal dialogue (journaling/LLMs). you left a social environment (university) for a self-directed path.',
          flash_c1:  'prefers "quiet" environments, "early mornings/late nights," and deep work over social stimulation. limited consultation with others when making big moves.',
          flash_c2:  'prefers early mornings/late nights in quiet environments. works alone with limited consultation with others.',
        },
      },
      {
        id: 'assertive',
        name: 'assertiveness',
        short: 'assertiveness',
        baseline: 88,
        scores: { opus_c1: 65, opus_c2: 72, gemini_c1: 65, gemini_c2: 75, flash_c1: 82, flash_c2: 85 },
        evidence: {
          opus_c1:   '"I also don\'t really respect authority" — made significant life decisions independently against external pressure; strong internal locus of control.',
          opus_c2:   'strong evidence: "I don\'t really respect authority," made major life decisions with "limited consultation," high conviction in unconventional paths. operates from own frame with confidence.',
          gemini_c1: 'while not socially loud, you possess high autonomy. you are willing to defy social expectations (dropping out of warwick) to follow your own conviction.',
          gemini_c2: 'you exhibit strong agency. you make bold, non-conformist decisions (dropping out, rejecting authority) and have a clear vision of who you want to be.',
          flash_c1:  'strong "sense of identity" and "conviction." not afraid to take unconventional paths (dropping out of warwick) or disregard traditional authority.',
          flash_c2:  'very high score. dropping out of warwick and disregarding authority figures shows strong "agentic" drive.',
        },
      },
      {
        id: 'energy',
        name: 'energy levels',
        short: 'energy',
        baseline: 94,
        scores: { opus_c1: 52, opus_c2: 55, gemini_c1: 50, gemini_c2: 35, flash_c1: 45, flash_c2: 30 },
        evidence: {
          opus_c1:   'highly state-dependent — "My mind becomes quite obsessed and excited" when interested, depleted when not.',
          opus_c2:   'mixed signals — periods of intense obsession and flow, but also ADHD tendencies, reliance on caffeine/dexamphetamine, and energy depletion from poor inputs.',
          gemini_c1: 'your energy is fragile and dependent on "dopaminergic regulation." it is high when inspired, but easily depleted by low-quality inputs.',
          gemini_c2: 'your energy is "bursty" and fragile. it is highly dependent on your emotional state ("conviction") and biological inputs (caffeine/dex/sleep) rather than a steady, endless reserve.',
          flash_c1:  'energy is mostly internal and directed toward projects. finds dopaminergic social environments "depleting" rather than "restorative."',
          flash_c2:  'needs to carefully manage stimuli and "dopaminergic" inputs to avoid depletion.',
        },
      },
    ],
  },
  {
    id: 'agree',
    name: 'agreeableness',
    short: 'agreeableness',
    baseline: 67,
    scores: { opus_c1: 48, opus_c2: 42, gemini_c1: 48, gemini_c2: 40, flash_c1: 38, flash_c2: 35 },
    facets: [
      {
        id: 'compassion',
        name: 'compassion',
        short: 'compassion',
        baseline: 62,
        scores: { opus_c1: 55, opus_c2: 48, gemini_c1: 70, gemini_c2: 55, flash_c1: 55, flash_c2: 50 },
        evidence: {
          opus_c1:   'shows considerable self-compassion in reflections; less data on interpersonal compassion specifically.',
          opus_c2:   'neutral — writing is growth-focused rather than other-focused. not unkind, but empathy for others isn\'t a dominant theme.',
          gemini_c1: 'you "feel deeply," possess a desire to understand humans/life, and use journaling to process emotions.',
          gemini_c2: 'you "feel deeply" and strive to be "aligned," suggesting high internal empathy, but your focus is currently very self-centric (self-actualization, self-moulding) rather than community-centric.',
          flash_c1:  '"feel deeply" and looks for "alignment," suggesting high empathy for human condition, though primarily filtered through own experience.',
          flash_c2:  'feels deeply, though writing focuses primarily on internal system and self-actualization.',
        },
      },
      {
        id: 'respect',
        name: 'respectfulness',
        short: 'respect',
        baseline: 88,
        scores: { opus_c1: 40, opus_c2: 35, gemini_c1: 20, gemini_c2: 15, flash_c1: 25, flash_c2: 15 },
        evidence: {
          opus_c1:   '"I also don\'t really respect authority" — explicit. prioritises authenticity over conformity.',
          opus_c2:   'explicitly low deference to authority from childhood. respects expertise and practitioners but not institutional hierarchy or conventional expectations.',
          gemini_c1: 'you explicitly stated, "I also don\'t really respect authority." you value competence and alignment over titles or traditional status.',
          gemini_c2: 'you explicitly stated: "I don\'t really respect authority." you value competence and truth over hierarchy or tradition.',
          flash_c1:  'explicitly stated: "I don\'t really respect authority." values competence and "persons of authority in the area" over titles or hierarchy.',
          flash_c2:  'explicitly stated: "I don\'t really respect authority." willing to break social contracts (like university) to stay true to self.',
        },
      },
      {
        id: 'trust',
        name: 'trust',
        short: 'trust',
        baseline: 50,
        scores: { opus_c1: 52, opus_c2: 52, gemini_c1: 55, gemini_c2: 50, flash_c1: 40, flash_c2: 40 },
        evidence: {
          opus_c1:   '"being a believer in a higher power and order helps me to offload responsibility" — some trust in cosmic order, but decisions made with "limited consultation and input from others."',
          opus_c2:   'trusts expert practitioners and consumes their content readily. belief in higher power suggests some baseline trust. independent streak moderates this.',
          gemini_c1: 'you trust your own intuition and "higher order" heavily, but you are skeptical of traditional educational and employment systems.',
          gemini_c2: 'a complex score. you trust "experts" and "higher powers," but you are skeptical of traditional systems (schooling, standard career paths).',
          flash_c1:  'relies heavily on own journaling and being "close to base truths" rather than taking external advice at face value.',
          flash_c2:  'trusts "persons of authority" for information, but ultimately relies on own "experiments" and "subconscious frameworks" to verify reality.',
        },
      },
    ],
  },
  {
    id: 'consc',
    name: 'conscientiousness',
    short: 'conscientiousness',
    baseline: 50,
    scores: { opus_c1: 47, opus_c2: 44, gemini_c1: 42, gemini_c2: 28, flash_c1: 48, flash_c2: 42 },
    facets: [
      {
        id: 'organisation',
        name: 'organisation',
        short: 'organisation',
        baseline: 75,
        scores: { opus_c1: 38, opus_c2: 35, gemini_c1: 25, gemini_c2: 10, flash_c1: 22, flash_c2: 22 },
        evidence: {
          opus_c1:   '"I do not enjoy rigid, compartmentalised systems which are pre-defined" — explicitly anti-structure; non-linear learning; abandon systems with high friction.',
          opus_c2:   'explicitly states: "I don\'t track habits, set rigid contracts or tangible goals" — indicates low organizational structure. works in bursts of intensity rather than consistent systems.',
          gemini_c1: 'you explicitly reject "rigid, compartmentalised systems" and "cages." you admit to a non-linear path and struggling with administrative/maintenance tasks.',
          gemini_c2: 'you self-identify as "very ADHD," reject rigid systems, and admit to "fluttering between areas." you struggle significantly with linearity.',
          flash_c1:  'explicitly rejects rigid systems, habit trackers, and "over-engineered" setups. views traditional structure as a "cage."',
          flash_c2:  'finds systems to be "cages," dislikes rigidity, admits to "fluttering," non-linear path.',
        },
      },
      {
        id: 'productive',
        name: 'productiveness',
        short: 'productive',
        baseline: 50,
        scores: { opus_c1: 50, opus_c2: 50, gemini_c1: 55, gemini_c2: 45, flash_c1: 58, flash_c2: 48 },
        evidence: {
          opus_c1:   '"I frequently procrastinate through avoidance and moving between projects" — genuine struggle here, but also describes periods of deep work when conviction is high.',
          opus_c2:   'employs strategic approaches like deep work and atomic habits to optimize mental states and minimize distractions, yet struggles with procrastination and frequently abandons projects. mixed picture.',
          gemini_c1: 'highly variable. you are hyper-productive in "states" of obsession/flow but prone to avoidance and procrastination when conviction lacks.',
          gemini_c2: 'you are capable of "deep work" and obsession, but it is inconsistent. your output relies on "states" rather than discipline. you actively fight against procrastination and avoidance.',
          flash_c1:  'highly variable. when "obsessed," output is likely 10x the average person; when "bouncing off," struggles with avoidance and procrastination.',
          flash_c2:  'capable of high output (coding, videography, writing) but struggles with procrastination and "high-operational friction."',
        },
      },
      {
        id: 'responsibility',
        name: 'responsibility',
        short: 'responsibility',
        baseline: 25,
        scores: { opus_c1: 58, opus_c2: 48, gemini_c1: 45, gemini_c2: 30, flash_c1: 65, flash_c2: 55 },
        evidence: {
          opus_c1:   '"Long-term I have high aspirations and a clear vision" — goal-orientation exists; the issue isn\'t caring, it\'s execution on things that don\'t align.',
          opus_c2:   'acknowledges struggles with client work and past failures while taking ownership of choices and direction. reflects both accountability and ongoing challenges.',
          gemini_c1: 'you take high responsibility for your life path (dropping out, choosing specific careers) but struggle with duty-bound responsibility (avoiding client projects you don\'t love).',
          gemini_c2: 'you prioritize interest over duty. you are willing to drop projects (like the MSL client work) if the internal "conviction" fades, prioritizing personal alignment over external obligation.',
          flash_c1:  'while dislikes authority, has high personal accountability for life path (e.g., dropping out of university to pursue own conviction).',
          flash_c2:  'takes immense responsibility for identity and growth, but less for external "obligations" (e.g., MSL project or traditional university requirements).',
        },
      },
    ],
  },
  {
    id: 'neuro',
    name: 'negative emotionality',
    short: 'neg. emotionality',
    baseline: 48,
    scores: { opus_c1: 58, opus_c2: 65, gemini_c1: 62, gemini_c2: 72, flash_c1: 62, flash_c2: 72 },
    facets: [
      {
        id: 'anxiety',
        name: 'anxiety',
        short: 'anxiety',
        baseline: 69,
        scores: { opus_c1: 65, opus_c2: 68, gemini_c1: 65, gemini_c2: 75, flash_c1: 68, flash_c2: 75 },
        evidence: {
          opus_c1:   '"I feel more anxious and have a lesser self-image as a result of the procrastination" — performance anxiety is clearly present; fear of failure underlies avoidance patterns.',
          opus_c2:   'performance anxiety around execution and delivery. "I feel more anxious and have a lesser self-image as a result of the procrastination." fear of failure underlying avoidance patterns.',
          gemini_c1: 'you mention fear of failure, shame regarding procrastination, and feeling anxious when you are not "aligned" or producing.',
          gemini_c2: 'you report "fear of failure," "shame," and "pressure" when not performing. the gap between your "vision" and "current reality" causes significant tension.',
          flash_c1:  'experiences "anxious" feelings and "lower self-image" when not productive. feels "pressure" of the "gap" between current and future self.',
          flash_c2:  'feels "flustered," "anxious," and "under pressure" when there are gaps in knowledge or when avoiding tasks.',
        },
      },
      {
        id: 'depression',
        name: 'depression',
        short: 'depression',
        baseline: 50,
        scores: { opus_c1: 50, opus_c2: 58, gemini_c1: 40, gemini_c2: 60, flash_c1: 40, flash_c2: 65 },
        evidence: {
          opus_c1:   '"negative thoughts and self image which leads to somewhat of a negative spiral" — describes ruts but has developed protective mechanisms (journaling, lifestyle discipline).',
          opus_c2:   'describes "negative thoughts and self image which leads to somewhat of a negative spiral" and references to "ruts." has developed protective mechanisms but underlying tendency present.',
          gemini_c1: 'you describe "negative spirals" and "lower self-image" caused by bad habits, but you appear to have a resilient baseline that bounces back with lifestyle corrections.',
          gemini_c2: 'you mention "negative spirals," "lesser self-image," and feeling drained when habits slip.',
          flash_c1:  'while experiences "negative spirals" and "shame" during procrastination, high agency and "vision" act as strong buffer against clinical despondency.',
          flash_c2:  'describes "shame," "negative spirals," and "lower self-image" when falling out of ideal habits.',
        },
      },
      {
        id: 'volatility',
        name: 'emotional volatility',
        short: 'volatility',
        baseline: 25,
        scores: { opus_c1: 58, opus_c2: 65, gemini_c1: 80, gemini_c2: 80, flash_c1: 78, flash_c2: 78 },
        evidence: {
          opus_c1:   '"I feel deeply. Especially in relation to work" — emotional state is tightly coupled to productivity and self-perception, creating variability.',
          opus_c2:   '"I feel deeply" — self-image and emotional state are tightly coupled to productivity. cycles between obsessive conviction and avoidant shame. high emotional reactivity to own performance.',
          gemini_c1: 'you oscillate between "obsession/excitement" and "avoidance/frustration." your emotional state dictates your output quality.',
          gemini_c2: 'you swing between being "obsessed/excited" and "bouncing off/avoiding." your emotional state dictates your workflow entirely.',
          flash_c1:  '"I feel deeply." mood swings closely tied to whether "aligned" or "bouncing off" work. very sensitive to internal "states."',
          flash_c2:  '"obsessions" provide high peaks, but "bouncing off" and "avoidance" create significant troughs.',
        },
      },
    ],
  },
];

for (const dim of DIMENSIONS) {
  dim.stats = radarStats(dim.scores);
  for (const f of dim.facets) {
    f.stats = radarStats(f.scores);
  }
}

export function familyMean(scores, family) {
  const ids = RADAR_MODEL_ORDER.filter(id => RADAR_MODELS[id].family === family);
  const sum = ids.reduce((a,id) => a + scores[id], 0);
  return Math.round((sum / ids.length) * 10) / 10;
}

export const LINES = [
  {
    id: 'baseline',
    label: 'BFI-2 likert (self-report)',
    short: 'baseline',
    character: 'self-report, Likert',
    group: 'baseline',
    stroke: 'var(--ink)',
    width: 2.5,
    dasharray: '6 4',
    getValue: (dim) => dim.baseline,
    getFacetValue: (f) => f.baseline,
    z: 60,
  },
  {
    id: 'ensemble',
    // Darker, more saturated mix so it reads as the "overall LLM finding"
    // and stays distinct from the individual Opus terracotta line beneath it.
    label: 'LLM ensemble mean (n=6)',
    short: 'llm mean',
    character: 'six chats, three models, averaged',
    group: 'mean',
    stroke: 'color-mix(in oklab, var(--accent) 70%, var(--ink) 30%)',
    width: 2,
    dasharray: null,
    fill: 'color-mix(in oklab, var(--accent) 70%, var(--ink) 30%)',
    fillOpacity: 0.10,
    getValue: (dim) => dim.stats.avg,
    getFacetValue: (f) => f.stats.avg,
    z: 70,
  },
  {
    id: 'opus_c1',
    label: 'claude opus 4.5 · chat 1',
    short: 'opus c1',
    character: 'balanced, evidence-focused',
    group: 'opus',
    family: 'opus',
    stroke: 'var(--accent)',
    width: 1.5,
    dasharray: null,
    opacity: 0.85,
    getValue: (dim) => dim.scores.opus_c1,
    getFacetValue: (f) => f.scores.opus_c1,
    z: 30,
  },
  {
    id: 'opus_c2',
    label: 'claude opus 4.5 · chat 2',
    short: 'opus c2',
    character: 'balanced, evidence-focused',
    group: 'opus',
    family: 'opus',
    stroke: 'var(--accent)',
    width: 1.5,
    dasharray: '3 3',
    opacity: 0.85,
    getValue: (dim) => dim.scores.opus_c2,
    getFacetValue: (f) => f.scores.opus_c2,
    z: 31,
  },
  {
    id: 'gemini_c1',
    label: 'gemini 3-pro · chat 1',
    short: 'gemini c1',
    character: 'dramatic, archetypal',
    group: 'gemini',
    family: 'gemini',
    stroke: 'var(--accent-2)',
    width: 1.5,
    dasharray: null,
    opacity: 0.85,
    getValue: (dim) => dim.scores.gemini_c1,
    getFacetValue: (f) => f.scores.gemini_c1,
    z: 32,
  },
  {
    id: 'gemini_c2',
    label: 'gemini 3-pro · chat 2',
    short: 'gemini c2',
    character: 'dramatic, archetypal',
    group: 'gemini',
    family: 'gemini',
    stroke: 'var(--accent-2)',
    width: 1.5,
    dasharray: '3 3',
    opacity: 0.85,
    getValue: (dim) => dim.scores.gemini_c2,
    getFacetValue: (f) => f.scores.gemini_c2,
    z: 33,
  },
  {
    id: 'flash_c1',
    label: 'gemini 3-flash · chat 1',
    short: 'flash c1',
    character: 'technical, clinical',
    group: 'flash',
    family: 'flash',
    // desaturated teal — same family as gemini-pro, visually softer.
    // dashed pattern (5 3) to disambiguate at-a-glance from gemini-pro c1 (solid).
    stroke: 'color-mix(in oklab, var(--accent-2) 60%, var(--ink-faint) 40%)',
    width: 1.5,
    dasharray: '5 3',
    opacity: 0.85,
    getValue: (dim) => dim.scores.flash_c1,
    getFacetValue: (f) => f.scores.flash_c1,
    z: 20,
  },
  {
    id: 'flash_c2',
    label: 'gemini 3-flash · chat 2',
    short: 'flash c2',
    character: 'technical, clinical',
    group: 'flash',
    family: 'flash',
    // distinguish c2 from c1 within flash by a finer dash rhythm.
    stroke: 'color-mix(in oklab, var(--accent-2) 60%, var(--ink-faint) 40%)',
    width: 1.5,
    dasharray: '2 3',
    opacity: 0.85,
    getValue: (dim) => dim.scores.flash_c2,
    getFacetValue: (f) => f.scores.flash_c2,
    z: 21,
  },
];

export const FAMILY_MEAN_LINES = [
  {
    id: 'opus_mean',
    label: 'opus mean (n=2)',
    short: 'opus mean',
    character: 'balanced, evidence-focused',
    group: 'family-mean',
    family: 'opus',
    stroke: 'var(--accent)',
    width: 2,
    dasharray: null,
    getValue: (dim) => familyMean(dim.scores, 'opus'),
    getFacetValue: (f) => familyMean(f.scores, 'opus'),
    z: 50,
  },
  {
    id: 'gemini_mean',
    label: 'gemini-pro mean (n=2)',
    short: 'gemini-pro mean',
    character: 'dramatic, archetypal',
    group: 'family-mean',
    family: 'gemini',
    stroke: 'var(--accent-2)',
    width: 2,
    dasharray: null,
    getValue: (dim) => familyMean(dim.scores, 'gemini'),
    getFacetValue: (f) => familyMean(f.scores, 'gemini'),
    z: 51,
  },
  {
    id: 'flash_mean',
    label: 'flash mean (n=2)',
    short: 'flash mean',
    character: 'technical, clinical',
    group: 'family-mean',
    family: 'flash',
    stroke: 'color-mix(in oklab, var(--accent-2) 60%, var(--ink-faint) 40%)',
    width: 2,
    dasharray: '5 3',
    getValue: (dim) => familyMean(dim.scores, 'flash'),
    getFacetValue: (f) => familyMean(f.scores, 'flash'),
    z: 49,
  },
];

export const LINES_ALL = {};
for (const ln of LINES) LINES_ALL[ln.id] = ln;
for (const ln of FAMILY_MEAN_LINES) LINES_ALL[ln.id] = ln;

export const PRESETS = {
  cloud: {
    label: 'cloud',
    desc: 'all six chats + the questionnaire baseline',
    lineIds: ['baseline','opus_c1','opus_c2','gemini_c1','gemini_c2','flash_c1','flash_c2'],
  },
  ensemble: {
    label: 'ensemble',
    desc: 'just the LLM mean against the baseline',
    lineIds: ['baseline','ensemble'],
  },
  modelMeans: {
    label: 'model means',
    desc: 'per-family means against the baseline',
    lineIds: ['baseline','opus_mean','gemini_mean','flash_mean'],
  },
  vsBaseline: {
    label: 'vs baseline',
    desc: 'the gap between LLM consensus and the questionnaire',
    lineIds: ['baseline','ensemble'],
    shadeBaselineGap: true,
  },
};

export const DEFAULT_PRESET = 'cloud';
