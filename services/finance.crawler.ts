/* eslint-disable @typescript-eslint/no-explicit-any */
import { CrawlFinanceResult } from '@/types/finance';
import { getFinanceFromAPI, getStatisticsFromAPI } from './finance.service';

export async function crawlFinance(code: string): Promise<CrawlFinanceResult> {
  const data = await getFinanceFromAPI(code);

  return {
    code: data.code,
    name: data.name,
    items: data.data,
  };
}

export async function crawlStatistics(code: string) {
  const apiData = await getStatisticsFromAPI(code);

  // apiData.data là array of groups, mỗi group có { data: [...], label: [...] }
  const mappedData = apiData.data?.map((group: any) => ({
    data: group.data?.map((item: any) => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      displayLevel: item.displayLevel,
      data: item.data?.map((dp: any) => ({
        year: dp.year,
        value: dp.value1 ? Number(dp.value1) : null,
        value2: dp.value2 ? Number(dp.value2) : null,
      })) || [],
    })) || [],
    label: group.label || [],
  })) || [];

  return {
    code: apiData.code,
    name: apiData.name,
    floor: apiData.floor,
    bvps: apiData.BVPS,
    eps: apiData.EPS,
    klcplh: apiData.KLCPLH,
    marketCapital: apiData.MarketCapital,
    pb: apiData.PB,
    pe: apiData.PE,
    roaa: apiData.ROAA,
    roea: apiData.ROEA,
    adChange: apiData.adChange,
    adClose: apiData.adClose,
    ceilingPrice: apiData.ceilingPrice,
    floorPrice: apiData.floorPrice,
    pctChange: apiData.pctChange,
    epsRating: apiData.epsRating,
    rsRating: apiData.rsRating,
    rsnRating: apiData.rsnRating,
    sectorName: apiData.sectorName,
    smrRating: apiData.smrRating,
    data: mappedData,
  };
}
