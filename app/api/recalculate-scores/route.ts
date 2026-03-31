/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import FinancialRatios from '@/models/FinancialRatios';
import SectorAverageRatios from '@/models/SectorAverageRatios';
import { NextResponse } from 'next/server';

interface ScoreBreakdown {
  roe?: string;
  debtToEquity?: string;
  currentRatio?: string;
  qualityRatio?: string;
}

function calculateScore(
  ratios: any,
  benchmarkRatios: any
): { score: number; scoreBreakdown: ScoreBreakdown } {
  const scoreBreakdown: ScoreBreakdown = {};
  let totalScore = 0;
  let validCriteria = 0; // Đếm số tiêu chí hợp lệ

  // ROE >= benchmark ngành: +1 điểm
  if (
    ratios.roe !== undefined &&
    benchmarkRatios.roe !== undefined &&
    benchmarkRatios.roe !== null
  ) {
    validCriteria++;
    if (ratios.roe >= benchmarkRatios.roe) {
      scoreBreakdown.roe = `+1 (ROE ${(ratios.roe * 100).toFixed(
        2
      )}% >= benchmark ${(benchmarkRatios.roe * 100).toFixed(2)}%)`;
      totalScore += 1;
    } else {
      scoreBreakdown.roe = `-1 (ROE ${(ratios.roe * 100).toFixed(
        2
      )}% < benchmark ${(benchmarkRatios.roe * 100).toFixed(2)}%)`;
    }
  }

  // D/E <= benchmark ngành: +1 điểm (càng thấp càng tốt)
  if (
    ratios.debtToEquity !== undefined &&
    benchmarkRatios.debtToEquity !== undefined &&
    benchmarkRatios.debtToEquity !== null
  ) {
    validCriteria++;
    if (ratios.debtToEquity <= benchmarkRatios.debtToEquity) {
      scoreBreakdown.debtToEquity = `+1 (D/E ${ratios.debtToEquity.toFixed(
        2
      )} <= benchmark ${benchmarkRatios.debtToEquity.toFixed(2)})`;
      totalScore += 1;
    } else {
      scoreBreakdown.debtToEquity = `-1 (D/E ${ratios.debtToEquity.toFixed(
        2
      )} > benchmark ${benchmarkRatios.debtToEquity.toFixed(2)})`;
    }
  }

  // Current Ratio >= benchmark ngành: +1 điểm
  if (
    ratios.currentRatio !== undefined &&
    benchmarkRatios.currentRatio !== undefined &&
    benchmarkRatios.currentRatio !== null
  ) {
    validCriteria++;
    if (ratios.currentRatio >= benchmarkRatios.currentRatio) {
      scoreBreakdown.currentRatio = `+1 (Current ${ratios.currentRatio.toFixed(
        2
      )} >= benchmark ${benchmarkRatios.currentRatio.toFixed(2)})`;
      totalScore += 1;
    } else {
      scoreBreakdown.currentRatio = `-1 (Current ${ratios.currentRatio.toFixed(
        2
      )} < benchmark ${benchmarkRatios.currentRatio.toFixed(2)})`;
    }
  }

  // Quality Ratio >= 1: +1 điểm
  if (ratios.qualityRatio !== undefined && ratios.qualityRatio !== null) {
    validCriteria++;
    if (ratios.qualityRatio >= 1) {
      scoreBreakdown.qualityRatio = `+1 (Quality ${ratios.qualityRatio.toFixed(
        2
      )} >= 1)`;
      totalScore += 1;
    } else {
      scoreBreakdown.qualityRatio = `-1 (Quality ${ratios.qualityRatio.toFixed(
        2
      )} < 1)`;
    }
  }

  console.log(
    ` Final Score: ${totalScore}/${validCriteria}, Breakdown: ${JSON.stringify(
      scoreBreakdown
    )}`
  );

  return {
    score: totalScore, // Score từ 0 đến 4
    scoreBreakdown,
  };
}

export async function POST(req: Request) {
  await connectDB();

  try {
    const { code } = await req.json();

    // Nếu có code cụ thể, chỉ tính cho code đó
    const query = code ? { code } : {};

    const allStocks = await FinancialRatios.find(query);

    if (allStocks.length === 0) {
      return NextResponse.json({ error: 'No stocks found' }, { status: 404 });
    }

    let rescored = 0;
    const results = [];

    for (const stock of allStocks) {
      try {
        const updatedRatios = await Promise.all(
          stock.ratios.map(async (ratio: any) => {
            // Lấy benchmark ngành
            const sectorAverage = await SectorAverageRatios.findOne({
              sectorName: stock.sectorName,
              'ratios.year': ratio.year,
            });

            if (sectorAverage) {
              const benchmarkRatio = sectorAverage.ratios.find(
                (r: any) => r.year === ratio.year
              );
              if (benchmarkRatio) {
                const scoreInfo = calculateScore(ratio, benchmarkRatio);
                return {
                  ...ratio,
                  score: scoreInfo.score,
                  scoreBreakdown: scoreInfo.scoreBreakdown,
                };
              }
            }

            return {
              ...ratio,
              score: 0,
              scoreBreakdown: {},
            };
          })
        );

        await FinancialRatios.updateOne(
          { _id: stock._id },
          { $set: { ratios: updatedRatios } }
        );

        rescored++;
        results.push({
          code: stock.code,
          status: 'ok',
          message: `Rescored ${updatedRatios.length} years`,
        });
      } catch (err) {
        results.push({
          code: stock.code,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      rescored,
      totalStocks: allStocks.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();

  try {
    const allStocks = await FinancialRatios.find();

    if (allStocks.length === 0) {
      return NextResponse.json({ error: 'No stocks found' }, { status: 404 });
    }

    let rescored = 0;
    const results = [];

    for (const stock of allStocks) {
      try {
        console.log(
          `\n=== Processing ${stock.code} (Sector: ${stock.sectorName}) ===`
        );

        const updatedRatios = await Promise.all(
          stock.ratios.map(async (ratio: any) => {
            // Convert mongoose document to plain object
            const ratioObj = ratio.toObject
              ? ratio.toObject()
              : JSON.parse(JSON.stringify(ratio));

            // Lấy benchmark ngành
            const sectorAverage = await SectorAverageRatios.findOne({
              sectorName: stock.sectorName,
              'ratios.year': ratio.year,
            });

            console.log(`Year ${ratio.year}:`);
            console.log(
              `  - sectorAverage found: ${sectorAverage ? 'YES' : 'NO'}`
            );

            if (sectorAverage) {
              const benchmarkRatio = sectorAverage.ratios.find(
                (r: any) => r.year === ratio.year
              );
              console.log(
                `  - benchmarkRatio found: ${benchmarkRatio ? 'YES' : 'NO'}`
              );

              if (benchmarkRatio) {
                console.log(
                  `  - Stock ROE: ${ratio.roe}, Benchmark ROE: ${benchmarkRatio.roe}`
                );
                const scoreInfo = calculateScore(ratioObj, benchmarkRatio);
                console.log(`  - Score: ${scoreInfo.score}`);

                // Assign score trực tiếp
                ratioObj.score = scoreInfo.score;
                ratioObj.scoreBreakdown = scoreInfo.scoreBreakdown;

                return ratioObj;
              }
            } else {
              console.log(`  ❌ No sector average for: ${stock.sectorName}`);
            }

            ratioObj.score = 0;
            ratioObj.scoreBreakdown = {};
            return ratioObj;
          })
        );

        // Update với giá trị mới
        await FinancialRatios.updateOne(
          { _id: stock._id },
          { $set: { ratios: updatedRatios } }
        );

        rescored++;
        results.push({
          code: stock.code,
          status: 'ok',
          message: `Rescored ${updatedRatios.length} years`,
        });
      } catch (err) {
        console.error(`Error processing ${stock.code}:`, err);
        results.push({
          code: stock.code,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      rescored,
      totalStocks: allStocks.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
