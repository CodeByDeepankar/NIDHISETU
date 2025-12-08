import { supabase } from '@/lib/supabaseClient';
import type { DeviceFingerprint } from '@/hooks/useDeviceFingerprint';

// Service encapsulating Supabase access for device_auth table.
export const DeviceService = {
  // Fetch the most recent fingerprint for a beneficiary.
  async fetchLatestFingerprint(beneficiaryId: string): Promise<DeviceFingerprint | null> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('device_auth')
      .select('model, brand, os_version, install_id')
      .eq('beneficiary_id', beneficiaryId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const record = data[0];
    return {
      model: record.model ?? null,
      brand: record.brand ?? null,
      osVersion: record.os_version ?? null,
      installId: record.install_id ?? '',
    };
  },

  // Insert or update fingerprint for the beneficiary (one row per beneficiary enforced via onConflict).
  async upsertFingerprint(beneficiaryId: string, fingerprint: DeviceFingerprint) {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      beneficiary_id: beneficiaryId,
      model: fingerprint.model,
      brand: fingerprint.brand,
      os_version: fingerprint.osVersion,
      install_id: fingerprint.installId,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('device_auth')
      .upsert(payload, { onConflict: 'beneficiary_id' });

    if (error) {
      throw error;
    }
  },
};
