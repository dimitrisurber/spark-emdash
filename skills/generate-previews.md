# Generate Block Previews

Scan the project's emdash block definitions and generate spark-emdash preview templates for every block type found. Output a complete `previews` config ready to paste into the middleware.

spark-emdash also auto-enhances blocks with: collapsible field groups (clickable section headers), JSON field editors (monospace + Format button + live validation for any textarea with JSON), and block list summaries (one-line title + metadata injected into the editor's block list). These features work automatically — no config needed. This skill focuses on generating `previews` config, which is the only feature that requires per-block templates.

## Steps

1. Find the spark-emdash middleware config. Look for `sparkEmdash(` in `src/middleware.ts` or similar files. Read the existing `layouts` and `previews` config.

2. Identify all block types. Sources (check in order):
   - The `layouts` keys already defined in the spark-emdash config (most reliable)
   - emdash content schemas: search for `defineBlocks`, `portableTextBlocks`, `defineCollection`, or block registration patterns in `src/`, `emdash.config.*`, or `content/` directories
   - Grep for `type: "block"` or `name:` fields in schema definitions

3. For each block type, collect its field labels. Use the `layouts` config if available (it lists field names per group). Otherwise read the schema definition.

4. Generate a preview template for each block using the field-to-HTML heuristics below.

5. Output the complete `previews: { ... }` object. If the middleware already has a `previews` config, merge new blocks into it without overwriting existing ones.

## Field-to-HTML heuristics

Map field labels to semantic HTML based on name patterns:

| Field name pattern | HTML output |
|---|---|
| Title, Heading, Headline | `<h2>{{Title}}</h2>` |
| Eyebrow, Kicker, Overline, Tag | `<small class="emd-prev-eyebrow">{{Eyebrow}}</small>` (before title) |
| Subtitle, Lede, Lead, Description, Body, Text | `<p>{{Lede}}</p>` (after title) |
| CTA, Button, Link, Action | `<span class="emd-prev-cta">{{CTA Label}}</span>` |
| Image, Photo, Media, Cover | `<div class="emd-prev-media">{{Image}}</div>` |
| Tone, Theme, Variant | `data-tone="{{Tone}}"` attribute on the wrapper |
| Align, Alignment | `style="text-align:{{Align}}"` on the wrapper |
| Size | `data-size="{{Size}}"` attribute on the wrapper |
| Background image, Background | `style="background-image:url({{Background image}})"` on the wrapper |
| Foreground, Overlay | secondary image element |

Fields that don't match any pattern: skip them from the preview (they still appear in the form below).

## Template structure

Every preview template follows this skeleton:

```html
<div class="emd-prev-{blockname}" data-tone="{{Tone}}" style="text-align:{{Align}}">
  <small class="emd-prev-eyebrow">{{Eyebrow}}</small>
  <h2>{{Title}}</h2>
  <p>{{Lede}}</p>
  <span class="emd-prev-cta">{{CTA Label}}</span>
</div>
```

Only include elements for fields that actually exist on that block. Omit the `data-tone`/`style` attributes if the block has no Tone/Align field.

## Style generation

Generate a `style` string for each preview with sensible defaults:

```css
.emd-prev-{blockname} {
  padding: 1.5rem 2rem;
  border-radius: 8px;
  font-family: system-ui, -apple-system, sans-serif;
}
.emd-prev-{blockname} h2 { font-size: 1.4rem; margin: 0.25rem 0; }
.emd-prev-{blockname} p { opacity: 0.7; margin: 0.5rem 0 0; font-size: 0.9rem; }
.emd-prev-{blockname} small { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.65rem; opacity: 0.6; }
.emd-prev-{blockname} .emd-prev-cta {
  display: inline-block; margin-top: 0.75rem; padding: 0.4rem 1rem;
  border: 1px solid currentColor; border-radius: 4px; font-size: 0.75rem;
}
```

Add tone variants if a Tone/Theme field exists:

```css
.emd-prev-{blockname}[data-tone="dark"] { background: #1a1a2e; color: #f0f0f0; }
.emd-prev-{blockname}[data-tone="light"] { background: #ffffff; color: #1a1a2e; }
.emd-prev-{blockname}[data-tone="brand"] { background: #0f4c81; color: #ffffff; }
```

## Output format

Print the TypeScript config object that should be added to `sparkEmdash()`:

```typescript
previews: {
  Hero: {
    html: `...`,
    style: `...`,
  },
  CTA: {
    html: `...`,
    style: `...`,
  },
}
```

If the middleware already has `previews`, show only the new blocks to add. Tell the user exactly where to paste the config.

## Common block type templates

Use these as starting points when generating previews:

**Hero** — Full-width banner with eyebrow, title, subtitle, and CTA:
```
eyebrow → small, title → h2, lede/subtitle → p, CTA → button span, tone → data attr, align → text-align
```

**Text / Rich Text** — Simple content block:
```
title → h2, body/text → p (truncated), align → text-align
```

**CTA / Call to Action** — Action-focused block:
```
title → h2, description → p, button label → cta span, tone → data attr
```

**Card / Feature** — Small content unit:
```
icon/image → media div, title → h2, description → p
```

**Quote / Testimonial** — Quoted text with attribution:
```
quote/text → blockquote, author/attribution → cite, role/title → small
```

**Image / Media** — Visual block:
```
image → img placeholder, caption → figcaption, alt → alt text display
```

**Columns / Grid** — Multi-column layout indicator:
```
columns/count → column count display, show "N columns" label
```
