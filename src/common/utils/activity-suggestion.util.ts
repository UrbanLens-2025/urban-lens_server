/**
 * Generate fallback activity suggestion based on location tags
 */
export function generateFallbackActivity(
  locationName: string,
  tags: string[],
): string {
  const tagLower = tags.map((t) => t.toLowerCase());

  // Cafe/Coffee
  if (
    tagLower.some(
      (t) => t.includes('café') || t.includes('cafe') || t.includes('coffee'),
    )
  ) {
    return 'Enjoy beverages and relax in a peaceful atmosphere';
  }

  // Restaurant/Food
  if (tagLower.some((t) => t.includes('restaurant') || t.includes('food'))) {
    return 'Savor local cuisine and discover specialty dishes';
  }

  // Park/Nature
  if (tagLower.some((t) => t.includes('park') || t.includes('nature'))) {
    return 'Walk, exercise, and enjoy the fresh air';
  }

  // Museum/History
  if (tagLower.some((t) => t.includes('museum') || t.includes('history'))) {
    return 'Explore and learn about local history and culture';
  }

  // Gallery/Art
  if (tagLower.some((t) => t.includes('gallery') || t.includes('art'))) {
    return 'Discover art and photograph unique masterpieces';
  }

  // Bar/Nightlife
  if (tagLower.some((t) => t.includes('bar') || t.includes('nightlife'))) {
    return 'Enjoy drinks and experience the vibrant atmosphere';
  }

  // Gym/Fitness
  if (tagLower.some((t) => t.includes('gym') || t.includes('fitness'))) {
    return 'Work out and maintain your health';
  }

  // Rooftop/View
  if (tagLower.some((t) => t.includes('rooftop') || t.includes('view'))) {
    return 'Admire city views and capture stunning panoramas';
  }

  // Bookstore
  if (tagLower.some((t) => t.includes('bookstore') || t.includes('book'))) {
    return 'Read books and explore interesting literature';
  }

  // Coworking
  if (
    tagLower.some((t) => t.includes('coworking') || t.includes('workspace'))
  ) {
    return 'Work in a professional space and network';
  }

  // Shopping/Market
  if (tagLower.some((t) => t.includes('shopping') || t.includes('market'))) {
    return 'Shop and discover local products';
  }

  // Concert/Music
  if (tagLower.some((t) => t.includes('concert') || t.includes('music'))) {
    return 'Enjoy music and experience the artistic atmosphere';
  }

  // Default fallback
  return `Explore and experience ${locationName}`;
}
