/* eslint-disable @typescript-eslint/no-explicit-any */
import CashFlowStatement from '@/models/CashFlowStatement';
import FinanceStatement from '@/models/FinanceStatement';
import FinancialRatios from '@/models/FinancialRatios';
import IncomeStatement from '@/models/IncomeStatement';
import SectorAverageRatios from '@/models/SectorAverageRatios';
import Statistics from '@/models/Statistics';
import axios from 'axios';

export async function getFinanceFromAPI(code: string) {
  const url = `https://api.alphastock.vn/api/company/finance_statements?code=${code}&type=89&period=0&year=2025&period_num=8`;

  const res = await axios.get(url);

  return res.data;
}

export async function getIncomeStatementFromAPI(code: string) {
  const url = `https://api.alphastock.vn/api/company/finance_statements?code=${code}&type=90&period=0&year=2025&period_num=8`;

  const res = await axios.get(url);

  return res.data;
}

export async function getCashFlowStatementFromAPI(code: string) {
  const url = `https://api.alphastock.vn/api/company/finance_statements?code=${code}&type=91&period=0&year=2025&period_num=8`;

  const res = await axios.get(url);

  return res.data;
}

export async function getStatisticsFromAPI(code: string) {
  const url = `https://api.alphastock.vn/api/company/statistics?code=${code}`;

  const res = await axios.get(url);

  return res.data;
}

async function getValueByItemName(
  code: string,
  itemName: string,
  fiscalDate: string,
  type: 'balance' | 'income' | 'cashflow'
): Promise<number | null> {
  try {
    let doc;
    let fieldName;

    if (type === 'balance') {
      doc = await FinanceStatement.findOne({
        code,
        'items.itemName': itemName,
      });
      fieldName = 'items';
    } else if (type === 'income') {
      doc = await IncomeStatement.findOne({
        code,
        'rawItems.itemName': itemName,
      });
      fieldName = 'rawItems';
    } else {
      doc = await CashFlowStatement.findOne({
        code,
        'rawItems.itemName': itemName,
      });
      fieldName = 'rawItems';
    }

    if (!doc) return null;

    const items = doc[fieldName];
    const item = items.find((i: any) => i.itemName === itemName);
    if (!item) return null;

    const dataPoint = item.data.find((d: any) => d.fiscalDate === fiscalDate);
    if (!dataPoint) return null;

    const value = dataPoint.numericValue;
    return typeof value === 'number' ? value : null;
  } catch (error) {
    console.error(
      `Error getting value for ${itemName} on ${fiscalDate} (${type}):`,
      error
    );
    return null;
  }
}

export async function calculateYearlyRatios(code: string, year: number) {
  const fiscalDate = `${year}-12-31`;
  const prevFiscalDate = `${year - 1}-12-31`;

  const ratios: any = {
    year,
    quarter: null,
  };

  try {
    // ========== DU PONT ANALYSIS ==========

    // Get Income Statement data
    const profitAfterTax = await getValueByItemName(
      code,
      'Lợi nhuận sau thuế thu nhập doanh nghiệp',
      fiscalDate,
      'income'
    );
    const profitBeforeTax = await getValueByItemName(
      code,
      'Lợi nhuận kế toán trước thuế',
      fiscalDate,
      'income'
    );
    const interestExpense = await getValueByItemName(
      code,
      'Trong đó: Chi phí lãi vay',
      fiscalDate,
      'income'
    );
    const netRevenue = await getValueByItemName(
      code,
      'Doanh thu thuần',
      fiscalDate,
      'income'
    );

    // Lưu netRevenue để dùng làm trọng số (Ri)
    ratios.netRevenue = netRevenue;

    // 1. Tax Burden = Lợi nhuận sau thuế / Lợi nhuận trước thuế
    if (
      profitAfterTax !== null &&
      profitBeforeTax !== null &&
      profitBeforeTax !== 0
    ) {
      ratios.taxBurden = profitAfterTax / profitBeforeTax;
    }

    // 2. Interest Burden = Lợi nhuận trước thuế / (Lợi nhuận trước thuế + Chi phí lãi vay)
    if (
      profitBeforeTax !== null &&
      interestExpense !== null &&
      profitBeforeTax + interestExpense !== 0
    ) {
      ratios.interestBurden =
        profitBeforeTax / (profitBeforeTax + interestExpense);
    }

    // 3. Operating Margin = (Lợi nhuận trước thuế + Chi phí lãi vay) / Doanh thu thuần
    if (
      profitBeforeTax !== null &&
      interestExpense !== null &&
      netRevenue !== null &&
      netRevenue !== 0
    ) {
      ratios.operatingMargin = (profitBeforeTax + interestExpense) / netRevenue;
    }

    // Get Balance Sheet data
    const totalAssetsCurrentYear = await getValueByItemName(
      code,
      'TỔNG CỘNG TÀI SẢN',
      fiscalDate,
      'balance'
    );
    const totalAssetsPrevYear = await getValueByItemName(
      code,
      'TỔNG CỘNG TÀI SẢN',
      prevFiscalDate,
      'balance'
    );
    const equityCurrentYear = await getValueByItemName(
      code,
      'Vốn chủ sở hữu',
      fiscalDate,
      'balance'
    );
    const equityPrevYear = await getValueByItemName(
      code,
      'Vốn chủ sở hữu',
      prevFiscalDate,
      'balance'
    );

    // 4. Asset Turnover = Doanh thu thuần / Tổng tài sản trung bình
    if (
      netRevenue !== null &&
      totalAssetsCurrentYear !== null &&
      totalAssetsPrevYear !== null
    ) {
      const avgTotalAssets = (totalAssetsCurrentYear + totalAssetsPrevYear) / 2;
      if (avgTotalAssets !== 0) {
        ratios.assetTurnover = netRevenue / avgTotalAssets;
      }
    }

    // 5. Financial Leverage = Tổng tài sản trung bình / Vốn chủ trung bình
    if (
      totalAssetsCurrentYear !== null &&
      totalAssetsPrevYear !== null &&
      equityCurrentYear !== null &&
      equityPrevYear !== null
    ) {
      const avgAssets = (totalAssetsCurrentYear + totalAssetsPrevYear) / 2;
      const avgEquity = (equityCurrentYear + equityPrevYear) / 2;
      if (avgEquity !== 0) {
        ratios.financialLeverage = avgAssets / avgEquity;
      }
    }

    // ROE = Tax Burden × Interest Burden × Operating Margin × Asset Turnover × Financial Leverage
    if (
      ratios.taxBurden &&
      ratios.interestBurden &&
      ratios.operatingMargin &&
      ratios.assetTurnover &&
      ratios.financialLeverage
    ) {
      ratios.roe =
        ratios.taxBurden *
        ratios.interestBurden *
        ratios.operatingMargin *
        ratios.assetTurnover *
        ratios.financialLeverage;
    }

    // ========== QUỐC'S FORMULAS ==========

    const totalDebt = await getValueByItemName(
      code,
      'Nợ phải trả',
      fiscalDate,
      'balance'
    );

    const currentAssets = await getValueByItemName(
      code,
      'Tài sản ngắn hạn',
      fiscalDate,
      'balance'
    );
    const currentLiabilities = await getValueByItemName(
      code,
      'Nợ ngắn hạn',
      fiscalDate,
      'balance'
    );

    // Get Cash Flow Statement data
    const operatingCashFlow = await getValueByItemName(
      code,
      'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
      fiscalDate,
      'cashflow'
    );

    // 1. Debt to Equity = Tổng nợ phải trả (CĐKT) / Vốn chủ sở hữu (CĐKT)
    if (
      totalDebt !== null &&
      equityCurrentYear !== null &&
      equityCurrentYear !== 0
    ) {
      ratios.debtToEquity = totalDebt / equityCurrentYear;
    }

    // 2. Current Ratio = Tài sản ngắn hạn (CĐKT) / Nợ ngắn hạn (CĐKT)
    if (
      currentAssets !== null &&
      currentLiabilities !== null &&
      currentLiabilities !== 0
    ) {
      ratios.currentRatio = currentAssets / currentLiabilities;
    }

    // 3. Quality Ratio = Lưu chuyển tiền từ hoạt động (Lưu chuyển tiền tệ) / Lợi nhuận sau thuế (KQKD)
    if (
      operatingCashFlow !== null &&
      profitAfterTax !== null &&
      profitAfterTax !== 0
    ) {
      ratios.qualityRatio = operatingCashFlow / profitAfterTax;
    }

    return ratios;
  } catch (error) {
    console.error(
      `Error calculating yearly ratios for ${code} ${year}:`,
      error
    );
    return ratios;
  }
}

interface ScoreBreakdown {
  roe?: string;
  debtToEquity?: string;
  currentRatio?: string;
  qualityRatio?: string;
}

// Tính điểm theo bảng tiêu chí
function calculateScore(
  ratios: any,
  benchmarkRatios: any
): { score: number; scoreBreakdown: ScoreBreakdown } {
  const scoreBreakdown: ScoreBreakdown = {};
  let totalScore = 0;

  // ROE >= benchmark ngành: +1 điểm
  if (ratios.roe !== undefined && benchmarkRatios.roe !== undefined) {
    if (ratios.roe >= benchmarkRatios.roe) {
      scoreBreakdown.roe = `+1 (ROE ${(ratios.roe * 100).toFixed(2)}% >= benchmark ${(benchmarkRatios.roe * 100).toFixed(2)}%)`;
      totalScore += 1;
    } else {
      scoreBreakdown.roe = `-1 (ROE ${(ratios.roe * 100).toFixed(2)}% < benchmark ${(benchmarkRatios.roe * 100).toFixed(2)}%)`;
      totalScore -= 1;
    }
  }

  // D/E <= benchmark ngành: +1 điểm (càng thấp càng tốt)
  if (
    ratios.debtToEquity !== undefined &&
    benchmarkRatios.debtToEquity !== undefined
  ) {
    if (ratios.debtToEquity <= benchmarkRatios.debtToEquity) {
      scoreBreakdown.debtToEquity = `+1 (D/E ${ratios.debtToEquity.toFixed(2)} <= benchmark ${benchmarkRatios.debtToEquity.toFixed(2)})`;
      totalScore += 1;
    } else {
      scoreBreakdown.debtToEquity = `-1 (D/E ${ratios.debtToEquity.toFixed(2)} > benchmark ${benchmarkRatios.debtToEquity.toFixed(2)})`;
      totalScore -= 1;
    }
  }

  // Current Ratio >= benchmark ngành: +1 điểm
  if (
    ratios.currentRatio !== undefined &&
    benchmarkRatios.currentRatio !== undefined
  ) {
    if (ratios.currentRatio >= benchmarkRatios.currentRatio) {
      scoreBreakdown.currentRatio = `+1 (Current ${ratios.currentRatio.toFixed(2)} >= benchmark ${benchmarkRatios.currentRatio.toFixed(2)})`;
      totalScore += 1;
    } else {
      scoreBreakdown.currentRatio = `-1 (Current ${ratios.currentRatio.toFixed(2)} < benchmark ${benchmarkRatios.currentRatio.toFixed(2)})`;
      totalScore -= 1;
    }
  }

  // Quality Ratio >= 1: +1 điểm
  if (ratios.qualityRatio !== undefined) {
    if (ratios.qualityRatio >= 1) {
      scoreBreakdown.qualityRatio = `+1 (Quality ${ratios.qualityRatio.toFixed(2)} >= 1)`;
      totalScore += 1;
    } else {
      scoreBreakdown.qualityRatio = `-1 (Quality ${ratios.qualityRatio.toFixed(2)} < 1 - lỗi ảo)`;
      totalScore -= 1;
    }
  }

  return {
    score: totalScore,
    scoreBreakdown,
  };
}

export async function saveFinancialRatios(
  code: string,
  ratios: any[],
  sectorName?: string
) {
  try {
    const stock = await Statistics.findOne({ code });
    if (!stock) {
      console.error(`Stock ${code} not found in Statistics`);
      return false;
    }

    const finalSectorName = sectorName || stock.sectorName;

    // Tính score cho từng ratio nếu có sectorName
    const ratiosWithScore = await Promise.all(
      ratios.map(async (ratio) => {
        if (finalSectorName) {
          // Lấy benchmark ngành
          const sectorAverage = await SectorAverageRatios.findOne({
            sectorName: finalSectorName,
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
        }

        return {
          ...ratio,
          score: 0,
          scoreBreakdown: {},
        };
      })
    );

    await FinancialRatios.updateOne(
      { code },
      {
        $set: {
          code,
          name: stock.name,
          sectorName: finalSectorName,
          ratios: ratiosWithScore,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`Saved financial ratios for ${code}`);
    return true;
  } catch (error) {
    console.error(`Error saving financial ratios for ${code}:`, error);
    return false;
  }
}

interface RatioData {
  year: number;
  taxBurden?: number;
  interestBurden?: number;
  operatingMargin?: number;
  assetTurnover?: number;
  financialLeverage?: number;
  roe?: number;
  debtToEquity?: number;
  currentRatio?: number;
  qualityRatio?: number;
  netRevenue?: number; // Doanh thu thuần - Ri (trọng số)
}

// Tính weighted average theo công thức: Σ(Xi × Ri) / ΣRi
// Xi = chỉ số tài chính, Ri = doanh thu thuần (netRevenue)
function calculateWeightedAverage(
  values: (number | undefined)[],
  weights: (number | undefined)[]
): number | null {
  if (values.length !== weights.length) return null;

  let totalWeightedValue = 0;
  let totalWeight = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const weight = weights[i];

    // Chỉ tính những values và weights hợp lệ (không null, không undefined, không NaN, weight > 0)
    if (
      value !== null &&
      value !== undefined &&
      !isNaN(value) &&
      weight !== null &&
      weight !== undefined &&
      !isNaN(weight) &&
      weight > 0
    ) {
      totalWeightedValue += value * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return null;
  return totalWeightedValue / totalWeight;
}

export async function calculateSectorAverageRatios(sectorName: string) {
  try {
    // Lấy tất cả stock trong ngành từ Statistics
    const stocks = await Statistics.find({ sectorName }, 'code');

    if (stocks.length === 0) {
      console.warn(`No stocks found for sector: ${sectorName}`);
      return [];
    }

    const stockCodes = stocks.map((s) => s.code);

    // Lấy financial ratios của tất cả stock trong ngành
    const financialRatios = await FinancialRatios.find({
      code: { $in: stockCodes },
    });

    if (financialRatios.length === 0) {
      console.warn(`No financial ratios found for sector: ${sectorName}`);
      return [];
    }

    // Group ratios by year
    const ratiosByYear: Record<number, RatioData[]> = {};
    const revenueByYear: Record<number, (number | undefined)[]> = {};

    financialRatios.forEach((stock) => {
      stock.ratios.forEach((ratio: any) => {
        const year = ratio.year;

        if (!ratiosByYear[year]) {
          ratiosByYear[year] = [];
          revenueByYear[year] = [];
        }

        ratiosByYear[year].push({
          year: ratio.year,
          taxBurden: ratio.taxBurden,
          interestBurden: ratio.interestBurden,
          operatingMargin: ratio.operatingMargin,
          assetTurnover: ratio.assetTurnover,
          financialLeverage: ratio.financialLeverage,
          roe: ratio.roe,
          debtToEquity: ratio.debtToEquity,
          currentRatio: ratio.currentRatio,
          qualityRatio: ratio.qualityRatio,
          netRevenue: ratio.netRevenue, // Ri - trọng số
        });

        // Lấy netRevenue (Doanh thu thuần) làm trọng số Ri
        revenueByYear[year].push(ratio.netRevenue);
      });
    });

    // Tính weighted average cho mỗi năm theo công thức: Σ(Xi × Ri) / ΣRi
    const averageRatios = Object.entries(ratiosByYear)
      .map(([year, ratios]) => {
        const weights = revenueByYear[parseInt(year)]; // Ri = netRevenue

        return {
          year: parseInt(year),
          // Xi = chỉ số tài chính, Ri = netRevenue (doanh thu thuần)
          taxBurden: calculateWeightedAverage(
            ratios.map((r) => r.taxBurden),
            weights
          ),
          interestBurden: calculateWeightedAverage(
            ratios.map((r) => r.interestBurden),
            weights
          ),
          operatingMargin: calculateWeightedAverage(
            ratios.map((r) => r.operatingMargin),
            weights
          ),
          assetTurnover: calculateWeightedAverage(
            ratios.map((r) => r.assetTurnover),
            weights
          ),
          financialLeverage: calculateWeightedAverage(
            ratios.map((r) => r.financialLeverage),
            weights
          ),
          roe: calculateWeightedAverage(
            ratios.map((r) => r.roe),
            weights
          ),
          debtToEquity: calculateWeightedAverage(
            ratios.map((r) => r.debtToEquity),
            weights
          ),
          currentRatio: calculateWeightedAverage(
            ratios.map((r) => r.currentRatio),
            weights
          ),
          qualityRatio: calculateWeightedAverage(
            ratios.map((r) => r.qualityRatio),
            weights
          ),
          companyCount: ratios.length,
        };
      })
      .sort((a, b) => a.year - b.year);

    return averageRatios;
  } catch (error) {
    console.error(
      `Error calculating sector average ratios for ${sectorName}:`,
      error
    );
    return [];
  }
}

export async function saveSectorAverageRatios(
  sectorName: string,
  ratios: any[]
) {
  try {
    await SectorAverageRatios.updateOne(
      { sectorName },
      {
        $set: {
          sectorName,
          ratios,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`Saved sector average ratios for: ${sectorName}`);
    return true;
  } catch (error) {
    console.error('Error saving sector average ratios:', error);
    return false;
  }
}

export async function calculateAndSaveAllSectorAverages() {
  try {
    // Lấy danh sách tất cả ngành từ Statistics
    const sectors = await Statistics.distinct('sectorName');

    console.log(`Found ${sectors.length} sectors`);

    let processed = 0;
    for (const sectorName of sectors) {
      if (!sectorName) continue; // Skip empty sector names

      const averageRatios = await calculateSectorAverageRatios(sectorName);
      if (averageRatios.length > 0) {
        await saveSectorAverageRatios(sectorName, averageRatios);
        processed++;
      }
    }

    console.log(`Calculated sector averages for ${processed} sectors`);
    return processed;
  } catch (error) {
    console.error('Error calculating all sector averages:', error);
    return 0;
  }
}
