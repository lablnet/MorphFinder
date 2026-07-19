import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AirShareHeader } from '../../src/renderer/src/components/airshare/AirShareHeader';
import { AirShareConfigCard } from '../../src/renderer/src/components/airshare/AirShareConfigCard';
import { AirShareQrPanel } from '../../src/renderer/src/components/airshare/AirShareQrPanel';
import { AirShareReceivedList } from '../../src/renderer/src/components/airshare/AirShareReceivedList';
import { AirShareHub } from '../../src/renderer/src/components/airshare/AirShareHub';
import type { WebShareSession, ReceivedFile } from '../../src/shared/types/webShare';

describe('AirShare UI Components Unit Tests', () => {
  const mockSession: WebShareSession = {
    id: 'airshare-session-1',
    targetPath: '/Users/test/Projects',
    fileName: 'Projects',
    isDirectory: true,
    fileSize: 0,
    lanIp: '192.168.1.120',
    port: 8888,
    shareUrl: 'http://192.168.1.120:8888/share/airshare-session-1/',
    qrSvg: '<svg id="airshare-qr"></svg>',
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000,
    downloadCount: 4,
    allowInbound: true,
    receivedFiles: [],
  };

  const mockReceived: ReceivedFile[] = [
    {
      id: 'rec-1',
      fileName: 'photo.jpg',
      fileSize: 2097152,
      senderIp: '192.168.1.45',
      receivedAt: Date.now(),
      savedPath: '/Users/test/Downloads/MorphFinder_Received/photo.jpg',
    },
  ];

  beforeEach(() => {
    Object.defineProperty(window, 'morph', {
      value: {
        invoke: vi.fn().mockImplementation((channel) => {
          if (channel === 'webshare:getActive') return Promise.resolve(mockSession);
          if (channel === 'airshare:getReceived') return Promise.resolve(mockReceived);
          if (channel === 'shell:selectFolder') return Promise.resolve('/Users/test/Documents');
          return Promise.resolve(null);
        }),
        on: vi.fn().mockReturnValue(() => {}),
      },
      configurable: true,
      writable: true,
    });
  });

  it('renders AirShareHeader with status badge', () => {
    render(<AirShareHeader isServerActive={true} onStop={() => {}} />);
    expect(screen.getByText('Morph AirShare')).toBeDefined();
    expect(screen.getByText('Server Online')).toBeDefined();
  });

  it('renders AirShareConfigCard and handles folder picker', () => {
    const handleSelect = vi.fn();
    const handleToggle = vi.fn();
    render(
      <AirShareConfigCard
        session={mockSession}
        allowInbound={true}
        onSelectFolder={handleSelect}
        onToggleInbound={handleToggle}
      />
    );
    expect(screen.getByText('/Users/test/Projects')).toBeDefined();
    const btn = screen.getByText('Choose Folder');
    fireEvent.click(btn);
    expect(handleSelect).toHaveBeenCalled();
  });

  it('renders AirShareQrPanel metrics and copy link button', () => {
    const handleCopy = vi.fn();
    render(<AirShareQrPanel session={mockSession} copied={false} onCopy={handleCopy} />);
    expect(screen.getByText('http://192.168.1.120:8888/share/airshare-session-1/')).toBeDefined();
    const copyBtn = screen.getByText('Copy Link');
    fireEvent.click(copyBtn);
    expect(handleCopy).toHaveBeenCalled();
  });

  it('renders AirShareReceivedList with received items', () => {
    const handleOpenFolder = vi.fn();
    render(<AirShareReceivedList receivedFiles={mockReceived} onOpenFolder={handleOpenFolder} />);
    expect(screen.getByText('photo.jpg')).toBeDefined();
    expect(screen.getByText(/192\.168\.1\.45/)).toBeDefined();
  });

  it('renders full AirShareHub tool page', () => {
    render(<AirShareHub />);
    expect(screen.getByText('Morph AirShare')).toBeDefined();
  });
});
