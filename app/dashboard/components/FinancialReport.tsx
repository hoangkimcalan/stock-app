/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

export function FinancialReport({ tree, headers, expanded, setExpanded }: any) {
  const [visibleHeadersStart, setVisibleHeadersStart] = useState(0);
  const visibleCount = 4; // Hiển thị 4 năm cùng lúc

  const visibleHeaders = headers.slice(
    visibleHeadersStart,
    visibleHeadersStart + visibleCount
  );

  const handlePrevHeaders = () => {
    setVisibleHeadersStart(Math.max(0, visibleHeadersStart - 1));
  };

  const handleNextHeaders = () => {
    setVisibleHeadersStart(
      Math.min(headers.length - visibleCount, visibleHeadersStart + 1)
    );
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
                    setExpanded((p: any) => ({
                      ...p,
                      [node.itemCode]: !isExpanded,
                    }))
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

          {visibleHeaders.map((date: string) => {
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

  return (
    <div className="overflow-x-auto">
      {/* YEAR NAVIGATION */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={handlePrevHeaders}
          disabled={visibleHeadersStart === 0}
          className={`px-3 py-2 rounded-lg font-bold transition ${
            visibleHeadersStart === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              : 'bg-yellow-500 text-black hover:bg-yellow-600'
          }`}
        >
          ← Năm mới hơn
        </button>

        <div className="flex gap-2 text-sm text-slate-400">
          Hiển thị năm {visibleHeadersStart + 1} -{' '}
          {visibleHeadersStart + visibleCount} / Tổng {headers.length} năm
        </div>

        <button
          onClick={handleNextHeaders}
          disabled={visibleHeadersStart >= headers.length - visibleCount}
          className={`px-3 py-2 rounded-lg font-bold transition ${
            visibleHeadersStart >= headers.length - visibleCount
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              : 'bg-yellow-500 text-black hover:bg-yellow-600'
          }`}
        >
          Năm mới cũ →
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-900 border-b border-slate-700 text-slate-500 text-[12px]">
            <th className="py-4 px-6 text-left sticky left-0 bg-slate-900 z-20 min-w-[350px]">
              CHỈ TIÊU
            </th>
            {visibleHeaders.map((date: string) => {
              const year = new Date(date).getFullYear();
              return (
                <th key={date} className="py-3 px-4 text-right min-w-[120px]">
                  <span className="text-sm font-semibold text-yellow-500">
                    {year}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{tree.map((node: any) => renderRow(node))}</tbody>
      </table>
    </div>
  );
}
