import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import path from 'path';
import SocialCard from 'components/SocialCard/SocialCard';
import { getTotalBurned } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { block } = await getTotalBurned();

  // These statements causes Next to bundle these files
  console.log(path.resolve(process.cwd(), 'fonts', 'fonts.conf')); // eslint-disable-line
  console.log(path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf')); // eslint-disable-line

  const svg = ReactDOMServer.renderToString(
    React.createElement(SocialCard, {
      block,
    })
  );

  const buffer = Buffer.from(svg);
  const output = await sharp(buffer, { density: 300 }).toFormat('png').toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.write(output, 'binary');
  res.end(null, 'binary');
};

export default handler;
