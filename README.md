# Signal Motion Lab

**Scroll-driven storytelling. Interactive navigation. Motion as a design language.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live demo:** [signal-motion-lab.vercel.app](https://signal-motion-lab.vercel.app/)

[![Live demo](https://img.shields.io/badge/Live%20demo-Vercel-black?logo=vercel)](https://signal-motion-lab.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVKevinxz%2Fsignal-motion-lab)

An educational web motion lab exploring scroll-driven animations, interactive navigation, canvas effects, and microinteractions inspired by [Bonanza Studios](https://www.bonanza-studios.com/). An unofficial reference study, not an official Bonanza Studios website or an independently reconstructed source-code implementation.

## What this project demonstrates

| Technique | What it contributes |
| --- | --- |
| Scroll-driven scenes | Spatial storytelling and progressive reveals |
| Sticky sections | Persistent stages for transitions between content |
| Staggered typography | Attention guidance through sequential word motion |
| Animated canvas | Dynamic visual composition and responsive scenes |
| Floating navigation | Persistent access to sections and interactive menus |
| Hover and microinteractions | Feedback, affordances, and contextual navigation |
| Responsive motion | Layout and interaction adaptation across screen sizes |

## Explore the reference study

Scroll through the home page, observe the sticky scenes and changes in the visual composition, hover over Services, and explore the mobile menu. External business actions are disabled in the production preview. Six routes were captured; other routes show a local not-captured page.

## Run locally

Requires Node.js 22+. The reference capture in `site/` (including `capture-manifest.json`) is included for a reproducible build.

```bash
npm run build
npm run preview
```

Open http://127.0.0.1:4174/. No npm dependencies, API keys, environment variables or external backend are required for the captured preview. To inspect the unmodified local reference, run `python serve.py` and open port 4173.

## Project structure

```text
scripts/
  build.mjs          Static build and image-loader adaptation
  preview.mjs        Local production preview
  lab-notice.js      Visible credit and demo restrictions
docs/
  visual-analysis.md Reference analysis and original QA results
mirror.py            Local capture utility
serve.py             Local reference server
vercel.json          Static deployment configuration
LICENSE              MIT (original code only)
THIRD_PARTY_NOTICES.md  Attribution and rights
site/                Reference capture
dist/                Generated deployment output (ignored by Git)
qa/                  Local captures and reports (ignored by Git)
```

The original HTML/CSS and compiled Next.js runtime are captured public resources, not MIT-licensed source authored for this project. The original work here is the analysis, capture tooling, deployment adapter, and documentation.

## Deploy on Vercel

Third-party material retains its original rights; the MIT license applies only to the lab's original work. See the third-party notices.

| Setting | Value |
| --- | --- |
| Root Directory | `./` |
| Framework Preset | Other |
| Install Command | Empty (skip) |
| Build Command | `node scripts/build.mjs` |
| Output Directory | `dist` |
| Node.js | 22.x |
| Environment Variables | None |

The root `vercel.json` defines the build, output directory, explicit static routes and security headers. The build converts captured image variants into ordinary static assets; no Next.js optimizer or backend is required. The generated preview has a visible credit link, noindex headers and a restrictive content security policy.

Import the GitHub repository in Vercel and select the main branch. The included capture makes Git-based builds reproducible.

## Validation

- Reference QA: 41 position-aligned scroll samples at desktop and mobile resolutions. Mean mismatch: 0.785% for the 1920×1080 repeat, 0.611–0.780% for the desktop 1280×720 segments, 1.727% for mobile. Dynamic timing can vary.
- Production build: 6 pages, 480 static optimized image variants, 1,664 image URL replacements and one captured loader adaptation. Node syntax check passed.
- Production preview: confirmed the title, credit notice, 34,671 px initial document height at 1920×1080, and Services hover menu. These are local production checks, not a live Vercel deployment or a new pixel-perfect comparison.

See [visual analysis](docs/visual-analysis.md) for details.

## Credits and license

Original visual reference: [Bonanza Studios](https://www.bonanza-studios.com/). All original design, brand, content, and captured client assets belong to their respective owners. This educational project is not affiliated with or endorsed by Bonanza Studios.

Original project utilities and documentation are licensed under the [MIT License](LICENSE), Copyright (c) 2026 VKevinxz. Third-party material is excluded from that license. See [Third-party notices](THIRD_PARTY_NOTICES.md).
