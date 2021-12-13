import { NextApiRequest, NextApiResponse } from 'next';
import { getAdapter } from 'data/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const adapter = await getAdapter();

  const [total, totalUSD, lastHourBurned, lastHourBurnedUSD, block] = await Promise.all([
    adapter.executeQuery('tokensBurnedTotal'),
    adapter.executeQuery('tokensBurnedTotalUSD'),
    adapter.executeQuery('tokensBurnedInRecentSeconds', 60 * 60),
    adapter.executeQuery('tokensBurnedInRecentSecondsUSD', 60 * 60),
    adapter.executeQuery('currentIndexedBlock'),
  ]);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=20, stale-while-revalidate');
  res.json({
    success: true,
    total,
    totalUSD,
    lastHourBurned,
    lastHourBurnedUSD,
    block,
  });
};

export default handler;
