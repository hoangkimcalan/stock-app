/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import {
  calculateYearlyRatios,
  saveFinancialRatios,
} from '@/services/finance.service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectDB();

  try {
    const { codes, yearRange } = await req.json();

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
        const allRatios: any[] = [];

        for (
          let year = yearRange.start;
          year <= yearRange.end;
          year++
        ) {
          const ratios = await calculateYearlyRatios(code, year);
          if (Object.keys(ratios).length > 1) {
            allRatios.push(ratios);
          }
        }

        if (allRatios.length > 0) {
          const saved = await saveFinancialRatios(code, allRatios);
          if (saved) {
            results.push({
              code,
              status: 'ok',
              message: `Calculated ${allRatios.length} yearly ratios`,
            });
            processed++;
          }
        } else {
          results.push({
            code,
            status: 'warning',
            message: 'No ratios calculated (missing data)',
          });
        }
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
