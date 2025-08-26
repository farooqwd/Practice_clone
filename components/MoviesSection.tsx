"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StarIcon } from "@heroicons/react/16/solid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";

interface Movie {
  _id: string;
  id: string; // IMDb ID like "tt21815562"
  title: string;
  description: string;
  rating?: number;
  genres?: string[];
  poster?: string;
  year?: number;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 18;

  // Read filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";
  const genreQuery = searchParams.get("genre") || "";
  const actorQuery = searchParams.get("actor") || "";

  // Fetch posters from our API
  const getPoster = async (imdbId: string) => {
    try {
      const res = await fetch(`/api/poster?id=${imdbId}`);
      const data = await res.json();
      return data.poster || "/placeholder.jpg";
    } catch {
      return "/placeholder.jpg";
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let url = "";

      if (searchQuery) {
        url = `/api/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${pageSize}`;
      } else if (genreQuery) {
        url = `/api/genre?name=${encodeURIComponent(genreQuery)}&page=${currentPage}&limit=${pageSize}`;
      } else if (actorQuery) {
        url = `/api/actor?name=${encodeURIComponent(actorQuery)}&page=${currentPage}&limit=${pageSize}`;
      } else {
        url = `/api/movies?page=${currentPage}&limit=${pageSize}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data = await res.json();

      const moviesArray = Array.isArray(data.movies) ? data.movies : data;
      const moviesWithPosters = await Promise.all(
        (moviesArray || []).map(async (movie: Movie) => {
          const poster = await getPoster(movie.id);
          return { ...movie, poster };
        })
      );

      setMovies(moviesWithPosters);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch on the homepage route, and react to all relevant params
  useEffect(() => {
    if (pathname !== "/") return;
    fetchMovies();
  }, [pathname, currentPage, searchQuery, genreQuery, actorQuery]);

  // Handlers update the URL (clear conflicting params)
  const handleSearch = (term: string) => {
    const params = new URLSearchParams();
    if (term.trim()) params.set("q", term.trim());
    params.set("page", "1");
    // clear others
    params.delete("genre");
    params.delete("actor");
    router.push(`/?${params.toString()}`);
  };

  const handleGenre = (genre: string) => {
    const params = new URLSearchParams();
    if (genre.trim()) params.set("genre", genre.trim());
    params.set("page", "1");
    // clear others
    params.delete("q");
    params.delete("actor");
    router.push(`/?${params.toString()}`);
  };

  const resetMovies = () => {
    router.push("/?page=1");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-[#141414] text-white min-h-screen flex flex-col">
      <Header onSearch={handleSearch} onGenreSelect={handleGenre} onReset={resetMovies} />

      <main className="flex-grow p-8">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid grid-cols-6 gap-4">
              {movies.map((movie) => (
                <Link
                  key={movie._id}
                  href={`/watch/${movie.id}`}
                  prefetch={false}
                  className="cursor-pointer bg-gray-800 rounded overflow-hidden transform transition duration-300 hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-[300px] object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {movie.rating ?? "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 text-sm">{movie.title}</div>
                  <div className="p-1 text-sm">{movie.year}</div>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
