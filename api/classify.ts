/**
 * Vercel Serverless Function — AI Issue Classification
 * Keeps Anthropic API key server-side.
 * POST /api/classify { description, categories }
 */

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const { description, categories } = await req.json();

    if (!description || !categories?.length) {
      return Response.json({ error: 'Missing description or categories' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Classify this commercial door hardware issue into ONE category.

Issue: "${description}"

Categories: ${categories.join(', ')}

Return ONLY valid JSON: {"category": "<exact category name>", "confidence": 0.0-1.0}`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return Response.json({ category: 'Door Accessories', confidence: 0.3 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';

    // Parse JSON from response
    const match = text.match(/\{[^}]+\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Response.json({
        category: parsed.category || 'Door Accessories',
        confidence: parsed.confidence || 0.7,
      });
    }

    return Response.json({ category: 'Door Accessories', confidence: 0.3 });
  } catch (err) {
    console.error('Classify error:', err);
    return Response.json({ category: 'Door Accessories', confidence: 0.3 });
  }
}
