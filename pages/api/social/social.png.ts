import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import path from 'path';
import SocialCard from 'components/SocialCard/SocialCard';
import { getTotalBurned } from 'data/queries';

// These statements causes Next to bundle these files
path.resolve(process.cwd(), 'fonts', 'fonts.conf');
path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { block, burned } = await getTotalBurned();

  const svg = ReactDOMServer.renderToString(
    React.createElement(SocialCard, {
      block,
      burned,
    })
  );

  const buffer = Buffer.from(svg);
  const output = await sharp(buffer, { density: 300 }).toFormat('png').toBuffer();

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=120, stale-while-revalidate');
  res.setHeader('Content-Type', 'image/png');
  res.write(output, 'binary');
  res.end(null, 'binary');
};

export default handler;
