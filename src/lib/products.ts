import { Product } from './store';
import galleryBlackFront from '@/assets/sigma-gallery-top-black-front.jpg';
import galleryBlackBack from '@/assets/sigma-gallery-top-black-back.jpg';
import galleryBlackFrontBack from '@/assets/sigma-gallery-top-black-front-back.jpg';
import galleryWhiteFront from '@/assets/sigma-gallery-top-white-front.jpg';
import galleryWhiteBack from '@/assets/sigma-gallery-top-white-back.jpg';
import galleryWhiteFrontBack from '@/assets/sigma-gallery-top-white-front-back.jpg';
import lancetBlackFront from '@/assets/sigma-lancet-top-black-front.jpg';
import lancetBlackBack from '@/assets/sigma-lancet-top-black-back.jpg';
import lancetBlackFrontBack from '@/assets/sigma-lancet-top-black-front-back.jpg';
import lancetWhiteFront from '@/assets/sigma-lancet-top-white-front.jpg';
import lancetWhiteBack from '@/assets/sigma-lancet-top-white-back.jpg';
import lancetWhiteFrontBack from '@/assets/sigma-lancet-top-white-front-back.jpg';
import footprintBlackFront from '@/assets/sigma-footprint-top-black-front.jpg';
import footprintBlackBack from '@/assets/sigma-footprint-top-black-back.jpg';
import footprintBlackFrontBack from '@/assets/sigma-footprint-top-black-front-back.jpg';
import footprintWhiteFront from '@/assets/sigma-footprint-top-white-front.jpg';
import footprintWhiteBack from '@/assets/sigma-footprint-top-white-back.jpg';
import footprintWhiteFrontBack from '@/assets/sigma-footprint-top-white-front-back.jpg';
import medusaNoirTopBlack from '@/assets/sigma-medusa-noir-top-black.png';

export const products: Product[] = [
  {
    id: 'sigma-gallery-top-black',
    name: 'Gallery Collection Top',
    price: 370,
    image: galleryBlackFront,
    images: [galleryBlackFront, galleryBlackBack, galleryBlackFrontBack],
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
    image: galleryWhiteFront,
    images: [galleryWhiteFront, galleryWhiteBack, galleryWhiteFrontBack],
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
    image: lancetBlackFront,
    images: [lancetBlackFront, lancetBlackBack, lancetBlackFrontBack],
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
    image: lancetWhiteFront,
    images: [lancetWhiteFront, lancetWhiteBack, lancetWhiteFrontBack],
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
    image: footprintBlackFront,
    images: [footprintBlackFront, footprintBlackBack, footprintBlackFrontBack],
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
    image: footprintWhiteFront,
    images: [footprintWhiteFront, footprintWhiteBack, footprintWhiteFrontBack],
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
