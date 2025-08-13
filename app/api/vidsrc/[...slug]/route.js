export async function GET(req, { params }) {
  const slug = params.slug; // e.g., ["movie", "tt1462059"]
  const type = slug[0];
  const idPath = slug.slice(1).join("/");

  const targetUrl = `https://vidsrc.to/embed/${type}/${idPath}`;
  const response = await fetch(targetUrl);
  let html = await response.text();

  // Remove ANY script that isn't the player core
  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
    const keepList = ["player", "dash", "hls", "mpeg", "videojs"];
    if (keepList.some((kw) => match.includes(kw))) {
      return match;
    }
    return "";
  });

  // Remove inline event handlers like onload=, onclick=, etc.
  html = html.replace(/\son\w+="[^"]*"/gi, "");

  // Remove links with target="_blank" that point to ads
  html = html.replace(/<a\b[^>]*target="_blank"[^>]*>.*?<\/a>/gi, "");

  // Remove any window.open() calls
  html = html.replace(/window\.open\([^)]*\)/gi, "");

  // Remove references to known ad/tracker domains
  html = html
    .replace(/https?:\/\/[^"']*acscdn\.com[^"']*/gi, "")
    .replace(/https?:\/\/[^"']*histats\.com[^"']*/gi, "")
    .replace(/https?:\/\/[^"']*popads\.net[^"']*/gi, "")
    .replace(/https?:\/\/[^"']*doubleclick\.net[^"']*/gi, "")
    .replace(/https?:\/\/[^"']*adnxs\.com[^"']*/gi, "")
    .replace(/https?:\/\/[^"']*challenge-platform[^"']*/gi, "");

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
