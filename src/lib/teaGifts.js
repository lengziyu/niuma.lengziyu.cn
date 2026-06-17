const TEA_FRIEND_ID_STORAGE_KEY = 'niuma-tea-friend-id';
const TEA_FRIEND_TOKEN_STORAGE_KEY = 'niuma-tea-friend-token';
export const TEA_GIFT_POLL_INTERVAL_MS = 12000;
const MAX_FRIEND_ID_LENGTH = 3;
const PREFERRED_SHORT_IDS = ['666', '888', '999', '520', '521', '233', '234', '345', '567', '678', '789', '123'];

function createClientToken() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `tea-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeFriendId(rawValue) {
  return String(rawValue || '')
    .trim()
    .replace(/\D/g, '')
    .slice(0, MAX_FRIEND_ID_LENGTH);
}

function storeTeaFriendId(friendId) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TEA_FRIEND_ID_STORAGE_KEY, normalizeFriendId(friendId));
}

function buildFallbackFriendId() {
  const storedId = readStoredTeaFriendId();
  if (storedId.length === MAX_FRIEND_ID_LENGTH) {
    return storedId;
  }

  if (typeof window === 'undefined') {
    return PREFERRED_SHORT_IDS[0];
  }

  const token = readOrCreateTeaFriendToken();
  const seed = Array.from(token).reduce((total, char) => total + char.charCodeAt(0), 0);
  const preferred = PREFERRED_SHORT_IDS[seed % PREFERRED_SHORT_IDS.length];

  if (preferred) {
    storeTeaFriendId(preferred);
    return preferred;
  }

  const numericId = String(100 + (seed % 900));
  storeTeaFriendId(numericId);
  return numericId;
}

export function readStoredTeaFriendId() {
  if (typeof window === 'undefined') {
    return '';
  }

  return normalizeFriendId(window.localStorage.getItem(TEA_FRIEND_ID_STORAGE_KEY));
}

export function readOrCreateTeaFriendToken() {
  if (typeof window === 'undefined') {
    return 'tea-local-token';
  }

  const storedToken = String(window.localStorage.getItem(TEA_FRIEND_TOKEN_STORAGE_KEY) || '').trim();
  if (storedToken.length >= 8) {
    return storedToken;
  }

  const nextToken = createClientToken();
  window.localStorage.setItem(TEA_FRIEND_TOKEN_STORAGE_KEY, nextToken);
  return nextToken;
}

export async function ensureTeaFriendId() {
  const clientToken = readOrCreateTeaFriendToken();
  const fallbackId = buildFallbackFriendId();

  try {
    const response = await fetch('/api/tea-gifts/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientToken, preferredId: fallbackId })
    });

    const data = await parseJsonResponse(response);
    const friendId = normalizeFriendId(data?.friendId);

    if (friendId) {
      storeTeaFriendId(friendId);
      return friendId;
    }
  } catch {
    // Keep using the local short ID when the gift service is unavailable.
  }

  return fallbackId;
}

export function sanitizeTeaFriendId(rawValue) {
  return normalizeFriendId(rawValue);
}

export async function copyText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

async function parseJsonResponse(response) {
  const rawText = await response.text().catch(() => '');
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const message = typeof data?.detail === 'string'
      ? data.detail
      : Array.isArray(data?.detail) && data.detail.length
        ? data.detail.map((item) => item?.msg).filter(Boolean).join('；')
        : typeof data?.message === 'string'
          ? data.message
          : rawText
            ? `请求失败（HTTP ${response.status}）：${rawText.slice(0, 120)}`
            : `请求失败（HTTP ${response.status}）`;
    throw new Error(message);
  }

  return data;
}

export async function sendTeaGift(payload) {
  const response = await fetch('/api/tea-gifts/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return parseJsonResponse(response);
}

export async function fetchTeaGiftInbox(friendId) {
  const normalizedId = sanitizeTeaFriendId(friendId);

  if (normalizedId.length < 3) {
    return { count: 0, items: [] };
  }

  const response = await fetch(`/api/tea-gifts/inbox/${encodeURIComponent(normalizedId)}`);
  return parseJsonResponse(response);
}

export async function acknowledgeTeaGift(friendId, giftId) {
  const normalizedId = sanitizeTeaFriendId(friendId);
  const normalizedGiftId = String(giftId || '').trim();

  if (normalizedId.length < 3 || !normalizedGiftId) {
    return { status: 'ignored', remaining: 0 };
  }

  const response = await fetch(
    `/api/tea-gifts/inbox/${encodeURIComponent(normalizedId)}/${encodeURIComponent(normalizedGiftId)}`,
    { method: 'DELETE' }
  );
  return parseJsonResponse(response);
}

export async function fetchTeaGiftReceipts(friendId) {
  const normalizedId = sanitizeTeaFriendId(friendId);

  if (normalizedId.length < 3) {
    return { count: 0, items: [] };
  }

  const response = await fetch(`/api/tea-gifts/receipts/${encodeURIComponent(normalizedId)}`);
  return parseJsonResponse(response);
}

export async function acknowledgeTeaGiftReceipt(friendId, receiptId) {
  const normalizedId = sanitizeTeaFriendId(friendId);
  const normalizedReceiptId = String(receiptId || '').trim();

  if (normalizedId.length < 3 || !normalizedReceiptId) {
    return { status: 'ignored', remaining: 0 };
  }

  const response = await fetch(
    `/api/tea-gifts/receipts/${encodeURIComponent(normalizedId)}/${encodeURIComponent(normalizedReceiptId)}`,
    { method: 'DELETE' }
  );
  return parseJsonResponse(response);
}
