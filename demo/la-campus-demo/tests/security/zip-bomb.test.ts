/**
 * These exercise real zip parsing through adm-zip, which is Node-side code:
 * under the suite's default jsdom environment AdmZip round-trips to an empty
 * entry list and every assertion here silently passes for the wrong reason.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import AdmZip from 'adm-zip';
import {
  readZipEntry,
  assertArchiveWithinLimits,
  ZipLimitError,
  MAX_ARCHIVE_ENTRIES,
} from '@/lib/zip-limits';

/**
 * Builds a real zip whose single entry expands to `size` bytes of repeated
 * data. Highly compressible, so the archive itself stays tiny -- that ratio
 * is the whole point of a zip bomb.
 */
function bombArchive(size: number, name = 'bomb.txt'): Buffer {
  const zip = new AdmZip();
  zip.addFile(name, Buffer.alloc(size, 0x41));
  return zip.toBuffer();
}

/**
 * Rewrites every occurrence of `from` as a little-endian uint32 to `to`,
 * which patches an entry's uncompressed-size field in both the local file
 * header and the central directory. This is how an attacker makes an entry
 * lie about how large it really is.
 */
function patchDeclaredSize(buf: Buffer, from: number, to: number): Buffer {
  const out = Buffer.from(buf);
  for (let i = 0; i + 4 <= out.length; i++) {
    if (out.readUInt32LE(i) === from) out.writeUInt32LE(to, i);
  }
  return out;
}

const entryOf = (buf: Buffer) => new AdmZip(buf).getEntries()[0];

describe('Security: zip bomb limits', () => {
  it('rejects an entry that honestly declares more than the limit', () => {
    const entry = entryOf(bombArchive(4 * 1024 * 1024));

    expect(() => readZipEntry(entry, 1024 * 1024, 'bomb.txt')).toThrow(
      ZipLimitError
    );
    expect(() => readZipEntry(entry, 1024 * 1024, 'bomb.txt')).toThrow(
      /over the 1048576 byte limit/
    );
  });

  it('rejects an entry that declares zero bytes', () => {
    // The bypass this helper exists for. adm-zip only applies its own
    // maxOutputLength cap when the declared size is > 0, so a size of 0 is
    // both uncapped by the library and invisible to a `size > limit` check.
    const raw = bombArchive(4 * 1024 * 1024);
    const lying = patchDeclaredSize(raw, 4 * 1024 * 1024, 0);
    const entry = entryOf(lying);

    expect(entry.header.size).toBe(0);
    expect(entry.header.size > 1024 * 1024).toBe(false); // a size check alone passes it

    expect(() => readZipEntry(entry, 1024 * 1024, 'bomb.txt')).toThrow(
      ZipLimitError
    );
    expect(() => readZipEntry(entry, 1024 * 1024, 'bomb.txt')).toThrow(
      /cannot be bounded safely/
    );
  });

  it('pins the adm-zip behaviour the declared-size check relies on', () => {
    // readZipEntry trusts header.size because adm-zip passes it to zlib as
    // maxOutputLength, so an entry cannot inflate past what it declared.
    // If a future adm-zip stops doing that, this test fails and the comment
    // in lib/zip-limits.ts stops being true -- which is the point.
    const raw = bombArchive(4 * 1024 * 1024);
    const understated = patchDeclaredSize(raw, 4 * 1024 * 1024, 1024);
    const entry = entryOf(understated);

    expect(entry.header.size).toBe(1024);
    expect(() => entry.getData()).toThrow();
  });

  it('accepts an entry within the limit and returns its bytes', () => {
    const zip = new AdmZip();
    zip.addFile('ok.txt', Buffer.from('hello world'));
    const entry = new AdmZip(zip.toBuffer()).getEntries()[0];

    const data = readZipEntry(entry, 1024 * 1024, 'ok.txt');
    expect(data.toString('utf8')).toBe('hello world');
  });

  it('rejects an archive with too many entries', () => {
    const zip = new AdmZip();
    for (let i = 0; i <= MAX_ARCHIVE_ENTRIES; i++) {
      zip.addFile(`f${i}.txt`, Buffer.from('x'));
    }

    expect(() => assertArchiveWithinLimits(new AdmZip(zip.toBuffer()))).toThrow(
      /over the 512 entry limit/
    );
  });

  it('rejects an archive whose entries are individually fine but collectively huge', () => {
    // Each entry sits under MAX_ENTRY_BYTES, so no per-entry check fires;
    // only the aggregate budget catches this.
    const zip = new AdmZip();
    for (let i = 0; i < 6; i++) {
      zip.addFile(`part${i}.bin`, Buffer.alloc(40 * 1024 * 1024, 0x41));
    }

    expect(() => assertArchiveWithinLimits(new AdmZip(zip.toBuffer()))).toThrow(
      /more than 209715200 bytes uncompressed in total/
    );
  });

  it('accepts an ordinary archive', () => {
    const zip = new AdmZip();
    zip.addFile('metadata.json', Buffer.from('{"title":"ok"}'));
    zip.addFile('index.html', Buffer.from('<h1>ok</h1>'));

    expect(() =>
      assertArchiveWithinLimits(new AdmZip(zip.toBuffer()))
    ).not.toThrow();
  });
});
