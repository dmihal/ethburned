import sdk from './sdk';

export const getTotalBurned = async () => {
  const result = await sdk.graph.query(
    'dmihal/mainnet-eth-burned',
    `{
    ethburned(id:"1") {
      burned
    }
    _meta {
      block {
        number
      }
    }
  }`,
    {
      node: 'http://subgraph.ethburned.com',
    }
  );

  return {
    burned: parseFloat(result.ethburned?.burned || '0'),
    block: parseInt(result._meta.block.number),
  };
};

const ONE_HOUR = 60 * 60 * 1000;

export const getBurnedLastHr = async () => {
  const yesterday = new Date().getTime() - ONE_HOUR;
  const yesterdayBlock = await sdk.chainData.getBlockNumber(yesterday, 'goerli');

  const result = await sdk.graph.query(
    'dmihal/mainnet-eth-burned',
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

  if (!result.now) {
    return 0;
  }

  return result.now.burned - result.yesterday.burned;
};

export const getBurnedOnRecentBlocks = async () => {
  const {
    _meta: {
      block: { number: currentBlock },
    },
  } = await sdk.graph.query(
    'dmihal/eth-burned',
    `{
    _meta {
      block {
        number
      }
    }
  }`,
    {
      node: 'http://subgraph.ethburned.com',
    }
  );

  const burnQueries = [];
  for (let block = currentBlock - 30; block <= currentBlock; block += 1) {
    burnQueries.push(`block_${block}: ethburned(id: "1", block: { number: ${block} }) { burned }`);
  }

  const result = await sdk.graph.query('dmihal/eth-burned', `{${burnQueries.join('\n')}}`, {
    node: 'http://subgraph.ethburned.com',
  });

  const dateResults = await sdk.graph.query(
    'blocklytics/ethereum-blocks',
    `query ($startBlock: Int!, $endBlock: Int!){
       blocks(where: {number_gte: $startBlock, number_lte: $endBlock }, orderBy: number) {
        number
        timestamp
      }
    }`,
    {
      variables: {
        startBlock: currentBlock - 30,
        endBlock: currentBlock,
      },
    }
  );

  const burnedOnBlock: { block: number; burned: number; timestamp: number }[] = [];
  for (let i = 0; i <= 30; i += 1) {
    if (!dateResults.blocks[i]) {
      break;
    }

    const block = currentBlock - 30 + i;
    burnedOnBlock.push({
      block,
      burned: parseFloat(result[`block_${block}`].burned),
      timestamp: parseInt(dateResults.blocks[i].timestamp),
    });
  }

  return burnedOnBlock;
};

export const getCurrentBlock = async () => {
  const blockResult = await sdk.graph.query(
    'blocklytics/ethereum-blocks',
    `{
      blocks(first: 1, skip: 0, orderBy: number, orderDirection: desc, where: {number_gt: 9300000}) {
        number
      }
    }`
  );
  return parseInt(blockResult.blocks[0].number);
};
