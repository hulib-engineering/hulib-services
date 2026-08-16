export function computeAverageRating(feedbacks: { rating: number }[]): number {
  if (feedbacks.length === 0) return 0;
  const avg = feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length;
  return Math.round(avg * 10) / 10;
}
