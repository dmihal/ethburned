import sdk from './sdk';

export const getTotalBurned = async () => {
  const result = await sdk.graph.query(
    'dmihal/eth-burned',
    `{
    ethburned(id:"1") {
      burned
    }
  }`,
    {
      node: 'http://subgraph.ethburned.com',
    }
  );

  return parseFloat(result.ethburned.burned);
};

const ONE_DAY = 24 * 60 * 60 * 1000;

export const getBurned24hrs = async () => {
  const yesterday = new Date().getTime() - ONE_DAY;
  const yesterdayBlock = await sdk.chainData.getBlockNumber(yesterday, 'goerli');

  const result = await sdk.graph.query(
    'dmihal/eth-burned',
    `query ($yesterdayBlock: Int!){
    now: ethburned(id:"1") {
      burned
    }
    yesterday: ethburned(id:"1", block: { number: $yesterdayBlock }) {
      burned
    }
  }`,
    {
      variables: { yesterdayBlock },
      node: 'http://subgraph.ethburned.com',
    }
  );

  return result.now.burned - result.yesterday.burned;
};
