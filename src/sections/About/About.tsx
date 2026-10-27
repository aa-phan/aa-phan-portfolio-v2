import { Section } from '@/layout/Section'

interface AboutProfile {
  bio: readonly string[]
  quote?: string
  photo?: {
    src: string
    alt: string
    width: number
    height: number
    sources?: { avif?: string; webp?: string }
  }
}

const PHOTO_SIZES = '(min-width: 768px) 40vw, 100vw'

/**
 * About Me as an asymmetric pair (D-12): the DJ photo on columns 1 to 5 and the bio on columns 7
 * to 11, starting 128 px down from 768 px up. The photo box owns its shape and ground (aspect
 * ratio, --secondary), so the layout holds before the image loads and if it fails. There is no
 * quote until the owner supplies one (D-15): nothing renders in its place.
 */
export function About({ profile }: { profile: AboutProfile }) {
  const { bio, quote, photo } = profile
  return (
    <Section id="about" title="About Me" mood="airy">
      <div className="poster-grid mt-12 md:mt-16">
        {photo ? (
          <div className="col-span-full aspect-[4/5] overflow-hidden rounded-hold bg-secondary md:col-span-5 md:col-start-1 md:aspect-[539/800]">
            <picture>
              {photo.sources?.avif ? (
                <source srcSet={photo.sources.avif} sizes={PHOTO_SIZES} type="image/avif" />
              ) : null}
              {photo.sources?.webp ? (
                <source srcSet={photo.sources.webp} sizes={PHOTO_SIZES} type="image/webp" />
              ) : null}
              <img
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[50%_30%] md:object-center"
              />
            </picture>
          </div>
        ) : null}
        <div className="col-span-full mt-4 flex flex-col gap-6 md:col-span-5 md:col-start-7 md:mt-0 md:pt-32">
          {bio.map((paragraph, index) => (
            <p key={paragraph} className={`max-w-[62ch] ${index === 0 ? 'text-l' : 'text-body'}`}>
              {paragraph}
            </p>
          ))}
          {quote ? (
            <blockquote className="max-w-[62ch] border-s-2 border-border-strong ps-4 text-m">
              {quote}
            </blockquote>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
