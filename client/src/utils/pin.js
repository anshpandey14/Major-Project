import CryptoJS from "crypto-js";

const PIN_KEY = "ehr_pin_hash";
const ATTEMPTS_KEY = "ehr_pin_attempts";
const LOCK_KEY = "ehr_pin_locked_until";
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const hashPIN = (pin) => {
  return CryptoJS.SHA256(pin).toString();
};

export const setPIN = (pin) => {
  localStorage.setItem(PIN_KEY, hashPIN(pin));
  resetAttempts();
};

export const hasPIN = () => {
  return !!localStorage.getItem(PIN_KEY);
};

export const verifyPIN = (pin) => {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return false;
  return hashPIN(pin) === stored;
};

export const getAttempts = () => {
  return parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10);
};

export const incrementAttempts = () => {
  const current = getAttempts();
  const next = current + 1;
  localStorage.setItem(ATTEMPTS_KEY, String(next));
  if (next >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_DURATION_MS));
  }
  return next;
};

export const resetAttempts = () => {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(LOCK_KEY);
};

export const isLocked = () => {
  const lockedUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
  if (!lockedUntil) return false;
  if (Date.now() < lockedUntil) return true;
  // Lockout expired — clear it
  localStorage.removeItem(LOCK_KEY);
  localStorage.removeItem(ATTEMPTS_KEY);
  return false;
};

export const getRemainingLockSeconds = () => {
  const lockedUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
  if (!lockedUntil) return 0;
  const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
  return Math.max(0, remaining);
};

export const clearPIN = () => {
  localStorage.removeItem(PIN_KEY);
  resetAttempts();
};
