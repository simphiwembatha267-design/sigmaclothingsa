import { Product } from './store';
import galleryBlackFront from '@/assets/sigma-gallery-top-black-front.jpg.asset.json';
import galleryBlackBack from '@/assets/sigma-gallery-top-black-back.jpg.asset.json';
import galleryBlackFrontBack from '@/assets/sigma-gallery-top-black-front-back.jpg.asset.json';
import galleryWhiteFront from '@/assets/sigma-gallery-top-white-front.jpg.asset.json';
import galleryWhiteBack from '@/assets/sigma-gallery-top-white-back.jpg.asset.json';
import galleryWhiteFrontBack from '@/assets/sigma-gallery-top-white-front-back.jpg.asset.json';
import lancetBlackFront from '@/assets/sigma-lancet-top-black-front.jpg.asset.json';
import lancetBlackBack from '@/assets/sigma-lancet-top-black-back.jpg.asset.json';
import lancetBlackFrontBack from '@/assets/sigma-lancet-top-black-front-back.jpg.asset.json';
import lancetWhiteFront from '@/assets/sigma-lancet-top-white-front.jpg.asset.json';
import lancetWhiteBack from '@/assets/sigma-lancet-top-white-back.jpg.asset.json';
import lancetWhiteFrontBack from '@/assets/sigma-lancet-top-white-front-back.jpg.asset.json';
import footprintBlackFront from '@/assets/sigma-footprint-top-black-front.jpg.asset.json';
import footprintBlackBack from '@/assets/sigma-footprint-top-black-back.jpg.asset.json';
import footprintBlackFrontBack from '@/assets/sigma-footprint-top-black-front-back.jpg.asset.json';
import footprintWhiteFront from '@/assets/sigma-footprint-top-white-front.jpg.asset.json';
import footprintWhiteBack from '@/assets/sigma-footprint-top-white-back.jpg.asset.json';
import footprintWhiteFrontBack from '@/assets/sigma-footprint-top-white-front-back.jpg.asset.json';
import medusaNoirTopBlack from '@/assets/sigma-medusa-noir-top-black.png';

export const products: Product[] = [
  {
    id: 'sigma-gallery-top-black',
    name: 'Gallery Collection Top',
    price: 370,
    image: galleryBlackFront.url,
    images: [galleryBlackFront.url, galleryBlackBack.url, galleryBlackFrontBack.url],
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
    image: galleryWhiteFront.url,
    images: [galleryWhiteFront.url, galleryWhiteBack.url, galleryWhiteFrontBack.url],
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
    image: lancetBlackFront.url,
    images: [lancetBlackFront.url, lancetBlackBack.url, lancetBlackFrontBack.url],
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
    image: lancetWhiteFront.url,
    images: [lancetWhiteFront.url, lancetWhiteBack.url, lancetWhiteFrontBack.url],
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
    image: footprintBlackFront.url,
    images: [footprintBlackFront.url, footprintBlackBack.url, footprintBlackFrontBack.url],
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
    image: footprintWhiteFront.url,
    images: [footprintWhiteFront.url, footprintWhiteBack.url, footprintWhiteFrontBack.url],
    category: 'Tops',
    description: 'Heavyweight 280gsm cotton jersey. Boxy oversized fit. Footprint Collection lettering printed at chest and oversized at back. Made in Portugal.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'White',
    colorVariants: ['sigma-footprint-top-black', 'sigma-footprint-top-white'],
  },
  {
    id: 'sigma-medusa-noir-top-black',
    name: 'Medusa Noir Collection Top',
    price: 500,
    image: medusaNoirTopBlack,
    images: [medusaNoirTopBlack],
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
