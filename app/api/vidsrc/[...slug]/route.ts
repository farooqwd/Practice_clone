import { NextResponse } from "next/server";

// Modern ad detection using multiple techniques
class AdBlockEngine {
  // Domain reputation database (could be external API in production)
  private domainReputation: Map<string, number> = new Map();
  
  // Pattern database for modern ad networks
  private adPatterns = {
    domains: [
      // Programmatic advertising
      /(ads|adx|adservice|doubleclick|googleads)\.(com|net|org)/i,
      /(pubmatic|openx|rubiconproject|appnexus)\.com/i,
      /(criteo|taboola|outbrain|revcontent)\.com/i,
      /(adform|adcolony|unityads|vungle|ironsrc)\.com/i,
      /(inmobi|smaato|fyber|verizonmedia)\.com/i,
      
      // Social tracking
      /(facebook\.com\/tr|facebook\.net|fbcdn\.net\/tr)/i,
      /(twitter\.com\/i\/ads|pinterest\.com\/tracking)/i,
      /(tiktok\.com\/analytics|snapchat\.com\/sc-analytics)/i,
      
      // Malicious domains
      /(coinhive|cryptoloot|miner)\./i,
      /(popads|propellerads|popcash)\.net/i
    ],
    
    paths: [
      /\/ads?\//i,
      /\/track(ing)?\//i,
      /\/pixel\/?/i,
      /\/analytics\//i,
      /\/sync\//i,
      /\/bid\//i,
      /\/tr\//i
    ],
    
    params: [
      'utm_', 'fbclid', 'gclid', 'msclkid', 'dclid', 'gbraid', 
      'wbraid', 'twclid', 'ttclid', 'igshid', 'mc_cid', 'mc_eid',
      '_ga', '_gl', '_gac', '_gid', 'yclid', 'rb_clickid'
    ]
  };

  // Streaming and content whitelist
  private whitelist = {
    domains: [
      // Streaming services
      'vidsrc.pro', 'vidsrc.xyz', 'vidsrc.me', 'vidsrc.stream', 'vidsrc.to',
      '2embed.cc', 'multiembed.mov', 'movieboxpro.app', 'flixhq.to',
      'soap2day.sh', 'fmovies.to', 'lookmovie.ag', 'movie4kto.net',
      'embedhub.tk', 'movie-web.app', 'vidplay.site', 'streamtape.com',
      'doodstream.com', 'mixdrop.co', 'mp4upload.com', 'vidcloud.co',
      'upstream.to', 'filemoon.sx', 'moviesapi.club',
      
      // CDNs and infrastructure
      'cloudflare.com', 'cloudfront.net', 'akamaihd.net', 'fastly.net',
      'bunny.net', 'cdn77.org', 'gcore.com', 'stackpath.com'
    ],
    
    patterns: [
      /\.(mp4|m3u8|ts|mkv|avi|mov|wmv|flv|webm|m4v|3gp|mpeg|mpg)(\?|$)/i,
      /\/video\//i,
      /\/stream\//i,
      /\/embed\//i,
      /\/hls\//i,
      /\/dash\//i,
      /\/manifest\./i,
      /\.m3u8(\?|$)/i
    ]
  };

  // Behavioral scoring system
  private scoreUrl(url: string): number {
    let score = 0;
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Whitelist check - immediate pass
    if (this.whitelist.domains.some(domain => hostname.includes(domain)) ||
        this.whitelist.patterns.some(pattern => pattern.test(url))) {
      return -100; // Definitely not an ad
    }

    // Domain pattern matching
    if (this.adPatterns.domains.some(pattern => pattern.test(hostname))) {
      score += 80;
    }

    // Path pattern matching
    if (this.adPatterns.paths.some(pattern => pattern.test(pathname))) {
      score += 60;
    }

    // Parameter analysis
    const paramCount = this.adPatterns.params.filter(param => 
      urlObj.searchParams.has(param)
    ).length;
    score += paramCount * 25;

    // Domain structure analysis (subdomain counting)
    const subdomainCount = hostname.split('.').length - 2;
    if (subdomainCount > 3) {
      score += 20; // Excessive subdomains often indicate ad networks
    }

    // Query string length analysis
    if (urlObj.search.length > 100) {
      score += 15; // Long query strings often contain tracking data
    }

    return score;
  }

  isAd(url: string): boolean {
    try {
      const score = this.scoreUrl(url);
      // Threshold for blocking - adjust based on testing
      return score > 50;
    } catch {
      return false;
    }
  }

  cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove tracking parameters but preserve essential ones
      this.adPatterns.params.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // Clean up common tracking fragments
      if (urlObj.hash.includes('#')) {
        urlObj.hash = '';
      }
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }
}

// Real-time URL classification with fallback strategy
class StreamingUrlClassifier {
  private adBlockEngine = new AdBlockEngine();
  private knownGoodPatterns = [
    /\/embed\/movie\//i,
    /\/movie\/tt\d+/i,
    /\/embed\/tt\d+/i,
    /\/stream\/movie\//i
  ];

  classifyUrl(url: string): {
    isAd: boolean;
    confidence: number;
    category: 'streaming' | 'ad' | 'mixed' | 'unknown';
  } {
    const isAd = this.adBlockEngine.isAd(url);
    const isStreaming = this.knownGoodPatterns.some(pattern => pattern.test(url));
    
    let category: 'streaming' | 'ad' | 'mixed' | 'unknown' = 'unknown';
    let confidence = 0.5;

    if (isStreaming && !isAd) {
      category = 'streaming';
      confidence = 0.9;
    } else if (isAd && !isStreaming) {
      category = 'ad';
      confidence = 0.8;
    } else if (isAd && isStreaming) {
      category = 'mixed';
      confidence = 0.6;
    }

    return { isAd, confidence, category };
  }
}

// Provider configuration with modern streaming sources
const PROVIDERS = [
  {
    name: "MoviesAPI",
    url: (id: string) => `https://moviesapi.club/movie/${id}`,
    type: "movie",
    reliability: 0.9
  },
  {
    name: "VidSrc Pro",
    url: (id: string) => `https://vidsrc.pro/embed/movie/${id}`,
    type: "movie",
    reliability: 0.85
  },
  {
    name: "2Embed",
    url: (id: string) => `https://www.2embed.cc/embed/${id}`,
    type: "movie",
    reliability: 0.8
  },
  {
    name: "MovieWeb",
    url: (id: string) => `https://movie-web.app/embed/movie/${id}`,
    type: "movie",
    reliability: 0.75
  }
];

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const [mediaType, id] = params.slug;

  if (!id || !/^tt\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid IMDb ID" }, { status: 400 });
  }

  const classifier = new StreamingUrlClassifier();
  const adBlockEngine = new AdBlockEngine();

  // Process providers with modern classification
  const processedProviders = PROVIDERS.filter(p => 
    p.type === mediaType || mediaType === "both"
  ).map(provider => {
    const rawUrl = provider.url(id);
    const classification = classifier.classifyUrl(rawUrl);
    const cleanedUrl = adBlockEngine.cleanUrl(rawUrl);

    return {
      name: provider.name,
      url: cleanedUrl,
      originalUrl: rawUrl,
      classification,
      reliability: provider.reliability,
      blocked: classification.isAd && classification.confidence > 0.7,
      priority: provider.reliability * (1 - (classification.confidence * Number(classification.isAd)))
    };
  });

  // Sort by priority (best streams first)
  processedProviders.sort((a, b) => b.priority - a.priority);

  return NextResponse.json({
    providers: processedProviders.map(p => ({
      name: p.name,
      url: p.url,
      blocked: p.blocked,
      reliability: p.reliability,
      classification: p.classification
    })),
    
    // Modern analytics
    analytics: {
      total: processedProviders.length,
      blocked: processedProviders.filter(p => p.blocked).length,
      high_confidence_streams: processedProviders.filter(p => 
        p.classification.category === 'streaming' && p.classification.confidence > 0.8
      ).length,
      risk_assessment: processedProviders.reduce((acc, p) => 
        acc + (p.classification.isAd ? p.classification.confidence : 0), 0
      ) / processedProviders.length
    },
    
    // Client recommendations
    recommendations: {
      preferred_providers: processedProviders
        .filter(p => !p.blocked && p.classification.confidence < 0.3)
        .slice(0, 3)
        .map(p => p.name),
      fallback_strategy: processedProviders.some(p => p.blocked) ? 
        "Try preferred providers first, then consider blocked ones with ad-blocker" : 
        "All providers appear safe"
    }
  });
}

// Optional: Add periodic pattern updates from external source
async function updateAdPatterns() {
  try {
    // Could fetch from reputable ad-block list sources
    const response = await fetch('https://raw.githubusercontent.com/easylist/easylist/master/easylist/easylist_general_block.txt');
    const data = await response.text();
    
    // Parse and update patterns (simplified example)
    const newPatterns = data.split('\n')
      .filter(line => line.startsWith('||') && !line.includes('#') && line.length > 4)
      .map(line => line.replace('||', '').replace('^', ''));
    
    console.log(`Updated ${newPatterns.length} ad patterns`);
    
  } catch (error) {
    console.warn('Failed to update ad patterns, using defaults');
  }
}

// Uncomment to enable periodic updates
// setInterval(updateAdPatterns, 24 * 60 * 60 * 1000); // Daily updates