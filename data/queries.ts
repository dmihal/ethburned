import sdk from './sdk';

const SUBGRAPH = 'dmihal/eth-burned';
const GRAPH_NODE = 'https://subgraph.ethburned.com';

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

export const getBurnedOnRecentTimePeriod = async (period: string) => {
  if (['minute', 'hour', 'day'].indexOf(period) === -1) {
    throw new Error(`Invalid period ${period}`);
  }

  const date = new Date();
  let periodLength: number;
  if (period === 'day') {
    date.setHours(0, 0, 0, 0);
    periodLength = 24 * 60 * 60;
  } else if (period === 'hour') {
    date.setMinutes(0, 0, 0);
    periodLength = 60 * 60;
  } else {
    // minute
    date.setSeconds(0, 0);
    periodLength = 60;
  }

  const blockQueries = [];
  const timestamps = [];
  for (let i = 0; i < 30; i += 1) {
    const timestamp = date.getTime() / 1000 - periodLength * i;
    timestamps.push(timestamp);
    blockQueries.push(`block_${i}: blocks(where: {
      timestamp_gte: ${timestamp},
      timestamp_lte: ${timestamp + 100}
    }, orderBy: number, limit: 1) {
      number
    }`);
  }
  const blockResult = await sdk.graph.query(
    'blocklytics/ethereum-blocks',
    `{${blockQueries.join('\n')}}`
  );

  const blocks = [];
  const burnQueries = [];
  for (let i = 0; i < 30; i += 1) {
    if (blockResult[`block_${i}`].length === 0) {
      blocks.push(0);
      continue;
    }

    const blockNum = blockResult[`block_${i}`][0].number;
    blocks.push(parseInt(blockNum));
    burnQueries.push(`burned_${i}: ethburned(id:"1", block: { number: ${blockNum} }){ burned }`);
  }

  burnQueries.push('now: ethburned(id:"1") { burned }');
  burnQueries.push('_meta { block { number } }');

  const burnResult = await sdk.graph.query(SUBGRAPH, `{${burnQueries.join('\n')}}`, {
    node: GRAPH_NODE,
  });

  const response = [
    {
      burned: parseFloat(burnResult.now.burned),
      timestamp: Math.floor(Date.now() / 1000),
      block: parseInt(burnResult._meta.block.number),
    },
  ];
  for (let i = 0; i < 30; i += 1) {
    if (blocks[i] === 0) {
      continue;
    }

    response.push({
      burned: parseFloat(burnResult[`burned_${i}`]?.burned || '0'),
      timestamp: timestamps[i],
      block: blocks[i],
    });
  }

  return response.reverse();
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
