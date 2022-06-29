import { Adapter, CryptoStatsSDK } from '@cryptostats/sdk';

const sdk = new CryptoStatsSDK();

export default sdk;

let adapterPromise: Promise<Adapter> | null = null;

export function getAdapter() {
  if (!adapterPromise) {
    adapterPromise = getAdapterImpl();
  }
  return adapterPromise;
}

async function getAdapterImpl() {
  const list = sdk.getCollection('eth-burned');
  const isServer = typeof window === 'undefined';

  if (isServer) {
    await list.fetchAdapters();
  } else {
    await list.fetchAdapterFromIPFS('QmXQDGDAn9v8BBYzXdNhVQeAEqTacHx3qK5cW6mTPXFM8H');
  }
  const adapter = list.getAdapter('eth-burned');
  return adapter;
}
