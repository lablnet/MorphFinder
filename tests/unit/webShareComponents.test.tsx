import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebShareDialog } from '../../src/renderer/src/components/webshare/WebShareDialog';
import { WebShareQrCard } from '../../src/renderer/src/components/webshare/WebShareQrCard';
import { WebShareInfoBanner } from '../../src/renderer/src/components/webshare/WebShareInfoBanner';
import { WebShareControls } from '../../src/renderer/src/components/webshare/WebShareControls';
import { WebShareModal } from '../../src/renderer/src/components/webshare/WebShareModal';
import type { WebShareSession } from '../../src/shared/types/webShare';

describe('WebShare UI Components Unit Tests', () => {
  const mockSession: WebShareSession = {
    id: 'test-session-123',
    targetPath: '/tmp/test.txt',
    fileName: 'test.txt',
    isDirectory: false,
    fileSize: 1048576,
    lanIp: '192.168.1.50',
    port: 5000,
    shareUrl: 'http://192.168.1.50:5000/share/test-session-123/test.txt',
    qrSvg: '<svg id="test-qr"></svg>',
    createdAt: Date.now(),
    expiresAt: Date.now() + 900000,
    downloadCount: 3,
  };

  beforeEach(() => {
    Object.defineProperty(window, 'morph', {
      value: {
        invoke: vi.fn().mockImplementation((channel) => {
          if (channel === 'webshare:getActive') return Promise.resolve(mockSession);
          if (channel === 'webshare:stop') return Promise.resolve();
          return Promise.resolve(null);
        }),
        on: vi.fn().mockReturnValue(() => {}),
      },
      configurable: true,
      writable: true,
    });
  });

  it('renders WebShareDialog when open', () => {
    render(
      <WebShareDialog isOpen={true} onClose={() => {}}>
        <div>Dialog Content</div>
      </WebShareDialog>
    );
    expect(screen.getByText('Dialog Content')).toBeDefined();
  });

  it('renders WebShareQrCard with session info and QR SVG', () => {
    const handleCopy = vi.fn();
    render(<WebShareQrCard session={mockSession} copied={false} onCopy={handleCopy} />);
    expect(screen.getByText('test.txt')).toBeDefined();
    expect(screen.getByText('http://192.168.1.50:5000/share/test-session-123/test.txt')).toBeDefined();

    const copyBtn = screen.getByText('Copy');
    fireEvent.click(copyBtn);
    expect(handleCopy).toHaveBeenCalled();
  });

  it('renders WebShareInfoBanner metrics', () => {
    render(<WebShareInfoBanner session={mockSession} remainingFormatted="14:59" />);
    expect(screen.getByText('LAN Only')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('14:59')).toBeDefined();
  });

  it('renders WebShareControls buttons and triggers callbacks', () => {
    const handleStop = vi.fn();
    const handleClose = vi.fn();
    render(<WebShareControls onStop={handleStop} onClose={handleClose} isSharing={true} />);

    const stopBtn = screen.getByText('Stop Sharing');
    fireEvent.click(stopBtn);
    expect(handleStop).toHaveBeenCalled();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders full WebShareModal component', async () => {
    const handleClose = vi.fn();
    render(<WebShareModal isOpen={true} onClose={handleClose} />);
    expect(screen.getByText('Local Network Share')).toBeDefined();
  });
});
