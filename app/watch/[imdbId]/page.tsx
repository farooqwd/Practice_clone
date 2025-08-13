"use client";
import { useParams } from "next/navigation";

export default function WatchPage() {
  const { imdbId } = useParams();

  return (
    <div className="w-screen h-screen bg-black">
      <iframe
        src={`/api/vidsrc/movie/${imdbId}`} // movie
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
}
