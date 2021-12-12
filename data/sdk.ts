import { Adapter, CryptoStatsSDK } from '@cryptostats/sdk';

const sdk = new CryptoStatsSDK({
  adapterListSubgraph: 'dmihal/cryptostats-adapter-registry-test',
});

export default sdk;

let adapterPromise: Promise<Adapter> | null = null;

export function getAdapter() {
  if (!adapterPromise) {
    adapterPromise = getAdapterImpl();
  }
  return adapterPromise;
}

async function getAdapterImpl() {
  const list = sdk.getList('eth-burned');
  await list.fetchAdapters();
  const adapter = list.getAdapter('eth-burned');
  return adapter;
}
