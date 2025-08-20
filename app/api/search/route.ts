import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  console.log(`Searching movies with query: "${query}", page: ${page}, limit: ${limit}`);

  if (!query.trim()) {
    return NextResponse.json({ movies: [], total: 0, page, totalPages: 0 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("new_data");
    const collection = db.collection("movies");

    const total = await collection.countDocuments({
      title: { $regex: escapeRegex(query), $options: "i" },
    });

    const movies = await collection
      .find({
        title: { $regex: escapeRegex(query), $options: "i" },
      })
      .sort({ year: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(); // ✅ no projection, all fields including poster come back

    return NextResponse.json({
      movies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}
