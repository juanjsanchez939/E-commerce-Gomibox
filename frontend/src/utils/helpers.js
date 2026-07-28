export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDiscountBadge(price, discountPercentage) {
  if (!discountPercentage || discountPercentage <= 0) return null;
  const original = Math.round(price / (1 - discountPercentage / 100) * 100) / 100;
  return { originalPrice: original, label: `SAVE ${Math.round(discountPercentage)}%` };
}

export function getStarRating(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
}
