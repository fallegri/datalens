// Proxy serverless para evitar bloqueos CORS al llamar proveedores de IA
// desde el navegador. Corre server-to-server en Vercel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const { provider, endpoint, model, apiKey, prompt } = req.body || {};
  if (!provider || provider === 'none') {
    res.status(400).json({ error: 'Proveedor no especificado' });
    return;
  }
  try {
    let text = null;
    const base = String(endpoint || '').replace(/\/$/, '');

    if (provider === 'nvidia' || provider === 'openai_compat') {
      const r = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 500, temperature: 0.3 })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
      const data = await r.json();
      text = data.choices?.[0]?.message?.content;

    } else if (provider === 'anthropic') {
      const r = await fetch(`${base}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
      const data = await r.json();
      text = data.content?.[0]?.text;

    } else if (provider === 'gemini') {
      const r = await fetch(`${base}/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
      const data = await r.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    } else {
      res.status(400).json({ error: `Proveedor "${provider}" no soportado por este proxy (usá llamada directa para Ollama).` });
      return;
    }

    res.status(200).json({ text: text || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
