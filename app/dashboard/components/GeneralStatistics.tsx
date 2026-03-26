/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

interface GeneralStatisticsProps {
  data: any;
}

export function GeneralStatistics({ data }: GeneralStatisticsProps) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="p-6 text-slate-400 text-center">
        Không có dữ liệu thống kê
      </div>
    );
  }

  // Map để nhận dạng group titles
  const groupTitles = [
    'Doanh Thu',
    'Lợi Nhuận',
    'EPS',
    'Chỉ Số Tài Chính',
    'Khác',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* HEADER STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-700">
        {/* Left Section */}
        <div>
          <p className="text-slate-400 text-xs mb-1">Công ty</p>
          <p className="text-yellow-500 font-bold">{data.code}</p>
          <p className="text-slate-400 text-xs">{data.floor}</p>
        </div>

        {/* Ratings */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">RS Rating</span>
            <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
              {data.rsRating || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">RS Ngành</span>
            <span className="bg-cyan-600 text-white px-2 py-1 rounded text-xs font-bold">
              {data.rsnRating || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">SMR Rating</span>
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
              {data.smrRating || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">EPS Rating</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              {data.epsRating || '-'}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">Vốn hóa (tỷ)</span>
            <span className="text-slate-300 font-mono">
              {data.marketCapital
                ? new Intl.NumberFormat('vi-VN').format(data.marketCapital)
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">
              EPS 4 quý gần nhất (đ)
            </span>
            <span className="text-slate-300 font-mono">
              {data.eps
                ? new Intl.NumberFormat('vi-VN').format(Math.round(data.eps))
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">BVPS (đ)</span>
            <span className="text-slate-300 font-mono">
              {data.bvps
                ? new Intl.NumberFormat('vi-VN').format(Math.round(data.bvps))
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">KLCP lần hành (CP)</span>
            <span className="text-slate-300 font-mono">
              {data.klcplh || '-'}
            </span>
          </div>
        </div>

        {/* Valuation */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">P/E (lần)</span>
            <span className="text-slate-300 font-mono">
              {data.pe
                ? new Intl.NumberFormat('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.pe)
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">P/B (lần)</span>
            <span className="text-slate-300 font-mono">
              {data.pb
                ? new Intl.NumberFormat('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.pb)
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">ROEA (%)</span>
            <span className="text-slate-300 font-mono">
              {data.roea
                ? new Intl.NumberFormat('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.roea)
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">ROAA (%)</span>
            <span className="text-slate-300 font-mono">
              {data.roaa
                ? new Intl.NumberFormat('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.roaa)
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* DATA TABLES */}
      {data.data?.map((group: any, groupIdx: number) => (
        <div key={groupIdx} className="space-y-3">
          {/* Group Title - chỉ hiển thị 1 lần */}
          <div className="border-b border-slate-700 pb-2">
            <h3 className="text-lg font-semibold text-yellow-500">
              {groupTitles[groupIdx] || `Nhóm ${groupIdx + 1}`}
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-400">
                    Năm
                  </th>
                  {group.label?.map((year: number) => (
                    <th
                      key={year}
                      className="text-right px-4 py-3 text-slate-400"
                    >
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.data?.map((item: any, itemIdx: number) => (
                  <tr
                    key={itemIdx}
                    className={`border-b border-slate-800 ${
                      item.displayLevel === 0
                        ? 'bg-slate-900 font-bold'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td
                      className="px-4 py-3 text-slate-300"
                      style={{
                        paddingLeft: `${(item.displayLevel || 0) * 16 + 16}px`,
                      }}
                    >
                      {item.itemName}
                    </td>
                    {group.label?.map((year: number) => {
                      const point = item.data?.find(
                        (d: any) => d.year === year
                      );
                      return (
                        <td
                          key={year}
                          className="text-right px-4 py-3 font-mono text-slate-300"
                        >
                          {point?.value
                            ? new Intl.NumberFormat('vi-VN').format(
                                Math.round(point.value)
                              )
                            : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
