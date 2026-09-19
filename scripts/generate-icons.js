// Generates public/icons/icon-192.png and icon-512.png: a navy square
// with a simple white bus glyph, built pixel-by-pixel and encoded to
// PNG using only Node's built-in zlib (no canvas/image dependency).
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function buildPng(size, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const rowBytes = size * 4;
  const raw = Buffer.alloc((rowBytes + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0; // filter: none
    pixels[y].copy(raw, y * (rowBytes + 1) + 1);
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function generateIcon(size) {
  const navy = [24, 38, 66, 255];
  const white = [246, 243, 236, 255];
  const amber = [232, 169, 58, 255];
  const rows = [];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(size * 4);
    for (let x = 0; x < size; x++) {
      let color = navy;

      // bus body: rounded rectangle roughly centered
      const bx0 = size * 0.18, bx1 = size * 0.82;
      const by0 = size * 0.32, by1 = size * 0.66;
      const inBody = x >= bx0 && x <= bx1 && y >= by0 && y <= by1;

      // windows: a lighter band near the top of the body
      const windowBand = inBody && y < by0 + (by1 - by0) * 0.45;

      // wheels: two circles under the body
      const wheelR = size * 0.07;
      const wheel1 = dist(x, y, size * 0.32, by1 + wheelR * 0.6) <= wheelR;
      const wheel2 = dist(x, y, size * 0.68, by1 + wheelR * 0.6) <= wheelR;

      if (wheel1 || wheel2) color = amber;
      else if (windowBand) color = white;
      else if (inBody) color = white;

      row[x * 4] = color[0];
      row[x * 4 + 1] = color[1];
      row[x * 4 + 2] = color[2];
      row[x * 4 + 3] = color[3];
    }
    rows.push(row);
  }
  return buildPng(size, rows);
}

function dist(x, y, cx, cy) {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "icon-192.png"), generateIcon(192));
fs.writeFileSync(path.join(outDir, "icon-512.png"), generateIcon(512));
console.log("Icons generated.");
