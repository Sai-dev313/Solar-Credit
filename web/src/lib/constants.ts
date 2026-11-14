export const APP_NAME = 'SolarCredit';

export const USER_ROLES = {
  CONSUMER: 'consumer',
  PROSUMER: 'prosumer',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const SEPOLIA_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_ENERGY_TRADING_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

/** Supported electricity distribution companies (DISCOMs) for BBPS bill settlement */
export const DISCOM_PROVIDERS: { value: string; label: string }[] = [
  { value: 'bescom', label: 'BESCOM - Bangalore Electricity Supply' },
  { value: 'msedcl', label: 'MSEDCL - Maharashtra State Electricity' },
  { value: 'tata', label: 'Tata Power - Mumbai & Delhi' },
  { value: 'adani', label: 'Adani Electricity - Mumbai' },
  { value: 'bses-rajdhani', label: 'BSES Rajdhani - Delhi NCT' },
  { value: 'bses-yamuna', label: 'BSES Yamuna - Delhi NCT' },
  { value: 'tangedco', label: 'TANGEDCO - Tamil Nadu' },
  { value: 'wbsetcl', label: 'WBSEDCL - West Bengal' },
];

/**
 * Team agreement: 1 credit (CC) = 1 kWh, and 1 credit is worth Rs 2 on an electricity bill.
 * Every rupee value of credits in the UI must come from this constant.
 */
export const CREDIT_VALUE_INR = 2;

/** The email OTP code that always works in offline demo mode */
export const DEMO_OTP_CODE = '123456';
