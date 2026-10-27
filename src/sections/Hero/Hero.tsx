import { CtaLink } from '@/components/ui/CtaLink'
import { useCopyEmail } from '@/components/ui/useCopyEmail'
import { Container } from '@/layout/Container'

interface HeroProps {
  profile: { name: string; tagline: string; heroFacts: readonly [string, string] }
  email: string
}

export function Hero({ profile, email }: HeroProps) {
  const copyEmail = useCopyEmail(email)
  const [first = '', ...rest] = profile.name.split(' ')
  const [leftFact, rightFact] = profile.heroFacts
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="py-8 md:flex md:min-h-[calc(100svh-64px)] md:py-10"
    >
      <Container className="poster-grid w-full md:grid-rows-[auto_1fr_auto]">
        <h1
          id="hero-heading"
          className="col-span-full -ms-[0.055em] text-mega text-balance md:col-span-9 md:row-start-1"
        >
          <span className="block">{first}</span> <span className="block">{rest.join(' ')}</span>
        </h1>
        <p className="col-span-full text-l text-text md:col-span-6 md:row-start-2 md:self-center">
          {profile.tagline}
        </p>
        <div className="col-span-full flex flex-col gap-4 md:col-span-4 md:col-start-9 md:row-start-2 md:self-center">
          <CtaLink
            href={`${import.meta.env.BASE_URL}resume.pdf`}
            variant="filled"
            download
            className="md:min-w-[200px]"
          >
            Download resume
          </CtaLink>
          <CtaLink
            href={`mailto:${email}`}
            variant="outlined"
            onClick={copyEmail}
            className="md:min-w-[200px]"
          >
            Copy email
          </CtaLink>
        </div>
        <div className="col-span-full flex flex-col gap-1 text-s text-muted tabular-nums md:row-start-3 md:flex-row md:justify-between">
          <p>{leftFact}</p>
          <p>{rightFact}</p>
        </div>
      </Container>
    </section>
  )
}
