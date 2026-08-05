import { Product } from './store';
import teeBlack from '@/assets/tee-black.png';
import teeWhite from '@/assets/tee-white.png';
import loopTeeBlack from '@/assets/sigma-loop-tee-black.jpg.asset.json';
import loopTeeWhite from '@/assets/sigma-loop-tee-white.jpg.asset.json';
import renaissanceTeeBlack from '@/assets/sigma-renaissance-tee-black.jpg.asset.json';
import renaissanceTeeWhite from '@/assets/sigma-renaissance-tee-white.jpg.asset.json';
import exclusiveTeeBlack from '@/assets/sigma-exclusive-tee-black.jpg.asset.json';
import exclusiveTeeWhite from '@/assets/sigma-exclusive-tee-white.jpg.asset.json';
import renaissanceHoodieBlack from '@/assets/sigma-renaissance-hoodie-black.jpg.asset.json';
import renaissanceHoodieWhite from '@/assets/sigma-renaissance-hoodie-white.jpg.asset.json';
import galleryTopBlack from '@/assets/sigma-gallery-top-black.jpg.asset.json';
import galleryTopBlackBack from '@/assets/sigma-gallery-top-black-back.jpg.asset.json';
import galleryTopWhite from '@/assets/sigma-gallery-top-white.jpg.asset.json';
import galleryTopWhiteBack from '@/assets/sigma-gallery-top-white-back.jpg.asset.json';
import lancetTopBlack from '@/assets/sigma-lancet-top-black.jpg.asset.json';
import lancetTopBlackBack from '@/assets/sigma-lancet-top-black-back.jpg.asset.json';
import lancetTopWhite from '@/assets/sigma-lancet-top-white.jpg.asset.json';
import lancetTopWhiteBack from '@/assets/sigma-lancet-top-white-back.jpg.asset.json';
import exclusiveTopBlack from '@/assets/sigma-exclusive-top-black.jpg.asset.json';
import exclusiveTopBlackBack from '@/assets/sigma-exclusive-top-black-back.jpg.asset.json';
import exclusiveTopWhite from '@/assets/sigma-exclusive-top-white.jpg.asset.json';
import exclusiveTopWhiteBack from '@/assets/sigma-exclusive-top-white-back.jpg.asset.json';

export const products: Product[] = [
  {
    id: 'sigma-gallery-top-black',
    name: 'Gallery Collection Top',
    price: 370,
    image: galleryTopBlack.url,
    images: [galleryTopBlack.url, galleryTopBlackBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Gallery Collection artwork printed at chest and oversized at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-gallery-top-black', 'sigma-gallery-top-white'],
  },
  {
    id: 'sigma-gallery-top-white',
    name: 'Gallery Collection Top',
    price: 370,
    image: galleryTopWhite.url,
    images: [galleryTopWhite.url, galleryTopWhiteBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Gallery Collection artwork printed at chest and oversized at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-gallery-top-black', 'sigma-gallery-top-white'],
  },
  {
    id: 'sigma-lancet-top-black',
    name: 'Lancet Collection Top',
    price: 370,
    image: lancetTopBlack.url,
    images: [lancetTopBlack.url, lancetTopBlackBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Sigma loop logo at chest with Lancet arch graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-lancet-top-black', 'sigma-lancet-top-white'],
  },
  {
    id: 'sigma-lancet-top-white',
    name: 'Lancet Collection Top',
    price: 370,
    image: lancetTopWhite.url,
    images: [lancetTopWhite.url, lancetTopWhiteBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Sigma loop logo at chest with Lancet arch graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-lancet-top-black', 'sigma-lancet-top-white'],
  },
  {
    id: 'sigma-renaissance-hoodie-black',
    name: 'Renaissance Hoodie',
    price: 650,
    image: renaissanceHoodieBlack.url,
    images: [renaissanceHoodieBlack.url],
    category: 'Hoodies',
    description: 'Heavyweight 450gsm French terry cotton. Oversized fit with dropped shoulders. Sigma wordmark at front chest with Renaissance artwork graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-renaissance-hoodie-black', 'sigma-renaissance-hoodie-white'],
  },
  {
    id: 'sigma-renaissance-hoodie-white',
    name: 'Renaissance Hoodie',
    price: 650,
    image: renaissanceHoodieWhite.url,
    images: [renaissanceHoodieWhite.url],
    category: 'Hoodies',
    description: 'Heavyweight 450gsm French terry cotton. Oversized fit with dropped shoulders. Sigma wordmark at front chest with Renaissance artwork graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-renaissance-hoodie-black', 'sigma-renaissance-hoodie-white'],
  },
  {
    id: 'sigma-tee-black',
    name: 'Essential Tee',
    price: 370,
    image: teeBlack,
    images: [teeBlack],
    category: 'Tops',
    description: 'Premium 280gsm organic cotton jersey. Boxy fit with ribbed crew neck. Screen-printed Sigma wordmark at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-tee-black', 'sigma-tee-white'],
  },
  {
    id: 'sigma-tee-white',
    name: 'Essential Tee',
    price: 370,
    image: teeWhite,
    images: [teeWhite],
    category: 'Tops',
    description: 'Premium 280gsm organic cotton jersey. Boxy fit with ribbed crew neck. Screen-printed Sigma wordmark at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-tee-black', 'sigma-tee-white'],
  },
  {
    id: 'sigma-loop-tee-black',
    name: 'Loop Logo Tee',
    price: 370,
    image: loopTeeBlack.url,
    images: [loopTeeBlack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Signature Sigma loop logo at chest and oversized graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-loop-tee-black', 'sigma-loop-tee-white'],
  },
  {
    id: 'sigma-loop-tee-white',
    name: 'Loop Logo Tee',
    price: 370,
    image: loopTeeWhite.url,
    images: [loopTeeWhite.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Signature Sigma loop logo at chest and oversized graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-loop-tee-black', 'sigma-loop-tee-white'],
  },
  {
    id: 'sigma-renaissance-tee-black',
    name: 'Renaissance Tee',
    price: 370,
    image: renaissanceTeeBlack.url,
    images: [renaissanceTeeBlack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Sigma wordmark at front chest with Renaissance artwork graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-renaissance-tee-black', 'sigma-renaissance-tee-white'],
  },
  {
    id: 'sigma-renaissance-tee-white',
    name: 'Renaissance Tee',
    price: 370,
    image: renaissanceTeeWhite.url,
    images: [renaissanceTeeWhite.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Sigma wordmark at front chest with Renaissance artwork graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-renaissance-tee-black', 'sigma-renaissance-tee-white'],
  },
  {
    id: 'sigma-exclusive-tee-black',
    name: 'Exclusive Tee',
    price: 370,
    image: exclusiveTopBlack.url,
    images: [exclusiveTopBlack.url, exclusiveTopBlackBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Outlined Sigma loop logo at chest with arched "SIGMA EXCLUSIVE" graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-exclusive-tee-black', 'sigma-exclusive-tee-white'],
  },
  {
    id: 'sigma-exclusive-tee-white',
    name: 'Exclusive Tee',
    price: 370,
    image: exclusiveTopWhite.url,
    images: [exclusiveTopWhite.url, exclusiveTopWhiteBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Outlined Sigma loop logo at chest with arched "SIGMA EXCLUSIVE" graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-exclusive-tee-black', 'sigma-exclusive-tee-white'],
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
    price: 370,
    image: '/products/longsleeve-black.jpg',
    images: ['/products/longsleeve-black.jpg', '/products/longsleeve-black-2.jpg'],
    category: 'Tops',
    description: 'Double-layer thermal cotton with waffle texture interior. Elongated body with curved hem. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
  },
];

export const categories = ['All', 'Hoodies', 'Tops', 'Pants', 'Outerwear', 'Accessories'];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return products;
  return products.filter((product) => product.category === category);
};
