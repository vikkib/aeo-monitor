import { readHistory } from './_history.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const [content, search] = await Promise.all([
      readHistory('history:content'),
      readHistory('history:search'),
    ]);

    res.status(200).json({ content, search });
  } catch (err) {
    console.error('Failed to read history:', err);
    res.status(500).json({ error: 'Could not load history' });
  }
}
