import { AbstractProvider } from 'web3-core';

interface ConnectInfo {
  chainId: string;
}

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

export interface EthereumProvider extends AbstractProvider {
  isMetaMask: boolean;
  chainId: boolean;
  autoRefreshOnNetworkChange: boolean;
  isConnected(): boolean;
  request(props: { method: 'eth_requestAccounts' }): Promise<[string]>;
  on(eventType: 'connect', handler: (connectInfo: ConnectInfo) => void): this;
  on(eventType: 'accountsChanged', listener: (accounts: string[]) => void): this;
  on(eventType: 'disconnect', listener: (error: ProviderRpcError) => void): this;
  on(eventType: 'chainChanged', listener: (chainId: string) => void): this;
  on(eventType: 'message', listener: (message: ProviderMessage) => void): this;
}