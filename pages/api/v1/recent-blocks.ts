import { NextApiRequest, NextApiResponse } from 'next';
import { getBurnedOnRecentBlocks, getIssuedOnRecentBlocks } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [burned, issued] = await Promise.all([
    getBurnedOnRecentBlocks(),
    getIssuedOnRecentBlocks().catch(() => []),
  ]);

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=5, stale-while-revalidate');
  res.json({
    success: true,
    burned,
    issued,
  });
};

export default handler;
