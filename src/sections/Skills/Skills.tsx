import { Section } from '@/layout/Section'

interface SkillRow {
  id: string
  label: string
  items: readonly string[]
}

/**
 * Skills as a statement (D-10): four sentences, each a group name in weight 750 and a colon, then
 * the alphabetical items, ending with a period. Static markup, no slider and no motion; the
 * sentences wrap across columns 1 to 10 and fit a 320 px phone.
 */
export function Skills({ groups }: { groups: readonly SkillRow[] }) {
  return (
    <Section id="skills" title="Skills" mood="tight">
      <div className="poster-grid mt-12 md:mt-16">
        <ul className="col-span-full flex flex-col gap-6 md:col-span-10">
          {groups.map((group) => (
            <li key={group.id} className="text-l text-pretty">
              <span className="skill-label font-[750]">{group.label}:</span>{' '}
              {group.items.join(', ')}.
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
