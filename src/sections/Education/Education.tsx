import { Section } from '@/layout/Section'

interface EducationRow {
  id: string
  degree: string
  school: string
  location: string
  dates: { label: string }
  gpa: string
  track?: string
}

/** The date after the last en dash of a range label: "August 2022 – December 2026" gives "December 2026". */
function endOf(label: string): string {
  return label.split('–').pop()?.trim() ?? label
}

/**
 * Education as facts (D-11). The graduation date leads at poster size; the university details sit
 * beside it (below it on phones) and the high school entry follows under a rule, quieter. No card,
 * no flip and no hidden face. The first entry is the current study, the rest are earlier.
 */
export function Education({ entries }: { entries: readonly EducationRow[] }) {
  const [current, ...earlier] = entries
  return (
    <Section id="education" title="Education" mood="tight">
      <div className="poster-grid mt-12 md:mt-16">
        {current ? (
          <div className="col-span-full md:col-span-6">
            <p className="text-xl tabular-nums">{endOf(current.dates.label)}</p>
            <p className="mt-2 text-s text-muted">Graduating</p>
          </div>
        ) : null}
        <div className="col-span-full mt-2 flex flex-col md:col-span-6 md:col-start-7 md:mt-0">
          {current ? (
            <div className="flex flex-col gap-1">
              <h3 className="text-m">{current.school}</h3>
              <p className="text-body">{current.degree}</p>
              {current.track ? <p className="text-body">{current.track} track</p> : null}
              <p className="text-body tabular-nums">GPA {current.gpa}</p>
              <p className="mt-2 text-s text-muted">{current.location}</p>
              <p className="text-s text-muted tabular-nums">{current.dates.label}</p>
            </div>
          ) : null}
          {earlier.map((entry) => (
            <div key={entry.id} className="mt-8 flex flex-col gap-1 border-t border-border pt-8">
              <h3 className="text-m">{entry.school}</h3>
              <p className="text-body tabular-nums">
                {entry.degree}, {entry.dates.label}
              </p>
              <p className="text-body tabular-nums">GPA {entry.gpa}</p>
              <p className="text-s text-muted">{entry.location}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
