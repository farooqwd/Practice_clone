"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

export default function HomePage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 18;

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

  const fetchMovies = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?page=${page}&limit=${pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data = await res.json();

      const moviesWithPosters = await Promise.all(
        (Array.isArray(data.movies) ? data.movies : []).map(async (movie: Movie) => {
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

  const searchMovies = async (term: string) => {
    if (!term.trim()) {
      fetchMovies(1);
      setCurrentPage(1);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error("Failed to search movies");
      const data = await res.json();

      const moviesWithPosters = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (movie: Movie) => {
          const poster = await getPoster(movie.id);
          return { ...movie, poster };
        })
      );

      setMovies(moviesWithPosters);
      setTotalPages(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchByGenre = async (genre: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/genre?name=${encodeURIComponent(genre)}`);
      if (!res.ok) throw new Error("Failed to fetch movies by genre");
      const data = await res.json();

      const moviesWithPosters = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (movie: Movie) => {
          const poster = await getPoster(movie.id);
          return { ...movie, poster };
        })
      );

      setMovies(moviesWithPosters);
      setTotalPages(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetMovies = () => {
    setCurrentPage(1);
    fetchMovies(1);
  };

  useEffect(() => {
    fetchMovies(currentPage);
  }, [currentPage]);

  const handleMovieClick = (imdbId: string) => {
    router.push(`/watch/${imdbId}`);
  };

  return (
    <div className="bg-[#141414] text-white min-h-screen flex flex-col">
      <Header onSearch={searchMovies} onGenreSelect={fetchByGenre} onReset={resetMovies} />

      <main className="flex-grow p-8">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid grid-cols-6 gap-4">
              {movies.map((movie) => (
                <div
                  key={movie._id}
                  onClick={() => handleMovieClick(movie.id)}
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
                  <div className="p-2 text-sm">{movie.title}</div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
