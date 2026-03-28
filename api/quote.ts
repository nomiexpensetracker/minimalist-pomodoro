import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const response = await fetch('https://zenquotes.io/api/random');
  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to fetch quote' });
  }
  const data = await response.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json(data);
}
