# spark-emdash

Admin UX plugin for [emdash CMS](https://emdash.dev). Fixes the editing experience when your portable text blocks have 20+ fields. Drop-in Astro middleware, zero config required.

Built by [Alchemy Zürich](https://alchemy.zuerich) for production client projects on Cloudflare Workers. Open-sourced because every emdash project deserves a proper admin.

---

## What is spark-emdash?

spark-emdash is an Astro middleware plugin that upgrades the emdash CMS admin interface. It intercepts HTML responses from the `/_emdash/admin` route and injects CSS and JavaScript that fix modal sizing, add scroll behavior, organize fields into multi-column groups, and render live illustration previews. It works with any emdash project that uses `portableTextBlocks` plugins, including setups on Cloudflare Workers with D1 databases. The plugin requires zero changes to emdash internals and causes no React conflicts because it uses CSS grid `order` properties instead of moving DOM nodes.

---

## Why does the emdash admin need this?

emdash ships a clean, minimal admin UI. The editing experience works well for simple content types. But when you register custom portable text blocks with many fields (Hero blocks with 20+ fields for layout, media, CTAs, and positioning), the edit modal becomes a single-column wall of inputs that overflows the viewport. The Save button scrolls out of view. Image select fields show text values with no preview. Your client opens the modal, can't find what they need, and calls you.

spark-emdash fixes this by making the modal wider (920px on desktop), adding a scrollable form body with a pinned footer, grouping related fields into labeled multi-column sections, and showing thumbnail previews for illustration selects.

## What does spark-emdash do?

| Feature | What changes |
|---------|-------------|
| **Wider modals** | Edit dialogs expand to 920px on desktop instead of the default narrow width |
| **Scrollable forms** | The form body scrolls inside the modal with Save/Cancel pinned to the bottom |
| **Multi-column field groups** | Related fields are grouped with section headers and arranged in 2 or 3 column grids |
| **Live block previews** | See a rendered preview of the block at the top of the modal, updating live as you edit fields |
| **Collapsible field groups** | Click any section header to collapse/expand its fields — focus on what you're editing |
| **JSON field editor** | Textareas with JSON get monospace font, a Format button, and live validation (green/red border) |
| **Block list summaries** | Block items in the editor show a one-line summary of their content (title, tone, etc.) |
| **Field search** | Search box at the top of every modal — type to filter fields by label, hides section headers while searching |
| **Markdown preview** | Textareas with markdown content show a live rendered preview (headings, bold, italic, links, lists) |
| **Copy block JSON** | One-click button copies all field values as formatted JSON to clipboard |
| **Paste block JSON** | Paste button fills fields from clipboard JSON — duplicate blocks across pages instantly |
| **Field dependencies** | Config-driven show/hide: only show fields when another field has a specific value |
| **Character count** | Live char/word count below text fields with smart limits (60 for titles, 155 for descriptions) |
| **Change tracking** | Blue indicator on modified fields with per-field reset button to restore original values |
| **Dark mode** | Automatic dark theme for all spark-emdash UI via `prefers-color-scheme: dark` |
| **Illustration previews** | Select fields for images show a 56px live thumbnail of the selected illustration |
| **Sheet scroll fixes** | The right-side editor panel scrolls properly when blocks have many fields |

All enhancements run as CSS + JS injected via Astro middleware. The JavaScript uses a `MutationObserver` to detect edit dialogs and applies CSS grid `order` and `grid-column` styles in-place. No DOM nodes are moved. React keeps its virtual DOM intact.

---

## How to install spark-emdash

```bash
npm install spark-emdash
```

Requires Astro 4.0 or later. Works with emdash on any hosting platform, including Cloudflare Workers, Vercel, and Node.js.

## How to use spark-emdash with Astro middleware

Add the middleware to your `src/middleware.ts`:

```typescript
import { sparkEmdash } from "spark-emdash/middleware";
import { sequence } from "astro:middleware";

export const onRequest = sequence(
  sparkEmdash({
    layouts: {
      // "Hero" matches the heading "Edit Hero" in the modal
      Hero: [
        { label: "Content",     cols: 1, fields: ["Eyebrow", "Title", "Lede"] },
        { label: "Layout",      cols: 3, fields: ["Tone", "Size", "Align"] },
        { label: "Options",     cols: 3, fields: ["Under header", "Media bleed", "Sparks"] },
        { label: "Scene Cover", cols: 3, fields: ["Background image", "Foreground overlay", "Left %", "Top %", "Width %", "Rotation"] },
        { label: "Actions",     cols: 2, fields: ["CTA Primary (JSON)", "CTA Secondary (JSON)"] },
      ],
    },
    illustrations: {
      // key = select option value, value = image path
      "boat-small":  "/illustrations/boat-1.webp",
      "water-clouds": "/illustrations/water-clouds.webp",
      "marion":      "/illustrations/marion.webp",
    },
  })
);
```

Open `/_emdash/admin`, edit a block, see the difference.

## How to configure field groups

The `layouts` config maps block type names to field group arrays. The block name is matched against the modal heading (e.g., "Edit **Hero**" matches the key `"Hero"`).

Each group has:

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Section header text shown above the group |
| `cols` | `1 \| 2 \| 3` | Number of columns for the fields in this group |
| `fields` | `string[]` | Field labels to include, matched exactly against the `<label>` text in the modal |

Fields containing `<textarea>` elements automatically span full width in multi-column groups. Fields not matched by any group appear at the bottom of the form.

## How to add illustration previews

The `illustrations` config maps option values to image paths. When a select field has a label containing "illustration", "background", or "foreground", spark-emdash renders a 56px thumbnail preview below the select. The preview updates live when the selection changes.

```typescript
sparkEmdash({
  illustrations: {
    "hero-scene": "/illustrations/hero-scene.webp",
    "boat-small": "/illustrations/boat.webp",
    "compass":    "/illustrations/compass-rose.svg",
  },
})
```

## How to add live block previews

The `previews` config renders a visual preview of the block at the top of the edit modal. Use `{{Field Label}}` placeholders for dynamic values — they update live as the editor types and are HTML-escaped automatically.

```typescript
sparkEmdash({
  previews: {
    Hero: {
      html: `
        <div class="emd-prev-hero" data-tone="{{Tone}}" style="text-align:{{Align}}">
          <small>{{Eyebrow}}</small>
          <h2>{{Title}}</h2>
          <p>{{Lede}}</p>
        </div>
      `,
      style: `
        .emd-prev-hero { padding: 1.5rem 2rem; font-family: system-ui; }
        .emd-prev-hero[data-tone="dark"] { background: #1a1a2e; color: #f0f0f0; }
        .emd-prev-hero[data-tone="light"] { background: #fff; color: #1a1a2e; }
        .emd-prev-hero h2 { font-size: 1.4rem; margin: 0.25rem 0; }
        .emd-prev-hero p { opacity: 0.7; margin: 0.5rem 0 0; }
        .emd-prev-hero small { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.65rem; opacity: 0.6; }
      `,
    },
  },
  layouts: { /* ... */ },
})
```

Each preview has:

| Property | Type | Description |
|----------|------|-------------|
| `html` | `string` | HTML template with `{{Field Label}}` placeholders |
| `style` | `string?` | Optional CSS injected inside the preview container |

Field labels must match exactly (case-sensitive, including spaces). Use `data-` attributes with CSS attribute selectors for conditional styling based on select values like Tone or Size. The preview container has a max-height of 240px and sits in the non-scrolling area of the modal, above the form fields.

Previews work independently of `layouts` — you can add a preview to any block type, whether or not it has a layout definition.

## How to set up field dependencies

The `dependencies` config hides fields until another field has a specific value. Only show "Background image" when Tone is "dark":

```typescript
sparkEmdash({
  dependencies: {
    Hero: {
      "Background image": { field: "Tone", value: "dark" },
      "Foreground overlay": { field: "Tone", value: ["dark", "brand"] },
    },
  },
})
```

Each dependency has:

| Property | Type | Description |
|----------|------|-------------|
| `field` | `string` | The field label to watch |
| `value` | `string \| string[]` | Show the dependent field when the watched field has this value (or one of these values) |

Dependencies update live as the editor changes select/input values.

## Can spark-emdash run without configuration?

Yes. Call `sparkEmdash()` with no arguments for zero-config mode. You get wider modals, scrollable forms, sheet scroll fixes, collapsible section headers, JSON field editors, markdown previews, field search, copy/paste JSON, character counts, change tracking, and dark mode immediately. Multi-column field grouping only activates for block types that have a matching layout definition. Illustration previews require the `illustrations` map. Live block previews require the `previews` config. Field dependencies require the `dependencies` config.

```typescript
// Base UX fixes, no field grouping
sparkEmdash()

// Base fixes + illustration previews
sparkEmdash({
  illustrations: { "boat": "/img/boat.webp" }
})
```

---

## How spark-emdash works under the hood

spark-emdash is an Astro middleware that intercepts HTML responses from `/_emdash/admin` and injects a `<style>` + `<script>` tag before `</head>`. The CSS handles modal sizing, scroll behavior, and the 6-column grid layout. The JavaScript uses a `MutationObserver` to detect when edit dialogs open, then sets `order` and `grid-column` inline styles on each field. Section headers are injected as new DOM elements. No existing DOM nodes are moved or reparented, which keeps React's reconciliation intact.

## API reference

```typescript
import { sparkEmdash, buildPatch } from "spark-emdash";
import { adminCSS } from "spark-emdash/css";
import type { SparkConfig, BlockLayouts, FieldGroup, IllustrationMap, BlockPreview, FieldDependency } from "spark-emdash";
```

| Export | Description |
|--------|-------------|
| `sparkEmdash(config?)` | Returns an Astro middleware handler that patches the emdash admin |
| `buildPatch(config?)` | Returns the raw HTML string (style + script) for custom injection outside Astro |
| `adminCSS` | The raw CSS string for use in non-Astro setups |

---

## For AI coding agents

spark-emdash ships with agent instructions and a preview generator skill:

- **`CLAUDE.md`** — Agent-facing documentation covering architecture, all features (previews, collapsible groups, JSON editor, block summaries), config shape, security model, and how to make changes to the plugin.
- **`skills/generate-previews.md`** — A skill that scans your project's emdash block definitions (or reads the existing `layouts` config) and auto-generates preview templates for every block type. It maps field names to HTML elements using heuristics (Title → `<h2>`, Eyebrow → `<small>`, Tone → `data-tone` attribute, etc.). The other features (collapsible groups, JSON editor, block summaries) work automatically with no config needed.

To use the skill with Claude Code, copy `skills/generate-previews.md` to your project's `.claude/skills/` directory and invoke it with `/generate-previews`.

---

## License

MIT

## Built by

[Alchemy Zürich](https://alchemy.zuerich) builds handcrafted brands for passionate megalomaniacs. We work at the forefront of AI, cloud infrastructure, and modern web tech to give our clients an unfair advantage. spark-emdash is one piece of that stack: we run emdash CMS on Cloudflare Workers for our client projects and refused to ship an admin that made editors suffer.

Spark your emdash. [Spark your business.](https://alchemy.zuerich)
