---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-10-18T05:23:00.566Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | stub | src/sections/Stubs/SectionStubs.tsx | 6 | Six empty section stubs awaiting Phase 3 content (intentional, D-04) | open |  | 2026-10-18T05:22:56.614Z |  |
| 2 | 02 | stub | public/resume.pdf |  | Stand-in resume 'Resume coming soon.'; Phase 3 CNT-04 replaces with the phone-free real resume | open |  | 2026-10-18T05:23:00.566Z |  |

````json
[
  {
    "id": 1,
    "kind": "stub",
    "phase": "02",
    "file": "src/sections/Stubs/SectionStubs.tsx",
    "line": 6,
    "description": "Six empty section stubs awaiting Phase 3 content (intentional, D-04)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-18T05:22:56.614Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 2,
    "kind": "stub",
    "phase": "02",
    "file": "public/resume.pdf",
    "line": null,
    "description": "Stand-in resume 'Resume coming soon.'; Phase 3 CNT-04 replaces with the phone-free real resume",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-18T05:23:00.566Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
