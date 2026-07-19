import QRCode from 'qrcode';

/**
 * Industry-standard specification-compliant QR code generator using `qrcode`.
 * Generates 100% compliant QR code SVG strings readable by standard phone cameras & online QR tools.
 */
export function generateCompliantQrSvg(text: string): string {
  try {
    // QRCode.toString with sync option 'svg'
    const svg = QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return typeof svg === 'string' ? svg : '';
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50" fill="red">QR Error</text></svg>`;
  }
}
export async function generateCompliantQrSvgAsync(text: string): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50" fill="red">QR Error</text></svg>`;
  }
}
