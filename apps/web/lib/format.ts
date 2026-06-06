import type { Money } from '@threadly/types';

export function formatMoney(money: Money): string {
  if (money.currency === 'VND') {
    return `${money.amount.toLocaleString('vi-VN')} ₫`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount / 100);
}
