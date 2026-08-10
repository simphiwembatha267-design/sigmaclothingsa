import { Product } from './store';
import galleryTopBlack from '@/assets/sigma-gallery-top-black.jpg.asset.json';
import galleryTopBlackBack from '@/assets/sigma-gallery-top-black-back.jpg.asset.json';
import galleryTopWhite from '@/assets/sigma-gallery-top-white.jpg.asset.json';
import galleryTopWhiteBack from '@/assets/sigma-gallery-top-white-back.jpg.asset.json';
import lancetTopBlack from '@/assets/sigma-lancet-top-black.jpg.asset.json';
import lancetTopBlackBack from '@/assets/sigma-lancet-top-black-back.jpg.asset.json';
import lancetTopWhite from '@/assets/sigma-lancet-top-white.jpg.asset.json';
import lancetTopWhiteBack from '@/assets/sigma-lancet-top-white-back.jpg.asset.json';
import footprintTopBlack from '@/assets/sigma-footprint-top-black.jpg.asset.json';
import footprintTopBlackBack from '@/assets/sigma-footprint-top-black-back.jpg.asset.json';
import footprintTopWhite from '@/assets/sigma-footprint-top-white.jpg.asset.json';
import footprintTopWhiteBack from '@/assets/sigma-footprint-top-white-back.jpg.asset.json';
import meduseNoirTopBlack from '@/assets/sigma-medusa-noir-top-black.png';

export const products: Product[] = [
  {
    id: 'sigma-gallery-top-black',
    name: 'Gallery Collection Top',
    price: 370,
    image: galleryTopBlackBack.url,
    images: [galleryTopBlackBack.url, galleryTopBlack.url],
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
    image: galleryTopWhiteBack.url,
    images: [galleryTopWhiteBack.url, galleryTopWhite.url],
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
    image: lancetTopBlackBack.url,
    images: [lancetTopBlackBack.url, lancetTopBlack.url],
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
    image: lancetTopWhiteBack.url,
    images: [lancetTopWhiteBack.url, lancetTopWhite.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Sigma loop logo at chest with Lancet arch graphic at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-lancet-top-black', 'sigma-lancet-top-white'],
  },
  {
    id: 'sigma-footprint-top-black',
    name: 'Footprint Collection Top',
    price: 370,
    image: footprintTopBlackBack.url,
    images: [footprintTopBlackBack.url, footprintTopBlack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Footprint Collection lettering printed at chest and oversized at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-footprint-top-black', 'sigma-footprint-top-white'],
  },
  {
    id: 'sigma-footprint-top-white',
    name: 'Footprint Collection Top',
    price: 370,
    image: footprintTopWhiteBack.url,
    images: [footprintTopWhiteBack.url, footprintTopWhite.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Footprint Collection lettering printed at chest and oversized at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-footprint-top-black', 'sigma-footprint-top-white'],
  },
  {
    id: 'sigma-medusa-noir-top-black',
    name: 'Medusa Noir Collection Top',
    price: 370,
    image: meduseNoirTopBlack,
    images: [meduseNoirTopBlack],
    category: 'Tops',
    description: 'Heavyweight cotton. Medusa Noir collection.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Black',
    colorVariants: ['sigma-medusa-noir-top-black'],
  },
];

export const categories = ['All', 'Tops'];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return products;
  return products.filter((product) => product.category === category);
};
