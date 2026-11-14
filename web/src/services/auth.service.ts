import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { demoAdapter } from '@/lib/demoAdapter';
import { UserProfile, UserRole } from '@/types';
import { DEMO_OTP_CODE } from '@/lib/constants';

export const authService = {
  async getCurrentProfile(): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      return demoAdapter.getProfile();
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return demoAdapter.getProfile();
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    if (error || !data) {
      return demoAdapter.getProfile();
    }
    return data as UserProfile;
  },

  async signInWithEmail(
    email: string,
    password: string,
    role?: UserRole
  ): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      const resolvedRole: UserRole =
        role ?? (email.toLowerCase().includes('consumer') ? 'consumer' : 'prosumer');
      return demoAdapter.updateProfile({
        email,
        role: resolvedRole,
        fullName: resolvedRole === 'prosumer' ? 'Alex Rivera (Producer)' : 'Priya Sharma (Consumer)',
      });
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return this.getCurrentProfile();
  },

  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      return demoAdapter.updateProfile({ email, fullName, role, onboarded: false });
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw new Error(error.message);
    return this.getCurrentProfile();
  },

  /**
   * Check the 6-digit code from the sign-up email.
   * Demo mode: only DEMO_OTP_CODE (123456) is accepted.
   * Real backend: Supabase verifies the emailed code (Person 2 owns the email OTP setup).
   */
  async verifyEmailOtp(email: string, code: string): Promise<void> {
    if (!isSupabaseConfigured) {
      if (code !== DEMO_OTP_CODE) {
        throw new Error(`That code is incorrect. In demo mode the code is ${DEMO_OTP_CODE}.`);
      }
      return;
    }
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) throw new Error(error.message);
  },

  /** Send a fresh sign-up code to the user's email. No-op in demo mode. */
  async resendEmailOtp(email: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw new Error(error.message);
  },

  async switchRole(role: UserRole): Promise<UserProfile> {
    return demoAdapter.updateRole(role);
  },

  /**
   * Save edits from the Profile page. Role, balances and IDs are not editable here.
   *
   * Team rule: the browser never writes tables directly; it only calls database functions.
   * None of the agreed functions covers profile edits yet, so this saves to the local demo
   * store only. When the backend adds an `update_profile` function, call it here with
   * `supabase.rpc('update_profile', { ... })`.
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return demoAdapter.updateProfile(updates);
  },

  async updateOnboardingProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return demoAdapter.updateProfile({ ...updates, onboarded: true });
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },
};
