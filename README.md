# CodeRabbit feature tour

A responsive, JSON-managed feature tour built with React, TypeScript, and Vite. Browse nested categories, search features, share direct links, and play complete recordings or bounded segments.

## Local development

Use Node.js 24 and npm. All direct dependencies are pinned in `package.json`; reproducible installations use the committed lockfile.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. See [AGENTS.md](AGENTS.md) for the mandatory development, dependency-approval, CLI review, and PR merge workflow.

## Maintain the feature list

Edit [public/tour.json](public/tour.json). Array order controls display and playback order; `children` creates a category. Move objects between arrays to reorganize the menu. Keep IDs stable when renaming or moving features so shared links keep working.

The tour contains nine Version 3 recordings served from Vercel Blob, with captions and optional side-by-side Do / Say / See scripts. Eight flows include illustrated PDF guides; Platform uses its introduction transcript. Original recordings in `public/media/` remain preserved. Set a future recording's `src` to `null` to display “Demo coming soon.”

See [the content guide](docs/content.md) for the full manifest format and publishing steps.

## Checks

```sh
npm run check
npm run security:check
```

`check` runs formatting, type-aware lint, strict TypeScript, manifest validation, a production build, tests, and coverage. Coverage gates require 100% of application lines and functions, at least 98% of statements, and 95% of branches. The goal remains full coverage; the branch allowance covers defensive DOM lifecycle guards. Bootstrap mounting and test setup are excluded from coverage. Focused integration tests verify bootstrap analytics initialization; browser checks verify the deployed script and page-view requests.

`security:check` runs npm's dependency audit and requires registry access. Python checks are inapplicable because the application contains no Python. Do not install additional checks or dependencies without individual maintainer approval.

## Deploy on Vercel

Import `coderabbit-demo/demo-site` as a Vite project. Set Node.js to 24, the install command to `npm ci`, the build command to `npm run build`, and the output directory to `dist`. Review changes in a Vercel preview before promoting to production. This repository does not create a Vercel project or deploy automatically until that connection is configured.

Feature links use `/?feature=introduction`, so static hosting does not need a catch-all route rewrite. The browser fetches `tour.json` with revalidation; a repository content change takes effect after its reviewed deployment. No database or API credentials are needed.

Large recordings should live on HTTPS media storage with byte-range support and CORS for the site's origin. Small approved recordings can also be placed under `public/media/`. Supply readable recordings and caption files; avoid real credentials or private customer data in demo footage.

## Web Analytics

The application mounts Vercel Web Analytics once at the root using `@vercel/analytics/react`. Vite production builds collect page views; local development and tests use the SDK's development mode and do not send analytics data.

Enable Web Analytics in the Vercel project's Analytics tab before deploying this integration. The existing `coderabbitai/fe-demo-site` project already has Web Analytics enabled. After a reviewed deployment, visit the site and verify that the analytics script loads and a page-view request succeeds in the browser's Network panel. Data then appears in the project's Analytics dashboard. See [Vercel's setup guide](https://vercel.com/docs/analytics/quickstart).

## Playback behavior

- Initial links and manual feature selection wait for a play action. Click the video area to toggle playback, or focus it and use Enter/Space. The separate playback controls remain available.
- Segment times and seeking are relative to the selected feature. The controller validates boundaries against the recording's loaded duration.
- Playback pauses at the segment end. “Play next automatically” advances in menu order, independent of search filtering.
- Each feature change tears down the previous media listeners and pending playback. A fresh player is mounted; repeat use of a recording relies on normal browser caching.
- Browser Back/Forward restores selection without autoplay. Unknown or removed feature IDs fall back to the first feature and replace the current URL.
- Frame checks and media events enforce segment boundaries, but browser scheduling is not frame-exact editing. Use separately exported clips when exact cuts matter. jsdom tests simulate media events; final audiovisual QA requires the actual recordings in real browsers.
