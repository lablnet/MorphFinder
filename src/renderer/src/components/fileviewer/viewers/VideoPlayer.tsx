import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { ViewerProps } from '../types';
import { useVideoPlayer } from '@renderer/hooks';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPlayer({ filePath, node }: ViewerProps): React.JSX.Element {
  const {
    videoRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    progress,
    src,
    togglePlay,
    toggleMute,
    handleSeek,
    handleFullscreen,
  } = useVideoPlayer({ filePath });

  return (
    <div className="flex h-full flex-col">
      {/* Video area */}
      <div className="flex flex-1 items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={src}
          className="max-h-full max-w-full"
          onClick={togglePlay}
          title={node.name}
        />
      </div>

      {/* Controls */}
      <div className="flex h-12 shrink-0 flex-col justify-center border-t border-shell-border bg-shell-surface px-3">
        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="file-viewer-range mb-1 h-1 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, var(--shell-accent) ${progress}%, var(--shell-border) ${progress}%)`,
          }}
        />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </Button>
          <span className="text-xs text-current/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={handleFullscreen} title="Fullscreen">
            <Maximize size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
