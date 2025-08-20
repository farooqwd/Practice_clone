"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 

export default function WatchPage() {
  const params = useParams<{ imdbId: string }>();
  const imdbId = params?.imdbId;
  const router = useRouter();

  const [providers, setProviders] = useState<{ name: string; url: string }[]>([]);
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [movieData, setMovieData] = useState<{
    title: string;
    year: string;
    rating: string;
    duration: string;
    genres: string[];
    description: string;
    cast: string[];
    director: string;
  } | null>(null);

  useEffect(() => {
    if (!imdbId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const providersRes = await fetch(`/api/vidsrc/movie/${imdbId}`);
        const providersData = await providersRes.json();
        setProviders(providersData.providers || []);
        if (providersData.providers?.length > 0) {
          setActiveUrl(providersData.providers[0].url);
        }

        const movieRes = await fetch(`/api/movie/${imdbId}`);
        const movieData = await movieRes.json();
        setMovieData({
          title: movieData.title || "Unknown Title",
          year: movieData.year || "Unknown Year",
          rating: movieData.rating || "N/A",
          duration: movieData.duration || "N/A",
          genres: movieData.genres || [],
          description: movieData.description || "No description available.",
          cast: movieData.cast || [],
          director: movieData.director || "Unknown Director",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [imdbId]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-6 max-w-[1800px] mx-auto">
        {/* Left Column - Video Player (2/3 width) */}
        <div className="lg:w-2/3">
          {/* Video Container */}
          <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="animate-pulse text-gray-500">Loading player...</div>
              </div>
            ) : activeUrl ? (
              <iframe
                src={activeUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
                No streaming sources available
              </div>
            )}
          </div>

          {/* Server Selection */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">SERVER</h2>
            <div className="flex flex-wrap gap-2">
              {providers.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveUrl(p.url)}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    activeUrl === p.url
                      ? "bg-[#00a3ff] text-white"
                      : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Movie Info (1/3 width) */}
        <div className="lg:w-1/3">
          <div className="bg-[#1a1a1a] rounded-lg p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6"></div>
              </div>
            ) : movieData ? (
              <>
                <h1 className="text-2xl font-bold mb-2">{movieData.title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-[#00a3ff]">{movieData.year}</span>
                  <span className="text-yellow-400">★ {movieData.rating}</span>
                  <span>{movieData.duration}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {movieData.genres.map((genre, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#2a2a2a] rounded text-xs hover:bg-[#00a3ff] hover:text-white transition cursor-pointer"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{movieData.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Director</h3>
                    <p>{movieData.director}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Cast</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {movieData.cast.map((actor, i) => (
  <span
    key={i}
    onClick={() => router.push(`/?actor=${encodeURIComponent(actor)}&page=1`)}
    className="px-2 py-1 bg-[#2a2a2a] rounded text-xs hover:bg-[#00a3ff] hover:text-white transition cursor-pointer"
  >
    {actor}
  </span>
))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-400">Failed to load movie data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}