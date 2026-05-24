# spark-emdash

Admin UX upgrades for [emdash](https://emdash.dev) CMS. Drop it in, open the admin, feel the difference.

Built by [Alchemy Zürich](https://alchemy.zuerich) for our client projects. Open-sourced because every emdash project deserves a proper editing experience.

---

## The problem

emdash ships a clean admin. Then you add a `portableTextBlocks` plugin with 20+ fields per block, and the edit modal becomes a scroll-hostile wall of inputs. Your client opens it, squints, closes it, calls you.

## What spark does

**Wider modals.** Edit dialogs expand to 920px on desktop. Your fields can breathe.

**Scrollable forms.** The form body scrolls inside the modal. Save/Cancel stays pinned to the bottom. No more hunting for the button you scrolled past.

**Multi-column field groups.** Define which fields belong together and how many columns they get. Tone/Size/Align in a 3-column row. CTA Label and Href side by side. Section headers separate the groups visually.

**Illustration previews.** Any select field with "illustration", "background", or "foreground" in its label gets a live thumbnail preview. Your client sees the image, picks the right one.

**Sheet scroll fixes.** The right-side panel scrolls properly when blocks have many fields. No more clipped content.

All of this runs as CSS + JS injected via Astro middleware. Zero React conflicts. The enhancement uses CSS grid `order` to rearrange fields visually without moving DOM nodes.

---

## Install

```bash
npm install spark-emdash
```

## Usage

In your `src/middleware.ts`:

```typescript
import { sparkEmdash } from "spark-emdash/middleware";
import { sequence } from "astro:middleware";

export const onRequest = sequence(
  sparkEmdash({
    layouts: {
      // "Hero" matches the h2 text "Edit Hero" in the modal
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

That's it. Open `/_emdash/admin`, edit a block, see the difference.

## Configuration

### `layouts`

A map of block names to field group arrays. The block name is matched against the modal heading (e.g., "Edit **Hero**" matches the key `"Hero"`).

Each group has:

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Section header text shown above the group |
| `cols` | `1 \| 2 \| 3` | Number of columns for the fields in this group |
| `fields` | `string[]` | Field labels to include, matched exactly against the `<label>` text in the modal |

Fields with `<textarea>` elements automatically span full width in multi-column groups. Fields not matched by any group appear at the bottom.

### `illustrations`

A map of illustration keys to image paths. When a select field contains one of these keys as an option value, a 56px thumbnail preview appears below the select. The preview updates live when the selection changes.

## Zero-config mode

Call `sparkEmdash()` with no arguments. You still get wider modals, scrollable forms, sheet fixes, and illustration previews (if you pass the illustration map). The multi-column grouping only kicks in for blocks that have a matching layout definition.

```typescript
// Just the base UX fixes, no field grouping
sparkEmdash()

// Base fixes + illustration previews, no field grouping
sparkEmdash({
  illustrations: { "boat": "/img/boat.webp" }
})
```

## How it works

spark-emdash is an Astro middleware that intercepts HTML responses from `/_emdash/admin` and injects a `<style>` + `<script>` tag before `</head>`.

The CSS handles modal sizing, scroll behavior, and grid layout. The JS uses a `MutationObserver` to detect when edit dialogs open, then applies `order` and `grid-column` styles to fields in-place. No DOM nodes are moved. React keeps its tree intact. No conflicts.

## API

```typescript
import { sparkEmdash, buildPatch } from "spark-emdash";
import { adminCSS } from "spark-emdash/css";
import type { SparkConfig, BlockLayouts, FieldGroup, IllustrationMap } from "spark-emdash";
```

| Export | Description |
|--------|-------------|
| `sparkEmdash(config?)` | Returns an Astro middleware handler |
| `buildPatch(config?)` | Returns the raw HTML string (style + script) for custom injection |
| `adminCSS` | The raw CSS string, if you want to use it outside Astro |

---

## License

MIT

## Built by

[Alchemy Zürich](https://alchemy.zuerich). We build brands and digital products for founders who take their craft seriously.

Spark your emdash. Spark your business.
