import { NextResponse } from "next/server";

// Provider configurations
const PROVIDERS: Array<(slug: string) => string> = [
  (slug) => `https://autoembed.cc/embed/${slug}`,
  (slug) => `https://vidsrc.me/embed/${slug}`,
  (slug) => `https://vidsrc.xyz/embed/${slug}`,
  (slug) => `https://moviesapi.club/embed/${slug}`,
];

// Blocklist of ad/tracker domains
const SCRIPT_SRC_BLOCKLIST = [
  "histats.com",
  "adnxs.com",
  "popads",
  "propellerads",
  "onclick",
  "traff",
  "exosrv",
  "bcvc",
  "short",
  "adsterra",
  "doubleclick.net",
  "taboola",
  "outbrain",
  "yandex",
  "arc.io",
];

// Guard script to prevent frame-busting and popups
const GUARD_JS = `
(function(){
  try {
    window.open = function(){ return null; };
    document.addEventListener('click', function(e){
      const a = e.target?.closest && e.target.closest('a');
      if (a && (a.target === '_blank' || /window\\.open|popup/i.test(a.getAttribute('onclick')||''))) {
        a.target = '_self';
        a.removeAttribute('onclick');
      }
    }, true);
    Object.defineProperty(window, 'top', { get: () => window });
    Object.defineProperty(window, 'parent', { get: () => window });
    try { window.location.assign = function(){}; } catch(_) {}
    try { window.location.replace = function(){}; } catch(_) {}
    window.onbeforeunload = null;
    window.aclib = undefined;
  } catch (e) { /* ignore */ }
})();
`;

// Utility functions for HTML processing
const FIXED_DIMENSIONS_REGEX = /(width|height)=["']\d+["']/gi;
const IFRAME_STYLE_REGEX = /<iframe([^>]*)style=["']([^"']*)["']/gi;

function enforceResponsiveSizing(html: string): string {
  // Remove fixed dimensions
  let output = html.replace(FIXED_DIMENSIONS_REGEX, '');
  
  // Modify iframe styles
  output = output.replace(IFRAME_STYLE_REGEX, (match, prefix, existingStyle) => {
    const newStyle = `${existingStyle}; width:100%!important; height:100%!important; border:none; position:absolute; top:0; left:0;`;
    return `<iframe${prefix}style="${newStyle}"`;
  });
  
  // Add styles to iframes without them
  output = output.replace(/<iframe((?!style)[^>]*)>/gi, 
    `<iframe$1 style="width:100%!important; height:100%!important; border:none; position:absolute; top:0; left:0;">`);

  return output;
}

function ensureHtmlStructure(html: string): string {
  if (!html.includes('<html')) {
    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html, body { margin:0; padding:0; height:100%; overflow:hidden; }
            .video-container { position:relative; padding-bottom:56.25%; height:0; }
            .video-container iframe { position:absolute; top:0; left:0; width:100%; height:100%; }
          </style>
        </head>
        <body><div class="video-container">${html}</div></body>
      </html>`;
  }
  return html;
}

function stripBlockedScripts(html: string) {
  return html.replace(
    /<script\b[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi,
    (match, src) => {
      const bad = SCRIPT_SRC_BLOCKLIST.some((d) => src.toLowerCase().includes(d));
      return bad ? "" : match;
    }
  );
}

function neutralizeDangerousPatterns(html: string) {
  let out = html;
  out = out.replace(/top\.location/gi, "self.location");
  out = out.replace(/parent\.location/gi, "self.location");
  out = out.replace(/window\.open\s*\(/gi, "/*blocked*/ console.log(");
  out = out.replace(/target\s*=\s*["_']_blank["_']/gi, 'target="_self"');
  return out;
}

function injectGuardScript(html: string) {
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(
      /<head[^>]*>/i,
      (m) => `${m}\n<script>${GUARD_JS}</script>`
    );
  }
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(
      /<body[^>]*>/i,
      (m) => `${m}\n<script>${GUARD_JS}</script>`
    );
  }
  return `<script>${GUARD_JS}</script>${html}`;
}

export async function GET(req: Request, { params }: { params: { slug: string[] } }) {
  const url = new URL(req.url);
  const slug = params.slug.join("/");
  const serverOverride = url.searchParams.get("server");

  const order = (() => {
    if (serverOverride) {
      const i = Number(serverOverride);
      if (!Number.isNaN(i) && i >= 0 && i < PROVIDERS.length) {
        return [i, ...Array.from({ length: PROVIDERS.length }, (_, k) => k).filter((k) => k !== i)];
      }
    }
    return Array.from({ length: PROVIDERS.length }, (_, i) => i);
  })();

  for (const i of order) {
    const target = PROVIDERS[i](slug);
    try {
      const res = await fetch(target, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": target,
        },
      });

      if (!res.ok) continue;

      let html = await res.text();

      // Process the HTML
      html = ensureHtmlStructure(html);
      html = enforceResponsiveSizing(html);
      html = stripBlockedScripts(html);
      html = neutralizeDangerousPatterns(html);
      html = injectGuardScript(html);

      const headers = new Headers({
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "default-src * blob: data:; script-src * 'unsafe-inline' 'unsafe-eval' blob: data:; style-src * 'unsafe-inline'; img-src * blob: data:; frame-src * blob: data:; child-src * blob: data:; connect-src * blob: data:; navigate-to 'self';",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "no-referrer",
      });

      return new NextResponse(html, { headers });
    } catch (e) {
      continue;
    }
  }

  return NextResponse.json({ error: "No working providers" }, { status: 502 });
}