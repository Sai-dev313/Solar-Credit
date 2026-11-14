import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { demoAdapter } from '@/lib/demoAdapter';
import { db } from '@/lib/dbFunctions';
import { ElectricityBill } from '@/types';

export const billService = {
  async getBills(): Promise<ElectricityBill[]> {
    if (!isSupabaseConfigured) {
      return demoAdapter.getBills();
    }
    const { data, error } = await supabase
      .from('electricity_bills')
      .select('*')
      .order('due_date', { ascending: false });

    if (error || !data || data.length === 0) {
      return demoAdapter.getBills();
    }
    return data as ElectricityBill[];
  },

  /** pay_bill: use credits on a bill */
  async applyCreditsToBill(billId: string, creditsKwh: number): Promise<void> {
    await db.payBill(billId, creditsKwh);
  },

  /**
   * Paying the rest of a bill in cash (UPI / net banking) is not one of the 7 agreed
   * functions, so it only works in demo mode for now.
   */
  async payRemainingBill(billId: string): Promise<void> {
    if (isSupabaseConfigured) {
      throw new Error('Paying the rest of a bill by UPI is not connected yet.');
    }
    demoAdapter.payRemainingBill(billId);
  },
};
