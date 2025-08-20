import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // adjust if your db client is different

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const actor = searchParams.get("name");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "18", 10);
  const skip = (page - 1) * limit;

  if (!actor) {
    return NextResponse.json({ movies: [], totalPages: 0 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("new_data"); // change to your db name
    const collection = db.collection("movies");

    // Case-insensitive match for actor name
    const query = { stars: { $regex: actor, $options: "i" } };

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
    return NextResponse.json({ error: "Failed to fetch actor movies" }, { status: 500 });
  }
}
