import { TextReveal } from '@/anim'
import { Container } from '@/layout/Container'

interface HeroProps {
  profile: { name: string; tagline: string }
  email: string
}

export function Hero({ profile, email }: HeroProps) {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="pt-24 pb-16">
      <Container>
        <h1 id="hero-heading" className="text-mega">
          {profile.name}
        </h1>
        <TextReveal className="mt-4 max-w-2xl text-l text-muted">{profile.tagline}</TextReveal>
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <a
            href={`${import.meta.env.BASE_URL}resume.pdf`}
            download
            className="inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-6 font-medium text-on-primary hover:bg-primary-hover"
          >
            Download resume
          </a>
          <a
            href={`mailto:${email}`}
            className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-strong px-6 font-medium text-text hover:bg-surface"
          >
            Copy email
          </a>
          <a
            href="#contact"
            className="inline-flex min-h-11 items-center px-2 font-medium text-link underline underline-offset-4"
          >
            Contact
          </a>
        </div>
      </Container>
    </section>
  )
}
