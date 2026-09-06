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
