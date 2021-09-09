import React from 'react';

const Footer: React.FC = () => {
  return (
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
  );
};

export default Footer;
