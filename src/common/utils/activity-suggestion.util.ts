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
    return 'Thưởng thức đồ uống và thư giãn trong không gian yên tĩnh';
  }

  // Restaurant/Food
  if (tagLower.some((t) => t.includes('restaurant') || t.includes('food'))) {
    return 'Thưởng thức ẩm thực địa phương và khám phá món ăn đặc sản';
  }

  // Park/Nature
  if (tagLower.some((t) => t.includes('park') || t.includes('nature'))) {
    return 'Dạo bộ, tập thể dục và tận hưởng không khí trong lành';
  }

  // Museum/History
  if (tagLower.some((t) => t.includes('museum') || t.includes('history'))) {
    return 'Tham quan và tìm hiểu về lịch sử, văn hóa địa phương';
  }

  // Gallery/Art
  if (tagLower.some((t) => t.includes('gallery') || t.includes('art'))) {
    return 'Khám phá nghệ thuật và chụp ảnh các tác phẩm độc đáo';
  }

  // Bar/Nightlife
  if (tagLower.some((t) => t.includes('bar') || t.includes('nightlife'))) {
    return 'Thưởng thức đồ uống và trải nghiệm không khí sôi động';
  }

  // Gym/Fitness
  if (tagLower.some((t) => t.includes('gym') || t.includes('fitness'))) {
    return 'Tập luyện thể thao và rèn luyện sức khỏe';
  }

  // Rooftop/View
  if (tagLower.some((t) => t.includes('rooftop') || t.includes('view'))) {
    return 'Ngắm cảnh thành phố và chụp ảnh panorama tuyệt đẹp';
  }

  // Bookstore
  if (tagLower.some((t) => t.includes('bookstore') || t.includes('book'))) {
    return 'Đọc sách và khám phá các tác phẩm văn học thú vị';
  }

  // Coworking
  if (
    tagLower.some((t) => t.includes('coworking') || t.includes('workspace'))
  ) {
    return 'Làm việc trong không gian chuyên nghiệp và giao lưu networking';
  }

  // Shopping/Market
  if (tagLower.some((t) => t.includes('shopping') || t.includes('market'))) {
    return 'Mua sắm và khám phá các sản phẩm địa phương';
  }

  // Concert/Music
  if (tagLower.some((t) => t.includes('concert') || t.includes('music'))) {
    return 'Thưởng thức âm nhạc và tận hưởng không khí nghệ thuật';
  }

  // Default fallback
  return `Khám phá và trải nghiệm ${locationName}`;
}
