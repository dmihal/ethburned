import sdk from './sdk';

const SUBGRAPH = 'dmihal/eth-burned';
const GRAPH_NODE = 'http://subgraph.ethburned.com';

export const getTotalBurned = async () => {
  const result = await sdk.graph.query(
    SUBGRAPH,
    `{
    ethburned(id:"1") {
      burned
      burnedUSD
    }
    _meta {
      block {
        number
      }
    }
  }`,
    {
      node: GRAPH_NODE,
    }
  );

  return {
    burned: parseFloat(result.ethburned?.burned || '0'),
    burnedUSD: parseFloat(result.ethburned?.burnedUSD || '0'),
    block: parseInt(result._meta.block.number),
  };
};

const ONE_HOUR = 60 * 60 * 1000;

export const getBurnedLastHr = async () => {
  const yesterday = new Date().getTime() - ONE_HOUR;
  const yesterdayBlock = await sdk.chainData.getBlockNumber(yesterday, 'ethereum');

  const result = await sdk.graph.query(
    SUBGRAPH,
    `query ($yesterdayBlock: Int!){
    now: ethburned(id:"1") {
      burned
      burnedUSD
    }
    yesterday: ethburned(id:"1", block: { number: $yesterdayBlock }) {
      burned
      burnedUSD
    }
  }`,
    {
      variables: { yesterdayBlock },
      node: GRAPH_NODE,
    }
  );

  if (!result.now) {
    return { burned: 0, burnedUSD: 0 };
  }

  if (!result.yesterday) {
    return {
      burned: parseFloat(result.now.burned),
      burnedUSD: parseFloat(result.now.burnedUSD),
    };
  }

  return {
    burned: result.now.burned - result.yesterday.burned,
    burnedUSD: result.now.burnedUSD - result.yesterday.burnedUSD,
  };
};

export const getBurnedOnRecentBlocks = async () => {
  const {
    _meta: {
      block: { number: currentBlock },
    },
  } = await sdk.graph.query(
    SUBGRAPH,
    `{
    _meta {
      block {
        number
      }
    }
  }`,
    {
      node: GRAPH_NODE,
    }
  );

  const burnQueries = [];
  for (let block = currentBlock - 30; block <= currentBlock; block += 1) {
    burnQueries.push(`block_${block}: ethburned(id: "1", block: { number: ${block} }) { burned }`);
  }

  const burnQuery = sdk.graph.query(SUBGRAPH, `{${burnQueries.join('\n')}}`, {
    node: GRAPH_NODE,
  });

  const dataQuery = sdk.graph.query(
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

  const [result, dateResults] = await Promise.all([burnQuery, dataQuery]);

  const burnedOnBlock: { block: number; burned: number; timestamp: number }[] = [];
  for (let i = 0; i <= 30; i += 1) {
    if (!dateResults.blocks[i]) {
      break;
    }

    const block = currentBlock - 30 + i;

    if (!result[`block_${block}`]) {
      continue;
    }
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

export const getBlockTime = async () => {
  const NUM_BLOCKS = 1000;

  const currentBlockResult = await sdk.graph.query(
    'blocklytics/ethereum-blocks',
    `{
      blocks(first: 1, skip: 0, orderBy: number, orderDirection: desc, where: {number_gt: 9300000}) {
        number
        timestamp
      }
    }`
  );

  const oldBlockResult = await sdk.graph.query(
    'blocklytics/ethereum-blocks',
    `{
      blocks(where: {number: ${currentBlockResult.blocks[0].number - NUM_BLOCKS}}) {
        timestamp
      }
    }`
  );

  return (currentBlockResult.blocks[0].timestamp - oldBlockResult.blocks[0].timestamp) / NUM_BLOCKS;
};
