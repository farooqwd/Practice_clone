// components/watch/VideoPlayer.tsx
interface VideoPlayerProps {
  loading: boolean;
  activeUrl: string;
  title?: string;
}

const VideoPlayer = ({ loading, activeUrl, title }: VideoPlayerProps) => {
  return (
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
          title={title ? `Streaming ${title}` : "Movie player"}
          loading="eager"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
          No streaming sources available
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;