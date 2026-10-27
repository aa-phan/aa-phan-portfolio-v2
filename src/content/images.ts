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
