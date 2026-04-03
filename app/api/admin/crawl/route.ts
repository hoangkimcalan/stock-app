/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import CashFlowStatement from '@/models/CashFlowStatement';
import FinanceStatement from '@/models/FinanceStatement';
import IncomeStatement from '@/models/IncomeStatement';
import Statistics from '@/models/Statistics';
import {
  crawlCashFlowStatement,
  crawlFinance,
  crawlIncomeStatement,
  crawlStatistics,
} from '@/services/finance.crawler';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectDB();

  try {
    const { codes } = await req.json();

    if (!codes || codes.length === 0) {
      return NextResponse.json(
        { error: 'No codes provided' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    let processed = 0;

    for (const code of codes) {
      try {
        // Crawl Finance
        const financeData = await crawlFinance(code);
        const financeParsed = {
          code: financeData.code,
          name: financeData.name,
          type: 89,
          period: 1,
          year: new Date().getFullYear(),
          items: financeData.items.map((item: any) => ({
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
          message: 'Crawled successfully',
        });
        processed++;
      } catch (err) {
        results.push({
          code,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: codes.length,
        processed,
        failed: codes.length - processed,
      },
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
