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
    const db = client.db("new_data");

    const movies = await db
      .collection("movies")
      .find({
        genres: { $regex: genre, $options: "i" } // case-insensitive match, works with arrays
      })
      .sort({ year: -1 })
      .limit(18)
      .toArray();

    return NextResponse.json(movies);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
