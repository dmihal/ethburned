import { NextApiRequest, NextApiResponse } from 'next';
import { getTotalBurned, getBurned24hrs } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [{ burned: total, block }, yesterday] = await Promise.all([
    getTotalBurned(),
    getBurned24hrs(),
  ]);

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=5, stale-while-revalidate');
  res.json({
    success: true,
    total,
    yesterday,
    block,
  });
};

export default handler;
