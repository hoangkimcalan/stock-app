/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useStockData } from '@/hooks/useStockData';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdvancedRatios } from './components/AdvancedRatios';
import { DetailedCharts } from './components/DetailedCharts';
import { FinancialReport } from './components/FinancialReport';
import { GeneralStatistics } from './components/GeneralStatistics';

type TabType = 'data' | 'chart' | 'ratios';

const STOCKS = [
  'VIC',
  'VHM',
  'VNM',
  'HPG',
  'MSN',
  'VJC',
  'NVL',
  'KDH',
  'DXG',
  'PDR',
  'BCM',
  'HSG',
  'NKG',
  'GAS',
  'PLX',
  'MWG',
  'FPT',
  'SAB',
  'DGW',
  'GMD',
  'AST',
  'BTT',
  'CMV',
  'COM',
  'FRT',
  'PET',
  'PIT',
  'SBV',
  'SVT',
  'AGG',
  'CCL',
  'CKG',
  'CRE',
  'CRV',
  'D2D',
  'DIG',
  'DRH',
  'DTA',
  'DXS',
  'FDC',
  'FIR',
  'HAR',
  'HDC',
  'HDG',
  'HPX',
  'HQC',
  'HTN',
  'IJC',
  'ITC',
  'KBC',
  'KHG',
  'KOS',
  'LDG',
  'LGL',
  'LHG',
  'NBB',
  'NLG',
  'NTC',
  'NTL',
  'NVT',
  'PTL',
  'QCG',
  'SCR',
  'SGR',
  'SIP',
  'SJS',
  'SZC',
  'SZL',
  'TAL',
  'TCH',
  'TDC',
  'TDH',
  'TEG',
  'TIP',
  'TIX',
  'TN1',
  'VPH',
  'VPI',
  'VRC',
  'VRE',
  'DTL',
  'HMC',
  'SHA',
  'SHI',
  'SMC',
  'TLH',
  'TNI',
  'VCA',
  'CMG',
  'ICT',
  'ITD',
  'SGT',
  'ASG',
  'CLL',
  'DVP',
  'GSP',
  'HAH',
  'HTV',
  'ILB',
  'MHC',
  'NCT',
  'PDN',
  'PDV',
  'PJT',
  'PVP',
  'PVT',
  'QNP',
  'SFI',
  'SGN',
  'STG',
  'TCL',
  'TMS',
  'VIP',
  'VNL',
  'VOS',
  'VSC',
  'VTO',
  'VTP',
  'ACC',
  'ADP',
  'BCE',
  'BMP',
  'C32',
  'C47',
  'CCC',
  'CDC',
  'CIG',
  'CII',
  'CRC',
  'CTD',
  'CTI',
  'CTR',
  'CVT',
  'DC4',
  'DHA',
  'DLG',
  'DPG',
  'DXV',
  'EVG',
  'FCM',
  'FCN',
  'GEL',
  'GMH',
  'HAS',
  'HHV',
  'HID',
  'HT1',
  'HTI',
  'HU1',
  'HUB',
  'HVH',
  'KSB',
  'LBM',
  'LCG',
  'LGC',
  'LM8',
  'MDG',
  'NAV',
  'NHA',
  'NNC',
  'PC1',
  'PHC',
  'PTC',
  'RYG',
  'SC5',
  'TCD',
  'TCR',
  'THG',
  'TLD',
  'TNT',
  'TSA',
  'VCG',
  'VGC',
  'VNE',
  'VSI',
];

function DashboardContent() {
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('data');
  const [dataSubTab, setDataSubTab] = useState<'report' | 'statistics'>(
    'statistics'
  );
  const [reportSubTab, setReportSubTab] = useState<
    'balance' | 'income' | 'cashflow'
  >('balance');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [incomeExpanded, setIncomeExpanded] = useState<Record<number, boolean>>(
    {}
  );
  const [cashFlowExpanded, setCashFlowExpanded] = useState<
    Record<number, boolean>
  >({});

  const searchParams = useSearchParams();
  const router = useRouter();
  const stockCode = searchParams.get('code') || 'GMD';

  const {
    data,
    incomeData,
    cashFlowData,
    statisticsData,
    tree,
    incomeTree,
    cashFlowTree,
    headers,
    incomeHeaders,
    cashFlowHeaders,
    loading,
  } = useStockData(stockCode, activeTab, dataSubTab, reportSubTab);

  const suggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const input = searchInput.trim().toUpperCase();
    return STOCKS.filter((stock) => stock.startsWith(input)).slice(0, 10);
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(stockCode);
  }, [stockCode]);

  useEffect(() => {
    setExpanded({});
    setIncomeExpanded({});
    setCashFlowExpanded({});
    setActiveTab('data');
    setDataSubTab('statistics');
    setReportSubTab('balance');
  }, [stockCode]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const code = searchInput.trim().toUpperCase();
      if (code) {
        router.push(`/dashboard?code=${code}`);
        setShowSuggestions(false);
      }
    },
    [searchInput, router]
  );

  const handleSuggestionClick = useCallback(
    (stock: string) => {
      router.push(`/dashboard?code=${stock}`);
      setShowSuggestions(false);
    },
    [router]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleDataSubTabChange = useCallback(
    (subTab: 'report' | 'statistics') => {
      setDataSubTab(subTab);
    },
    []
  );

  const handleReportSubTabChange = useCallback(
    (subTab: 'balance' | 'income' | 'cashflow') => {
      setReportSubTab(subTab);
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8 lg:px-24 relative overflow-x-hidden">
      {/* <FloatingCats /> */}

      <div className="max-w-[1400px] mx-auto relative z-10">
        <form onSubmit={handleSearch} className="mb-6 relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Nhập mã cổ phiếu (VD: GMD, VNM, BID)..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
                  {suggestions.map((stock) => (
                    <button
                      key={stock}
                      type="button"
                      onClick={() => handleSuggestionClick(stock)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition first:rounded-t-lg last:rounded-b-lg"
                    >
                      {stock}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-2xl text-slate-300">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-yellow-500 uppercase mb-4">
              {data?.name || 'Đang tải...'}
            </h1>

            <div className="flex gap-2 border-b border-slate-700 mb-4">
              <button
                onClick={() => handleTabChange('data')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'data'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Dữ liệu tài chính
              </button>
              <button
                onClick={() => handleTabChange('ratios')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'ratios'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Chỉ số nâng cao
              </button>
              <button
                onClick={() => handleTabChange('chart')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'chart'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Biểu đồ chi tiết
              </button>
            </div>

            {activeTab === 'data' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDataSubTabChange('statistics')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    dataSubTab === 'statistics'
                      ? 'bg-yellow-500 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Thống kê chung
                </button>
                <button
                  onClick={() => handleDataSubTabChange('report')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    dataSubTab === 'report'
                      ? 'bg-yellow-500 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Báo cáo tài chính
                </button>
              </div>
            )}

            {activeTab === 'data' && dataSubTab === 'report' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleReportSubTabChange('balance')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    reportSubTab === 'balance'
                      ? 'bg-yellow-200 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Cân đối kế toán
                </button>
                <button
                  onClick={() => handleReportSubTabChange('income')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    reportSubTab === 'income'
                      ? 'bg-yellow-200 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Kết quả kinh doanh
                </button>
                <button
                  onClick={() => handleReportSubTabChange('cashflow')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    reportSubTab === 'cashflow'
                      ? 'bg-yellow-200 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Lưu chuyển tiền tệ
                </button>
              </div>
            )}
          </div>

          {activeTab === 'data' &&
            dataSubTab === 'report' &&
            reportSubTab === 'balance' && (
              <FinancialReport
                tree={tree}
                headers={headers}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            )}

          {activeTab === 'data' &&
            dataSubTab === 'report' &&
            reportSubTab === 'income' && (
              <FinancialReport
                tree={incomeTree}
                headers={incomeHeaders}
                expanded={incomeExpanded}
                setExpanded={setIncomeExpanded}
              />
            )}

          {activeTab === 'data' &&
            dataSubTab === 'report' &&
            reportSubTab === 'cashflow' && (
              <FinancialReport
                tree={cashFlowTree}
                headers={cashFlowHeaders}
                expanded={cashFlowExpanded}
                setExpanded={setCashFlowExpanded}
              />
            )}

          {activeTab === 'data' && dataSubTab === 'statistics' && (
            <GeneralStatistics data={statisticsData} />
          )}

          {activeTab === 'chart' && (
            <DetailedCharts
              code={stockCode}
              sectorName={statisticsData?.sectorName}
            />
          )}

          {activeTab === 'ratios' && (
            <AdvancedRatios
              code={stockCode}
              sectorName={statisticsData?.sectorName}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] p-8 flex items-center justify-center">
          <div className="text-slate-300">Loading...</div>
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
