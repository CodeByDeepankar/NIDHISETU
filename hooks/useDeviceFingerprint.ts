import { useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

import { compareFingerprints } from '@/utils/compareFingerprints';
import { DeviceService } from '@/services/api/DeviceService';

// Device fingerprint type shared across hook and helpers.
export type DeviceFingerprint = {
  model: string | null;
  brand: string | null;
  osVersion: string | null;
  installId: string;
};

// SecureStore keys for PIN and install identifier.
const PIN_HASH_KEY = 'nidhi_pin_hash';
const INSTALL_ID_KEY = 'nidhi_install_id';
const PIN_ATTEMPTS_KEY = 'nidhi_pin_attempts';
const PIN_LOCK_KEY = 'nidhi_pin_locked';

// Hash a PIN locally using SHA-256 for storage (never send to backend).
const hashPin = async (pin: string) => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
};

// Retrieve or create a stable installId persisted in SecureStore.
const getOrCreateInstallId = async (): Promise<string> => {
  const existing = await SecureStore.getItemAsync(INSTALL_ID_KEY);
  if (existing) {
    return existing;
  }
  const fresh = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALL_ID_KEY, fresh);
  return fresh;
};

// Build the current device fingerprint from Expo Device info and stored installId.
const buildFingerprint = async (): Promise<DeviceFingerprint> => {
  const installId = await getOrCreateInstallId();
  return {
    model: Device.modelName ?? null,
    brand: Device.brand ?? null,
    osVersion: Device.osVersion ?? null,
    installId,
  };
};

// Read the hashed PIN from SecureStore.
const getStoredPinHash = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(PIN_HASH_KEY);
};

// Persist the hashed PIN securely.
const savePinHash = async (hash: string) => {
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  await SecureStore.deleteItemAsync(PIN_LOCK_KEY);
  await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
};

// Increment failed attempts, set lock after 3 attempts.
const recordFailedAttempt = async () => {
  const raw = await SecureStore.getItemAsync(PIN_ATTEMPTS_KEY);
  const attempts = raw ? parseInt(raw, 10) || 0 : 0;
  const next = attempts + 1;
  await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, next.toString());
  if (next >= 3) {
    await SecureStore.setItemAsync(PIN_LOCK_KEY, 'locked');
  }
  return next;
};

// Reset failed attempts and lock flag after successful auth or OTP fallback.
const resetAttempts = async () => {
  await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
  await SecureStore.deleteItemAsync(PIN_LOCK_KEY);
};

// Check if PIN is locked due to too many failures.
const isPinLocked = async () => {
  const locked = await SecureStore.getItemAsync(PIN_LOCK_KEY);
  return Boolean(locked);
};

// Hook exposes fingerprint + PIN helpers.
export const useDeviceFingerprint = () => {
  // Generate and return the current device fingerprint.
  const getFingerprint = useCallback(async () => {
    return buildFingerprint();
  }, []);

  // Save a new PIN after hashing; also resets attempts/lock.
  const savePin = useCallback(async (pin: string) => {
    const hash = await hashPin(pin);
    await savePinHash(hash);
  }, []);

  // Verify a user-entered PIN against stored hash; returns true/false and handles lock.
  const verifyPin = useCallback(async (pin: string) => {
    if (await isPinLocked()) {
      return { ok: false, locked: true, attempts: 3 } as const;
    }
    const storedHash = await getStoredPinHash();
    if (!storedHash) {
      return { ok: false, locked: false, attempts: 0 } as const;
    }
    const candidate = await hashPin(pin);
    if (candidate === storedHash) {
      await resetAttempts();
      return { ok: true, locked: false, attempts: 0 } as const;
    }
    const attempts = await recordFailedAttempt();
    const locked = attempts >= 3;
    return { ok: false, locked, attempts } as const;
  }, []);

  // Fetch stored fingerprint for a beneficiary and compare with current device.
  const evaluateFingerprintTrust = useCallback(async (beneficiaryId: string) => {
    const current = await buildFingerprint();
    const stored = await DeviceService.fetchLatestFingerprint(beneficiaryId);
    const result = compareFingerprints(current, stored, 3);
    return { current, stored, ...result };
  }, []);

  // Save the current fingerprint to Supabase for the beneficiary.
  const persistFingerprint = useCallback(async (beneficiaryId: string) => {
    const fingerprint = await buildFingerprint();
    await DeviceService.upsertFingerprint(beneficiaryId, fingerprint);
    return fingerprint;
  }, []);

  return {
    getFingerprint,
    savePin,
    verifyPin,
    evaluateFingerprintTrust,
    persistFingerprint,
  };
};
