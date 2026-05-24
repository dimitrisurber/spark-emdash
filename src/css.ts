export const adminCSS = `
/* ── Sheet scroll fixes ──────────────────────────────── */
div[class*="fixed"][class*="inset-y-0"][class*="right-0"][class*="flex-col"],
div[class*="fixed"][class*="inset-y-0"][class*="right-0"][class*="max-w-lg"] {
  overflow-y: auto !important; max-height: 100vh;
}
div[class*="fixed"][class*="inset-0"][class*="items-center"][class*="justify-center"] > * {
  max-height: 90vh; overflow-y: auto !important;
}

/* ── Modal: wider + flex column ──────────────────────── */
div[role="dialog"][data-open] {
  max-width: min(920px, calc(100vw - 3rem)) !important;
  width: 920px !important;
  max-height: min(88vh, 880px) !important;
  display: flex !important;
  flex-direction: column !important;
}
div[role="dialog"][data-open] form {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 0% !important;
  min-height: 0 !important;
  overflow: hidden !important;
}
div[role="dialog"][data-open] form > div:first-child {
  flex: 1 1 0% !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  padding-right: 12px !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(0,0,0,.15) transparent !important;
}
div[role="dialog"][data-open] form > div:first-child::-webkit-scrollbar { width: 5px; }
div[role="dialog"][data-open] form > div:first-child::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,.15); border-radius: 3px;
}
div[role="dialog"][data-open] form > div:last-child {
  flex-shrink: 0 !important;
  border-top: 1px solid var(--kumo-line, #e5e7eb) !important;
  padding-top: 12px !important;
}

/* ── CSS-grid field layout ───────────────────────────── */
div[role="dialog"][data-open] form > div.emd-grid {
  display: grid !important;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 14px !important;
}
.emd-section-label {
  grid-column: 1 / -1 !important;
  font-size: 10px !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: 0.1em !important;
  color: var(--kumo-subtle, #6b7280) !important;
  margin: 0 !important; padding: 8px 0 0 !important;
  border-top: 1px solid var(--kumo-line, #e5e7eb);
  cursor: pointer; user-select: none;
  display: flex !important; align-items: center; justify-content: space-between;
}
.emd-section-label:hover { color: var(--kumo-text, #374151) !important; }
.emd-section-label:first-child { border-top: none; padding-top: 0; }
.emd-chevron::after {
  content: ""; display: inline-block; width: 5px; height: 5px;
  border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg); transition: transform 0.15s ease;
}
.emd-collapsed .emd-chevron::after { transform: rotate(-45deg); }

/* ── Illustration preview ────────────────────────────── */
.emd-illus-preview {
  display: flex; align-items: center; gap: 10px; margin-top: 6px;
}
.emd-illus-preview img {
  width: 56px; height: 56px; object-fit: contain;
  border-radius: 6px; border: 1px solid var(--kumo-line, #e5e7eb);
  background: #f8f8f8;
}
.emd-illus-preview span {
  font-size: 11px; color: var(--kumo-subtle, #6b7280);
}

/* ── Block preview ───────────────────────────────────── */
.emd-preview {
  flex-shrink: 0;
  max-height: 240px;
  overflow: hidden;
  border: 1px solid var(--kumo-line, #e5e7eb);
  border-radius: 8px;
  margin: 0 24px 12px;
  background: #f9fafb;
  font-family: system-ui, -apple-system, sans-serif;
}
.emd-preview:empty { display: none; }

/* ── Toolbar (search + copy) ────────────────────────── */
.emd-toolbar {
  flex-shrink: 0; display: flex; align-items: center; gap: 8px; margin: 0 24px 8px;
}
.emd-search {
  flex: 1; font-size: 13px; padding: 6px 10px;
  border: 1px solid var(--kumo-line, #e5e7eb); border-radius: 6px;
  outline: none; background: var(--kumo-surface, #fff); color: var(--kumo-text, #1f2937);
}
.emd-search:focus { border-color: var(--kumo-accent, #3b82f6); box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
.emd-search::placeholder { color: var(--kumo-subtle, #9ca3af); }
.emd-copy-btn {
  font-size: 11px; padding: 5px 10px; white-space: nowrap;
  border: 1px solid var(--kumo-line, #d1d5db); border-radius: 4px;
  background: var(--kumo-surface, #fff); color: var(--kumo-text, #374151); cursor: pointer;
}
.emd-copy-btn:hover { background: var(--kumo-hover, #f3f4f6); }

/* ── Markdown preview ───────────────────────────────── */
.emd-md-preview {
  margin-top: 6px; padding: 8px 12px;
  border: 1px solid var(--kumo-line, #e5e7eb); border-radius: 6px;
  background: #fafafa; font-size: 13px; line-height: 1.5;
  max-height: 120px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.12) transparent;
}
.emd-md-preview h2 { font-size: 1.1rem; margin: 0 0 0.3rem; font-weight: 600; }
.emd-md-preview h3 { font-size: 1rem; margin: 0 0 0.3rem; font-weight: 600; }
.emd-md-preview h4 { font-size: 0.9rem; margin: 0 0 0.3rem; font-weight: 600; }
.emd-md-preview p { margin: 0 0 0.4rem; }
.emd-md-preview strong { font-weight: 700; }
.emd-md-preview u { color: var(--kumo-accent, #3b82f6); text-decoration: underline; }
.emd-md-preview:empty { display: none; }

/* ── JSON field editor ──────────────────────────────── */
.emd-json {
  font-family: "SF Mono", "Cascadia Mono", "Fira Code", monospace !important;
  font-size: 12px !important; tab-size: 2;
}
.emd-json-err { border-color: #ef4444 !important; box-shadow: 0 0 0 1px #ef4444 !important; }
.emd-json-ok { border-color: #22c55e !important; }
.emd-json-bar { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.emd-json-fmt {
  font-size: 11px; padding: 2px 8px;
  border: 1px solid var(--kumo-line, #d1d5db); border-radius: 4px;
  background: var(--kumo-surface, #fff); color: var(--kumo-text, #374151); cursor: pointer;
}
.emd-json-fmt:hover { background: var(--kumo-hover, #f3f4f6); }
.emd-json-status { font-size: 11px; color: var(--kumo-subtle, #6b7280); }

/* ── Block list mini-preview ────────────────────────── */
.emd-block-summary {
  display: block; font-size: 11px; color: var(--kumo-subtle, #6b7280);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; margin-top: 2px;
}

@media (max-width: 640px) {
  div[role="dialog"][data-open] { max-width: calc(100vw - 2rem) !important; width: auto !important; }
  div[role="dialog"][data-open] form > div.emd-grid > * { grid-column: 1 / -1 !important; }
}
`;
