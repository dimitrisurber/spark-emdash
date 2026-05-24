# spark-emdash

Astro middleware plugin that upgrades the emdash CMS admin UI. Injects CSS + JS into `/_emdash/admin` responses for modal sizing, field layout, live previews, collapsible sections, JSON editing, and block list summaries.

## Architecture

- `src/middleware.ts` — Astro middleware that intercepts HTML responses and injects a `<style>` + `<script>` before `</head>`
- `src/js.ts` — Generates the injected JavaScript (MutationObserver-based DOM enhancement)
- `src/css.ts` — The injected CSS (modal sizing, grid layout, preview styling, JSON editor, collapsible sections)
- `src/types.ts` — TypeScript interfaces for the config
- `src/index.ts` — Public exports

The JS runs inside a self-executing function injected into the admin page. It uses `MutationObserver` to detect `div[role="dialog"][data-open]` elements and enhances them. No DOM nodes are moved — only CSS `order` and `grid-column` properties are set, keeping React's virtual DOM intact.

## Config shape

```typescript
sparkEmdash({
  layouts: Record<string, FieldGroup[]>,      // field grouping per block type
  illustrations: Record<string, string>,       // select value → image URL
  previews: Record<string, BlockPreview>,      // block type → HTML template
})
```

Block type names are matched against the modal heading text: "Edit **Hero**" → key `"Hero"`.

## Features

### Live block previews
Preview templates use `{{Field Label}}` placeholders. Field labels must match exactly (case-sensitive, including spaces). Values are HTML-escaped before substitution via `esc()` — the template HTML itself is trusted (developer-authored), but field values are treated as untrusted.

The preview `<div class="emd-preview">` is inserted between the modal heading and the form, in the flex column's non-scrolling area. It stays visible while the form fields scroll below.

Optional `style` property injects a scoped `<style>` tag inside the preview container.

Use `data-` attributes on wrapper elements (e.g., `data-tone="{{Tone}}"`) combined with CSS attribute selectors for conditional styling based on select field values.

### Collapsible field groups
Section headers (`.emd-section-label`) are clickable. Clicking toggles visibility of all fields in that group via `display: none`. A chevron indicator (`.emd-chevron`) rotates to show collapsed/expanded state. Fields are tracked per group in the `gf` array inside the layout loop. Collapsed fields remain in the DOM (form submission is unaffected).

### JSON field editor
The `enhanceJson()` function detects JSON textareas by: (1) checking if the field label contains "json" (case-insensitive), or (2) trying `JSON.parse()` on the textarea value. Enhanced textareas get:
- Monospace font (`.emd-json`)
- A "Format" button that pretty-prints with `JSON.stringify(parsed, null, 2)`
- Live validation on input — green border (`.emd-json-ok`) for valid, red border + "Invalid" status (`.emd-json-err`) for invalid
- The Format button dispatches an `input` event after formatting so React picks up the change

### Block list summaries
Tracks the last clicked element via a global `click` listener (capture phase). When a dialog opens, identifies the block list item that triggered it by walking up from `lastClicked` to the nearest `[data-block]`, `[data-type]`, `button`, or `[role=button]` element. Extracts a one-line summary from key fields (Title/Heading/Name + Tone/Size/Align metadata), truncated to 80 chars. Injects a `<span class="emd-block-summary">` into the block item. Summary updates live as fields are edited via `input`/`change` listeners.

## Security

All config values serialized into the inline script use `safe()` which replaces `<` with `<` after `JSON.stringify` to prevent `</script>` breakout. Illustration previews use DOM API (createElement, textContent, .src) instead of innerHTML. Preview template rendering uses innerHTML for the developer-authored template but escapes all substituted field values. The JSON Format button dispatches a synthetic `input` event to keep React state in sync.

## Generating previews for a project

Use the skill at `skills/generate-previews.md`. It scans the project's emdash block definitions (or reads the existing `layouts` config) and generates preview templates for every block type using field-name heuristics.

Workflow:
1. Read `src/middleware.ts` to find existing spark-emdash config
2. For each block type in `layouts`, map field names to HTML elements
3. Generate `previews: { ... }` config with sensible default templates
4. Add the config to the `sparkEmdash()` call

## Building

```bash
npm run build    # tsc && node scripts/build-assets.js
```

Output goes to `dist/`. The `prepublishOnly` script runs the build automatically before `npm publish`. A GitHub Actions workflow (`.github/workflows/publish.yml`) auto-publishes to npm when a GitHub release is created.

## Testing changes

There are no automated tests. To verify changes:
1. Build with `npm run build`
2. Link into an emdash project: `npm link` then `npm link spark-emdash` in the target project
3. Open `/_emdash/admin`, edit a block with a matching layout/preview config
4. Check: modal sizing, field grouping, collapsible sections, illustration thumbnails, live preview rendering, JSON editor validation, block list summaries
