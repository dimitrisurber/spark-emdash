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

### Field search
A search input (`.emd-search`) and "Copy JSON" button (`.emd-copy-btn`) are placed in a toolbar (`.emd-toolbar`) inserted before the form in the dialog flex column. Typing in the search filters fields by label (case-insensitive `indexOf`). While searching, section headers are hidden for a flat filtered view. Clearing the search restores collapsed group state via `data-emd-collapsed` attributes set by the collapsible handler.

### Markdown preview
The `enhanceMd()` function detects markdown textareas by: (1) label matching `/markdown|rich.?text/`, or (2) content detection (lines starting with `#`, presence of `**bold**` or `[link](url)` patterns, minimum 10 chars). Skips fields already marked as JSON (`.emd-json`). Renders via `miniMd()` which escapes HTML first (`esc()`), then applies regex transforms for headings, bold, italic, links (rendered as `<u>` without href for safety), and lists. Output goes into a `.emd-md-preview` div below the textarea, max-height 120px with scroll.

### Copy / Paste block JSON
The toolbar contains "Copy JSON" and "Paste" buttons. Copy calls `getVals(fc)` and writes to clipboard as pretty-printed JSON. Paste reads clipboard text, parses as JSON, and fills matching fields by label. Both dispatch synthetic `input` events so React state stays in sync. Paste handles errors (invalid JSON → "Invalid" feedback, clipboard denied → "Denied" feedback).

### Field dependencies
Config-driven show/hide via `dependencies` in `SparkConfig`. The `DEPS` object maps block types to dependency rules: `{ "Background image": { field: "Tone", value: "dark" } }`. In `enhance()`, an IIFE-based `for..in` loop creates closures per dependency. Each watches the controlling field's `change`/`input` events and toggles `display: none` on the dependent field. Supports single string or string array for `value`.

### Character / word count
`addCharCount()` appends a `.emd-char-count` div below text inputs and textareas (skips JSON fields). Shows "N chars · M words" with optional smart limits detected from field label: 60 for title/heading, 155 for description/meta, 30 for eyebrow/tag. Over-limit triggers `.emd-char-warn` (red text).

### Change tracking + reset
On dialog open, `initVals` captures all field values. Each field gets a reset button (`.emd-reset-btn`, content `↺`) inserted after its label. The button is hidden via CSS until the field has `.emd-modified`. On each `input`/`change`, the field's current value is compared to `initVals[label]`. Modified fields get `.emd-modified` class (blue left `box-shadow` indicator). Reset button restores `initVals` value and dispatches `input` event.

### Dark mode
A `@media (prefers-color-scheme: dark)` block at the end of the CSS overrides backgrounds, borders, text colors, and accent colors for all spark-emdash elements. Uses darker palette (#1f2937 backgrounds, #374151 borders, #f3f4f6 text) with lighter accent variants (#60a5fa blue, #4ade80 green, #f87171 red).

## Security

All config values serialized into the inline script use `safe()` which replaces `<` with `<` after `JSON.stringify` to prevent `</script>` breakout. Illustration previews use DOM API (createElement, textContent, .src) instead of innerHTML. Preview template rendering uses innerHTML for the developer-authored template but escapes all substituted field values. Markdown preview escapes all HTML entities before applying markdown regex transforms — user content cannot inject HTML. The JSON Format button and Paste button dispatch synthetic `input` events to keep React state in sync. Clipboard read (Paste) requires browser permission — handled gracefully on denial.

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
4. Check: modal sizing, field grouping, collapsible sections, illustration thumbnails, live preview rendering, JSON editor validation, block list summaries, field search filtering, markdown preview rendering, copy JSON button
