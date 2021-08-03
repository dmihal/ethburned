import sdk from './sdk';

export const getTotalBurned = async () => {
  const result = await sdk.graph.query(
    'dmihal/eth-burned',
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
    burned: parseFloat(result.ethburned.burned),
    block: parseInt(result._meta.block.number),
  };
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
    'blocklytics/goerli-blocks',
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
