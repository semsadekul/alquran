/**
 * Generate PWA icons (192x192 and 512x512 PNG) using pure Node.js.
 * No external dependencies — uses built-in zlib for PNG compression.
 * Design: Islamic crescent + star on the app's theme green background.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const THEME_GREEN = [0x0a, 0x36, 0x22]; // #0a3622
const GOLD = [0xd8, 0xb3, 0x5d];        // #d8b35d
const LIGHT_GOLD = [0xf0, 0xd8, 0x8a];  // #f0d88a

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t.push(c);
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPNG(width, height, pixels) {
  // pixels: flat array of RGBA bytes, length = width * height * 4
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter: None
    const offset = y * width * 4;
    pixels.copy ? pixels.copy(row, 1, offset, offset + width * 4)
                : Buffer.from(pixels.slice(offset, offset + width * 4)).copy(row, 1);
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  const setPixel = (x, y, color) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
    pixels[i + 3] = 255;
  };

  // Fill background with theme green
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(x, y, THEME_GREEN);
    }
  }

  // Draw crescent moon
  const moonR = r;
  const offset = size * 0.08;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const distOuter = Math.sqrt(dx * dx + dy * dy);
      const distInner = Math.sqrt((dx - offset) * (dx - offset) + dy * dy);
      if (distOuter <= moonR && distInner > moonR * 0.72) {
        setPixel(x, y, GOLD);
      }
    }
  }

  // Draw five-pointed star
  const starCx = cx + r * 0.35;
  const starCy = cy - r * 0.3;
  const starR = size * 0.12;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - starCx;
      const dy = y - starCy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > starR * 0.45 && dist < starR) {
        const angle = Math.atan2(dy, dx);
        // Five-pointed star shape
        const starAngle = (Math.atan2(Math.sin(5 * angle), Math.cos(5 * angle)) + Math.PI) / (2 * Math.PI);
        const starDist = 0.5 + 0.5 * Math.cos(5 * angle + Math.PI / 2);
        // Simplified: use distance-based star
        const nAngle = Math.atan2(dy, dx);
        const pointAngle = Math.round(nAngle / (Math.PI * 2 / 5)) * (Math.PI * 2 / 5);
        const angleDiff = Math.abs(nAngle - pointAngle);
        const maxRAtAngle = starR * (1 - angleDiff * 1.8);
        if (dist < maxRAtAngle && dist > starR * 0.2) {
          setPixel(x, y, LIGHT_GOLD);
        }
      }
    }
  }

  return pixels;
}

const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });

for (const size of [192, 512]) {
  const png = createPNG(size, size, drawIcon(size));
  fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${png.length} bytes)`);
}
