/**
 * /api/ai-tip  — plain-text AI response for tools (feeding calculator, health quiz, etc.)
 * POST { prompt: string }
 * Returns { tip: string }
 */

const geminiKey = () => process.env.GEMINI_API_KEY;
const claudeKey = () => process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLUADE_API_KEY;

const MODEL_GEMINI = 'gemini-2.5-flash';
const MODEL_CLAUDE = 'claude-sonnet-4-5-20250929';

async function callGemini(prompt) {
    const key = geminiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent?key=${key}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const d = await res.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function callClaude(prompt) {
    const key = claudeKey();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: MODEL_CLAUDE,
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }],
        }),
    });
    if (!res.ok) throw new Error(`Claude ${res.status}`);
    const d = await res.json();
    return d.content?.map(b => b.text || '').join('').trim() || '';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    try {
        const tip = geminiKey()
            ? await callGemini(prompt)
            : await callClaude(prompt);
        return res.status(200).json({ tip });
    } catch (err) {
        console.error('[ai-tip]', err.message);
        return res.status(500).json({ error: err.message });
    }
}
