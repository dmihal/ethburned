import { NextApiRequest, NextApiResponse } from 'next';
import { getAdapter } from 'data/sdk';

const cacheTime: { [period: string]: number } = {
  minute: 30,
  hour: 60 * 5,
  day: 60 * 10,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const adapter = await getAdapter();
  const burned = await adapter.executeQuery(
    'tokensBurnedInRecentTimePeriods',
    req.query.period.toString(),
    30
  );

  const cache = cacheTime[req.query.period.toString()];
  res.setHeader('Cache-Control', `max-age=0, s-maxage=${cache}, stale-while-revalidate`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  res.json({
    success: true,
    burned,
  });
};

export default handler;
