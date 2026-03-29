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
