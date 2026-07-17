import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractDomain(input) {
  const raw = input.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  return raw.split('/')[0].toLowerCase();
}

function positionResult(citationUrls, domain) {
  const idx = citationUrls.findIndex((url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '').toLowerCase().includes(domain);
    } catch {
      return url.toLowerCase().includes(domain);
    }
  });
  if (idx === -1) return { found: false, position: null, confidence: 0 };
  return { found: true, position: idx + 1, confidence: Math.max(35, 100 - idx * 15) };
}

async function checkChatGPT(query, domain) {
  const response = await openai.responses.create({
    model: 'gpt-4.1',
    tools: [{ type: 'web_search_preview' }],
    input: query,
  });

  const citations = [];
  for (const item of response.output ?? []) {
    if (item.type !== 'message') continue;
    for (const block of item.content ?? []) {
      for (const annotation of block.annotations ?? []) {
        if (annotation.type === 'url_citation' && annotation.url) citations.push(annotation.url);
      }
    }
  }

  return positionResult(citations, domain);
}

async function checkPerplexity(query, domain) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: query }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity request failed (${res.status})`);
  }

  const data = await res.json();
  const citations = data.citations ?? [];
  return positionResult(citations, domain);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { query, website } = req.body ?? {};
  if (!query || !website) {
    res.status(400).json({ error: 'query and website are required' });
    return;
  }

  const domain = extractDomain(website);

  const [chatgpt, perplexity] = await Promise.all([
    checkChatGPT(query, domain).catch((err) => {
      console.error('ChatGPT check failed:', err);
      return { found: false, position: null, confidence: 0, error: err.message };
    }),
    checkPerplexity(query, domain).catch((err) => {
      console.error('Perplexity check failed:', err);
      return { found: false, position: null, confidence: 0, error: err.message };
    }),
  ]);

  res.status(200).json({
    query,
    website,
    chatgpt,
    perplexity,
    timestamp: new Date().toISOString(),
  });
}
