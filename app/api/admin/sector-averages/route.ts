/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import {
  calculateAndSaveAllSectorAverages,
} from '@/services/finance.service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectDB();

  try {
    const sectorsProcessed = await calculateAndSaveAllSectorAverages();

    return NextResponse.json({
      success: true,
      results: [
        {
          code: 'SECTOR_AVERAGES',
          status: 'ok' as const,
          message: `Calculated for ${sectorsProcessed} sectors`,
        },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
