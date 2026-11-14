import { connectWallet, SEPOLIA_CHAIN_ID } from '@/lib/chain';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { demoAdapter } from '@/lib/demoAdapter';
import { ChainEventLog } from '@/types';

export const blockchainService = {
  contractAddress: CONTRACT_ADDRESS,
  chainId: SEPOLIA_CHAIN_ID,

  async connectWallet(): Promise<{ address: string; chainId: number }> {
    try {
      const result = await connectWallet();
      demoAdapter.updateProfile({ walletAddress: result.address });
      return result;
    } catch {
      const fallbackAddress = '0x71C9...9A21';
      demoAdapter.updateProfile({ walletAddress: fallbackAddress });
      return { address: fallbackAddress, chainId: SEPOLIA_CHAIN_ID };
    }
  },

  async getChainEvents(): Promise<ChainEventLog[]> {
    return demoAdapter.getChainEvents();
  },
};
