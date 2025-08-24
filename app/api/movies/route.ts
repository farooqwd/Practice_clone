import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 18;
  const skip = (page - 1) * limit;

  try {
    const client = await clientPromise;
    const db = client.db("new_data");

    // ✅ Using the index on { year: -1, _id: 1 }
    const movies = await db
  .collection("movies")
  .find({ year: { $gt: 2024 } })
  .sort({ year: -1 })   // descending (latest first)
  .skip(skip)
  .limit(limit)
  .toArray();
    const totalCount = await db.collection("movies").countDocuments({
      year:{
        $gt:2024
      }
    });

    return NextResponse.json({
      movies,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
