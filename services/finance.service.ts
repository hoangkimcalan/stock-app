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

export async function saveFinancialRatios(code: string, ratios: any[]) {
  try {
    const stock = await Statistics.findOne({ code });
    if (!stock) {
      console.error(`Stock ${code} not found in Statistics`);
      return false;
    }

    await FinancialRatios.updateOne(
      { code },
      {
        $set: {
          code,
          name: stock.name,
          sectorName: stock.sectorName,
          ratios,
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
  taxBurden?: number;
  interestBurden?: number;
  operatingMargin?: number;
  assetTurnover?: number;
  financialLeverage?: number;
  roe?: number;
  debtToEquity?: number;
  currentRatio?: number;
  qualityRatio?: number;
}

function calculateAverage(values: (number | undefined)[]): number | null {
  const validValues = values.filter(
    (v): v is number => v !== null && v !== undefined && !isNaN(v)
  );
  if (validValues.length === 0) return null;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
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

    financialRatios.forEach((stock) => {
      stock.ratios.forEach((ratio: any) => {
        const year = ratio.year;

        if (!ratiosByYear[year]) {
          ratiosByYear[year] = [];
        }

        ratiosByYear[year].push({
          taxBurden: ratio.taxBurden,
          interestBurden: ratio.interestBurden,
          operatingMargin: ratio.operatingMargin,
          assetTurnover: ratio.assetTurnover,
          financialLeverage: ratio.financialLeverage,
          roe: ratio.roe,
          debtToEquity: ratio.debtToEquity,
          currentRatio: ratio.currentRatio,
          qualityRatio: ratio.qualityRatio,
        });
      });
    });

    // Tính trung bình cho mỗi năm
    const averageRatios = Object.entries(ratiosByYear)
      .map(([year, ratios]) => {
        return {
          year: parseInt(year),
          taxBurden: calculateAverage(ratios.map((r) => r.taxBurden)),
          interestBurden: calculateAverage(
            ratios.map((r) => r.interestBurden)
          ),
          operatingMargin: calculateAverage(ratios.map((r) => r.operatingMargin)),
          assetTurnover: calculateAverage(ratios.map((r) => r.assetTurnover)),
          financialLeverage: calculateAverage(
            ratios.map((r) => r.financialLeverage)
          ),
          roe: calculateAverage(ratios.map((r) => r.roe)),
          debtToEquity: calculateAverage(ratios.map((r) => r.debtToEquity)),
          currentRatio: calculateAverage(ratios.map((r) => r.currentRatio)),
          qualityRatio: calculateAverage(ratios.map((r) => r.qualityRatio)),
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
