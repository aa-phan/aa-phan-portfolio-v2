import { Section } from '@/layout/Section'

interface ExperienceRow {
  id: string
  role: string
  org: string
  location?: string
  dates: { label: string }
  bullets: readonly string[]
  monogram?: string
  logo?: { src: string; width: number; height: number; sources?: { avif?: string; webp?: string } }
}

/**
 * Experience as an index list (D-07). Each row is a native details element, so it opens by tap,
 * click, Enter or Space and works without JavaScript. Every row starts closed and any number may
 * be open. The summary starts with a 24 px slot that keeps its size whatever it holds: a
 * monogram chip when there is no logo, and the logo picture when there is one (alt is empty: the company name is adjacent text).
 */
export function Experience({ entries }: { entries: readonly ExperienceRow[] }) {
  return (
    <Section id="experience" title="Experience" mood="tight">
      <ul className="mt-12 md:mt-16">
        {entries.map((entry) => (
          <li key={entry.id} className="exp-item">
            <details className="exp-row">
              <summary className="exp-summary">
                <h3 className="exp-company text-m">
                  <span className="exp-slot">
                    {entry.logo ? (
                      <picture>
                        {entry.logo.sources?.avif ? (
                          <source srcSet={entry.logo.sources.avif} type="image/avif" />
                        ) : null}
                        {entry.logo.sources?.webp ? (
                          <source srcSet={entry.logo.sources.webp} type="image/webp" />
                        ) : null}
                        <img
                          src={entry.logo.src}
                          width={entry.logo.width}
                          height={entry.logo.height}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    ) : entry.monogram ? (
                      <span aria-hidden="true" className="exp-chip">
                        {entry.monogram}
                      </span>
                    ) : null}
                  </span>
                  <span className="exp-name">{entry.org}</span>
                </h3>
                <span className="exp-title text-body">{entry.role}</span>
                <span className="exp-dates text-s tabular-nums">{entry.dates.label}</span>
                <span aria-hidden="true" className="exp-marker">
                  <span className="exp-bar-h" />
                  <span className="exp-bar-v" />
                </span>
              </summary>
              <div className="exp-body">
                <div className="exp-body-inner">
                  {entry.location ? <p className="text-s text-muted">{entry.location}</p> : null}
                  <ul className="exp-bullets text-body">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </Section>
  )
}
