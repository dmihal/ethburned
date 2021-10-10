import { NextApiRequest, NextApiResponse } from 'next';
import { getTotalBurned, getBurnedLastHr } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [
    { burned: total, burnedUSD: totalUSD, block },
    { burned: yesterday, burnedUSD: yesterdayUSD },
  ] = await Promise.all([getTotalBurned(), getBurnedLastHr()]);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=5, stale-while-revalidate');
  res.json({
    success: true,
    total,
    totalUSD,
    yesterday,
    yesterdayUSD,
    block,
  });
};

export default handler;
