/**
 * Cloudflare Pages Function: /api/store/[[path]]
 *
 * Reverse Proxy for Commercial Dashboard Storefront API
 *
 * Invariants & Security Controls:
 * 1. Fixed Upstream: Strictly targets https://3d-printing-dashboard-peach.vercel.app.
 *    Never accepts dynamic, parameter-controlled, or arbitrary proxy targets (prevents open proxy / SSRF).
 * 2. Path & Query Preservation: Preserves exact pathname and query parameters (/api/store/...).
 * 3. Method Support: Supports GET, POST, OPTIONS, and any standard HTTP methods.
 * 4. Header Forwarding: Strips unsafe hop-by-hop headers while preserving client headers,
 *    especially the incoming 'Origin' header required by the dashboard's CSRF / storefront origin validator.
 * 5. Body Streaming: Forwards request body on POST and other mutation methods.
 * 6. Honest Error Handling: Returns HTTP 502 with structured JSON on network/upstream failures.
 *    Never fabricates mock data or hides failures with fake 200 OK responses.
 */

// Hop-by-hop headers that must not be forwarded between client and upstream (RFC 2616 / RFC 7230)
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

const UPSTREAM_ORIGIN = 'https://3d-printing-dashboard-peach.vercel.app';

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const incomingUrl = new URL(request.url);

  // 1. Construct target upstream URL preserving exact pathname and query string
  const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, UPSTREAM_ORIGIN);

  // 2. Prepare forward headers
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lowerKey) && lowerKey !== 'content-length') {
      forwardHeaders.set(key, value);
    }
  });

  // Preserve the incoming Origin header if present
  const incomingOrigin = request.headers.get('origin');
  if (incomingOrigin) {
    forwardHeaders.set('Origin', incomingOrigin);
  }

  // Pass through client IP if available from Cloudflare headers
  const clientIp = request.headers.get('cf-connecting-ip');
  if (clientIp && !forwardHeaders.has('x-forwarded-for')) {
    forwardHeaders.set('x-forwarded-for', clientIp);
  }

  // 3. Build upstream request options
  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: forwardHeaders,
    redirect: 'manual',
  };

  // Forward body for mutation methods (POST, PUT, PATCH, DELETE)
  if (method !== 'GET' && method !== 'HEAD') {
    if (request.body) {
      init.body = request.body;
      // @ts-expect-error - duplex is standard when passing ReadableStream bodies in fetch
      init.duplex = 'half';
    }
  }

  // 4. Forward request to upstream
  try {
    const upstreamResponse = await fetch(targetUrl.toString(), init);

    // 5. Prepare sanitized response headers
    const responseHeaders = new Headers();
    upstreamResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Filter hop-by-hop headers as well as content-encoding/content-length to allow Cloudflare edge compression
      if (!HOP_BY_HOP_HEADERS.has(lower) && lower !== 'content-encoding' && lower !== 'content-length') {
        responseHeaders.set(key, value);
      }
    });

    // Ensure client-side access by allowing the storefront origin
    if (incomingOrigin) {
      responseHeaders.set('Access-Control-Allow-Origin', incomingOrigin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    } else {
      responseHeaders.set('Access-Control-Allow-Origin', '*');
    }

    if (method === 'OPTIONS') {
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization');
      responseHeaders.set('Access-Control-Max-Age', '86400');
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Pages API Proxy Error] Failed to proxy ${method} ${targetUrl.toString()}:`, error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'BAD_GATEWAY',
        message: 'Storefront API proxy failed to communicate with upstream service.',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
};
