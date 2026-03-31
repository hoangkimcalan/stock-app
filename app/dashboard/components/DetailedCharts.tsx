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
  score?: number;
  scoreBreakdown?: {
    roe?: string;
    debtToEquity?: string;
    currentRatio?: string;
    qualityRatio?: string;
  };
}

interface DetailedChartsProps {
  code: string;
  sectorName: string;
}

export function DetailedCharts({ code, sectorName }: DetailedChartsProps) {
  const [stockRatios, setStockRatios] = useState<Ratio[]>([]);
  const [sectorRatios, setSectorRatios] = useState<Ratio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('roe');

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
        [code]: stock?.[selectedMetric as keyof Ratio],
        [sectorName]: sector?.[selectedMetric as keyof Ratio],
      };
    });
  };

  const createScoreChartData = () => {
    return stockRatios.map((ratio) => ({
      year: ratio.year.toString(),
      score: ratio.score || 0,
      roe: ratio.scoreBreakdown?.roe?.includes('+') ? 1 : 0,
      debtToEquity: ratio.scoreBreakdown?.debtToEquity?.includes('+') ? 1 : 0,
      currentRatio: ratio.scoreBreakdown?.currentRatio?.includes('+') ? 1 : 0,
      qualityRatio: ratio.scoreBreakdown?.qualityRatio?.includes('+') ? 1 : 0,
      roeText: ratio.scoreBreakdown?.roe || '',
      debtToEquityText: ratio.scoreBreakdown?.debtToEquity || '',
      currentRatioText: ratio.scoreBreakdown?.currentRatio || '',
      qualityRatioText: ratio.scoreBreakdown?.qualityRatio || '',
    }));
  };

  // Component để vẽ 4 khúc điểm (hàng ngang full)
  const ScoreBar = ({ data }: { data: any }) => {
    const criteria = [
      { key: 'roe', label: 'ROE', color: '#9333ea', darkColor: '#6b21a8' },
      {
        key: 'debtToEquity',
        label: 'D/E',
        color: '#0891b2',
        darkColor: '#0a5f6f',
      },
      {
        key: 'currentRatio',
        label: 'CR',
        color: '#ca8a04',
        darkColor: '#854d0e',
      },
      {
        key: 'qualityRatio',
        label: 'Quality',
        color: '#2563eb',
        darkColor: '#1e40af',
      },
    ];

    return (
      <div className="flex gap-3 flex-1">
        {criteria.map((criterion) => {
          const isPass = data[criterion.key] === 1;
          return (
            <div
              key={criterion.key}
              className="relative group flex-1"
              title={data[`${criterion.key}Text`]}
            >
              <div
                className="rounded px-4 py-3 text-sm font-bold text-white text-center border-2 border-slate-600 h-12 flex items-center justify-center cursor-pointer hover:opacity-85 transition shadow-lg"
                style={{
                  backgroundColor: isPass ? criterion.color : '#3f4651',
                  color: '#ffffff',
                }}
              >
                Chỉ số {criterion.label}
              </div>
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-950 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10 border border-slate-500 w-64 shadow-xl">
                {data[`${criterion.key}Text`] || 'N/A'}
              </div>
            </div>
          );
        })}
      </div>
    );
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
    { key: 'score', label: 'Financial Score' },
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
  const scoreChartData = createScoreChartData();
  const isScoreChart = selectedMetric === 'score';

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
              onClick={() => setSelectedMetric(metric.key)}
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

        {/* Chart Content */}
        {isScoreChart ? (
          // Score Chart
          <div className="space-y-3">
            {scoreChartData.map((data, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-16 font-bold text-slate-200 text-right text-lg">
                  {data.year}
                </span>
                <ScoreBar data={data} />
                <span
                  className={`font-bold text-lg w-16 text-center ${
                    (data.score || 0) > 0 ? 'text-green-400' : 'text-slate-400'
                  }`}
                >
                  {data.score}/4
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Line Chart
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
                  value !== undefined ? value.toFixed(4) : 'N/A'
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
        )}

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-300 mb-3 font-semibold">Ghi chú:</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-xs flex-wrap">
            {!isScoreChart && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-yellow-300">Dữ liệu {code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span className="text-blue-300">Trung bình ngành</span>
                </div>
              </>
            )}
            {isScoreChart && (
              <>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#9333ea' }}
                  ></div>
                  <span className="text-slate-300">ROE: Tím</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#0891b2' }}
                  ></div>
                  <span className="text-slate-300">D/E: Cầm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#ca8a04' }}
                  ></div>
                  <span className="text-slate-300">CR: Vàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#2563eb' }}
                  ></div>
                  <span className="text-slate-300">Quality: Xanh</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-500"></div>
                  <span className="text-slate-400">Chưa đạt</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
