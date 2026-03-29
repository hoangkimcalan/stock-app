import { connectDB } from '@/lib/mongodb';
import CashFlowStatement from '@/models/CashFlowStatement';
import FinanceStatement from '@/models/FinanceStatement';
import IncomeStatement from '@/models/IncomeStatement';
import Statistics from '@/models/Statistics';
import { crawlCashFlowStatement, crawlFinance, crawlIncomeStatement, crawlStatistics } from '@/services/finance.crawler';

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
];

export async function GET() {
  await connectDB();

  const results = [];

  for (const code of STOCKS) {
    try {
      //Crawl Finance
      const financeData = await crawlFinance(code);

      const financeParsed = {
        code: financeData.code,
        name: financeData.name,
        type: 89,
        period: 1,
        year: 2025,
        items: financeData.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          displayLevel: item.displayLevel,
          data: item.data,
        })),
      };

      await FinanceStatement.findOneAndUpdate(
        { code: financeParsed.code, year: financeParsed.year },
        financeParsed,
        { upsert: true, new: true }
      );

      //Crawl Income Statement
      const incomeData = await crawlIncomeStatement(code);

      await IncomeStatement.findOneAndUpdate(
        {
          code: incomeData.code,
          year: incomeData.year,
          periodNum: incomeData.periodNum,
        },
        incomeData,
        { upsert: true, new: true }
      );

      // Crawl Cash Flow Statement
      const cashFlowData = await crawlCashFlowStatement(code);

      await CashFlowStatement.findOneAndUpdate(
        {
          code: cashFlowData.code,
          year: cashFlowData.year,
          periodNum: cashFlowData.periodNum,
        },
        cashFlowData,
        { upsert: true, new: true }
      );

      //Crawl Statistics
      const statisticsData = await crawlStatistics(code);

      await Statistics.findOneAndUpdate(
        { code: statisticsData.code },
        statisticsData,
        { upsert: true, new: true }
      );

      results.push({
        code,
        status: 'ok',
        finance: 'saved',
        income: 'saved',
        cashflow: 'saved',
        statistics: 'saved',
      });
    } catch (err) {
      results.push({
        code,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return Response.json({
    success: true,
    results,
  });
}
