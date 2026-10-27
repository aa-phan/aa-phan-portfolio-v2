# Content Inventory (DOC-02, CNT-03)

Status: Accepted

Phase 1 plan 01-01 created this file with the structure, the source-of-truth rules and the Contact Me section. Plan 01-03 adds the other six sections, the gap register (D-07) and the experience recount (D-09).

## Sources

| Source | Role | Version |
|--------|------|---------|
| `references/Aaron_Phan_Resume.pdf` | Source of truth | File modified 2026-10-09. Kept out of version control by design (D-03). |
| `aa-phan.github.io/index.html` (the iPod site) | Legacy source | Repo `aa-phan.github.io` at commit `d9d97db`. Content constants sit at lines 460-545. |

## Source-of-truth rules

1. The resume wins on any conflict with the legacy site.
2. Items the resume does not cover are kept from the legacy site (for example the DJ Instagram link).
3. Copy is verbatim. Any edit is recorded in this file with a before and an after.
4. The phone number is never published (D-11): not in site copy, the served resume, meta tags, JSON-LD or Open Graph data. It is never written into any planning doc either. The resume is read only through a redacting pipe that replaces phone-shaped strings.
5. Each item carries Value, Source, Legacy-site value and Resolution so a later phase can build the typed content module (CNT-01) without re-reading the sources.

## Date format policy

Decision D-10. One format is used for every date on the site and in this file.

1. Month names are written in full: January, February, and so on. No abbreviations, no numeric months.
2. A single date is `Month YYYY`, for example `July 2026`.
3. A range is `Month YYYY – Month YYYY`: an en dash (U+2013) with one space on each side, and the year written on both sides, for example `May 2025 – August 2025`.
4. Resume abbreviations are expanded. The resume's `Aug. 2022` becomes `August 2022`.
5. Legacy hyphen ranges and short months are normalized. The legacy `June 2023 - Aug 2023` becomes `June 2023 – August 2023`.
6. Academic-term labels (Spring 2024, Fall 2023, Summer 2022) are converted to month ranges per the G-08 ruling. The original label is kept in the item's Legacy-site value.
7. This policy is applied to every date in the file. The `Dates` line of each dated item contains only the normalized date, nothing else.

## Hero {#hero}

Wireframes: `### Frame: Hero` in `01-IA-WIREFRAMES.md`. The hero role line is gap G-04.

### HERO-01 Name

- Value: Aaron Phan
- Source: resume
- Legacy-site value: Aaron Phan (About Me bio: "My name is Aaron Phan").
- Resolution: Agree. Rendered as the hero heading.

### HERO-02 Role line

- Value: One line under the name. Three options drafted from resume facts only (G-04).
- Option 1 (proposed default): Software engineer building cloud-native backends in Go.
- Option 2: Electrical and computer engineering student at UT Austin, shipping production backends and tools.
- Option 3: Software engineer who builds real-time pipelines, serverless services and the tools around them.
- Source: resume (Capital One, Spectrum, Symbotic bullets and the Education block supply the facts behind each option).
- Legacy-site value: None. The iPod site has no hero or tagline.
- Chosen: Software engineer building cloud-native backends in Go.
- Resolution: Option 1 chosen by the G-04 ruling (accept-defaults, 2026-10-09).

### HERO-03 CTAs

- Value: Three calls to action in this order: Download resume, Copy email, Contact.
- Source: resume (Download resume links to the phone-stripped copy, CON-05), CON-01 (Copy email, IX-09), the Contact section anchor.
- Legacy-site value: None. The iPod site has no hero CTAs.
- Resolution: New for v2. Download resume points at the CNT-04 derivative, never at the source file.

## Experience {#experience}

Five entries, newest first. EXP-01 to EXP-03 come from the resume. EXP-04 and EXP-05 are legacy-only and kept (see R-06).

### EXP-01 Capital One

- Title: Software Engineer Intern
- Organization: Capital One
- Location: Plano, TX
- Dates: June 2026 – August 2026
- Logo: images/logos/capitalone.png, 124 x 113 px (favicon-grade, see G-12)
- Bullets:
  1. Engineered a real-time event-processing pipeline in Go using Kafka, Amazon SQS, and AWS Lambda to process 100K+ Auto Finance events daily within a production distributed system.
  2. Built and deployed cloud-native serverless infrastructure with AWS CloudFormation and CloudWatch, ensuring reliability and observability across critical Auto Finance services.
  3. Developed production backend microservices in Go within an Agile team, leveraging Docker, GitHub, Jenkins, and CI/CD pipelines to deliver scalable cloud applications.
- Source: resume
- Legacy-site value: Software Engineering Intern, Capital One: June 2026 - Aug 2026, no location. Bullets are identical.
- Resolution: Resume title "Software Engineer Intern" replaces "Software Engineering Intern" (R-02). Location added from the resume (R-05). Dates normalized per the policy.

### EXP-02 Spectrum

- Title: Network Engineer Intern
- Organization: Spectrum
- Location: Austin, TX
- Dates: May 2025 – August 2025
- Logo: images/logos/spectrum.png, 32 x 32 px (favicon-grade, see G-12)
- Bullets:
  1. Coordinated installation of 8+ off-net Layer 2 devices per week with ≤ 1 hour turnaround times.
  2. Developed a Python application to standardize post-installation records, improving team efficiency by 30%.
  3. Validated Layer 2 circuit designs against customer-defined acceptance criteria before handoff to installation team.
- Source: resume
- Legacy-site value: Network Engineer Intern, Spectrum: June 2025 - Aug 2025, no location. Bullets are identical.
- Resolution: Resume start date May 2025 replaces June 2025 (R-04). Location added from the resume (R-05). The 30% figure also appears in PRJ-02 (R-07).

### EXP-03 Symbotic

- Title: System Engineer Intern
- Organization: Symbotic
- Location: Raymond, NH
- Dates: January 2025 – May 2025
- Logo: images/logos/symbotic.png, 96 x 96 px (favicon-grade, see G-12)
- Bullets:
  1. Monitored automated conveyors, vertical lifts, and robotic palletizers for 8+ production lines, troubleshooting disruptions to maintain production flow.
  2. Investigated production-critical system issues and coordinated escalations with engineering and operations teams to restore equipment functionality.
  3. Developed a Python application to flag potentially unusable shipping freight, helping operations teams identify problematic SKUs for further investigation.
- Source: resume
- Legacy-site value: Systems Engineer Intern, Symbotic: January 2025 - May 2025. Bullets differed: the legacy bullets carried 5+ disruptions per week, 12 hours per month downtime, 76% accuracy and a 12% reduction in defective freight.
- Resolution: Resume bullets used verbatim; none of the legacy figures are published. The metric overlap with PRJ-03 was resolved by the resume revision of 2026-10-09 (R-01, D-08). Title replaces "Systems Engineer Intern" (R-03). Location added from the resume (R-05).

### EXP-04 OdderTech IT

- Title: Software Engineer Intern
- Organization: OdderTech IT
- Location: not stated in either source
- Dates: June 2023 – August 2023
- Logo: none (see G-06)
- Bullets:
  1. Developed a Python application to read Wi-Fi camera feeds.
  2. Interacted with Wi-Fi camera documentation to develop cross-platform software interfaces.
  3. Utilized Linux to integrate a network-attached storage rack into business infrastructure.
- Source: legacy site
- Legacy-site value: Software Engineer Intern, OdderTech IT: June 2023 - Aug 2023.
- Resolution: Not on the resume, so kept from the legacy site (G-10 ruled: kept, R-06). Dates normalized per the policy. Location is unknown and is left blank rather than guessed.

### EXP-05 The University of Texas at Austin

- Title: ITS Student Consultant I
- Organization: The University of Texas at Austin
- Location: not stated in either source (the university is in Austin, TX per EDU-01)
- Dates: August 2022 – October 2023
- Logo: none (see G-05)
- Bullets:
  1. Assessed client needs to provide solutions and resolve technical problems.
  2. Utilized new systems and software to provide training and support to clients.
  3. Possessed a strong background in IT, excellent communication, problem-solving skills, and the ability to work independently and as part of a team.
- Source: legacy site
- Legacy-site value: ITS Student Consultant I, The University of Texas at Austin: Aug 2022 – Oct 2023.
- Resolution: Not on the resume, so kept from the legacy site (R-06). Dates normalized per the policy.

## Projects {#projects}

Seven projects. PRJ-01 to PRJ-03 come from the resume; PRJ-04 to PRJ-07 are legacy-only and kept. Stack names use official casing (G-09) and keep the order of their source.

### PRJ-01 RecipeCart

- Title: RecipeCart
- Context: personal, Personal Project
- Dates: July 2026
- Stack: TypeScript, Railway, Docker, CSS
- Bullets:
  1. Built a TypeScript pipeline converting TikTok recipes into Kroger cart items using OCR and Claude.
  2. Developed a deterministic matching engine ranking grocery products by availability, package fit, and unit price.
  3. Implemented an OAuth2-secured cart workflow with explicit user approval, encrypted tokens, and automated secret redaction.
- Write-up (D-14, proposed):
  Problem: A recipe in a TikTok video had no direct path into a Kroger cart.
  Approach: A TypeScript pipeline converts the recipe using OCR and Claude, then a deterministic engine ranks products by availability, package fit, and unit price.
  Outcome: Items reach the cart through an OAuth2-secured workflow with explicit user approval, encrypted tokens, and automated secret redaction.
- Edit record (rule 3): before = the bullets above are shown in the project detail; after (if approved) = the three lines replace the bullets in the project detail and the bullets stay recorded here.
- Related experience: none
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: yes
- Source: resume
- Legacy-site value: Personal Project: July 2026; stack TypeScript, Railway, Docker, CSS. Bullets identical.
- Resolution: Resume stack "Typescript" recased to "TypeScript" (R-09).

### PRJ-02 A.T.L.A.S

- Title: A.T.L.A.S
- Context: employer, Spectrum
- Dates: May 2025 – August 2025
- Stack: Python, Flask, HTML, CSS, JavaScript
- Bullets:
  1. Built a Python/Flask web app standardizing post-installation logging, improving team efficiency by 30%.
  2. Conducted user testing with off-net installation teams to iteratively refine features based on direct feedback.
  3. Documented technical architecture, reducing developer onboarding time by 12%.
- Write-up (D-14, proposed):
  Problem: Post-installation logging at Spectrum needed standardizing.
  Approach: I built a Python/Flask web app and refined its features through user testing with off-net installation teams.
  Outcome: Team efficiency improved by 30%, and documenting the technical architecture reduced developer onboarding time by 12%.
- Edit record (rule 3): before = the bullets above are shown in the project detail; after (if approved) = the three lines replace the bullets in the project detail and the bullets stay recorded here.
- Related experience: EXP-02
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: yes
- Source: resume
- Legacy-site value: Spectrum: May 2025 – August 2025; stack Python, Flask, HTML/CSS, JavaScript. Bullets identical.
- Resolution: Resume lists HTML and CSS as separate stack items and the resume wins, so they are kept separate. "Javascript" recased to "JavaScript" (R-09). The 30% figure matches EXP-02 (R-07).

### PRJ-03 Suspect Genie

- Title: Suspect Genie
- Context: employer, Symbotic
- Dates: January 2025 – May 2025
- Stack: Python, PyQt, TensorFlow, Keras, Scikit-learn
- Bullets:
  1. Built a neural network classifier to assess shipping freight viability using case dimensions and weight.
  2. Developed a data preprocessing pipeline with NumPy, Pandas, and Scikit-learn to clean freight records and prepare features for model training.
  3. Trained and evaluated classification models with TensorFlow and Keras to identify patterns associated with unusable freight.
  4. Built a PyQt interface enabling non-technical teams to upload CSV files and review SKU-level predictions for targeted investigation.
- Write-up (D-14, proposed):
  Problem: Symbotic needed a way to judge whether shipping freight was viable from case dimensions and weight.
  Approach: A neural network classifier trained with TensorFlow and Keras, on features prepared by a NumPy, Pandas, and Scikit-learn pipeline.
  Outcome: A PyQt interface lets non-technical teams upload CSV files and review SKU-level predictions for targeted investigation.
- Edit record (rule 3): before = the bullets above are shown in the project detail; after (if approved) = the three lines replace the bullets in the project detail and the bullets stay recorded here.
- Related experience: EXP-03
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: yes
- Source: resume
- Legacy-site value: Symbotic: January 2025 – May 2025; stack Python, PyQT, TensorFlow, Keras, Scikit-learn. Four bullets with the figures 25% automation, at least 50% accuracy, 24% model improvement and 36% fewer labor hours.
- Resolution: Resume bullets used verbatim, none of the legacy figures published (R-01, D-08). Stack "PyQT" recased to "PyQt" (R-09).

### PRJ-04 MediaDash: Content Recommendation Hub

- Title: MediaDash: Content Recommendation Hub
- Context: hackathon, Brainrot Hackathon
- Dates: November 2024
- Stack: Python, Langchain, Supabase
- Bullets:
  1. Developed a Python backend for preprocessing user search queries sent to the IMDb and TMDb APIs.
  2. Utilized the Langchain API to make AI-customized content recommendations from previous user watch history.
  3. Applied database management concepts to ensure low-latency exchange between frontend and backend applications.
  4. Integrated Supabase into the data storage schema for previous user watch history.
- Related experience: none
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: no
- Source: legacy site
- Legacy-site value: Brainrot Hackathon: November 2024; stack Python, Langchain, Supabase. Same as above.
- Resolution: Not on the resume, kept from the legacy site.

### PRJ-05 Full-Stack Library Simulator

- Title: Full-Stack Library Simulator
- Context: course, ECE 422C
- Dates: January 2024 – May 2024
- Stack: JavaFX, MongoDB
- Bullets:
  1. Developed a full stack library application using JavaFX, enhancing user experience with an intuitive graphical interface.
  2. Implemented client-server socket communication to ensure real-time data exchange and seamless user interactions.
  3. Integrated MongoDB for efficient data storage and retrieval, ensuring robust and scalable database management.
  4. Utilized Scene Builder to design and arrange user interface components, streamlining development and improving usability.
- Related experience: none
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: no
- Source: legacy site
- Legacy-site value: ECE 422C: Spring 2024.
- Resolution: Academic term converted to months per the G-08 ruling (Spring 2024 = January 2024 – May 2024). Confirmed by the G-08 ruling.

### PRJ-06 FPGA-Based Stopwatch

- Title: FPGA-Based Stopwatch
- Context: course, ECE 313
- Dates: August 2023 – December 2023
- Stack: Verilog, FPGA
- Bullets:
  1. Designed and implemented an FPGA-based stopwatch utilizing Verilog digital design techniques.
  2. Developed and tested the stopwatch functionality on an FPGA board, ensuring accurate timekeeping and reliable performance.
  3. Applied state machine concepts to manage the stopwatch's operational states, enhancing the overall system efficiency.
- Related experience: none
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: no
- Source: legacy site
- Legacy-site value: ECE 313: Fall 2023.
- Resolution: Academic term converted per the G-08 ruling (Fall 2023 = August 2023 – December 2023). Confirmed by the G-08 ruling.

### PRJ-07 Smart Mirror

- Title: Smart Mirror
- Context: personal, Personal Project
- Dates: June 2022 – August 2022
- Stack: Raspberry Pi, Linux
- Bullets:
  1. Fabricated a mirror frame using plywood and power tools to house a two-way mirror, a Raspberry Pi, and a computer monitor.
  2. Used Ubuntu Linux to create a custom GUI displaying information such as real-time weather content and traffic data to function as a smart display.
- Related experience: none
- Links: none yet, deferred to Phase 3 (G-01)
- Image: none yet, deferred to Phase 3 (G-02)
- Featured: no
- Source: legacy site
- Legacy-site value: Personal Project: Summer 2022.
- Resolution: Academic term converted per the G-08 ruling (Summer 2022 = June 2022 – August 2022). Confirmed by the G-08 ruling.

## About Me {#about}

Interaction notes live in the wireframes. The DJ photo pairs with CON-04.

### ABT-01 Bio paragraph 1

- Value: Hello there! My name is Aaron Phan, and I'm a software engineer by day, and aspiring artist by night.
- Source: legacy site
- Legacy-site value: Same (ABOUT.bio[0]).
- Resolution: Not on the resume, kept verbatim.

### ABT-02 Bio paragraph 2

- Value: In my spare time, I enjoy listening to EDM, cooking, and DJing under the pseudonym PHVNTM.
- Source: legacy site
- Legacy-site value: Same (ABOUT.bio[1]).
- Resolution: Not on the resume, kept verbatim.

### ABT-03 Quote

- Value: "The best time to start was yesterday, the next best time to start is today."
- Source: legacy site
- Legacy-site value: Same (ABOUT.quote).
- Resolution: Kept verbatim.

### ABT-04 Photo

- Value: images/about-dj.jpg, 539 x 800 px.
- Alt text: Aaron Phan DJing at his UT Austin graduation
- Source: legacy site
- Legacy-site value: images/about-dj.jpg with the alt text above (line 660 of index.html).
- Resolution: Kept. Phase 3 produces responsive AVIF/WebP variants via vite-imagetools. The alt text is carried over verbatim.

## Skills {#skills}

Values come from the resume skills list (D-10). Order is alphabetical within each group and casing is official (G-09).

### SKL-01 Languages

- Value: C/C++, Go, HTML/CSS, Java, JavaScript, MATLAB, Python, SQL (Postgres)
- Source: resume
- Legacy-site value: C/C++, Go, HTML/CSS, Java, JavaScript, MATLAB, Python, SQL (Postgres)
- Resolution: Same set. Resume "Javascript" and "MatLAB" recased to "JavaScript" and "MATLAB"; resume order replaced with alphabetical (R-09).

### SKL-02 Frameworks

- Value: Flask, JavaFX, JUnit, Langchain, PyQt
- Source: resume
- Legacy-site value: Flask, JavaFX, JUnit, Langchain, PyQT
- Resolution: Same set. "PyQT" recased to "PyQt" and order made alphabetical (R-09).

### SKL-03 Developer Tools

- Value: Anaconda, Claude Code, Docker, Git, IntelliJ, Jenkins, Jira, Jupyter Notebook, Kubernetes, MongoDB, PyCharm, Salesforce, Supabase, VS Code
- Source: resume
- Legacy-site value: The same 14 tools plus AWS CloudFormation and AWS Lambda.
- Resolution: AWS CloudFormation and AWS Lambda are not in the resume skills list and are dropped from this list by default (G-13, R-10). Order made alphabetical (R-09).

### SKL-04 Libraries

- Value: Keras, Matplotlib, NumPy, Pandas, PyTorch, Scikit-learn, TensorFlow
- Source: resume
- Legacy-site value: Keras, Matplotlib, NumPy, Pandas, PyTorch, Scikit-learn, TensorFlow
- Resolution: Same set. Resume "Tensorflow" and "Pytorch" recased to "TensorFlow" and "PyTorch"; order made alphabetical (R-09).

## Education {#education}

### EDU-01 The University of Texas at Austin

- Degree: Bachelor of Science in Electrical & Computer Engineering
- Organization: The University of Texas at Austin
- Location: Austin, TX
- Dates: August 2022 – December 2026
- GPA: 3.2 (GPA 3.2, legacy site; the resume omits GPA)
- Track: Data Science (legacy site)
- Source: resume + legacy site
- Legacy-site value: B.S. Electrical & Computer Engineering; Location Austin, TX; GPA 3.2; Track Data Science; Expected December 2026. The resume adds the start date "Aug. 2022".
- Resolution: Degree name and dates from the resume (abbreviation expanded to "August 2022"). GPA and track come from the legacy site because the resume omits them (R-08). Publishing the GPA is approved (D-11).

### EDU-02 Glenda Dawson High School

- Degree: High School Diploma
- Organization: Glenda Dawson High School
- Location: Pearland, TX
- Dates: May 2022
- GPA: 3.911
- Source: legacy site
- Legacy-site value: High School Diploma; Pearland, TX; GPA 3.911; Completed May 2022.
- Resolution: Not on the resume, kept from the legacy site (G-11). The date is the completion month.

## Contact Me {#contact}

Interaction: IX-09 (copy-email toast) in `01-MOTION-SPEC.md`. Wireframes: `### Frame: Contact Me @ 375`, `@ 768`, `@ 1280` and the toast state in `01-IA-WIREFRAMES.md`. Color pairs: the `#contact` rows in `01-DESIGN-TOKENS.md`.

Six items. Five are public; one (CON-06) is recorded only to make its exclusion explicit.

### CON-01 Email

- Value: aaron.phan240@gmail.com
- Source: resume (header)
- Legacy-site value: aaron.phan240@gmail.com (`mailto:aaron.phan240@gmail.com`).
- Resolution: Resume and legacy agree, so there is no conflict. Confirmed public (D-11 ruling, 2026-10-09, G-07). Rendered as a `mailto:` link plus a Copy email button (IX-09).

### CON-02 GitHub

- Value: https://github.com/aa-phan
- Source: resume (header) shows the short form github.com/aa-phan.
- Legacy-site value: https://github.com/aa-phan (label github.com/aa-phan).
- Resolution: Agree. Opens in a new tab; the visible label is the short form.

### CON-03 LinkedIn

- Value: https://www.linkedin.com/in/aa-phan/
- Source: resume (header) shows the short form linkedin.com/in/aa-phan.
- Legacy-site value: https://www.linkedin.com/in/aa-phan/ (label linkedin.com/in/aa-phan).
- Resolution: Agree. Opens in a new tab; the visible label is the short form.

### CON-04 DJ Instagram

- Value: https://www.instagram.com/phvntm_
- Source: legacy site (not on the resume)
- Legacy-site value: https://www.instagram.com/phvntm_ (label instagram.com/phvntm_).
- Resolution: Legacy only, kept per the user (the DJ Instagram link is explicitly OK to keep public). Pairs with the About Me DJ personality block.

### CON-05 Resume PDF

- Value: A downloadable PDF of the resume, linked from the hero Resume CTA and from the Contact Me section.
- Source: resume (`references/Aaron_Phan_Resume.pdf` is the content source of truth)
- Legacy-site value: None. The iPod site has no resume download.
- Resolution: The file the site serves is a phone-stripped derivative of the source resume, produced under CNT-04 in Phase 3. The source file is never copied into the public repo. The served copy must be checked for the phone number in its text layer and its metadata before it ships.

### CON-06 Phone

- Value: EXCLUDED.
- Source: resume (header, excluded)
- Legacy-site value: Not on the legacy site.
- Resolution: EXCLUDED. Never published on the site, the web resume, meta tags, JSON-LD or OG data (D-11, and the saved content rule). The digits are deliberately not written in this file or any other planning doc. No `tel:` link and no copy-to-clipboard for it. Contact by phone is not offered; email is the primary channel.

## Owner inputs (Phase 3)

Collected in one stop by plan 03-02 so the content modules are typed once from a final inventory.

| ID | Input | Status |
|----|-------|--------|
| D-13 | A public repository URL per project (PRJ-01 to PRJ-07), or none | requested |
| D-14 | Approve, edit or reject the three featured write-ups (PRJ-01 to PRJ-03) | requested |
| D-15 | One line in the owner's own words about the night side for About Me, or none yet | requested |
| D-16 | A phone-free PDF exported from the resume source and saved over public/resume.pdf | requested |

## Reconciliation log

Every place the resume and the legacy site disagree, or a source was added or dropped, is listed here (CNT-03).

| ID | Topic | Resume | Legacy site | Resolution |
|----|-------|--------|-------------|------------|
| R-01 | Symbotic and Suspect Genie metrics | None of the figures appear | Symbotic: 76% accuracy, 12% defective-freight reduction, 12 hours/month downtime. Suspect Genie: 25% automation, at least 50% accuracy, 24% model improvement, 36% fewer labor hours | Conflict resolved by the resume revision of 2026-10-09: the resume carries none of these figures, so none are published, and EXP-03 and PRJ-03 use the resume bullets verbatim (D-08, CNT-03). |
| R-02 | Capital One title | Software Engineer Intern | Software Engineering Intern | Resume title wins (EXP-01). |
| R-03 | Symbotic title | System Engineer Intern | Systems Engineer Intern | Resume title wins (EXP-03). |
| R-04 | Spectrum start date | May 2025 | June 2025 | Resume date wins (EXP-02). |
| R-05 | Locations for EXP-01 to EXP-03 | Plano TX, Austin TX, Raymond NH | Not stated | Added from the resume. |
| R-06 | Experience recount (D-09) | Lists 3 roles: Capital One, Spectrum, Symbotic | Lists those 3 plus OdderTech IT and ITS Student Consultant I | Keeping both legacy-only roles gives 3 + 2 = 5 entries, matching the 5-entry requirement. Keeping OdderTech is G-10; dropping it would leave 4. |
| R-07 | Spectrum and A.T.L.A.S both state 30% efficiency | The resume places the 30% figure in both the Spectrum bullet and the A.T.L.A.S bullet | Same | Kept in both places as written on the resume (EXP-02, PRJ-02). |
| R-08 | Education GPA and track | Omitted | GPA 3.2, Track Data Science | Taken from the legacy site because the resume omits them (EDU-01). |
| R-09 | Stack and skill name casing and order | Mixed casing (Typescript, Javascript, MatLAB, PyQT, Tensorflow, Pytorch) | PyQT, otherwise official casing | Official product casing and alphabetical skill order per G-09 (SKL-01..04, PRJ-01..03). |
| R-10 | Legacy skills absent from the resume skills list | Not listed | AWS CloudFormation, AWS Lambda under Developer Tools | Dropped per D-10 (G-13 ruled: dropped). Both still appear in the Capital One bullets. |

## Content gaps

Each gap needs a ruling (D-07): supplied, deferred (Phase 3) or dropped. The user ruled on 2026-10-09 with "accept-defaults": every proposed default stands and the public email is confirmed (D-11).

| ID | Gap | Proposed default | Ruling | Status |
|----|-----|------------------|--------|--------|
| G-01 | Project links (repo or demo URLs) for PRJ-01 to PRJ-07 | Deferred (Phase 3) | Default accepted: no URLs supplied now | deferred (Phase 3) |
| G-02 | Project screenshots or cover art | Deferred (Phase 3) | Default accepted: no images supplied now | deferred (Phase 3) |
| G-03 | Featured projects | Supplied as PRJ-01, PRJ-02, PRJ-03 | Default accepted: PRJ-01, PRJ-02, PRJ-03 are featured | supplied |
| G-04 | Hero role line (HERO-02) | Supplied as option 1 from HERO-02 | Default accepted: option 1, "Software engineer building cloud-native backends in Go." | supplied |
| G-05 | UT Austin logo | Deferred (Phase 3), with a monogram chip if no asset arrives | Default accepted: asset deferred, monogram chip fallback | deferred (Phase 3) |
| G-06 | OdderTech logo | Deferred (Phase 3), with a monogram chip if no asset arrives | Default accepted: asset deferred, monogram chip fallback | deferred (Phase 3) |
| G-07 | Public email | Supplied as aaron.phan240@gmail.com (resume and legacy agree, D-11) | Default accepted: aaron.phan240@gmail.com confirmed public (D-11) | supplied |
| G-08 | Academic-term dates | Supplied: Spring 2024 = January 2024 – May 2024, Fall 2023 = August 2023 – December 2023, Summer 2022 = June 2022 – August 2022 | Default accepted as proposed | supplied |
| G-09 | Skill and stack name casing and order | Supplied: official product casing (TypeScript, JavaScript, PyQt, MATLAB, TensorFlow, PyTorch), alphabetical within each skill group, stacks keep source order | Default accepted as proposed | supplied |
| G-10 | Keep the legacy-only OdderTech IT role (EXP-04) | Supplied (kept) | Default accepted: EXP-04 kept | supplied |
| G-11 | Keep the high school education entry (EDU-02) | Supplied (kept) | Default accepted: EDU-02 kept | supplied |
| G-12 | Higher-resolution employer logos (Capital One, Spectrum, Symbotic are favicon-grade) | Deferred (Phase 3) | Default accepted: higher-resolution logos deferred | deferred (Phase 3) |
| G-13 | Legacy-only skills not on the resume skills list (AWS CloudFormation, AWS Lambda) | Dropped per D-10 | Default accepted: AWS CloudFormation and AWS Lambda dropped from the skills list | dropped |

## Assets

Measured with `sips -g pixelWidth -g pixelHeight` on the files under `aa-phan.github.io/images/` at commit `d9d97db`.

| File | Used by | Size (px) | Note |
|------|---------|-----------|------|
| `images/about-dj.jpg` | ABT-04 | 539 x 800 | Portrait. Resize and convert with vite-imagetools in Phase 3. |
| `images/logos/capitalone.png` | EXP-01 | 124 x 113 | Favicon-grade (G-12). |
| `images/logos/spectrum.png` | EXP-02 | 32 x 32 | Favicon-grade (G-12). |
| `images/logos/symbotic.png` | EXP-03 | 96 x 96 | Favicon-grade (G-12). |

The legacy template images (img-1 to img-6, blog-1 to blog-4, cover_bg_1, img_bg_1 to img_bg_3, about.jpg, loc.png) are not migrated.

## Excluded

- The phone number: never published, digits not recorded (CON-06).
- The iPod click-wheel concept and its click sounds: the v2 site is a different concept.
- The legacy meta description: replaced by new v2 metadata.

## Phase gate: ROADMAP criterion 2

Experience entries: 5 (ROADMAP Phase 1 success criterion 2 expects 5)
Projects: 7 (ROADMAP Phase 1 success criterion 2 expects 7)
Education entries: 2 (EDU-01 carries the GPA the criterion requires)
Deviation: none
