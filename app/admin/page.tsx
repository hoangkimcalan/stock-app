'use client';

import { useState } from 'react';

interface StockCode {
  code: string;
  name?: string;
}

interface TaskResult {
  code: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
}

interface TaskProgress {
  currentTask: string;
  processed: number;
  total: number;
  isRunning: boolean;
  results: TaskResult[];
}

export default function AdminPage() {
  const [stockCodes, setStockCodes] = useState<StockCode[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [progress, setProgress] = useState<TaskProgress>({
    currentTask: '',
    processed: 0,
    total: 0,
    isRunning: false,
    results: [],
  });

  const [selectedTask, setSelectedTask] = useState<
    'crawl' | 'ratios' | 'averages' | 'all'
  >('all');

  const [yearRange, setYearRange] = useState({
    start: 2017,
    end: new Date().getFullYear(),
  });

  const handleAddCode = (e: React.FormEvent) => {
    e.preventDefault();
    const codes = codeInput
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c);

    if (codes.length === 0) return;

    setStockCodes([
      ...stockCodes,
      ...codes.map((code) => ({ code })),
    ]);
    setCodeInput('');
  };

  const handleRemoveCode = (index: number) => {
    setStockCodes(stockCodes.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setStockCodes([]);
  };

  const handleRunTask = async () => {
    if (stockCodes.length === 0) {
      alert('Vui lòng thêm ít nhất 1 mã cổ phiếu');
      return;
    }

    setProgress({
      currentTask: '',
      processed: 0,
      total: stockCodes.length,
      isRunning: true,
      results: [],
    });

    try {
      if (selectedTask === 'crawl' || selectedTask === 'all') {
        await runCrawl();
      }

      if (selectedTask === 'ratios' || selectedTask === 'all') {
        await runRatios();
      }

      if (selectedTask === 'averages' || selectedTask === 'all') {
        await runAverages();
      }

      setProgress((prev) => ({ ...prev, isRunning: false }));
    } catch (error) {
      console.error('Task failed:', error);
      setProgress((prev) => ({
        ...prev,
        isRunning: false,
        results: [
          ...prev.results,
          {
            code: 'ERROR',
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      }));
    }
  };

  const runCrawl = async () => {
    setProgress((prev) => ({ ...prev, currentTask: 'Đang crawl data...' }));

    const codes = stockCodes.map((s) => s.code);
    const response = await fetch('/api/admin/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes }),
    });

    const data = await response.json();

    if (data.results) {
      setProgress((prev) => ({
        ...prev,
        processed: data.summary?.processed || 0,
        results: [...prev.results, ...data.results],
      }));
    }
  };

  const runRatios = async () => {
    setProgress((prev) => ({
      ...prev,
      currentTask: 'Đang tính ratios...',
      processed: 0,
    }));

    const codes = stockCodes.map((s) => s.code);
    const response = await fetch('/api/admin/ratios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes, yearRange }),
    });

    const data = await response.json();

    if (data.results) {
      setProgress((prev) => ({
        ...prev,
        processed: data.summary?.processed || 0,
        results: [...prev.results, ...data.results],
      }));
    }
  };

  const runAverages = async () => {
    setProgress((prev) => ({
      ...prev,
      currentTask: 'Đang tính sector averages...',
      processed: 0,
    }));

    const response = await fetch('/api/admin/sector-averages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.results) {
      setProgress((prev) => ({
        ...prev,
        results: [...prev.results, ...data.results],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400">
            Quản lý crawling, tính toán ratios và sector averages
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Input */}
          <div className="col-span-1 space-y-6">
            {/* Add Codes */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-bold text-yellow-400 mb-4">
                Thêm Mã Cổ Phiếu
              </h2>

              <form onSubmit={handleAddCode} className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Nhập mã (cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="VIC, VHM, VNM"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    disabled={progress.isRunning}
                  />
                </div>
                <button
                  type="submit"
                  disabled={progress.isRunning}
                  className="w-full px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600 disabled:opacity-50 transition"
                >
                  Thêm
                </button>
              </form>
            </div>

            {/* Year Range */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-bold text-yellow-400 mb-4">
                Năm Tài Chính
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Từ năm
                  </label>
                  <input
                    type="number"
                    value={yearRange.start}
                    onChange={(e) =>
                      setYearRange({
                        ...yearRange,
                        start: parseInt(e.target.value),
                      })
                    }
                    disabled={progress.isRunning}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Đến năm
                  </label>
                  <input
                    type="number"
                    value={yearRange.end}
                    onChange={(e) =>
                      setYearRange({
                        ...yearRange,
                        end: parseInt(e.target.value),
                      })
                    }
                    disabled={progress.isRunning}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Task Selection */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-bold text-yellow-400 mb-4">
                Chọn Công Việc
              </h2>

              <div className="space-y-2">
                {[
                  { value: 'crawl', label: 'Crawl Data' },
                  { value: 'ratios', label: 'Tính Ratios' },
                  { value: 'averages', label: 'Sector Averages' },
                  { value: 'all', label: 'Chạy Tất Cả' },
                ].map((task) => (
                  <label key={task.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="task"
                      value={task.value}
                      checked={selectedTask === task.value}
                      onChange={(e) =>
                        setSelectedTask(
                          e.target.value as
                            | 'crawl'
                            | 'ratios'
                            | 'averages'
                            | 'all'
                        )
                      }
                      disabled={progress.isRunning}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">{task.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stock List & Results */}
          <div className="col-span-2 space-y-6">
            {/* Stock List */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-yellow-400">
                  Danh Sách Mã ({stockCodes.length})
                </h2>
                <button
                  onClick={handleClearAll}
                  disabled={progress.isRunning || stockCodes.length === 0}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition"
                >
                  Xóa Tất Cả
                </button>
              </div>

              <div className="bg-slate-900 rounded p-4 max-h-48 overflow-y-auto">
                {stockCodes.length === 0 ? (
                  <p className="text-slate-500 text-center py-6">
                    Chưa có mã nào
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {stockCodes.map((stock, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-700 px-3 py-2 rounded"
                      >
                        <span className="text-white font-semibold">
                          {stock.code}
                        </span>
                        <button
                          onClick={() => handleRemoveCode(idx)}
                          disabled={progress.isRunning}
                          className="text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            {progress.isRunning && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="space-y-4">
                  <div>
                    <p className="text-yellow-400 font-semibold mb-2">
                      {progress.currentTask}
                    </p>
                    <div className="bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full transition-all duration-300"
                        style={{
                          width: `${(progress.processed / progress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {progress.processed} / {progress.total}
                  </p>
                </div>
              </div>
            )}

            {/* Results */}
            {progress.results.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-lg font-bold text-yellow-400 mb-4">
                  Kết Quả
                </h2>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {progress.results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded text-sm font-mono ${
                        result.status === 'ok'
                          ? 'bg-green-900/30 border border-green-700 text-green-400'
                          : result.status === 'warning'
                            ? 'bg-yellow-900/30 border border-yellow-700 text-yellow-400'
                            : 'bg-red-900/30 border border-red-700 text-red-400'
                      }`}
                    >
                      <div className="font-bold">{result.code}</div>
                      <div className="text-xs opacity-75">{result.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunTask}
              disabled={progress.isRunning || stockCodes.length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-lg rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 transition"
            >
              {progress.isRunning ? 'Đang chạy...' : 'Chạy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
