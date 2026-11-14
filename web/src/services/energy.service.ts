import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { demoAdapter } from '@/lib/demoAdapter';
import { db } from '@/lib/dbFunctions';
import { EnergyGenerationPoint, EnergyStatsSummary } from '@/types';

export const energyService = {
  async getDashboardData(): Promise<{
    stats: EnergyStatsSummary;
    telemetry: EnergyGenerationPoint[];
  }> {
    if (!isSupabaseConfigured) {
      return demoAdapter.getEnergyStats();
    }
    const { data, error } = await supabase.from('energy_readings').select('*').limit(24);
    if (error || !data || data.length === 0) {
      return demoAdapter.getEnergyStats();
    }
    return demoAdapter.getEnergyStats();
  },

  /** log_energy */
  async logEnergy(kwh: number): Promise<void> {
    await db.logEnergy(kwh);
  },

  /** claim_credits */
  async claimCredits(kwh: number): Promise<void> {
    await db.claimCredits(kwh);
  },
};
