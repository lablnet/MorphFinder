import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { ViewerProps } from '../types';
import { formatBytes } from '@renderer/lib/format';
import { useAudioPlayer } from '@renderer/hooks';

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ filePath, node }: ViewerProps): React.JSX.Element {
  const {
    audioRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    progress,
    src,
    togglePlay,
    toggleMute,
    handleSeek,
  } = useAudioPlayer({ filePath });

  return (
    <div className="flex h-full flex-col items-center justify-center bg-shell-surface p-8">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Album art placeholder */}
      <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--shell-accent)]/20 to-[color:var(--shell-accent)]/5 shadow-lg">
        <Music size={64} className="text-[color:var(--shell-accent)]/60" />
      </div>

      {/* Track info */}
      <h2 className="mb-1 text-lg font-semibold">{node.name}</h2>
      <p className="mb-6 text-xs text-current/50">
        {node.extension.toUpperCase()} • {formatBytes(node.sizeInBytes)}
      </p>

      {/* Progress */}
      <div className="w-full max-w-md">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="file-viewer-range mb-2 h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, var(--shell-accent) ${progress}%, var(--shell-border) ${progress}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-current/50">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--shell-accent)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <div className="w-7" /> {/* Spacer for visual balance */}
      </div>
    </div>
  );
}
