import mapboxgl from 'mapbox-gl';

const BASE62_CHARS =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function toBase62(num: number, length: number = 4): string {
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result.padStart(length, '0');
}

function fromBase62(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = result * 62 + BASE62_CHARS.indexOf(str[i]);
  }
  return result;
}

export function encodeBoundsBase62(bounds: mapboxgl.LngLatBounds): string {
  const values = [
    bounds.getNorth(),
    bounds.getEast(),
    bounds.getSouth(),
    bounds.getWest(),
  ];

  return values
    .map((v) => Math.round(v * 1000) + 90000)
    .map((v) => toBase62(v, 4))
    .join('');
}

export function decodeBoundsBase62(
  encoded: string
): mapboxgl.LngLatBounds | null {
  try {
    if (encoded.length !== 16) return null;

    const parts = [
      encoded.slice(0, 4),
      encoded.slice(4, 8),
      encoded.slice(8, 12),
      encoded.slice(12, 16),
    ];

    const values = parts.map((p) => (fromBase62(p) - 90000) / 1000);
    const [north, east, south, west] = values;

    return new mapboxgl.LngLatBounds([west, south], [east, north]);
  } catch {
    return null;
  }
}

export function decodeBoundsToString(encoded: string): string | null {
  try {
    if (encoded.length !== 16) return null;
    const parts = [
      encoded.slice(0, 4),
      encoded.slice(4, 8),
      encoded.slice(8, 12),
      encoded.slice(12, 16),
    ];
    const [north, east, south, west] = parts.map(
      (p) => (fromBase62(p) - 90000) / 1000
    );
    return `${west},${south},${east},${north}`;
  } catch {
    return null;
  }
}
