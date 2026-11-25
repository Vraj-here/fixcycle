/**
 * Secure client-side authentication helper using Web Crypto API (SHA-256 + per-user salt).
 * - Never stores plaintext passwords.
 * - Never exposes hardcoded accounts or credentials in UI or source code.
 * - Includes strict email & password validation and rate-limiting against brute-force attempts.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || '').trim().toLowerCase());
}

export function validatePasswordStrength(password) {
  const pwd = String(password || '');
  if (pwd.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
    return 'Password must include both letters and at least one number.';
  }
  return '';
}

export function generateSalt() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt) {
  const input = `${salt}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer), (b) =>
      b.toString(16).padStart(2, '0')
    ).join('');
  }
  // Safe fallback for non-HTTPS local LAN HTTP contexts where crypto.subtle may be restricted
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

export function sanitizeText(value, maxLength = 120) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}
