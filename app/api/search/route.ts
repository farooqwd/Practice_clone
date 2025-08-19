import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  console.log("Searching movies with query:", query);

  try {
    const client = await clientPromise;
    const db = client.db("new_data");

    const movies = await db
      .collection("movies")
      .find({
        // year: { $gt: 1990 },
        title: { $regex: query, $options: "i" }, // case-insensitive search
      })
      .sort({ year: -1 }) // newest first
      .limit(100)
      .toArray();

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}
