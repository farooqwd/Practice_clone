import { NextResponse } from "next/server";

// Adblocker utils (included directly in the route)
const AD_DOMAINS = [
  'doubleclick.net', 'googleadservices.com', 'googlesyndication.com', 'adservice.google.com',
  'google-analytics.com', 'googletagmanager.com', 'googletagservices.com', 'facebook.com/tr',
  'facebook.net', 'fbcdn.net', 'twitter.com/i/ads', 'pinterest.com/tracking', 'tiktok.com/analytics',
  'snapchat.com/sc-analytics', 'adform.net', 'adnxs.com', 'rubiconproject.com', 'openx.net',
  'pubmatic.com', 'criteo.com', 'taboola.com', 'outbrain.com', 'revcontent.com', 'popads.net',
  'propellerads.com', 'popcash.net', 'adblade.com', 'adroll.com', 'adzerk.net', 'brightcove.com',
  'jwplatform.com', 'vidazoo.com', 'spotxchange.com', 'adfly.com', 'linkvertise.com', 'bc.vc',
  'shorte.st', 'coinhive.com', 'cryptoloot.pro', 'miner.pr0gramm.com', 'cloudfront.net/ad',
  'akamaihd.net/ads', 'cdn.ads', 'adskeeper.co.uk', 'adcolony.com', 'unityads.unity3d.com',
  'applovin.com', 'ironsrc.com', 'vungle.com', 'inmobi.com', 'smaato.com', 'fyber.com',
  'verizonmedia.com'
];

const TRACKER_PARAMS = [
  'utm_', 'fbclid', 'gclid', 'msclkid', 'dclid', 'gbraid', 'wbraid', 'twclid', 'ttclid',
  'igshid', 'mc_cid', 'mc_eid', '_ga', 'yclid', 'oly_anon_id', 'oly_enc_id', 'rb_clickid',
  's_cid', 'vero_conv', 'vero_id'
];

const STREAMING_WHITELIST = [
  'vidsrc.pro', 'vidsrc.xyz', '2embed.cc', 'multiembed.mov', 'movieboxpro.app',
  'flixhq.to', 'soap2day.sh', 'fmovies.to', 'lookmovie.ag', 'movie4kto.net',
  'embedhub.tk', 'movie-web.app', 'vidsrc.me', 'vidsrc.stream', 'vidsrc.to',
  'vidplay.site', 'streamtape.com', 'doodstream.com', 'mixdrop.co', 'mp4upload.com',
  'vidcloud.co', 'upstream.to', 'filemoon.sx', 'moviesapi.club'
];

// Helper functions
function isAdUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Never block streaming domains
    if (STREAMING_WHITELIST.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    // Check domain blacklist
    if (AD_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Check tracker parameters
    if (TRACKER_PARAMS.some(param => urlObj.search.includes(param))) {
      return true;
    }
    
    // Check path patterns
    const adPaths = ['/ads/', '/ad/', '/track', '/pixel', '/analytics'];
    if (adPaths.some(path => urlObj.pathname.includes(path))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    TRACKER_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

// Your original providers array
const PROVIDERS: Array<{ name: string; url: (id: string) => string; type: string }> = [
  {
    name: "MoviesAPI",
    url: (id: string) => `https://moviesapi.club/movie/${id}`,
    type: "movie",
  },
  {
    name: "VidSrc Pro (Movie)",
    url: (id: string) => `https://vidsrc.pro/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "2Embed",
    url: (id: string) => `https://www.2embed.cc/embed/${id}`,
    type: "movie",
  },
  {
    name: "SuperEmbed",
    url: (id: string) => `https://multiembed.mov/?video_id=${id}`,
    type: "movie",
  },
  {
    name: "MovieBox Pro",
    url: (id: string) => `https://movieboxpro.app/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "FlixHQ",
    url: (id: string) => `https://flixhq.to/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "Soap2Day",
    url: (id: string) => `https://soap2day.sh/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "FMovies",
    url: (id: string) => `https://fmovies.to/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "LookMovie",
    url: (id: string) => `https://lookmovie.ag/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "Movie4K",
    url: (id: string) => `https://movie4kto.net/embed/movie/${id}`,
    type: "movie",
  },
  {
    name: "VidSrc Pro (TV)",
    url: (id: string) => `https://vidsrc.pro/embed/tv/${id}`,
    type: "tv",
  },
  {
    name: "2Embed (TV)",
    url: (id: string) => `https://www.2embed.cc/embedtv/${id}`,
    type: "tv",
  },
  {
    name: "MovieBox Pro (TV)",
    url: (id: string) => `https://movieboxpro.app/embed/tv/${id}`,
    type: "tv",
  },
  {
    name: "FlixHQ (TV)",
    url: (id: string) => `https://flixhq.to/embed/tv/${id}`,
    type: "tv",
  },
  {
    name: "Soap2Day (TV)",
    url: (id: string) => `https://soap2day.sh/embed/tv/${id}`,
    type: "tv",
  },
  {
    name: "FMovies (TV)",
    url: (id: string) => `https://fmovies.to/embed/tv/${id}`,
    type: "tv",
  },
  {
    name: "LookMovie (TV)",
    url: (id: string) => `https://lookmovie.ag/embed/tv/${id}`,
    type: "tv",
  },
  {
    name: "Vidsrc.xyz",
    url: (id: string) => `https://vidsrc.xyz/embed/${id}`,
    type: "both",
  },
  {
    name: "EmbedHub",
    url: (id: string) => `https://embedhub.tk/embed/${id}`,
    type: "both",
  },
  {
    name: "Movie-Web",
    url: (id: string) => `https://movie-web.app/embed/${id}`,
    type: "both",
  },
];

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const [mediaType, id] = params.slug;

  if (!id || !/^tt\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid IMDb ID" }, { status: 400 });
  }

  // Filter providers by media type
  const filteredProviders = PROVIDERS.filter((p) => 
    p.type === mediaType || p.type === "both" || mediaType === "both"
  );

  // Process each provider URL
  const urls = filteredProviders.map((provider) => {
    const rawUrl = provider.url(id);
    
    // Check if this URL should be blocked (but never block streaming domains)
    const shouldBlock = isAdUrl(rawUrl);
    
    // Clean the URL (remove tracking parameters)
    const cleanedUrl = cleanUrl(rawUrl);
    
    return {
      name: provider.name,
      url: cleanedUrl,
      blocked: shouldBlock,
      originalUrl: rawUrl
    };
  });

  // Return only non-blocked URLs to the client
  const availableUrls = urls.filter(provider => !provider.blocked);

  return NextResponse.json({ 
    providers: availableUrls,
    // Optional: include debug info in development
    ...(process.env.NODE_ENV === 'development' && {
      _debug: {
        totalProviders: filteredProviders.length,
        blockedProviders: urls.filter(p => p.blocked).length,
        availableProviders: availableUrls.length,
        blockedList: urls.filter(p => p.blocked).map(p => ({ name: p.name, reason: "Ad/tracker domain" }))
      }
    })
  });
}