import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imdbId = searchParams.get("id");

    if (!imdbId) {
      return NextResponse.json({ error: "Missing IMDb ID" }, { status: 400 });
    }

    // IMDb suggestion API (no API key required)
    const firstLetter = imdbId[2].toLowerCase(); // imdbId like "tt1234567"
    const apiUrl = `https://sg.media-imdb.com/suggests/${firstLetter}/${imdbId}.json`;

    const response = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const text = await response.text();

    // IMDb JSONP → strip callback
    const json = JSON.parse(text.replace(/^[^{]+/, "").replace(/\);?$/, ""));
    const posterRaw = json.d?.[0]?.i?.[0] || json.d?.[0]?.i?.imageUrl;

    if (!posterRaw) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 });
    }

    // Use small/faster version (width 150px)
    const poster = posterRaw.replace(/_V1_.*\.jpg$/, "_V1_UX150_.jpg");

    return NextResponse.json({ poster });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch poster" }, { status: 500 });
  }
}
