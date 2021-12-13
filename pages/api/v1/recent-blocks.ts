import { NextApiRequest, NextApiResponse } from 'next';
import { getAdapter } from 'data/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const adapter = await getAdapter();
  const burned = await adapter.executeQuery('tokensBurnedInRecentBlocks', 30);

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=10, stale-while-revalidate');
  res.json({
    success: true,
    burned,
  });
};

export default handler;
