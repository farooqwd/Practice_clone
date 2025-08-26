import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const [mediaType, id] = params.slug;

  if (!id || !/^tt\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid IMDb ID" }, { status: 400 });
  }

  // Direct autoplay embed
  const url = `https://www.2embed.cc/embed/${id}?autoplay=1`;

  return NextResponse.json({
    providers: [
      {
        name: "2Embed",
        url,
        blocked: false,
        reliability: 0.9,
        classification: {
          isAd: false,
          confidence: 1,
          category: "streaming"
        }
      }
    ]
  });
}
