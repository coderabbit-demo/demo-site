# Editing the tour

The application loads `public/tour.json`. Editing this file is sufficient to add, remove, move, or rename features; no React changes are required.

## Manifest format

```json
{
  "version": 1,
  "title": "Feature tour",
  "description": "Explore CodeRabbit in action.",
  "media": {
    "overview": {
      "src": "https://media.example.com/overview.mp4",
      "poster": "https://media.example.com/overview.webp",
      "captions": "https://media.example.com/overview.en.vtt"
    },
    "chat": { "src": null }
  },
  "navigation": [
    {
      "id": "reviews",
      "title": "Code review",
      "children": [
        {
          "id": "inline-comments",
          "title": "Inline review comments",
          "description": "Line-level findings with committable fixes.",
          "mediaId": "overview",
          "start": 12,
          "end": 32
        }
      ]
    },
    {
      "id": "pr-chat",
      "title": "Chat on the pull request",
      "mediaId": "chat"
    }
  ]
}
```

These URLs and timestamps are illustrative; replace them with your recordings.

## Editing rules

| Change                      | Edit                                                                       |
| --------------------------- | -------------------------------------------------------------------------- |
| Add a feature               | Add an object with `id`, `title`, and `mediaId` to any navigation array.   |
| Reorder                     | Change the order of objects in their array.                                |
| Add a category              | Add `id`, `title`, and a `children` array.                                 |
| Nest or move                | Move an object into another category's `children`.                         |
| Remove                      | Delete the object; remove unused media entries separately if desired.      |
| Rename                      | Change `title`; preserve `id` for existing links.                          |
| Play a whole recording      | Omit `start` and `end`.                                                    |
| Play to the recording's end | Set `start` and omit `end`.                                                |
| Play a segment              | Set `start` and `end` in seconds. The timeline starts at zero for viewers. |
| Mark a recording pending    | Set the media entry's `src` to `null`.                                     |

Categories cannot include `mediaId`, `start`, or `end`. Feature descriptions, media posters, and captions are optional; optional fields should be omitted rather than set to empty strings. Only `src` accepts `null`. Captions currently use an English WebVTT track and timestamps relative to the full recording. Local URLs begin with `/`, such as `/media/demo.mp4`; external URLs must use HTTPS without credentials. Hosts must permit cross-origin media and caption access because the player uses anonymous CORS.

IDs must use lowercase letters, numbers, and single separating hyphens. Navigation IDs are globally unique, including categories. Supported limits are 500 navigation entries and 8 levels, counting the top level. Empty categories and an empty tour are valid during preparation. Use two or three levels where possible so visitors can scan the menu easily.

Although the manifest permits missing caption tracks for pending or silent media, published videos containing prerecorded audio require captions. The exception is a clearly labeled media alternative that adds no information beyond existing text; see `PRODUCT.md`. Verify caption accuracy and synchronization before publishing.

Timestamps must be finite non-negative numbers, and `end` must exceed `start`. The build validates the manifest's structure. The player validates times against the actual recording duration after metadata loads; the build does not download remote videos to verify duration or availability.

## Publish an update

1. Make the edit on a feature branch/worktree.
2. Run `npm run check` and `npm run security:check`.
3. Follow the local committed-change CodeRabbit review process in `AGENTS.md` before pushing.
4. Open a PR, resolve review findings, and wait for a clean CodeRabbit review before merging.
5. Deploy the reviewed change to Vercel. Check desktop, mobile, audio/captions, fullscreen, and the start/end of every new recording or segment.

Do not commit credentials, signed URLs with sensitive tokens, or private customer footage. For large recordings, upload approved assets to the chosen media host and place only their public demo URLs in the manifest.

## Version 3 videos and companion scripts

The tour contains nine complete recordings, one per slide. Each media entry can
include a `guide` with a title, Markdown `download`, optional PDF URL, and ordered
steps. A step contains a title, absolute `start`/`end` seconds, `do` action strings,
verbatim `say` narration, `see` description, and `links` (`label`, `url`).
The parser validates text, timestamps, collection bounds, and safe URLs. Guide
scrolling and visibility do not change playback. Platform uses its introduction
transcript; the eight demonstration flows also have illustrated PDFs.

The side panel is optional. It stacks below the video on smaller screens and sits
beside it when enough width is available. Collapsing Features gives the recording
more space. The script currently uses manual scrolling, not automatic tracking.
Captions use the final full-recording WebVTT timestamps.

Old `introduction` and `summary` links resolve to Platform. The former PR feature
IDs resolve to the complete PR Review recording; they do not seek to old segment
times. Unknown links retain the existing first-feature fallback.

### Prepare and publish assets

1. Preserve the original capture, narration, approved videos, and captions in the
   recording workspace. Never use this site repository as the capture master.
2. With the Version 3 recording pack available, run
   `node scripts/prepare-v3-content.mjs /absolute/path/to/version-3`.
   This stages byte-identical MP4s under ignored `public/media/v3`, copies captions
   and guides, and extracts posters at five seconds with the existing FFmpeg
   installation. It checks the complete Say narration against every caption.
   Source paths, sizes, and SHA256 values are recorded in `docs/media-release.json`.
   The corrected AppSec PDF is preserved from the checked-in guide: its final
   timeline includes the 21.14-second introduction. Existing capture files are
   never overwritten.
3. Preparation refuses to replace published URLs. For an intentional new release,
   first change the release identifier in the preparation script, then pass
   `--reset-local-urls`. Every release must use new Blob paths.
4. Link the existing `coderabbitai/fe-demo-site` project with Vercel CLI and pull
   the development environment into ignored `.env.local`. Its dedicated public
   store is `demo-site-videos`. Credentials must never be committed or exposed
   through `VITE_*` variables.
5. Run `node scripts/publish-media.mjs --upload` to verify all source hashes,
   upload the MP4s/PDFs with the installed Vercel CLI, and write returned URLs to
   `tour.json`. The script saves non-secret receipts in `docs/blob-assets.json`
   after each successful upload so an interrupted upload can resume. It never
   overwrites existing Blob objects. Captions, posters, and Markdown remain
   same-origin static assets. PDF source copies remain in Git for reproducibility.
6. Verify the public URLs and byte-range responses, then run the repository
   checks and review workflow. Deploy a preview and check seeking, captions,
   PDF/script links, fullscreen, desktop/mobile layout, and legacy links before
   releasing to production.

Uploads are an explicit administrative action and never run during builds.
Public Blob media can be accessed by anyone with the URL, independently of
preview deployment protection. A rollback restores a previous tour manifest and
its immutable URLs; retain prior media releases.
