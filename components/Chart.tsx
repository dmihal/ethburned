import React, { useLayoutEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js';
import 'chartjs-adapter-luxon';
import ChartStreaming from 'chartjs-plugin-streaming';
import AnnotationPlugin from 'chartjs-plugin-annotation';
import {
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  SubTitle,
} from 'chart.js';

ChartJS.register(AnnotationPlugin);
ChartJS.register(ChartStreaming);
ChartJS.register([
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  SubTitle,
]);

const Chart: React.FC = () => {
  const maxBlock = useRef(0);
  const data = useRef([]);
  const canvas = useRef<any>(null);

  const onRefresh = async (chart) => {
    const req = await fetch('/api/v1/recent-blocks');
    const json = await req.json();

    for (let i = 1; i < json.burnedOnBlock.length; i += 1) {
      const blockData = json.burnedOnBlock[i];
      if (blockData.block > maxBlock.current) {
        maxBlock.current = blockData.block;
        data.current.push({
          x: blockData.timestamp * 1000,
          y: blockData.burned - json.burnedOnBlock[i - 1].burned,
          block: blockData.block,
        });
      }
    }

    chart.data.datasets[0].data = data.current;
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
        ticks: {
          font: {
            size: 18,
          },
        },
      },
      y: {
        title: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'ETH burned per block',
        font: {
          size: 18,
        },
      },
      tooltip: {
        displayColors: false,
        titleFont: {
          size: 18,
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          title(ctx: any) {
            // console.log(ctx);
            return ctx[0].raw ? `Block ${ctx[0].raw.block.toLocaleString()}` : '';
          },
          label(ctx: any) {
            // console.log(ctx);
            return ctx.parsed.y.toLocaleString('en-us', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            });
          },
          afterLabel() {
            return 'ETH burned';
          },
        },
      },
      annotation: {
        annotations: [
          {
            type: 'line' as 'line',
            mode: 'horizontal' as 'horizontal',
            scaleID: 'y' as 'y',
            value: 2,
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 4,
            label: {
              enabled: false,
              content: '2 ETH issued per block (approximate)',
            },
            enter(ctx: any) {
              ctx.chart.config.options.plugins.annotation.annotations[0].label.enabled = true;
              ctx.chart.update('quiet');
            },
            leave(ctx: any) {
              ctx.chart.config.options.plugins.annotation.annotations[0].label.enabled = false;
              ctx.chart.update('quiet');
            },
          },
        ],
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
            label: 'ETH burned per block',
            data: [],
            fill: false,
            borderWidth: 6,
            backgroundColor: '#FC940B',
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
          height: 40%;
        }
      `}</style>
    </div>
  );
};

export default Chart;
