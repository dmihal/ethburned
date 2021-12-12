import React, { useState, useEffect } from 'react';
import { NextPage, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import SocialTags from 'components/SocialTags';
import { getAdapter } from 'data/sdk';

interface HomeProps {
  total: number;
  totalUSD: number;
  lastHourBurned: number;
  lastHourBurnedUSD: number;
  currentBlock: number;
}

const Chart = dynamic(() => import('components/Chart'), { ssr: false });

const decimal = (num: number, maximumDecimals = 2) =>
  num.toLocaleString('en-us', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumDecimals,
  });

export const Home: NextPage<HomeProps> = ({
  total,
  totalUSD,
  lastHourBurned,
  lastHourBurnedUSD,
  currentBlock,
}) => {
  const [data, setData] = useState({
    total,
    totalUSD,
    lastHourBurned,
    lastHourBurnedUSD,
    currentBlock,
  });

  useEffect(() => {
    let timer;
    const refresh = async () => {
      try {
        const adapter = await getAdapter();

        const [
          _total,
          _totalUSD,
          _lastHourBurned,
          _lastHourBurnedUSD,
          _currentBlock,
        ] = await Promise.all([
          adapter.executeQuery('tokensBurnedTotal'),
          adapter.executeQuery('tokensBurnedTotalUSD'),
          adapter.executeQuery('tokensBurnedInRecentSeconds', 60 * 60),
          adapter.executeQuery('tokensBurnedInRecentSecondsUSD', 60 * 60),
          adapter.executeQuery('currentIndexedBlock'),
        ]);

        if (_currentBlock != data.currentBlock) {
          setData({
            total: _total,
            totalUSD: _totalUSD,
            lastHourBurned: _lastHourBurned,
            lastHourBurnedUSD: _lastHourBurnedUSD,
            currentBlock: _currentBlock,
          });
        }
      } catch (e) {
        console.warn(e);
      }
      timer = setTimeout(refresh, 2500);
    };
    timer = setTimeout(refresh, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      <SocialTags />

      <h1 className="title">ETH Burned</h1>

      <p className="description">
        The more Ethereum is used...
        <br />
        The more ETH is burned
      </p>

      <div className="row">
        <div className="card">
          <div className="big">{decimal(data.total)} ETH</div>
          <div className="small">${decimal(data.totalUSD, 2)}</div>
          <div className="sub-text">Total burned</div>
        </div>

        <div className="card">
          <div className="big">{decimal(data.lastHourBurned)} ETH</div>
          <div className="small">${decimal(data.lastHourBurnedUSD, 2)}</div>
          <div className="sub-text">Burned in the last hour</div>
        </div>
      </div>

      <Chart />

      <div className="block-num">Block: {data.currentBlock}</div>

      <style jsx>{`
        main {
          width: 100%;
          padding: 2rem 1rem 3rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 750px;
        }

        .title {
          margin: 0 0 16px;
          line-height: 1.15;
          font-size: 4rem;
          font-weight: 700;
        }

        .title,
        .description {
          text-align: center;
          max-width: 800px;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 4px 0 20px;
        }

        .row {
          display: flex;
          width: 100%;
          margin: 2em 0em;
        }

        .card {
          text-align: center;
          padding: 15px 10px;
          border: solid 1px #d0d1d9;
          border-radius: 8px;
          font-size: 24px;
          width: 100%;
        }

        .card:first-child {
          margin-right: 10px;
        }

        .sub-text {
          color: #7a8190;
        }

        .small {
          font-size: 14px;
          margin-top: 4px;
          color: #333;
        }

        .block-num {
          position: fixed;
          bottom: 0;
          left: 0;
          padding: 4px 8px;
        }

        .big {
          font-size: 32px;
          margin-bottom: 5px;
        }

        .event-headline {
          font-size: 24px;
          line-height: 1.2;
        }

        @media (max-width: 600px) {
          .row {
            flex-direction: column;
          }
          .card:first-child {
            margin-right: 0px;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </main>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const adapter = await getAdapter();

  const [total, totalUSD, lastHourBurned, lastHourBurnedUSD, currentBlock] = await Promise.all([
    adapter.executeQuery('tokensBurnedTotal'),
    adapter.executeQuery('tokensBurnedTotalUSD'),
    adapter.executeQuery('tokensBurnedInRecentSeconds', 60 * 60),
    adapter.executeQuery('tokensBurnedInRecentSecondsUSD', 60 * 60),
    adapter.executeQuery('currentIndexedBlock'),
  ]);

  return {
    props: {
      total,
      totalUSD,
      lastHourBurned,
      lastHourBurnedUSD,
      currentBlock,
    },
    revalidate: 60,
  };
};

export default Home;
