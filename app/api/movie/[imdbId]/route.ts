import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  req: Request,
  { params }: { params: { imdbId: string } }
) {
  const { imdbId } = params;

  try {
    const client = await clientPromise;
    const db = client.db("new_data");
    const movie = await db.collection("movies").findOne({ id: imdbId });

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Helper function to parse stringified arrays
    const parseStringArray = (str: string) => {
      try {
        return JSON.parse(str.replace(/'/g, '"'));
      } catch {
        return str.split(',').map(item => item.trim().replace(/^['"]|['"]$/g, ''));
      }
    };

    // Format response data
    const responseData = {
      title: movie.title,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration,
      genres: Array.isArray(movie.genres) ? movie.genres : parseStringArray(movie.genres),
      description: movie.description,
      cast: Array.isArray(movie.stars) ? movie.stars : parseStringArray(movie.stars),
      director: Array.isArray(movie.directors) ? movie.directors[0] : parseStringArray(movie.directors)[0],
      poster: null // Add your poster field if available
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie data" },
      { status: 500 }
    );
  }
}