import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOL = {
  name: 'submit_aeo_analysis',
  description: 'Submit a structured AEO (Answer Engine Optimization) analysis of the provided content.',
  input_schema: {
    type: 'object',
    properties: {
      score: { type: 'integer', minimum: 0, maximum: 100 },
      grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
      strengths: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
      weaknesses: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
      recommendations: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
      categories: {
        type: 'object',
        properties: {
          structure: { type: 'integer', minimum: 0, maximum: 100 },
          clarity: { type: 'integer', minimum: 0, maximum: 100 },
          completeness: { type: 'integer', minimum: 0, maximum: 100 },
          actionability: { type: 'integer', minimum: 0, maximum: 100 },
        },
        required: ['structure', 'clarity', 'completeness', 'actionability'],
      },
    },
    required: ['score', 'grade', 'strengths', 'weaknesses', 'recommendations', 'categories'],
  },
};

function extractTextFromHtml(html) {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const titleMatch = withoutNoise.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : null;

  const text = withoutNoise
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  return { title, text };
}

async function fetchUrlContent(url) {
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  let target;
  try {
    target = new URL(normalized);
  } catch {
    throw new Error('That URL doesn\'t look valid');
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error('Only http/https URLs are supported');
  }

  let res;
  try {
    res = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEOMonitorBot/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error("Couldn't reach that URL - check it's correct and publicly accessible");
  }
  if (!res.ok) {
    throw new Error(`Couldn't fetch that URL (${res.status})`);
  }
  const html = await res.text();
  const { title, text } = extractTextFromHtml(html);
  if (!text || text.length < 50) {
    throw new Error('Could not find readable content on that page');
  }
  return { title, text: text.slice(0, 15000) };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { content, url } = req.body ?? {};
  if ((!content || !content.trim()) && (!url || !url.trim())) {
    res.status(400).json({ error: 'content or url is required' });
    return;
  }

  let textToAnalyze = content;
  let sourceUrl = null;
  let pageTitle = null;

  if (url && url.trim()) {
    try {
      const fetched = await fetchUrlContent(url.trim());
      textToAnalyze = fetched.text;
      pageTitle = fetched.title;
      sourceUrl = url.trim();
    } catch (err) {
      res.status(422).json({ error: err.message });
      return;
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: [
        {
          role: 'user',
          content: `You are an AEO (Answer Engine Optimization) analyst. AEO measures how well content is structured to be surfaced and cited by AI search engines like ChatGPT, Perplexity, and Google AI Overviews — things like clear structure, direct answers, FAQ coverage, scannability, and specific/actionable claims.

Analyze the following content and submit your analysis via the submit_aeo_analysis tool.

Content:
"""
${textToAnalyze}
"""`,
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === 'tool_use');
    if (!toolUse) {
      res.status(502).json({ error: 'Model did not return structured analysis' });
      return;
    }

    res.status(200).json({ ...toolUse.input, sourceUrl, pageTitle, wordCount: textToAnalyze.split(/\s+/).filter(Boolean).length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
}
