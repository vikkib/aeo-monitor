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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { content } = req.body ?? {};
  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'content is required' });
    return;
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
${content}
"""`,
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === 'tool_use');
    if (!toolUse) {
      res.status(502).json({ error: 'Model did not return structured analysis' });
      return;
    }

    res.status(200).json(toolUse.input);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
}
