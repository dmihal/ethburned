import { NextApiRequest, NextApiResponse } from 'next';
import { getBurnedOnRecentBlocks } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const burned = await getBurnedOnRecentBlocks();

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=10, stale-while-revalidate');
  res.json({
    success: true,
    burned,
  });
};

export default handler;
