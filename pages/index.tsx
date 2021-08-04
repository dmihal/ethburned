import React, { useState, useEffect, Fragment } from 'react';
import { NextPage, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import { getTotalBurned, getBurnedLastHr, getCurrentBlock } from 'data/queries';
import SocialTags from 'components/SocialTags';

interface HomeProps {
  total: number;
  yesterday: number;
  currentBlock: number;
}

const Chart = dynamic(() => import('components/Chart'), { ssr: false });

const decimal = (num: number) =>
  num.toLocaleString('en-us', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 10,
  });

const LONDON_BLOCK = 12965000;

export const Home: NextPage<HomeProps> = ({ total, yesterday, currentBlock }) => {
  const [data, setData] = useState({ total, yesterday, currentBlock });

  useEffect(() => {
    let timer;
    const refresh = async () => {
      try {
        const req = await fetch('/api/v1/burned');
        const json = await req.json();
        setData({
          total: json.total,
          yesterday: json.yesterday,
          currentBlock: json.block,
        });
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

      {data.currentBlock < LONDON_BLOCK ? (
        <Fragment>
          <div className="card">
            <div className="big">{LONDON_BLOCK - /*data.*/ currentBlock}</div>
            <div>Blocks remaining until London upgrade</div>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="row">
            <div className="card">
              <div className="big">{decimal(data.total)} ETH</div>
              <div>Total burned</div>
            </div>

            <div className="card">
              <div className="big">{decimal(data.yesterday)} ETH</div>
              <div>Burned in the last hour</div>
            </div>
          </div>

          <Chart />
        </Fragment>
      )}

      <div className="block-num">Block: {data.currentBlock}</div>

      <style jsx>{`
        main {
          width: 100%;
          padding: 2rem 0 3rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
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
        }

        .card {
          text-align: center;
          margin: 8px;
          padding: 8px;
          border: solid 1px #d0d1d9;
          border-radius: 8px;
          font-size: 24px;
        }

        .block-num {
          position: fixed;
          bottom: 0;
          left: 0;
          padding: 4px 8px;
        }

        .big {
          font-size: 32px;
        }

        @media (max-width: 600px) {
          .row {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const [{ burned: total }, yesterday, currentBlock] = await Promise.all([
    getTotalBurned(),
    getBurnedLastHr(),
    getCurrentBlock(),
  ]);

  return { props: { total, yesterday, currentBlock }, revalidate: 60 };
};

export default Home;
