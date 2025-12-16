export const PRODUCT_CATEGORIES = [
  'Golf Clubs',
  'Golf Balls',
  'Golf Apparel',
  'Golf Accessories',
  'Golf Bags',
  'Golf Shoes',
  'Training Aids',
  'Golf Electronics'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];