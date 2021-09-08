import React, { useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga4';
import Header from 'components/Header';

ReactGA.initialize('G-9SBZ9ZN8GG');

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    ReactGA.set({ page: router.asPath });
    ReactGA.pageview(router.asPath);
  }, [router.pathname]);

  return (
    <div className="container">
      <Head>
        <title key="title">EthBurned.info</title>
        <link rel="icon" href="/favicon.png" />
        <link href="https://use.typekit.net/jrq0bbf.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/3.6.0/react-datepicker.min.css"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&amp;display=swap"
          rel="stylesheet"
        />
        <script
          async
          defer
          data-domain="ethburned.info"
          src="https://analytics.cryptostats.community/js/plausible.js"
        />
      </Head>

      <Header />

      <Component {...pageProps} />

      <footer>
        <div>Data updates continuously</div>
        <div>
          Created by{' '}
          <a href="https://twitter.com/dmihal" target="twitter">
            David Mihal
          </a>
        </div>

        <div>
          <a href="https://cryptofees.info">cryptofees.info</a>
          {' | '}
          <a href="https://ethereumnodes.com">ethereumnodes.com</a>
          {' | '}
          <a href="https://money-movers.info">money-movers.info</a>
          {' | '}
          <a href="https://open-orgs.info">open-orgs.info</a>
          {' | '}
          <b>ethburned.info</b>
        </div>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }

        footer {
          width: 100%;
          height: auto;
          border-top: 1px solid lightGray;
          text-align: center;
          padding: 2rem 0;
        }
        footer > * {
          margin-bottom: 0.5em;
        }
      `}</style>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'sofia-pro', sans-serif;
          background: #f9fafc;
          color: #091636;
        }

        * {
          box-sizing: border-box;
        }

        a {
          color: #091636;
          text-decoration: underline;
        }
        a:hover {
          color: #666666;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default App;
