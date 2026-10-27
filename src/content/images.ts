import aboutDj from '@/assets/images/about-dj.jpg?w=400;539&format=avif;webp&as=picture'
import capitalOne from '@/assets/images/capitalone.png?w=40;60&format=avif;webp&as=picture'
import spectrum from '@/assets/images/spectrum.png?w=40;60&format=avif;webp&as=picture'
import symbotic from '@/assets/images/symbotic.png?w=40;60&format=avif;webp&as=picture'
import type { ImageAsset } from './schema'

type Picture = typeof capitalOne

/**
 * Employer logos, drawn at 20 px (D-07). The sources are imagetools imports at 2x and 3x; it never
 * enlarges, so the 32 px Spectrum source yields a single width. Alt text lives here and is empty
 * because the company name is the adjacent text, so the logo is decorative.
 */
function logo(picture: Picture): ImageAsset {
  return {
    src: picture.img.src,
    alt: '',
    width: 20,
    height: 20,
    sources: { avif: picture.sources.avif, webp: picture.sources.webp },
  }
}

export const capitalOneLogo = logo(capitalOne)
export const spectrumLogo = logo(spectrum)
export const symboticLogo = logo(symbotic)

/**
 * The one photograph on the page (CNT-05, ABT-04). The source JPEG carries an Exif block; only the
 * AVIF and WebP outputs ship, at 400 and 539 px wide (imagetools never enlarges). The width and
 * height are the source's, so the box holds its 539 / 800 shape before the image arrives.
 */
export const aboutPhoto: ImageAsset = {
  src: aboutDj.img.src,
  alt: 'Aaron Phan DJing at his UT Austin graduation',
  width: 539,
  height: 800,
  sources: { avif: aboutDj.sources.avif, webp: aboutDj.sources.webp },
}
