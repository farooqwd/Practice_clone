import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 24;
  const skip = (page - 1) * limit;

  try {
    const client = await clientPromise;
    const db = client.db("new_data");

    const result = await db.collection("movies").aggregate([
      { $match: { year: { $gt: 1970 } } },   // filter
      {
        $facet: {
          movies: [
            { $sort: { year: -1 } },         // latest first
            { $skip: skip },                 // pagination
            { $limit: limit }
          ],
          totalCount: [
            { $count: "count" }              // count total docs
          ]
        }
      }
    ]).toArray();

    const movies = result[0].movies;
    const totalCount = result[0].totalCount[0]?.count || 0;

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
