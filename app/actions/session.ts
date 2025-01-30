'use server';

import redisClient from '@/app/utilities/redisClient';
import { cookies } from 'next/headers';
import { cache } from 'react';

const SESSION_PREFIX = 'session';
const REFRESH_PREFIX = 'refresh';

export async function createSession(userId: string, prefix = SESSION_PREFIX, expiration = 1800) {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const sessionId = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const sessionKey = `${prefix}:${sessionId}`;

  await redisClient.hmset(sessionKey, {
    userId: userId,
  });

  await redisClient.expire(sessionKey, expiration);

  return sessionId;
}

export async function getSession(sessionId: string | undefined | null, prefix = SESSION_PREFIX) {
  if (!sessionId) return null;

  const sessionKey = `${prefix}:${sessionId}`;
  const sessionData = await redisClient.hgetall(sessionKey);

  if (!sessionData || Object.keys(sessionData).length === 0) return null;
  return sessionData;
}

export async function destroySession() {
  const cks = await cookies();
  const sessionId = cks.get('sessionId')?.value;
  const refreshId = cks.get('refreshToken')?.value;

  const sessionKey = `${SESSION_PREFIX}:${sessionId}`;
  const refreshKey = `${REFRESH_PREFIX}:${refreshId}`;

  await redisClient.del(sessionKey);
  await redisClient.del(refreshKey);

  cks.delete('accessToken');
  cks.delete('refreshToken');
}

export async function destroyAllUserSessions() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Could not destroy sessions userId is not present');

  const cks = await cookies();
  const sessionKeys = await redisClient.keys(`${SESSION_PREFIX}:*`);
  const refreshKeys = await redisClient.keys(`${REFRESH_PREFIX}:*`);

  for (const key of sessionKeys) {
    const sessionData = await redisClient.hgetall(key);
    if (sessionData && sessionData.userId === userId) await redisClient.del(key);
  }

  for (const key of refreshKeys) {
    const sessionData = await redisClient.hgetall(key);
    if (sessionData && sessionData.userId === userId) await redisClient.del(key);
  }

  cks.delete('accessToken');
  cks.delete('refreshToken');
}

export async function refreshSession() {
  const cks = await cookies();
  const refreshSession = await getSession(cks.get('refreshToken')?.value);
  if (!refreshSession) return null;

  try {
    return createSession(refreshSession.userId);
  } catch (err: any) {
    console.error(err.stack);
    return null;
  }
}

export const verifySession = cache(async () => {
  const cks = await cookies();
  return await getSession(cks.get('accessToken')?.value);
});

export const getCurrentUserId = cache(async () => {
  const session = await verifySession();
  return session?.userId || null;
});
