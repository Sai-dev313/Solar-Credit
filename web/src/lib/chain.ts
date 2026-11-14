import { BrowserProvider } from 'ethers';
import { SEPOLIA_CHAIN_ID } from './constants';

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

export async function getBrowserProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask or a compatible Web3 wallet is not installed.');
  }
  return new BrowserProvider(window.ethereum as never);
}

export async function connectWallet(): Promise<{ address: string; chainId: number }> {
  const provider = await getBrowserProvider();
  const accounts = (await provider.send('eth_requestAccounts', [])) as string[];
  const network = await provider.getNetwork();
  return {
    address: accounts[0],
    chainId: Number(network.chainId),
  };
}

export { SEPOLIA_CHAIN_ID };
