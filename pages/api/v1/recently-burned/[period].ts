import { NextApiRequest, NextApiResponse } from 'next';
import { getBurnedOnRecentTimePeriod } from 'data/queries';

const cacheTime: { [period: string]: number } = {
  minute: 15,
  hour: 60,
  day: 60 * 10,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const burned = await getBurnedOnRecentTimePeriod(req.query.period.toString());

  const cache = cacheTime[req.query.period.toString()];
  res.setHeader('Cache-Control', `max-age=0, s-maxage=${cache}, stale-while-revalidate`);
  res.json({
    success: true,
    burned,
  });
};

export default handler;
