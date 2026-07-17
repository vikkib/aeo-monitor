import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const MAX_ENTRIES = 50;

export async function recordHistory(listKey, entry) {
  try {
    await redis.lpush(listKey, JSON.stringify(entry));
    await redis.ltrim(listKey, 0, MAX_ENTRIES - 1);
  } catch (err) {
    // History is a nice-to-have; never fail the user-facing request over it.
    console.error(`Failed to record history for ${listKey}:`, err);
  }
}

export async function readHistory(listKey, limit = MAX_ENTRIES) {
  const raw = await redis.lrange(listKey, 0, limit - 1);
  return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
}
