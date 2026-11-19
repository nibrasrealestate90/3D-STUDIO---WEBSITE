interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
}

/**
 * Cloudflare Pages Function: /products/[slug]
 *
 * Routing Invariant:
 * 1. Calls context.next() to check if a pre-rendered static HTML file exists for this product.
 * 2. If the static asset exists (200, 304, or 308 redirect), serves it directly with zero modification.
 * 3. Only when the response is 404 (product published after build or nonexistent), rewrites
 *    internally to the dynamic product fallback shell (/products/dynamic/) with 200 OK.
 * 4. The customer's browser URL remains unchanged (/products/[slug]/), allowing client hydration
 *    to extract the real slug and fetch product details from the live Commercial Dashboard API.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  // 1. Attempt to serve pre-rendered static asset
  const response = await context.next();

  // 2. If static file exists, return it directly
  if (response.status !== 404) {
    return response;
  }

  // 3. Asset not found: fetch the dynamic product fallback page from static assets
  // Use pretty path matching Next.js trailingSlash: true configuration
  const fallbackUrl = new URL('/products/dynamic/', context.request.url);
  const fallbackResponse = await context.env.ASSETS.fetch(fallbackUrl);

  // 4. Return fallback HTML with 200 OK status while keeping browser URL intact
  return new Response(fallbackResponse.body, {
    status: 200,
    headers: fallbackResponse.headers,
  });
};
