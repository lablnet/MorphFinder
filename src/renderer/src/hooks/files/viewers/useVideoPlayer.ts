import { useRef, useState, useCallback, useEffect } from 'react';
import { morphFileUrl } from '../../../components/fileviewer/types';

interface UseVideoPlayerOptions {
  filePath: string;
}

export function useVideoPlayer({ filePath }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const src = morphFileUrl(filePath);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (video === null) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video === null) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video === null) return;
    const time = Number(event.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (video === null) return;
    void video.requestFullscreen();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;

    const onPlay = (): void => setIsPlaying(true);
    const onPause = (): void => setIsPlaying(false);
    const onTimeUpdate = (): void => {
      setCurrentTime(video.currentTime);
      setProgress(video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0);
    };
    const onLoadedMetadata = (): void => setDuration(video.duration);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  return {
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
  };
}
