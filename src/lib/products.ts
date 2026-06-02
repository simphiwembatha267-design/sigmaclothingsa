import { Product } from './store';
import teeBlack from '@/assets/tee-black.png';
import teeWhite from '@/assets/tee-white.png';
import loopTeeBlack from '@/assets/sigma-loop-tee-black.jpg.asset.json';
import loopTeeWhite from '@/assets/sigma-loop-tee-white.jpg.asset.json';

export const products: Product[] = [
  {
    id: 'sigma-hoodie-black',
    name: 'Sigma Oversized Hoodie',
    price: 500,
    image: '/products/hoodie-black.jpg',
    images: ['/products/hoodie-black.jpg', '/products/hoodie-black-2.jpg'],
    category: 'Hoodies',
    description: 'Heavyweight 450gsm French terry cotton. Dropped shoulders with elongated sleeves. Embroidered Sigma logo at chest. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
  },
  {
    id: 'sigma-tee-black',
    name: 'Essential Tee',
    price: 125,
    image: teeBlack,
    images: [teeBlack],
    category: 'T-Shirts',
    description: 'Premium 280gsm organic cotton jersey. Boxy fit with ribbed crew neck. Screen-printed Sigma wordmark at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-tee-black', 'sigma-tee-white'],
  },
  {
    id: 'sigma-tee-white',
    name: 'Essential Tee',
    price: 125,
    image: teeWhite,
    images: [teeWhite],
    category: 'T-Shirts',
    description: 'Premium 280gsm organic cotton jersey. Boxy fit with ribbed crew neck. Screen-printed Sigma wordmark at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-tee-black', 'sigma-tee-white'],
  },
  {
    id: 'sigma-cargo-black',
    name: 'Tactical Cargo Pants',
    price: 345,
    image: '/products/cargo-black.jpg',
    images: ['/products/cargo-black.jpg', '/products/cargo-black-2.jpg'],
    category: 'Pants',
    description: 'Japanese ripstop nylon with water-resistant coating. Articulated knees with utility pockets. Adjustable hem with toggle closures. Made in Japan.',
    sizes: ['28', '30', '32', '34', '36'],
    color: 'Black',
  },
  {
    id: 'sigma-bomber-olive',
    name: 'Flight Bomber Jacket',
    price: 485,
    image: '/products/bomber-olive.jpg',
    images: ['/products/bomber-olive.jpg', '/products/bomber-olive-2.jpg'],
    category: 'Outerwear',
    description: 'Heavyweight MA-1 silhouette in premium Italian nylon. Quilted satin lining. Custom Sigma hardware. Made in Italy.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Olive',
  },
  {
    id: 'sigma-hoodie-cream',
    name: 'Archive Hoodie',
    price: 295,
    image: '/products/hoodie-cream.jpg',
    images: ['/products/hoodie-cream.jpg', '/products/hoodie-cream-2.jpg'],
    category: 'Hoodies',
    description: 'Garment-dyed 420gsm cotton fleece. Vintage wash finish. Puff-printed archival graphics. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Cream',
  },
  {
    id: 'sigma-sweatpants-black',
    name: 'Essential Sweatpants',
    price: 195,
    image: '/products/sweatpants-black.jpg',
    images: ['/products/sweatpants-black.jpg', '/products/sweatpants-black-2.jpg'],
    category: 'Pants',
    description: 'Heavyweight 400gsm French terry. Relaxed tapered fit with elastic cuffs. Hidden zip pocket at thigh. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
  },
  {
    id: 'sigma-cap-black',
    name: 'Logo Cap',
    price: 75,
    image: '/products/cap-black.jpg',
    images: ['/products/cap-black.jpg'],
    category: 'Accessories',
    description: 'Six-panel construction in cotton twill. Embroidered Sigma logo. Adjustable leather strap with metal buckle. Made in USA.',
    sizes: ['One Size'],
    color: 'Black',
  },
  {
    id: 'sigma-longsleeve-black',
    name: 'Thermal Long Sleeve',
    price: 165,
    image: '/products/longsleeve-black.jpg',
    images: ['/products/longsleeve-black.jpg', '/products/longsleeve-black-2.jpg'],
    category: 'T-Shirts',
    description: 'Double-layer thermal cotton with waffle texture interior. Elongated body with curved hem. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
  },
];

export const categories = ['All', 'Hoodies', 'T-Shirts', 'Pants', 'Outerwear', 'Accessories'];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return products;
  return products.filter((product) => product.category === category);
};
