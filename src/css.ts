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
}
.emd-section-label:first-child { border-top: none; padding-top: 0; }

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

@media (max-width: 640px) {
  div[role="dialog"][data-open] { max-width: calc(100vw - 2rem) !important; width: auto !important; }
  div[role="dialog"][data-open] form > div.emd-grid > * { grid-column: 1 / -1 !important; }
}
`;
