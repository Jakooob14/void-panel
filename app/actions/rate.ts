'use server';

import { headers } from 'next/headers';
import redisClient from '@/app/utilities/redisClient';

const SESSION_PREFIX = 'rate';

export async function createOrUpdateRate() {
  const hds = await headers();
  let ip = hds.get('x-real-ip');
  if (!ip) throw new Error('No cf-connecting-ip header');

  ip = ip.replaceAll(':', '-');

  const sessionKey = `${SESSION_PREFIX}:${ip}`;

  const rateData = await redisClient.hgetall(sessionKey);
  let rate = 1;

  if (rateData && Object.keys(rateData).length > 0) {
    rate = parseInt(rateData.count) + 1;
  }

  await redisClient.hmset(sessionKey, 'count', rate);
  if (rate === 1) await redisClient.expire(sessionKey, 60);

  return rate;
}
