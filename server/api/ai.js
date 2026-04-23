
const geminiKey = () => process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

async function callGemini(prompt, imageB64, imageMime) {
    const key = geminiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

    const parts = [];
    if (imageB64 && imageMime) {
        parts.push({ inlineData: { mimeType: imageMime, data: imageB64 } });
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

        const result = await callGemini(prompt, photo?.b64, photo?.mime);
        return res.status(200).json(result);
    } catch (err) {
        console.error('[AI Handler Error]', err);
        return res.status(500).json({ error: err.message });
    }
}
