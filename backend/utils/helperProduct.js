
export const calculateSalePrice = (price, percentage) => {
  const priceNum = Number(price);
  const percentNum = Number(percentage);
  if (
    isNaN(priceNum) ||
    isNaN(percentNum) ||
    percentNum <= 0 ||
    percentNum > 100
  ) {
    return priceNum;
  }
  const discountAmount = (priceNum * percentNum) / 100;
  return Math.round(priceNum - discountAmount);
};

export const findOrphanedImages = (oldProduct, newProductData) => {
  const oldImages = new Set();
  (oldProduct.images || []).forEach((url) => oldImages.add(url));
  (oldProduct.tier_variations || []).forEach((tier) => {
    (tier.images || []).forEach((url) => url && oldImages.add(url));
  });

  const newImages = new Set(); 
  (newProductData.images || []).forEach((url) => newImages.add(url));
  (newProductData.tier_variations || []).forEach((tier) => {
    (tier.images || []).forEach((url) => url && newImages.add(url));
  });

  const orphanedUrls = [];
  oldImages.forEach((url) => {
    if (!newImages.has(url)) {
      orphanedUrls.push(url);
    }
  });
  return orphanedUrls;
};
