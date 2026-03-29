/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AdvancedRatios } from './components/AdvancedRatios';
import { DetailedCharts } from './components/DetailedCharts';
import { FinancialReport } from './components/FinancialReport';
import { GeneralStatistics } from './components/GeneralStatistics';

type TabType = 'data' | 'chart' | 'ratios';

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [incomeTree, setIncomeTree] = useState<any[]>([]);
  const [cashFlowTree, setCashFlowTree] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [incomeExpanded, setIncomeExpanded] = useState<Record<number, boolean>>(
    {}
  );
  const [cashFlowExpanded, setCashFlowExpanded] = useState<
    Record<number, boolean>
  >({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [incomeHeaders, setIncomeHeaders] = useState<string[]>([]);
  const [cashFlowHeaders, setCashFlowHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('data');
  const [dataSubTab, setDataSubTab] = useState<'report' | 'statistics'>(
    'statistics'
  );
  const [reportSubTab, setReportSubTab] = useState<
    'balance' | 'income' | 'cashflow'
  >('balance');
  const searchParams = useSearchParams();
  const router = useRouter();
  const stockCode = searchParams.get('code') || 'GMD';

  useEffect(() => {
    setSearchInput(stockCode);
  }, [stockCode]);

  useEffect(() => {
    const handlePopState = () => {
      setLoading(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Balance Sheet
  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/${stockCode}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData || []);
        setTree(resData.tree || []);

        const items = resData.rawItems || [];
        if (items.length > 0) {
          const longestDataRow = items.reduce((prev: any, current: any) =>
            prev.data?.length > current.data?.length ? prev : current
          );
          if (longestDataRow && longestDataRow.data) {
            setHeaders(longestDataRow.data.map((d: any) => d.fiscalDate));
          }
        }
        setExpanded({});
      })
      .catch((err) => console.error('Error fetching balance sheet:', err))
      .finally(() => setLoading(false));
  }, [stockCode]);

  // Fetch Income Statement
  useEffect(() => {
    if (
      activeTab === 'data' &&
      dataSubTab === 'report' &&
      reportSubTab === 'income'
    ) {
      fetch(`/api/stocks/${stockCode}/finance`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
        .then((res) => res.json())
        .then((resData) => {
          setIncomeData(resData || []);
          const treeData =
            resData.tree && resData.tree.length > 0
              ? resData.tree
              : resData.rawItems || [];
          setIncomeTree(treeData);

          const items = resData.rawItems || [];
          if (items.length > 0) {
            const longestDataRow = items.reduce((prev: any, current: any) =>
              prev.data?.length > current.data?.length ? prev : current
            );
            if (longestDataRow && longestDataRow.data) {
              setIncomeHeaders(
                longestDataRow.data.map((d: any) => d.fiscalDate)
              );
            }
          }
          setIncomeExpanded({});
        })
        .catch((err) => console.error('Error fetching income statement:', err));
    }
  }, [stockCode, activeTab, dataSubTab, reportSubTab]);

  // Fetch Cash Flow Statement
  useEffect(() => {
    if (
      activeTab === 'data' &&
      dataSubTab === 'report' &&
      reportSubTab === 'cashflow'
    ) {
      fetch(`/api/stocks/${stockCode}/cashflow`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
        .then((res) => res.json())
        .then((resData) => {
          setCashFlowData(resData || []);
          const treeData =
            resData.tree && resData.tree.length > 0
              ? resData.tree
              : resData.rawItems || [];
          setCashFlowTree(treeData);

          const items = resData.rawItems || [];
          if (items.length > 0) {
            const longestDataRow = items.reduce((prev: any, current: any) =>
              prev.data?.length > current.data?.length ? prev : current
            );
            if (longestDataRow && longestDataRow.data) {
              setCashFlowHeaders(
                longestDataRow.data.map((d: any) => d.fiscalDate)
              );
            }
          }
          setCashFlowExpanded({});
        })
        .catch((err) =>
          console.error('Error fetching cash flow statement:', err)
        );
    }
  }, [stockCode, activeTab, dataSubTab, reportSubTab]);

  // Fetch Statistics
  useEffect(() => {
    if (activeTab === 'data' && dataSubTab === 'statistics') {
      fetch(`/api/stocks/${stockCode}/statistics`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
        .then((res) => res.json())
        .then((resData) => {
          setStatisticsData(resData || {});
        })
        .catch((err) => console.error('Error fetching statistics data:', err));
    }
  }, [stockCode, activeTab, dataSubTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchInput.trim().toUpperCase();
    if (code) {
      router.push(`/dashboard?code=${code}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập mã cổ phiếu (VD: GMD, VNM, BID)..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* TABLE & CHART CONTAINER */}
        <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-2xl text-slate-300">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-yellow-500 uppercase mb-4">
              {data.name}
            </h1>

            {/* MAIN TABS */}
            <div className="flex gap-2 border-b border-slate-700 mb-4">
              <button
                onClick={() => setActiveTab('data')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'data'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Dữ liệu tài chính
              </button>
              <button
                onClick={() => setActiveTab('ratios')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'ratios'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Chỉ số nâng cao
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'chart'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Biểu đồ chi tiết
              </button>
            </div>

            {/* SUB TABS */}
            {activeTab === 'data' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setDataSubTab('statistics')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    dataSubTab === 'statistics'
                      ? 'bg-yellow-500 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Thống kê chung
                </button>
                <button
                  onClick={() => setDataSubTab('report')}
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

            {/* REPORT SUB TABS */}
            {activeTab === 'data' && dataSubTab === 'report' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setReportSubTab('balance')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    reportSubTab === 'balance'
                      ? 'bg-yellow-200 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Cân đối kế toán
                </button>
                <button
                  onClick={() => setReportSubTab('income')}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    reportSubTab === 'income'
                      ? 'bg-yellow-200 text-black rounded'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 rounded'
                  }`}
                >
                  Kết quả kinh doanh
                </button>
                <button
                  onClick={() => setReportSubTab('cashflow')}
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

          {/* TAB CONTENT */}
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
