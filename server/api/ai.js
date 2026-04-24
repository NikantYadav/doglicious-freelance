import Anthropic from '@anthropic-ai/sdk';

console.log('🤖 [VetAI] AI Handler - Version SDK-V2.1 - Loaded');

// Support all common key name variants
const getApiKey = () => process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLUADE_API_KEY;

let _anthropic;
const getAnthropic = () => {
    if (!_anthropic) {
        const key = getApiKey();
        if (!key) console.warn('⚠️ [VetAI] No Anthropic API key found in process.env');
        _anthropic = new Anthropic({ apiKey: key });
    }
    return _anthropic;
};

const geminiKey = () => process.env.GEMINI_API_KEY;

const MODEL_GEMINI = 'gemini-2.5-flash';
const MODEL_CLAUDE = 'claude-sonnet-4-5-20250929';

async function callClaude(prompt, imageB64, imageMime) {
    const content = [];
    if (imageB64 && imageMime) {
        const cleanB64 = imageB64.includes('base64,') ? imageB64.split('base64,')[1] : imageB64;
        content.push({
            type: 'image',
            source: {
                type: 'base64',
                media_type: imageMime,
                data: cleanB64
            }
        });
    }
    content.push({ type: 'text', text: prompt });

    try {
        const response = await getAnthropic().messages.create({
            model: MODEL_CLAUDE,
            max_tokens: 4096,
            system: "You are VetAI, an expert canine veterinary diagnostic AI. Response ONLY in valid JSON.",
            messages: [{ role: 'user', content }]
        });

        const raw = response.content[0].text;
        return JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
    } catch (err) {
        // Rethrow with a flag so we know it came from THIS code
        throw new Error(`[SDK-ERROR] ${err.message}`);
    }
}

async function callGemini(prompt, imageB64, imageMime) {
    const key = geminiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent?key=${key}`;

    const parts = [];
    if (imageB64 && imageMime) {
        const cleanB64 = imageB64.includes('base64,') ? imageB64.split('base64,')[1] : imageB64;
        parts.push({ inlineData: { mimeType: imageMime, data: cleanB64 } });
    }
    parts.push({ text: prompt });

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json'
            }
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Gemini API: ${res.status} ${err?.error?.message || ''}`);
    }

    const d = await res.json();
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { type, photo, dogProfile, selectedPart, selectedSymptoms, initialAnalysis, answers } = req.body;

    try {
        let prompt = '';
        const dog = dogProfile || {};
        const age = `${dog.ageYears || 0}yr ${dog.ageMonths || 0}mo`;

        if (type === 'initial') {
            prompt = `You are VetAI, an expert canine veterinary diagnostic AI. Analyze the photo and profile. Respond ONLY in valid JSON.
            DOG: ${dog.name}, ${dog.breed}, ${age}, ${dog.weight}kg. Diet: ${dog.foodType}.
            AREA: ${selectedPart}. SYMPTOMS: ${selectedSymptoms?.join(', ')}.
            RETURN: { "imageFindings":"...", "conditions":["..."], "confidence":0, "confidenceLabel":"...", "urgency":"...", "summary":"...", "questions":[{"text":"...","options":["..."]}] }`;
        } else {
            const ia = initialAnalysis || {};
            const qa = (ia.questions || []).map((q, i) => `Q: ${q.text} -> A: ${answers[i] || ''}`).join('\n');
            prompt = `You are VetAI. Provide a REFINED diagnosis report. Respond ONLY in valid JSON.
            DOG: ${dog.name}, ${dog.breed}, ${age}, ${dog.weight}kg. Diet: ${dog.foodType}.
            IA FINDINGS: ${ia.imageFindings}. FOLLOW-UP Q&A: \n${qa}
            RETURN: { "healthScore":0, "healthTarget":85, "daysToImprove":10, "diagnosis":"...", "severity":"...", "confidence":0, "confidenceLabel":"...", "urgency":"...", "imageFindings":"...", "summary":"...", "steps":["..."], "natural":["..."], "diet":"...", "currentDietAssessment":"...", "redFlags":["..."], "vetNow":false }`;
        }

        const useGemini = !!process.env.GEMINI_API_KEY;
        const result = useGemini
            ? await callGemini(prompt, photo?.b64, photo?.mime)
            : await callClaude(prompt, photo?.b64, photo?.mime);

        return res.status(200).json(result);
    } catch (err) {
        console.error('[AI Handler Error]', err);
        return res.status(500).json({ error: err.message });
    }
}
