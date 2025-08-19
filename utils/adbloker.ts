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
  
  // Social Media Trackers
  'facebook.com/tr',
  'facebook.net',
  'fbcdn.net',
  'twitter.com/i/ads',
  'pinterest.com/tracking',
  'tiktok.com/analytics',
  'snapchat.com/sc-analytics',
  
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
  
  // Malicious/Popup Ads
  'popads.net',
  'propellerads.com',
  'popcash.net',
  'adblade.com',
  'adroll.com',
  'adzerk.net',
  
  // Video Ads
  'brightcove.com',
  'jwplatform.com',
  'vidazoo.com',
  'spotxchange.com',
  
  // Aggressive Redirectors
  'adfly.com',
  'linkvertise.com',
  'bc.vc',
  'shorte.st',
  
  // Crypto Miners
  'coinhive.com',
  'cryptoloot.pro',
  'miner.pr0gramm.com',
  
  // Common CDNs with ads
  'cloudfront.net/ad',
  'akamaihd.net/ads',
  'cdn.ads',
  
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
  'verizonmedia.com'
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
  'vero_id'
];

export function isAdUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check domain
    if (AD_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return true;
    }
    
    // Check query parameters
    if (TRACKER_PARAMS.some(param => urlObj.search.includes(param))) {
      return true;
    }
    
    // Check path
    const adPaths = ['/ads/', '/ad/', '/track', '/pixel', '/analytics'];
    if (adPaths.some(path => urlObj.pathname.includes(path))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}