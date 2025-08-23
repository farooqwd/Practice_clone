import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const director = searchParams.get("name"); // Changed to "name" to match URL
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "18", 10);
  const skip = (page - 1) * limit;

  if (!director) {
    return NextResponse.json({ movies: [], totalPages: 0 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("new_data");
    const collection = db.collection("movies");

    // Case-insensitive match for director name
    const query = { directors: { $regex: director, $options: "i" } };

    const totalCount = await collection.countDocuments(query);
    const movies = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      movies,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch director movies" }, { status: 500 });
  }
}