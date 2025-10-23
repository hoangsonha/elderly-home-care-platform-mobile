/**
 * Chuyển đổi số tiền sang định dạng tiền tệ Việt Nam
 * @param amount - Số tiền cần chuyển đổi
 * @param showUnit - Có hiển thị đơn vị "đồng" không (mặc định: true)
 * @returns Chuỗi tiền tệ đã format
 */
export const formatCurrency = (amount: number, showUnit: boolean = true): string => {
  if (amount === 0) return showUnit ? '0 đồng' : '0';
  
  // Format số với dấu phẩy ngăn cách hàng nghìn
  const formattedNumber = amount.toLocaleString('vi-VN');
  
  return showUnit ? `${formattedNumber} đồng` : formattedNumber;
};

/**
 * Chuyển đổi số tiền sang định dạng ngắn gọn (k, triệu, tỷ)
 * @param amount - Số tiền cần chuyển đổi
 * @param showUnit - Có hiển thị đơn vị "đồng" không (mặc định: true)
 * @returns Chuỗi tiền tệ ngắn gọn
 */
export const formatCurrencyShort = (amount: number, showUnit: boolean = true): string => {
  if (amount === 0) return showUnit ? '0 đồng' : '0';
  
  if (amount < 1000) {
    return showUnit ? `${amount} đồng` : amount.toString();
  }
  
  if (amount < 1000000) {
    const thousands = Math.floor(amount / 1000);
    return showUnit ? `${thousands}k đồng` : `${thousands}k`;
  }
  
  if (amount < 1000000000) {
    const millions = Math.floor(amount / 1000000);
    const remainder = Math.floor((amount % 1000000) / 1000);
    if (remainder === 0) {
      return showUnit ? `${millions} triệu đồng` : `${millions} triệu`;
    }
    return showUnit ? `${millions} triệu ${remainder}k đồng` : `${millions} triệu ${remainder}k`;
  }
  
  const billions = Math.floor(amount / 1000000000);
  const remainder = Math.floor((amount % 1000000000) / 1000000);
  if (remainder === 0) {
    return showUnit ? `${billions} tỷ đồng` : `${billions} tỷ`;
  }
  return showUnit ? `${billions} tỷ ${remainder} triệu đồng` : `${billions} tỷ ${remainder} triệu`;
};

/**
 * Chuyển đổi số tiền sang định dạng tiếng Việt đầy đủ
 * @param amount - Số tiền cần chuyển đổi
 * @returns Chuỗi tiền tệ bằng tiếng Việt
 */
export const formatCurrencyVietnamese = (amount: number): string => {
  if (amount === 0) return '0 đồng';
  
  const units = ['', 'nghìn', 'triệu', 'tỷ'];
  let unitIndex = 0;
  let result = '';
  let tempAmount = amount;
  
  while (tempAmount > 0) {
    const remainder = tempAmount % 1000;
    if (remainder !== 0) {
      result = remainder + ' ' + units[unitIndex] + ' ' + result;
    }
    tempAmount = Math.floor(tempAmount / 1000);
    unitIndex++;
  }
  
  return result.trim() + ' đồng';
};
