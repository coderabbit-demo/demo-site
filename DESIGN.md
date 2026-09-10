# Design system

The layout reference is the maintainer's CodeRabbit Feature Tour mockup video. The maintainer subsequently requested dark mode using the [official brand guidelines](https://www.coderabbit.ai/brand). This is a functional product surface for choosing and watching demos.

- **Theme:** dark mauve surfaces and light text, per the maintainer's explicit dark-mode preference. The page uses Mauve 1 `#121014`, sidebar Mauve 2 `#1A181D`, surfaces Mauve 3 `#232127`, selected rows Mauve 4 `#2B282F`, borders Mauve 6 `#3C3841`, secondary text Mauve 11 `#B5B2B9`, and primary text Mauve 12 `#EFEDF0`. CR Orange `#FF570A` is the primary accent. Mint `#25E2A8` and Cobalt `#687FF5` are reserved supporting tokens.
- **Typography:** locally served Geist, regular 400 for reading/navigation and semibold 600 for headings. Hack regular 400 for timecodes and bold 700 for demo labels. Primary headings are 26–36px.
- **Layout:** 308px desktop sidebar; 270px at intermediate widths; native feature drawer below 780px. A persistent desktop header control hides or restores the sidebar without interrupting playback. The collapsed layout gives the player the full available width and removes the normal video height cap. The mobile feature drawer remains available independently. Expanded layouts retain bounded video height on short screens.
- **Surfaces:** subtle borders and 7–10px radii. No decorative drop shadows or overlapping cards.
- **Selection:** gray row background, orange number, clip-progress line. Category disclosure does not initiate playback.
- **Media:** contain the entire recording, preserve its aspect ratio, and show clip-relative times. Placeholder copy is explicit when the recording is pending.
- **Motion:** only brief progress feedback; reduced-motion preference removes transitions.
- **Brand assets:** use the official white logotype unchanged, preserving aspect ratio and generous surrounding space. Do not recreate the mark or substitute text. Asset sources and font licenses are recorded in `public/brand/README.md`.

Tokens and responsive rules live in `src/styles.css`.
