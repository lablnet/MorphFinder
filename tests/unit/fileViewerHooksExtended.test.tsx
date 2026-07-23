import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from '../../src/renderer/src/hooks/files/viewers/useAudioPlayer';
import { useImageViewer } from '../../src/renderer/src/hooks/files/viewers/useImageViewer';
import { useVideoPlayer } from '../../src/renderer/src/hooks/files/viewers/useVideoPlayer';

describe('File Viewer Hooks Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAudioPlayer manages media state, seeking, and play/pause events', () => {
    const { result } = renderHook(() => useAudioPlayer({ filePath: '/tmp/song.mp3' }));
    expect(result.current.src).toContain('/tmp/song.mp3');
    expect(result.current.isPlaying).toBe(false);

    // Mock HTMLAudioElement
    const listeners = new Map<string, Function>();
    const mockAudio: any = {
      paused: true,
      muted: false,
      currentTime: 0,
      duration: 100,
      play: vi.fn().mockImplementation(() => {
        mockAudio.paused = false;
        listeners.get('play')?.();
      }),
      pause: vi.fn().mockImplementation(() => {
        mockAudio.paused = true;
        listeners.get('pause')?.();
      }),
      addEventListener: vi.fn((event, fn) => listeners.set(event, fn)),
      removeEventListener: vi.fn((event) => listeners.delete(event)),
    };

    (result.current.audioRef as any).current = mockAudio;

    // Trigger effect
    renderHook(() => useAudioPlayer({ filePath: '/tmp/song.mp3' }));

    act(() => {
      result.current.togglePlay();
    });
    expect(mockAudio.play).toHaveBeenCalled();

    act(() => {
      result.current.toggleMute();
    });
    expect(mockAudio.muted).toBe(true);

    act(() => {
      result.current.handleSeek({ target: { value: '50' } } as any);
    });
    expect(mockAudio.currentTime).toBe(50);
  });

  it('useImageViewer handles zoom, pan, rotation, and dimensions', () => {
    const { result } = renderHook(() => useImageViewer({ filePath: '/tmp/photo.jpg' }));
    expect(result.current.zoom).toBe(1);

    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(1.25);

    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.zoom).toBe(1);

    act(() => {
      result.current.rotate();
    });
    expect(result.current.rotation).toBe(90);

    act(() => {
      result.current.handleLoad({ currentTarget: { naturalWidth: 800, naturalHeight: 600 } } as any);
    });
    expect(result.current.dimensions).toEqual({ w: 800, h: 600 });

    act(() => {
      result.current.fitToView();
    });
    expect(result.current.zoom).toBe(1);
    expect(result.current.rotation).toBe(0);

    // Mouse panning
    act(() => {
      result.current.zoomIn(); // zoom > 1 allows panning
    });
    act(() => {
      result.current.handleMouseDown({ preventDefault: vi.fn(), clientX: 100, clientY: 100 } as any);
    });
    expect(result.current.isPanning).toBe(true);

    act(() => {
      result.current.handleMouseMove({ clientX: 120, clientY: 130 } as any);
    });
    expect(result.current.pan).toEqual({ x: 20, y: 30 });

    act(() => {
      result.current.handleMouseUp();
    });
    expect(result.current.isPanning).toBe(false);

    // Wheel zooming
    act(() => {
      result.current.handleWheel({ preventDefault: vi.fn(), deltaY: -100 } as any);
    });
    expect(result.current.zoom).toBeGreaterThan(1.25);
  });

  it('useVideoPlayer manages video playback controls', () => {
    const { result } = renderHook(() => useVideoPlayer({ filePath: '/tmp/clip.mp4' }));
    expect(result.current.src).toContain('/tmp/clip.mp4');

    const mockVideo: any = {
      paused: true,
      muted: false,
      currentTime: 0,
      duration: 120,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    (result.current.videoRef as any).current = mockVideo;

    act(() => {
      result.current.togglePlay();
    });
    expect(mockVideo.play).toHaveBeenCalled();

    act(() => {
      result.current.toggleMute();
    });
    expect(mockVideo.muted).toBe(true);
  });
});
