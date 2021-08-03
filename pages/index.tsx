import React, { useState, useEffect } from 'react';
import { NextPage, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import { getTotalBurned, getBurnedLastHr } from 'data/queries';
import SocialTags from 'components/SocialTags';

interface HomeProps {
  total: number;
  yesterday: number;
  block: number;
}

const Chart = dynamic(() => import('components/Chart'), { ssr: false });

const decimal = (num: number) =>
  num.toLocaleString('en-us', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 10,
  });

export const Home: NextPage<HomeProps> = ({ total, yesterday, block }) => {
  const [data, setData] = useState({ total, yesterday, block });

  useEffect(() => {
    let timer;
    const refresh = async () => {
      try {
        const req = await fetch('/api/v1/burned');
        const json = await req.json();
        setData({
          total: json.total,
          yesterday: json.yesterday,
          block: json.block,
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

      <div className="block-num">Block: {data.block}</div>

      <Chart />

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
  const [{ burned: total, block }, yesterday] = await Promise.all([
    getTotalBurned(),
    getBurnedLastHr(),
  ]);

  return { props: { total, yesterday, block }, revalidate: 60 };
};

export default Home;
