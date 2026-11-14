import { ChainEventLog, ProofStatus } from '@/types';

/** Etherscan for the Sepolia test network, where the EnergyTrading contract runs */
const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

export const getProofStatus = (evt: ChainEventLog): ProofStatus =>
  evt.status ?? (evt.txHash ? 'verified' : 'pending');

/** A complete transaction hash: 0x followed by 64 hex characters */
export const isFullTxHash = (hash?: string | null): hash is string =>
  Boolean(hash && /^0x[0-9a-fA-F]{64}$/.test(hash));

/** A complete contract/wallet address that isn't the zero address */
export const isRealAddress = (address?: string | null): address is string =>
  Boolean(address && /^0x[0-9a-fA-F]{40}$/.test(address) && !/^0x0{40}$/.test(address));

export const etherscanTxUrl = (hash: string) => `${SEPOLIA_EXPLORER}/tx/${hash}`;
export const etherscanAddressUrl = (address: string) => `${SEPOLIA_EXPLORER}/address/${address}`;

/** Shorten 0x1234...abcd for display */
export const shortHash = (hash: string, head = 10, tail = 6) =>
  hash.length > head + tail + 3 ? `${hash.slice(0, head)}…${hash.slice(-tail)}` : hash;

/** Plain-language names for the contract events */
export const EVENT_LABELS: Record<ChainEventLog['eventName'], { label: string; icon: string }> = {
  CreditMinted: { label: 'Credits earned', icon: 'solar_power' },
  ListingCreated: { label: 'Listed for sale', icon: 'storefront' },
  ListingCancelled: { label: 'Listing cancelled', icon: 'remove_shopping_cart' },
  CreditsPurchased: { label: 'Credits bought', icon: 'shopping_cart' },
  CreditRedeemed: { label: 'Used on bill', icon: 'receipt_long' },
};
