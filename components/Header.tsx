import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { FilmIcon } from "@heroicons/react/16/solid";

interface HeaderProps {
  onSearch: (term: string) => void;
  onGenreSelect: (genre: string) => void;
  onReset: () => void;
}

export default function Header({ onSearch, onGenreSelect, onReset }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showGenres, setShowGenres] = useState(false);

  const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"];

  return (
    <header className="bg-gradient-to-b from-black/90 to-black sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo & Title - Now Clickable */}
      <Link
  href="/"
  onClick={(e) => {
    e.preventDefault(); // Prevent page reload
    onReset(); // Call the function from HomePage
  }}
  className="flex items-center gap-3 hover:opacity-90 transition"
>
  <FilmIcon className="w-10 h-10 text-red-500" />
  <h1 className="text-2xl font-bold text-white tracking-wide">
    Movie<span className="text-red-500">Explorer</span>
  </h1>
</Link>



        {/* Search Bar */}
        <div className="relative flex items-center w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => onSearch(searchTerm)} // from Header.tsx
            className="ml-2 px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition"
          >
            Search
          </button>
        </div>

        {/* Genre Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowGenres((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
          >
            Genres
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${showGenres ? "rotate-180" : ""}`}
            />
          </button>

          {showGenres && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    onGenreSelect(genre);
                    setShowGenres(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-red-600 hover:text-white transition"
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
