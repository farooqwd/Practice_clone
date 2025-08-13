// app/api/genre/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("name");

  if (!genre) {
    return NextResponse.json({ error: "Genre is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");
    const movies = await db
      .collection("movies")
      .find({
        year: { $gt: 1990 },
        genres: { $in: [new RegExp(`^${genre}$`, "i")] } // case-insensitive match
      })
      .limit(30)
      .sort({ year: -1 })
      .toArray();

    return NextResponse.json(movies);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
