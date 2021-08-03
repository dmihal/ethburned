import React, { useLayoutEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js';
import 'chartjs-adapter-luxon';
import ChartStreaming from 'chartjs-plugin-streaming';
import { LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

ChartJS.register(ChartStreaming);
ChartJS.register([LineController, LineElement, PointElement, LinearScale, CategoryScale]);

interface ChartProps {
  startBlock: number;
}

const Chart: React.FC<ChartProps> = () => {
  // const recentBlockData = useRef([]);
  const maxBlock = useRef(0);

  const data = useRef({
    datasets: [
      {
        label: '# of Votes',
        data: [],
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
        cubicInterpolationMode: 'monotone' as 'monotone',
      },
    ],
  });
  const canvas = useRef<any>(null);

  const onRefresh = async (chart) => {
    const req = await fetch('/api/v1/recent-blocks');
    const json = await req.json();

    for (let i = 1; i < json.burnedOnBlock.length; i += 1) {
      const blockData = json.burnedOnBlock[i];
      if (blockData.block > maxBlock.current) {
        maxBlock.current = blockData.block;
        data.current.datasets[0].data.push({
          x: blockData.timestamp * 1000,
          y: blockData.burned - json.burnedOnBlock[i - 1].burned,
        });
      }
    }

    chart.data.datasets[0].data = data.current.datasets[0].data;
    chart.update('quiet');
  };

  const options = {
    scales: {
      x: {
        type: 'realtime' as 'realtime',
        realtime: {
          duration: 5 * 60 * 1000,
          refresh: 2500,
          delay: 2000,
          onRefresh: onRefresh,
        },
      },
      y: {
        title: {
          display: false,
        },
      },
    },
    title: {
      display: true,
      text: 'ETH burned per block',
      font: {
        size: 18,
      },
    },
    interaction: {
      intersect: false,
    },
  };

  useLayoutEffect(() => {
    const config = {
      type: 'line' as 'line',
      data: {
        datasets: [
          {
            label: '# of Votes',
            data: [],
            fill: false,
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgba(255, 99, 132, 0.2)',
            cubicInterpolationMode: 'monotone' as 'monotone',
          },
        ],
      },
      options,
    };
    const chart = new ChartJS(canvas.current, config);

    return () => chart.destroy();
  }, []);

  return (
    <div className="chart-container">
      <canvas ref={canvas} />
      <style jsx>{`
        .chart-container {
          width: 100%;
          max-width: 800px;
          padding: 12px;
          height: 40%;
        }
      `}</style>
    </div>
  );
};

export default Chart;
