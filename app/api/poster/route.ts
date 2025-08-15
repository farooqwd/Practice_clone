import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imdbId = searchParams.get("id");

    if (!imdbId) {
      return NextResponse.json({ error: "Missing IMDb ID" }, { status: 400 });
    }

    const response = await fetch(`https://www.imdb.com/title/${imdbId}/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const html = await response.text();
    const match = html.match(/<meta property="og:image" content="(.*?)"/);

    if (!match) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 });
    }

    return NextResponse.json({ poster: match[1] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch poster" }, { status: 500 });
  }
}
