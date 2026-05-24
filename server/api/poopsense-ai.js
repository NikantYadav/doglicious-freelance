// server/api/poopsense-ai.js
// AI handler for PoopSense — analyses stool photo and returns structured health data.

import Anthropic from '@anthropic-ai/sdk';

const getApiKey = () =>
  process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLUADE_API_KEY;

let _anthropic;
const getAnthropic = () => {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: getApiKey() });
  }
  return _anthropic;
};

const MODEL_CLAUDE = 'claude-sonnet-4-5-20250929';
const MODEL_GEMINI = 'gemini-2.5-flash';
const geminiKey = () => process.env.GEMINI_API_KEY;

function buildPrompt(dog, symptoms) {
  const dogInfo = dog
    ? `Dog: ${dog.name || 'Unknown'}, ${dog.breed || 'Unknown breed'}, ${dog.age || '?'}yr, ${dog.wt || '?'}kg. Diet: ${dog.diet || 'Unknown'}.`
    : 'Dog profile not provided.';

  const symInfo = symptoms
    ? `Symptoms reported: diet=${symptoms.diet}, water=${symptoms.water}, pain=${symptoms.pain}, freq=${symptoms.freq}, other=${symptoms.other || 'none'}.`
    : 'No symptoms reported.';

  return `You are PoopSense AI, an expert canine gastrointestinal health AI. Analyse the stool photo provided.

${dogInfo}
${symInfo}

Analyse the stool image carefully for:
- Colour (ideal: medium brown)
- Consistency (Bristol Stool Scale 1-7, ideal: 3-4)
- Shape (well-formed sausage is ideal)
- Contents (mucus, blood, parasites, undigested food, foreign material)
- Overall risk pattern

Return ONLY valid JSON in this exact structure:
{
  "score": <integer 0-100>,
  "risk": "<g|w|c>",
  "stoolType": "<brief type name e.g. 'Soft-formed Type 4'>",
  "bristolScore": <integer 1-7>,
  "color": "<colour description>",
  "consistency": "<consistency description>",
  "sum": "<clinical summary 1-2 sentences>",
  "simpleEn": "<plain English explanation for pet owner, 1-2 sentences>",
  "simpleHi": "<same in Hindi, 1-2 sentences>",
  "params": {
    "color": <0-20>,
    "consistency": <0-25>,
    "shape": <0-15>,
    "contents": <0-20>,
    "riskPattern": <0-20>
  },
  "possibleConditions": ["<condition1>", "<condition2>"],
  "recommendations": ["<action1>", "<action2>", "<action3>"]
}

Score guide: 75-100 = healthy (risk: g), 50-74 = monitor (risk: w), 0-49 = urgent (risk: c).`;
}

async function callClaude(imageB64, prompt) {
  const cleanB64 = imageB64.includes('base64,') ? imageB64.split('base64,')[1] : imageB64;
  const response = await getAnthropic().messages.create({
    model: MODEL_CLAUDE,
    max_tokens: 2048,
    system: 'You are PoopSense AI, a canine gastrointestinal health expert. Respond ONLY in valid JSON.',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: cleanB64 } },
        { type: 'text', text: prompt }
      ]
    }]
  });
  const raw = response.content[0].text;
  return JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
}

async function callGemini(imageB64, prompt) {
  const key = geminiKey();
  const cleanB64 = imageB64.includes('base64,') ? imageB64.split('base64,')[1] : imageB64;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inlineData: { mimeType: 'image/jpeg', data: cleanB64 } },
        { text: prompt }
      ]}],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini: ${res.status} ${err?.error?.message || ''}`);
  }
  const d = await res.json();
  const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageB64, dog, symptoms } = req.body || {};

  if (!imageB64) {
    return res.status(400).json({ error: 'imageB64 is required' });
  }

  try {
    const prompt = buildPrompt(dog, symptoms);
    const useGemini = !!process.env.GEMINI_API_KEY;
    const result = useGemini
      ? await callGemini(imageB64, prompt)
      : await callClaude(imageB64, prompt);

    return res.status(200).json(result);
  } catch (err) {
    console.error('[poopsense-ai]', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}
