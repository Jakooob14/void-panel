import crypto from 'crypto';

export function getGravatar(email: string, size = 48) {
  return `https://gravatar.com/avatar/${crypto.hash('sha256', email.trim().toLowerCase())}?s=${size}&d=retro`;
}
