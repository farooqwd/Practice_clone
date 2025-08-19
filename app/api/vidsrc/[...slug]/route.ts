import { NextResponse } from "next/server";

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
];


export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const [mediaType, id] = params.slug;

  if (!id || !/^tt\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid IMDb ID" }, { status: 400 });
  }

  const urls = PROVIDERS.filter((p) => p.type === mediaType).map((p) => ({
    name: p.name,
    url: p.url(id),
  }));

  return NextResponse.json({ providers: urls });
}
