import { NextApiRequest, NextApiResponse } from 'next';
import { getBurnedOnRecentBlocks } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const burnedOnBlock = await getBurnedOnRecentBlocks();

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=5, stale-while-revalidate');
  res.json({
    success: true,
    burnedOnBlock,
  });
};

export default handler;
