/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

interface StockDataState {
  data: any;
  incomeData: any;
  cashFlowData: any;
  statisticsData: any;
  tree: any[];
  incomeTree: any[];
  cashFlowTree: any[];
  headers: string[];
  incomeHeaders: string[];
  cashFlowHeaders: string[];
  loading: boolean;
}

export function useStockData(stockCode: string, activeTab: string, dataSubTab: string, reportSubTab: string) {
  const [state, setState] = useState<StockDataState>({
    data: null,
    incomeData: null,
    cashFlowData: null,
    statisticsData: null,
    tree: [],
    incomeTree: [],
    cashFlowTree: [],
    headers: [],
    incomeHeaders: [],
    cashFlowHeaders: [],
    loading: true,
  });

  // Reset data when stockCode changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      data: null,
      incomeData: null,
      cashFlowData: null,
      statisticsData: null,
      tree: [],
      incomeTree: [],
      cashFlowTree: [],
      headers: [],
      incomeHeaders: [],
      cashFlowHeaders: [],
    }));
  }, [stockCode]);

  // Fetch Balance Sheet
  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }));

    fetch(`/api/stocks/${stockCode}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((resData) => {
        const items = resData.rawItems || [];
        let headers: string[] = [];
        if (items.length > 0) {
          const longestDataRow = items.reduce((prev: any, current: any) =>
            prev.data?.length > current.data?.length ? prev : current
          );
          if (longestDataRow?.data) {
            headers = longestDataRow.data.map((d: any) => d.fiscalDate);
          }
        }

        setState((prev) => ({
          ...prev,
          data: resData || [],
          tree: resData.tree || [],
          headers,
          loading: false,
        }));
      })
      .catch((err) => {
        console.error('Error fetching balance sheet:', err);
        setState((prev) => ({ ...prev, loading: false }));
      });
  }, [stockCode]);

  // Fetch Income Statement
  useEffect(() => {
    if (activeTab === 'data' && dataSubTab === 'report' && reportSubTab === 'income') {
      fetch(`/api/stocks/${stockCode}/finance`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((resData) => {
          const items = resData.rawItems || [];
          let incomeHeaders: string[] = [];
          if (items.length > 0) {
            const longestDataRow = items.reduce((prev: any, current: any) =>
              prev.data?.length > current.data?.length ? prev : current
            );
            if (longestDataRow?.data) {
              incomeHeaders = longestDataRow.data.map((d: any) => d.fiscalDate);
            }
          }

          const treeData =
            resData.tree && resData.tree.length > 0 ? resData.tree : resData.rawItems || [];

          setState((prev) => ({
            ...prev,
            incomeData: resData || [],
            incomeTree: treeData,
            incomeHeaders,
          }));
        })
        .catch((err) => console.error('Error fetching income statement:', err));
    }
  }, [stockCode, activeTab, dataSubTab, reportSubTab]);

  // Fetch Cash Flow Statement
  useEffect(() => {
    if (activeTab === 'data' && dataSubTab === 'report' && reportSubTab === 'cashflow') {
      fetch(`/api/stocks/${stockCode}/cashflow`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((resData) => {
          const items = resData.rawItems || [];
          let cashFlowHeaders: string[] = [];
          if (items.length > 0) {
            const longestDataRow = items.reduce((prev: any, current: any) =>
              prev.data?.length > current.data?.length ? prev : current
            );
            if (longestDataRow?.data) {
              cashFlowHeaders = longestDataRow.data.map((d: any) => d.fiscalDate);
            }
          }

          const treeData =
            resData.tree && resData.tree.length > 0 ? resData.tree : resData.rawItems || [];

          setState((prev) => ({
            ...prev,
            cashFlowData: resData || [],
            cashFlowTree: treeData,
            cashFlowHeaders,
          }));
        })
        .catch((err) => console.error('Error fetching cash flow statement:', err));
    }
  }, [stockCode, activeTab, dataSubTab, reportSubTab]);

  // Fetch Statistics
  useEffect(() => {
    if (activeTab === 'data' && dataSubTab === 'statistics') {
      fetch(`/api/stocks/${stockCode}/statistics`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((resData) => {
          setState((prev) => ({
            ...prev,
            statisticsData: resData || {},
          }));
        })
        .catch((err) => console.error('Error fetching statistics data:', err));
    }
  }, [stockCode, activeTab, dataSubTab]);

  return state;
}
