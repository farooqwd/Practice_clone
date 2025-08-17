"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function WatchPage() {
  const { imdbId } = useParams();
  const [activeServer, setActiveServer] = useState(0); // Using index to match your PROVIDERS array
  const [isLoading, setIsLoading] = useState(false);

  // Your server providers from the route code
  const PROVIDERS = [
    { name: "AutoEmbed", index: 0 },
    { name: "VidSrc.me", index: 1 },
    { name: "VidSrc.xyz", index: 2 },
    { name: "MoviesAPI", index: 3 },
  ];

  // Mock movie data
  const movieData = {
    title: "WEAPONS",
    year: 2024,
    rating: "6.5",
    duration: "1h 39m",
    quality: "HD",
    description: "Multiple seemingly unrelated stories of people in a small town collide in a violent confrontation when a high school party is interrupted by strangers with weapons.",
    genres: ["Horror", "Thriller"],
    cast: ["Paul Rust", "Maya Hawke", "Lukas Gage"],
    details: {
      released: "2024",
      country: "United States",
      director: "Zach Cregger",
      production: "New Line Cinema"
    }
  };

  const handleServerChange = (index: number) => {
    setActiveServer(index);
    setIsLoading(true);
    // The iframe will reload automatically when src changes
  };

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen">
      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Video Player Container */}
          <div className="lg:w-3/4">
            {/* Player Container */}
            <div className="relative bg-black h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Switching Server...</p>
                  </div>
                </div>
              )}
              
              <iframe
                key={activeServer} // Force re-render when server changes
                src={`/api/vidsrc/movie/${imdbId}?server=${activeServer}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </div>

            {/* Server Selection */}
            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">SERVER</h3>
              <div className="flex flex-wrap gap-2">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.index}
                    onClick={() => handleServerChange(provider.index)}
                    className={`px-4 py-2 rounded-md text-sm ${
                      activeServer === provider.index
                        ? "bg-blue-600"
                        : "bg-[#2a2a2a] hover:bg-[#333333]"
                    }`}
                  >
                    {provider.name} (HD)
                  </button>
                ))}
              </div>
            </div>

            {/* Download/Report Section */}
            <div className="mt-4 flex justify-between">
              <button className="flex items-center text-blue-400 hover:text-blue-300 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button className="text-gray-400 hover:text-gray-300 text-sm">
                Report broken link
              </button>
            </div>
          </div>

          {/* Right Column - Movie Info */}
          <div className="lg:w-1/4">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h1 className="text-2xl font-bold">
                {movieData.title} <span className="text-blue-400">({movieData.year})</span>
              </h1>
              
              <div className="flex items-center mt-2 space-x-3">
                <span className="bg-blue-500 text-xs px-2 py-1 rounded">HD</span>
                <span className="text-yellow-400 text-sm">★ {movieData.rating}</span>
                <span className="text-gray-300 text-sm">{movieData.duration}</span>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Synopsis</h3>
                <p className="text-gray-300 text-sm">{movieData.description}</p>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Released</div>
                  <div>{movieData.details.released}</div>
                  <div className="text-gray-400">Country</div>
                  <div>{movieData.details.country}</div>
                  <div className="text-gray-400">Director</div>
                  <div>{movieData.details.director}</div>
                  <div className="text-gray-400">Production</div>
                  <div>{movieData.details.production}</div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {movieData.genres.map((genre, index) => (
                    <span key={index} className="bg-[#2a2a2a] text-sm px-3 py-1 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {movieData.cast.map((actor, index) => (
                    <span key={index} className="bg-[#2a2a2a] text-sm px-3 py-1 rounded-full">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">YOU MAY ALSO LIKE</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex gap-3 cursor-pointer hover:bg-[#2a2a2a] p-2 rounded">
                    <div className="w-16 h-24 bg-[#2a2a2a] rounded"></div>
                    <div>
                      <h4 className="font-medium">Similar Movie {item}</h4>
                      <p className="text-gray-400 text-sm">2024 • HD</p>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 text-xs">★ 6.{item}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
