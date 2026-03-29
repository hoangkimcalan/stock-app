'use client';
import { useEffect, useState } from 'react';

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

interface AdvancedRatiosProps {
  code: string;
  sectorName: string;
}

export function AdvancedRatios({ code, sectorName }: AdvancedRatiosProps) {
  const [stockRatios, setStockRatios] = useState<Ratio[]>([]);
  const [sectorRatios, setSectorRatios] = useState<Ratio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchRatios = async () => {
      try {
        setLoading(true);

        // Fetch stock ratios
        const stockRes = await fetch(`/api/stocks/${code}/ratios`);
        const stockData = await stockRes.json();
        if (stockData.ratios) {
          setStockRatios(stockData.ratios);
        }

        // Fetch sector averages
        if (sectorName) {
          const sectorRes = await fetch(
            `/api/sector-averages?sector=${encodeURIComponent(sectorName)}`
          );
          const sectorData = await sectorRes.json();
          if (sectorData.ratios) {
            setSectorRatios(sectorData.ratios);
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

  const getStockRatio = (year: number) =>
    stockRatios.find((r) => r.year === year);
  const getSectorRatio = (year: number) =>
    sectorRatios.find((r) => r.year === year);

  const getComparisonColor = (
    stockValue?: number,
    sectorValue?: number
  ): string => {
    if (stockValue === undefined || sectorValue === undefined) {
      return 'text-slate-400';
    }
    return stockValue > sectorValue ? 'text-green-400' : 'text-red-400';
  };

  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400">
        Đang tải chỉ số nâng cao...
      </div>
    );
  }

  const stockRatio = getStockRatio(selectedYear);
  const sectorRatio = getSectorRatio(selectedYear);

  const years = Array.from(
    new Set([
      ...stockRatios.map((r) => r.year),
      ...sectorRatios.map((r) => r.year),
    ])
  ).sort((a, b) => b - a);

  return (
    <div className="p-6">
      <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400">
          Nhóm ngành:{' '}
          <span className="text-xl font-bold text-yellow-400">
            {sectorName}
          </span>
        </p>
      </div>
      {/* Year Selector */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded font-semibold transition ${
              selectedYear === year
                ? 'bg-yellow-500 text-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {!stockRatio || !sectorRatio ? (
        <div className="text-center text-slate-400 py-8">
          Không có dữ liệu cho năm {selectedYear}
        </div>
      ) : (
        <div className="space-y-6">
          {/* DU PONT ANALYSIS */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tax Burden */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Tax Burden (Gánh nặng thuế)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.taxBurden,
                        sectorRatio.taxBurden
                      )}`}
                    >
                      {formatValue(stockRatio.taxBurden)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình ngành</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.taxBurden)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interest Burden */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Interest Burden (Gánh nặng lãi vay)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.interestBurden,
                        sectorRatio.interestBurden
                      )}`}
                    >
                      {formatValue(stockRatio.interestBurden)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình ngành</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.interestBurden)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Margin */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Operating Margin (Biên lợi nhuận)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.operatingMargin,
                        sectorRatio.operatingMargin
                      )}`}
                    >
                      {formatValue(stockRatio.operatingMargin)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình ngành</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.operatingMargin)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Asset Turnover */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Asset Turnover (Vòng quay tài sản)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.assetTurnover,
                        sectorRatio.assetTurnover
                      )}`}
                    >
                      {formatValue(stockRatio.assetTurnover)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình ngành</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.assetTurnover)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Leverage */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Financial Leverage (Đòn bẩy tài chính)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.financialLeverage,
                        sectorRatio.financialLeverage
                      )}`}
                    >
                      {formatValue(stockRatio.financialLeverage)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình ngành</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.financialLeverage)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ROE */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">ROE (Lợi suất vốn chủ)</p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded border-2 border-yellow-500">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.roe,
                        sectorRatio.roe
                      )}`}
                    >
                      {formatValue(stockRatio.roe)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình ngành</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.roe)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUỐC'S FORMULAS */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Debt to Equity */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Debt/Equity (Mức độ phụ thuộc nợ)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.debtToEquity,
                        sectorRatio.debtToEquity
                      )}`}
                    >
                      {formatValue(stockRatio.debtToEquity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.debtToEquity)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Ratio */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Current Ratio (Thanh khoản)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.currentRatio,
                        sectorRatio.currentRatio
                      )}`}
                    >
                      {formatValue(stockRatio.currentRatio)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.currentRatio)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Ratio */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Quality Ratio (Chất lượng lợi nhuận)
                </p>
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded">
                  <div>
                    <p className="text-xs text-slate-500">{code}</p>
                    <p
                      className={`text-lg font-bold ${getComparisonColor(
                        stockRatio.qualityRatio,
                        sectorRatio.qualityRatio
                      )}`}
                    >
                      {formatValue(stockRatio.qualityRatio)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Trung bình</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatValue(sectorRatio.qualityRatio)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400 mb-3">Ghi chú:</p>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-green-400">Cao hơn trung bình ngành</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-red-400">Thấp hơn trung bình ngành</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-blue-400">Trung bình ngành</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
