import React from 'react';
import Head from 'next/head';

const SocialTags: React.FC = () => {
  const _title = 'ETHBurned.info';
  return (
    <Head>
      <meta property="og:title" content={_title} />
      <meta
        property="og:image"
        content={`https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/social/social.png`}
      />
      <meta
        property="og:description"
        content="The more Ethereum gets used... The more Ether gets burned"
      />

      <meta name="twitter:title" content={_title} />
      <meta
        name="twitter:description"
        content="The more Ethereum gets used... The more Ether gets burned"
      />
      <meta
        name="twitter:image"
        content={`https://${
          process.env.NEXT_PUBLIC_VERCEL_URL
        }/api/social/social.png?${new Date().getDate()}`}
      />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
};

export default SocialTags;
