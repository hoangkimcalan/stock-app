export interface FinanceDataPoint {
  itemCode: number;
  fiscalDate: string;
  numericValue: number;
}

export interface FinanceItem {
  itemCode: number;
  itemName: string;
  displayLevel: number;
  data: FinanceDataPoint[];
}

export interface CrawlFinanceResult {
  code: string;
  name: string;
  items: FinanceItem[];
}
