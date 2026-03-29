/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Ratio {
  year: number;
  taxBurden?: number;
  interestBurden?: number;
  operatingMargin?: number;
  assetTurnover?: number;
  financialLeverage?: number;
  roe?: number;
  debtToEquity?: number;
  currentRatio?: number;
  qualityRatio?: number;
}

interface DetailedChartsProps {
  code: string;
  sectorName: string;
}

export function DetailedCharts({ code, sectorName }: DetailedChartsProps) {
  const [stockRatios, setStockRatios] = useState<Ratio[]>([]);
  const [sectorRatios, setSectorRatios] = useState<Ratio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<keyof Ratio>('roe');

  useEffect(() => {
    const fetchRatios = async () => {
      try {
        setLoading(true);

        const stockRes = await fetch(`/api/stocks/${code}/ratios`);
        const stockData = await stockRes.json();
        if (stockData.ratios) {
          setStockRatios(
            stockData.ratios
              .filter((r: Ratio) => r.year >= 2018 && r.year <= 2025)
              .sort((a: Ratio, b: Ratio) => a.year - b.year)
          );
        }

        if (sectorName) {
          const sectorRes = await fetch(
            `/api/sector-averages?sector=${encodeURIComponent(sectorName)}`
          );
          const sectorData = await sectorRes.json();
          if (sectorData.ratios) {
            setSectorRatios(
              sectorData.ratios
                .filter((r: Ratio) => r.year >= 2018 && r.year <= 2025)
                .sort((a: Ratio, b: Ratio) => a.year - b.year)
            );
          }
        }
      } catch (error) {
        console.error('Error fetching ratios:', error);
      } finally {
        setLoading(false);
      }
    };

    if (code && sectorName) {
      fetchRatios();
    }
  }, [code, sectorName]);

  const createChartData = () => {
    const allYears = Array.from(
      new Set([
        ...stockRatios.map((r) => r.year),
        ...sectorRatios.map((r) => r.year),
      ])
    ).sort((a, b) => a - b);

    return allYears.map((year) => {
      const stock = stockRatios.find((r) => r.year === year);
      const sector = sectorRatios.find((r) => r.year === year);
      return {
        year: year.toString(),
        [code]: stock?.[selectedMetric],
        [sectorName]: sector?.[selectedMetric],
      };
    });
  };

  const metrics = [
    { key: 'roe', label: 'ROE' },
    { key: 'taxBurden', label: 'Tax Burden' },
    { key: 'operatingMargin', label: 'Operating Margin' },
    { key: 'assetTurnover', label: 'Asset Turnover' },
    { key: 'financialLeverage', label: 'Financial Leverage' },
    { key: 'interestBurden', label: 'Interest Burden' },
    { key: 'debtToEquity', label: 'Debt/Equity' },
    { key: 'currentRatio', label: 'Current Ratio' },
  ];

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400">Đang tải biểu đồ...</div>
    );
  }

  if (stockRatios.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        Không có dữ liệu cho mã {code}
      </div>
    );
  }

  const chartData = createChartData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400">
          Nhóm ngành:{' '}
          <span className="text-xl font-bold text-yellow-400">
            {sectorName}
          </span>
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-yellow-400 mb-6">
          Biểu đồ So sánh Chỉ số
        </h3>

        {/* Metric Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key as keyof Ratio)}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                selectedMetric === metric.key
                  ? 'bg-yellow-500 text-black'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
              }}
              formatter={(value: any) =>
                value !== undefined ? value.toFixed(2) : 'N/A'
              }
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey={code}
              stroke="#fbbf24"
              strokeWidth={2}
              dot={{ fill: '#fbbf24', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey={sectorName}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-sm text-slate-400 mb-3">Ghi chú:</p>
        <div className="flex gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-yellow-400">Dữ liệu {code}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-blue-400">Trung bình ngành</span>
          </div>
        </div>
      </div>
    </div>
  );
}
