/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { GeneralStatistics } from './components/GeneralStatistics';

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'chart'>('data');
  const [dataSubTab, setDataSubTab] = useState<'report' | 'statistics'>(
    'report'
  );
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
      .catch((err) => console.error('Error fetching stock data:', err))
      .finally(() => setLoading(false));
  }, [stockCode]);

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

  const renderRow = (node: any): React.ReactNode => {
    const hasChild = node.children && node.children.length > 0;
    const isExpanded = expanded[node.itemCode];
    const level = node.displayLevel || 1;

    return (
      <React.Fragment key={node.itemCode}>
        <tr
          className={`border-b border-slate-800 hover:bg-white/5 ${
            level === 1 ? 'bg-slate-900 font-bold' : ''
          }`}
        >
          <td
            className="py-3 px-4 sticky left-0 bg-[#0f172a] z-10 border-r border-slate-800 whitespace-nowrap"
            style={{ paddingLeft: (level - 1) * 24 + 16 }}
          >
            <div className="flex items-center text-[13px]">
              {hasChild && (
                <button
                  onClick={() =>
                    setExpanded((p) => ({ ...p, [node.itemCode]: !isExpanded }))
                  }
                  className="mr-2 w-4 text-yellow-500 font-bold"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              )}
              {!hasChild && (
                <span className="mr-2 w-4 text-slate-700 opacity-40">•</span>
              )}
              <span className={level === 1 ? 'uppercase' : ''}>
                {node.itemName}
              </span>
            </div>
          </td>

          {headers.map((date) => {
            const cell = node.data?.find((d: any) => d.fiscalDate === date);
            return (
              <td
                key={date}
                className="text-right px-4 font-mono text-slate-300 text-[13px]"
              >
                {cell?.numericValue
                  ? new Intl.NumberFormat('vi-VN').format(
                      Math.round(cell.numericValue / 1e9)
                    )
                  : '-'}
              </td>
            );
          })}
        </tr>
        {hasChild &&
          isExpanded &&
          node.children.map((child: any) => renderRow(child))}
      </React.Fragment>
    );
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
                onClick={() => setActiveTab('chart')}
                className={`px-4 py-3 font-semibold transition ${
                  activeTab === 'chart'
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Biểu đồ tài chính
              </button>
            </div>

            {/* SUB TABS (chỉ hiện khi ở tab "Dữ liệu tài chính") */}
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
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'data' && dataSubTab === 'report' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-700 text-slate-500 text-[12px]">
                    <th className="py-4 px-6 text-left sticky left-0 bg-slate-900 z-20 min-w-[350px]">
                      CHỈ TIÊU
                    </th>
                    {headers.map((date) => (
                      <th key={date} className="py-3 px-4 text-right">
                        Q{Math.ceil((new Date(date).getMonth() + 1) / 3)} <br />
                        <span className="text-[10px] opacity-50">
                          {new Date(date).getFullYear()}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{tree.map((node) => renderRow(node))}</tbody>
              </table>
            </div>
          )}

          {activeTab === 'data' && dataSubTab === 'statistics' && (
            <GeneralStatistics data={statisticsData} />
          )}

          {activeTab === 'chart' && (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-slate-400 text-center">
                <p className="text-lg">Biểu đồ tài chính</p>
                <p className="text-sm opacity-50">Sắp có cập nhật</p>
              </div>
            </div>
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
