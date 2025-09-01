import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 24;
  
  // Add reasonable limits to prevent performance issues
  const maxPage = 1000;
  const safePage = Math.min(Math.max(1, page), maxPage);
  const skip = (safePage - 1) * limit;

  try {
    const client = await clientPromise;
    const db = client.db("new_data");

    // Use parallel execution for better performance
    const [movies, totalCount] = await Promise.all([
      // Get paginated movies
      db.collection("movies")
        .find({ year: { $gt: 1970 } })
        .sort({ year: -1, _id: 1 }) // Add secondary sort for consistency
        .skip(skip)
        .limit(limit)
        .toArray(),
      
      // Get total count
      db.collection("movies")
        .countDocuments({ year: { $gt: 1970 } })
    ]);

    const actualTotalPages = Math.ceil(totalCount / limit);
    const finalTotalPages = Math.min(actualTotalPages, maxPage);

    // Ensure we don't return empty results for pages beyond available data
    const currentPage = Math.min(safePage, finalTotalPages);

    return NextResponse.json({
      movies,
      totalPages: finalTotalPages,
      currentPage: currentPage,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}