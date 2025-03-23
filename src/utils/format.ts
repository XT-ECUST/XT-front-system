/**
 * 格式化日期时间
 * @param dateTime 日期时间字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime: string): string {
  if (!dateTime) return '';
  return dateTime.replace('T', ' ');
} 