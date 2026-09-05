# Dependency approvals

The maintainer approved each of these direct dependencies individually in the development conversation on September 5, 2026. Each affirmative reply followed a question naming exactly one package; no blanket approval was inferred. Transitive dependencies are recorded in `package-lock.json`.

| Dependency            | Approval evidence                       | Purpose                                 |
| --------------------- | --------------------------------------- | --------------------------------------- |
| `react`               | “Go ahead and install React”            | UI components                           |
| `react-dom`           | “Go ahead and install react-dom”        | Browser rendering                       |
| `typescript`          | “yes, install typescript”               | Strict static typing                    |
| `@types/react`        | “yes” to the named installation request | React types                             |
| `@types/react-dom`    | “yes” to the named installation request | React DOM types                         |
| `vite`                | “yes” to the named installation request | Development server and production build |
| `eslint`              | “yes” to the named installation request | Lint checks                             |
| `typescript-eslint`   | “yes” to the named installation request | Type-aware lint checks                  |
| `vitest`              | “yes” to the named installation request | Automated tests                         |
| `@vitest/coverage-v8` | “yes” to the named installation request | Coverage measurement                    |
| `jsdom`               | “yes” to the named installation request | DOM interaction tests                   |
| `prettier`            | “yes” to the named installation request | Formatting                              |

TypeScript was aligned from 7.0.2 to 6.0.3 to satisfy typescript-eslint's published peer range (`>=4.8.4 <6.1.0`). This changed the version of an already-approved dependency; it did not add another package. Vitest and its coverage provider are pinned to matching versions. No additional direct dependencies were installed for the official branding update; logos and font files are static assets requested by the maintainer, with font license notices bundled alongside them.

Future additions still require separate, explicit approval under `AGENTS.md`.
