import type { Project } from './schema'

/**
 * PRJ-01 to PRJ-07 from 01-CONTENT-INVENTORY.md, in inventory order (featured three first),
 * transcribed verbatim. Single-month items have the same start and end. A write-up exists only
 * where the owner approved it (D-14) and a code link only where the owner supplied one (D-13).
 */
export const projects = [
  {
    id: 'recipecart',
    title: 'RecipeCart',
    context: { kind: 'personal', label: 'Personal Project' },
    dates: { start: '2026-07', end: '2026-07', label: 'July 2026' },
    stack: ['TypeScript', 'Railway', 'Docker', 'CSS'],
    bullets: [
      'Built a TypeScript pipeline converting TikTok recipes into Kroger cart items using OCR and Claude.',
      'Developed a deterministic matching engine ranking grocery products by availability, package fit, and unit price.',
      'Implemented an OAuth2-secured cart workflow with explicit user approval, encrypted tokens, and automated secret redaction.',
    ],
    featured: true,
    links: { code: 'https://github.com/aa-phan/RecipeCart' },
    writeup: {
      problem: 'A recipe in a TikTok video had no direct path into a Kroger cart.',
      approach:
        'A TypeScript pipeline converts the recipe using OCR and Claude, then a deterministic engine ranks products by availability, package fit, and unit price.',
      outcome:
        'Items reach the cart through an OAuth2-secured workflow with explicit user approval, encrypted tokens, and automated secret redaction.',
    },
  },
  {
    id: 'atlas',
    title: 'A.T.L.A.S',
    context: { kind: 'employer', label: 'Spectrum' },
    dates: { start: '2025-05', end: '2025-08', label: 'May 2025 – August 2025' },
    stack: ['Python', 'Flask', 'HTML', 'CSS', 'JavaScript'],
    bullets: [
      'Built a Python/Flask web app standardizing post-installation logging, improving team efficiency by 30%.',
      'Conducted user testing with off-net installation teams to iteratively refine features based on direct feedback.',
      'Documented technical architecture, reducing developer onboarding time by 12%.',
    ],
    relatedExperienceId: 'spectrum',
    featured: true,
    writeup: {
      problem: 'Post-installation logging at Spectrum needed standardizing.',
      approach:
        'I built a Python/Flask web app and refined its features through user testing with off-net installation teams.',
      outcome:
        'Team efficiency improved by 30%, and documenting the technical architecture reduced developer onboarding time by 12%.',
    },
  },
  {
    id: 'suspect-genie',
    title: 'Suspect Genie',
    context: { kind: 'employer', label: 'Symbotic' },
    dates: { start: '2025-01', end: '2025-05', label: 'January 2025 – May 2025' },
    stack: ['Python', 'PyQt', 'TensorFlow', 'Keras', 'Scikit-learn'],
    bullets: [
      'Built a neural network classifier to assess shipping freight viability using case dimensions and weight.',
      'Developed a data preprocessing pipeline with NumPy, Pandas, and Scikit-learn to clean freight records and prepare features for model training.',
      'Trained and evaluated classification models with TensorFlow and Keras to identify patterns associated with unusable freight.',
      'Built a PyQt interface enabling non-technical teams to upload CSV files and review SKU-level predictions for targeted investigation.',
    ],
    relatedExperienceId: 'symbotic',
    featured: true,
    writeup: {
      problem:
        'Symbotic needed a way to judge whether shipping freight was viable from case dimensions and weight.',
      approach:
        'A neural network classifier trained with TensorFlow and Keras, on features prepared by a NumPy, Pandas, and Scikit-learn pipeline.',
      outcome:
        'A PyQt interface lets non-technical teams upload CSV files and review SKU-level predictions for targeted investigation.',
    },
  },
  {
    id: 'mediadash',
    title: 'MediaDash: Content Recommendation Hub',
    context: { kind: 'hackathon', label: 'Brainrot Hackathon' },
    dates: { start: '2024-11', end: '2024-11', label: 'November 2024' },
    stack: ['Python', 'Langchain', 'Supabase'],
    bullets: [
      'Developed a Python backend for preprocessing user search queries sent to the IMDb and TMDb APIs.',
      'Utilized the Langchain API to make AI-customized content recommendations from previous user watch history.',
      'Applied database management concepts to ensure low-latency exchange between frontend and backend applications.',
      'Integrated Supabase into the data storage schema for previous user watch history.',
    ],
    featured: false,
  },
  {
    id: 'library-simulator',
    title: 'Full-Stack Library Simulator',
    context: { kind: 'course', label: 'ECE 422C' },
    dates: { start: '2024-01', end: '2024-05', label: 'January 2024 – May 2024' },
    stack: ['JavaFX', 'MongoDB'],
    bullets: [
      'Developed a full stack library application using JavaFX, enhancing user experience with an intuitive graphical interface.',
      'Implemented client-server socket communication to ensure real-time data exchange and seamless user interactions.',
      'Integrated MongoDB for efficient data storage and retrieval, ensuring robust and scalable database management.',
      'Utilized Scene Builder to design and arrange user interface components, streamlining development and improving usability.',
    ],
    featured: false,
  },
  {
    id: 'fpga-stopwatch',
    title: 'FPGA-Based Stopwatch',
    context: { kind: 'course', label: 'ECE 313' },
    dates: { start: '2023-08', end: '2023-12', label: 'August 2023 – December 2023' },
    stack: ['Verilog', 'FPGA'],
    bullets: [
      'Designed and implemented an FPGA-based stopwatch utilizing Verilog digital design techniques.',
      'Developed and tested the stopwatch functionality on an FPGA board, ensuring accurate timekeeping and reliable performance.',
      "Applied state machine concepts to manage the stopwatch's operational states, enhancing the overall system efficiency.",
    ],
    featured: false,
  },
  {
    id: 'smart-mirror',
    title: 'Smart Mirror',
    context: { kind: 'personal', label: 'Personal Project' },
    dates: { start: '2022-06', end: '2022-08', label: 'June 2022 – August 2022' },
    stack: ['Raspberry Pi', 'Linux'],
    bullets: [
      'Fabricated a mirror frame using plywood and power tools to house a two-way mirror, a Raspberry Pi, and a computer monitor.',
      'Used Ubuntu Linux to create a custom GUI displaying information such as real-time weather content and traffic data to function as a smart display.',
    ],
    featured: false,
  },
] as const satisfies readonly Project[]
