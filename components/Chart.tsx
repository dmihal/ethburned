import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
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
import Select from './Select';
import { getAdapter } from 'data/sdk';
import { usePlausible } from 'next-plausible';

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

const periods = ['block', 'minute', 'hour', 'day'];

const periodLabels: { [period: string]: string } = {
  block: 'Block',
  minute: 'Minute',
  hour: 'Hour',
  day: 'Day',
};

const periodEntries = periods.map((value) => ({ value, label: periodLabels[value] }));

const REFRESH_SPEED = 3000;

const periodZooms: { [period: string]: number } = {
  block: 5 * 60 * 1000,
  minute: 29 * 60 * 1000,
  hour: 26 * 60 * 60 * 1000,
  day: 21 * 24 * 60 * 60 * 1000,
};

const titleFormatters: { [period: string]: (point: any) => string } = {
  block: (point: any) => `Block ${point.block.toLocaleString()}`,
  minute: (point: any) =>
    new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(point.x)),
  hour: (point: any) =>
    new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(point.x)),
  day: (point: any) =>
    new Intl.DateTimeFormat('default', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(point.x)),
};

const Chart: React.FC = () => {
  const plausible = usePlausible();
  const data = useRef({ block: [], minute: [], hour: [], day: [] });
  const canvas = useRef<any>(null);
  const chart = useRef<any>(null);
  const [period, setPeriod] = useState('block');

  const currentPeriod = useRef(period);
  currentPeriod.current = period;

  const updateChart = async () => {
    const adapter = await getAdapter();

    const currentDataSet = data.current[currentPeriod.current];

    if (chart.current.data.datasets[0].data != currentDataSet) {
      chart.current.data.datasets[0].data = currentDataSet;
      chart.current.options.plugins.title.text = `ETH burned per ${currentPeriod.current}`;
      chart.current.options.scales.x.realtime.duration = periodZooms[currentPeriod.current];
      chart.current.options.plugins.annotation.annotations[0].display =
        currentPeriod.current === 'block';
      chart.current.update('quiet');
    }

    let burned: any[];
    if (currentPeriod.current === 'block') {
      burned = await adapter.executeQuery('tokensBurnedInRecentBlocks', 30);
    } else {
      burned = await adapter.executeQuery(
        'tokensBurnedInRecentTimePeriods',
        currentPeriod.current,
        30
      );
    }

    const lastBlock =
      currentDataSet.length > 0 ? currentDataSet[currentDataSet.length - 1].block : 0;
    const lastNewBlock = burned[burned.length - 1].block;

    if (lastNewBlock > lastBlock) {
      if (currentPeriod.current === 'block') {
        data.current[currentPeriod.current] = burned.slice(1).map((blockData: any, i: number) => ({
          x: blockData.timestamp * 1000,
          y: blockData.burned - burned[i].burned, // i is the previous element, due to the slice
          block: blockData.block,
        }));
      } else {
        data.current[currentPeriod.current] = burned
          .slice(0, -1)
          .map((blockData: any, i: number) => ({
            x: blockData.timestamp * 1000,
            y: burned[i + 1].burned - blockData.burned,
            block: blockData.block,
          }));
      }

      chart.current.data.datasets[0].data = data.current[currentPeriod.current];
      chart.current.update('quiet');
    }
  };

  useEffect(() => {
    updateChart();
  }, [period]);

  const options = {
    scales: {
      x: {
        type: 'realtime' as 'realtime',
        realtime: {
          duration: periodZooms[period],
          refresh: REFRESH_SPEED,
          delay: 2000,
          onRefresh: updateChart,
        },
        ticks: {
          font: {
            size: 18,
          },
        },
      },
      y: {
        min: 0,
        title: {
          display: false,
        },
        ticks: {
          min: 0,
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
            if (!ctx[0].raw) {
              return '';
            }
            return titleFormatters[currentPeriod.current](ctx[0].raw);
          },
          label(ctx: any) {
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
              ctx.chart.config.options.plugins.tooltip.enabled = false;
              ctx.chart.config.options.plugins.annotation.annotations[0].label.enabled = true;
              ctx.chart.update('quiet');
            },
            leave(ctx: any) {
              ctx.chart.config.options.plugins.tooltip.enabled = true;
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
    const _chart = new ChartJS(canvas.current, config);
    chart.current = _chart;

    return () => _chart.destroy();
  }, []);

  return (
    <div className="chart-container">
      <canvas ref={canvas} />

      <Select
        options={periodEntries}
        value={period}
        onChange={(newPeriod: string) => {
          setPeriod(newPeriod);
          plausible('set-chart-period', {
            props: { period: newPeriod },
          });
        }}
        width={100}
      />

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
