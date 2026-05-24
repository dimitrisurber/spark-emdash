import type { SparkConfig } from "./types.js";
import { adminCSS } from "./css.js";
import { adminJS } from "./js.js";

export function buildPatch(config: SparkConfig = {}): string {
  const layouts = config.layouts ?? {};
  const illustrations = config.illustrations ?? {};
  const previews = config.previews ?? {};
  const dependencies = config.dependencies ?? {};
  return `<style>${adminCSS}</style>\n<script type="module">${adminJS(layouts, illustrations, previews, dependencies)}</script>`;
}

export type AstroMiddlewareContext = {
  url: URL;
};

export type AstroMiddlewareNext = () =>
  | Response
  | Promise<Response>;

/**
 * Returns an Astro middleware handler that injects spark-emdash
 * into the /_emdash/admin HTML shell.
 *
 * Usage in src/middleware.ts:
 *
 *   import { sparkEmdash } from "spark-emdash/middleware";
 *   import { sequence } from "astro:middleware";
 *
 *   export const onRequest = sequence(
 *     sparkEmdash({ layouts: { ... }, illustrations: { ... } })
 *   );
 */
export function sparkEmdash(config: SparkConfig = {}) {
  const patch = buildPatch(config);

  return async function sparkMiddleware(
    context: AstroMiddlewareContext,
    next: AstroMiddlewareNext,
  ) {
    if (!context.url.pathname.startsWith("/_emdash/admin")) {
      return next();
    }
    const response = await next();
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return response;
    }
    const html = await response.text();
    const patched = html.includes("</head>")
      ? html.replace("</head>", `${patch}</head>`)
      : html;
    return new Response(patched, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}
