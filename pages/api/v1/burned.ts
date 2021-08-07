import { NextApiRequest, NextApiResponse } from 'next';
import { getTotalBurned, getBurnedLastHr } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [
    { burned: total, burnedUSD: totalUSD, block },
    { burned: yesterday, burnedUSD: yesterdayUSD },
  ] = await Promise.all([getTotalBurned(), getBurnedLastHr()]);

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
