// utils/adblocker.ts
export const AD_DOMAINS = [
  // Google Ads
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'adservice.google.com',
  'google-analytics.com',
  'googletagmanager.com',
  'googletagservices.com',
  'googleadapis.com',
  'gstaticadssl.l.google.com',
  
  // Social Media Trackers
  'facebook.com/tr',
  'facebook.net',
  'fbcdn.net',
  'twitter.com/i/ads',
  'pinterest.com/tracking',
  'tiktok.com/analytics',
  'snapchat.com/sc-analytics',
  'linkedin.com/analytics',
  'reddit.com/ads',
  'instagram.com/tracking',
  
  // Programmatic Ads
  'adform.net',
  'adnxs.com',
  'rubiconproject.com',
  'openx.net',
  'pubmatic.com',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'revcontent.com',
  'zemanta.com',
  'quantcast.com',
  'amazon-adsystem.com',
  'adsystem.com',
  
  // Malicious/Popup Ads
  'popads.net',
  'propellerads.com',
  'popcash.net',
  'adblade.com',
  'adroll.com',
  'adzerk.net',
  'clickaine.com',
  'popundernet.com',
  'adskeeper.com',
  'adspirit.de',
  
  // Video Ads
  'brightcove.com',
  'jwplatform.com',
  'vidazoo.com',
  'spotxchange.com',
  'freewheel.tv',
  'tremorvideo.com',
  'videologygroup.com',
  
  // Aggressive Redirectors
  'adfly.com',
  'linkvertise.com',
  'bc.vc',
  'shorte.st',
  'ouo.io',
  'linkshrink.net',
  'sub2unlock.com',
  'cuty.io',
  
  // Crypto Miners
  'coinhive.com',
  'cryptoloot.pro',
  'miner.pr0gramm.com',
  'webmine.cz',
  'coinhave.com',
  'minero.cc',
  'crypto-loot.com',
  
  // Common CDNs with ads
  'cloudfront.net/ad',
  'akamaihd.net/ads',
  'cdn.ads',
  'edgeads.org',
  'adcdn.com',
  
  // New aggressive domains (2024)
  'adskeeper.co.uk',
  'adcolony.com',
  'unityads.unity3d.com',
  'applovin.com',
  'ironsrc.com',
  'vungle.com',
  'inmobi.com',
  'smaato.com',
  'fyber.com',
  'verizonmedia.com',
  'adgeneration.com',
  'adition.com',
  'adledge.com',
  
  // Additional tracking domains
  'hotjar.com',
  'mouseflow.com',
  'crazyegg.com',
  'clicktale.net',
  'sessioncam.com',
  'luckyorange.com',
  'inspectlet.com',
  'fullstory.com',
  'mixpanel.com',
  'amplitude.com',
  'heap.io',
  'pingdom.net',
  'newrelic.com',
  'datadoghq.com'
];

export const TRACKER_PARAMS = [
  'utm_',
  'fbclid',
  'gclid',
  'msclkid',
  'dclid',
  'gbraid',
  'wbraid',
  'twclid',
  'ttclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  '_ga',
  'yclid',
  'oly_anon_id',
  'oly_enc_id',
  'rb_clickid',
  's_cid',
  'vero_conv',
  'vero_id',
  'affiliate',
  'aff_id',
  'campaign',
  'ref_',
  'referrer',
  'source',
  'medium',
  'content',
  'term',
  'clickid',
  'transaction_id',
  'redirect',
  'tracking',
  'partner'
];

export const POPUP_DOMAINS = [
  'popup.com',
  'popunders.com',
  'popads.com',
  'popcash.net',
  'popmyads.com',
  'popupdomination.com',
  'exit-ad.com',
  'exitbee.com',
  'popupmaker.com',
  'modalpopup.com',
  'lightboxpopup.com',
  'overlayads.com',
  'interstitial.com'
];

export const NAVIGATION_BLOCK_DOMAINS = [
  'toolbar',
  'banner',
  'header-ad',
  'top-nav',
  'sticky-header',
  'floating-bar',
  'notification-bar',
  'cookie-consent',
  'gdpr-popup',
  'newsletter-popup',
  'age-verification',
  'survey-popup',
  'social-share-bar'
];

export const MALICIOUS_PATTERNS = [
  /^ad[s]?$/i,
  /track(ing)?/i,
  /pixel/i,
  /beacon/i,
  /analytics/i,
  /metrics/i,
  /stats?/i,
  /log/i,
  /count(er)?/i,
  /click/i,
  /impression/i,
  /viewability/i,
  /conversion/i,
  /retargeting/i,
  /remarketing/i
];

export function isAdUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    const search = urlObj.search;
    
    // Check domain blacklist
    if (AD_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Check popup domains
    if (POPUP_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Check navigation block domains in path
    if (NAVIGATION_BLOCK_DOMAINS.some(domain => pathname.includes(domain))) {
      return true;
    }
    
    // Check tracker parameters
    if (TRACKER_PARAMS.some(param => search.includes(param))) {
      return true;
    }
    
    // Check path patterns
    const adPaths = ['/ads/', '/ad/', '/track', '/pixel', '/analytics', '/beacon', '/log', '/count'];
    if (adPaths.some(path => pathname.includes(path))) {
      return true;
    }
    
    // Check for malicious patterns in subdomains
    const subdomains = hostname.split('.');
    if (subdomains.some(subdomain => MALICIOUS_PATTERNS.some(pattern => pattern.test(subdomain)))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export function shouldBlockPopup(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Block known popup domains
    if (POPUP_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Block URLs with popup-related query parameters
    const popupParams = ['popup', 'modal', 'lightbox', 'overlay', 'interstitial'];
    if (popupParams.some(param => urlObj.search.includes(param))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export function shouldBlockNavigation(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Block navigation elements
    if (NAVIGATION_BLOCK_DOMAINS.some(domain => pathname.includes(domain))) {
      return true;
    }
    
    // Block social share bars and sticky headers
    if (pathname.includes('share') || pathname.includes('sticky') || pathname.includes('floating')) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    TRACKER_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param);
      // Also remove variations with underscores and dashes
      urlObj.searchParams.delete(param.replace('_', '-'));
      urlObj.searchParams.delete(param.replace('_', ''));
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

export function isThirdPartyTracker(currentUrl: string, requestUrl: string): boolean {
  try {
    const currentHost = new URL(currentUrl).hostname;
    const requestHost = new URL(requestUrl).hostname;
    
    // Check if it's a third-party request
    if (currentHost !== requestHost && !requestHost.endsWith(currentHost)) {
      // Check if the third party is known for tracking
      return AD_DOMAINS.some(domain => requestHost.includes(domain));
    }
    
    return false;
  } catch {
    return false;
  }
}

// Comprehensive blocking function
export function shouldBlockRequest(url: string, referrer?: string): boolean {
  return isAdUrl(url) || 
         shouldBlockPopup(url) || 
         shouldBlockNavigation(url) || 
         (referrer ? isThirdPartyTracker(referrer, url) : false);
}