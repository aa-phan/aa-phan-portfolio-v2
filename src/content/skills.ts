import type { SkillGroup } from './schema'

/** SKL-01 to SKL-04 from 01-CONTENT-INVENTORY.md: alphabetical within each group, official casing. */
export const skills = [
  {
    id: 'languages',
    label: 'Languages',
    items: ['C/C++', 'Go', 'HTML/CSS', 'Java', 'JavaScript', 'MATLAB', 'Python', 'SQL (Postgres)'],
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    items: ['Flask', 'JavaFX', 'JUnit', 'Langchain', 'PyQt'],
  },
  {
    id: 'developer-tools',
    label: 'Developer Tools',
    items: [
      'Anaconda',
      'Claude Code',
      'Docker',
      'Git',
      'IntelliJ',
      'Jenkins',
      'Jira',
      'Jupyter Notebook',
      'Kubernetes',
      'MongoDB',
      'PyCharm',
      'Salesforce',
      'Supabase',
      'VS Code',
    ],
  },
  {
    id: 'libraries',
    label: 'Libraries',
    items: ['Keras', 'Matplotlib', 'NumPy', 'Pandas', 'PyTorch', 'Scikit-learn', 'TensorFlow'],
  },
] as const satisfies readonly SkillGroup[]
