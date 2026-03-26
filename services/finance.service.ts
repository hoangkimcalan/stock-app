import axios from 'axios';

export async function getFinanceFromAPI(code: string) {
  const url = `https://api.alphastock.vn/api/company/finance_statements?code=${code}&type=89&period=1&year=2025&period_num=5`;

  const res = await axios.get(url);

  return res.data;
}

export async function getStatisticsFromAPI(code: string) {
  const url = `https://api.alphastock.vn/api/company/statistics?code=${code}`;

  const res = await axios.get(url);

  return res.data;
}
