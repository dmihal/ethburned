import React, { useLayoutEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js';
import 'chartjs-adapter-luxon';
import ChartStreaming from 'chartjs-plugin-streaming';
import { LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

ChartJS.register(ChartStreaming);
ChartJS.register([LineController, LineElement, PointElement, LinearScale, CategoryScale]);

const Chart = () => {
  const data = useRef({
    datasets: [
      {
        label: '# of Votes',
        data: [],
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  });
  const canvas = useRef<any>(null);

  const onRefresh = (chart) => {
    if (data.current.datasets[0].data.length > 15) {
      return;
    }

    const now = Date.now() - 5000;
    data.current.datasets[0].data.push({
      x: now,
      y: Math.random() * 20,
    });
    chart.data = data.current;
  };

  const options = {
    scales: {
      x: {
        type: 'realtime' as 'realtime',
        realtime: {
          duration: 20000,
          refresh: 1000,
          delay: 2000,
          onRefresh: onRefresh,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
    interaction: {
      intersect: false,
    },
  };

  useLayoutEffect(() => {
    const config = {
      type: 'line' as 'line',
      data: data.current,
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
