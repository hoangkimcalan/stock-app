import { connectDB } from '@/lib/mongodb';
import FinanceStatement from '@/models/FinanceStatement';
import IncomeStatement from '@/models/IncomeStatement';
import Statistics from '@/models/Statistics';
import {
  crawlFinance,
  crawlIncomeStatement,
  crawlStatistics,
} from '@/services/finance.crawler';

const STOCKS = [
  'FIR',
  'TAL',
  'TIX',
  'VRC',
  'QNP',
  'BCE',
  'CCC',
  'RYG',
  'TCD',
  'TSA',

];

export async function GET() {
  await connectDB();

  const results = [];

  for (const code of STOCKS) {
    try {
      // Crawl Finance
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

      // Crawl Income Statement
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

      // Crawl Statistics
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
