import type { DeviceFingerprint } from '@/hooks/useDeviceFingerprint';

// compareFingerprints counts matching fields and reports trust against a threshold.
export const compareFingerprints = (
  current: DeviceFingerprint,
  stored: DeviceFingerprint | null,
  threshold: number = 3
) => {
  // Early exit if no stored fingerprint is available.
  if (!stored) {
    return { matchCount: 0, matchedFields: [], isTrusted: false };
  }

  // Track which fields matched for transparency/debug.
  const matchedFields: string[] = [];

  // Compare each property and record matches.
  if (current.model && stored.model && current.model === stored.model) {
    matchedFields.push('model');
  }
  if (current.brand && stored.brand && current.brand === stored.brand) {
    matchedFields.push('brand');
  }
  if (current.osVersion && stored.osVersion && current.osVersion === stored.osVersion) {
    matchedFields.push('osVersion');
  }
  if (current.installId && stored.installId && current.installId === stored.installId) {
    matchedFields.push('installId');
  }

  // Determine trust based on the threshold (default 3 of 4).
  const matchCount = matchedFields.length;
  const isTrusted = matchCount >= threshold;

  return { matchCount, matchedFields, isTrusted };
};
