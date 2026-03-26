/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function FinancialReport({ tree, headers, expanded, setExpanded }: any) {
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

          {headers.map((date: string) => {
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
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-900 border-b border-slate-700 text-slate-500 text-[12px]">
            <th className="py-4 px-6 text-left sticky left-0 bg-slate-900 z-20 min-w-[350px]">
              CHỈ TIÊU
            </th>
            {headers.map((date: string) => (
              <th key={date} className="py-3 px-4 text-right">
                Q{Math.ceil((new Date(date).getMonth() + 1) / 3)} <br />
                <span className="text-[10px] opacity-50">
                  {new Date(date).getFullYear()}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{tree.map((node: any) => renderRow(node))}</tbody>
      </table>
    </div>
  );
}
