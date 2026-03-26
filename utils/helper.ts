// Chuyển "2025-03-31" thành "Q1 2025"
export function getQuarterLabel(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() trả về 0-11
  const year = date.getFullYear();

  let quarter = 1;
  if (month > 3 && month <= 6) quarter = 2;
  else if (month > 6 && month <= 9) quarter = 3;
  else if (month > 9) quarter = 4;

  return `Q${quarter} ${year}`;
}

// Định dạng số: 6266773107834 -> 6.266,8 (Tỷ đồng)
export function formatFinanceNumber(val: number): string {
  if (val === 0 || !val) return '-';
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(val / 1e9);
}
