import type AdmZip from 'adm-zip';

type ZipEntry = ReturnType<AdmZip['getEntries']>[number];

/** Largest uncompressed payload accepted for a game file, lesson or thumbnail. */
export const MAX_ENTRY_BYTES = 50 * 1024 * 1024;

/** Largest uncompressed payload accepted for a metadata.json manifest. */
export const MAX_MANIFEST_BYTES = 1024 * 1024;

/** Largest total uncompressed payload accepted across every entry in one archive. */
export const MAX_ARCHIVE_BYTES = 200 * 1024 * 1024;

/** Largest number of entries accepted in one archive. */
export const MAX_ARCHIVE_ENTRIES = 512;

/** Thrown when an archive or one of its entries exceeds a decompression limit. */
export class ZipLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipLimitError';
  }
}

/**
 * Reads one zip entry's uncompressed bytes, refusing to decompress anything
 * larger than `limit`.
 *
 * Why this checks `header.size` rather than measuring the output
 * --------------------------------------------------------------
 * `header.size` is the *declared* uncompressed length, written by whoever
 * built the archive, so on its own it is an attacker-controlled number and
 * checking it would look like security theatre. It is not, because of how
 * adm-zip inflates: `methods/inflater.js` passes the declared size to
 * zlib as `maxOutputLength`, so zlib aborts with ERR_BUFFER_TOO_LARGE the
 * moment real output exceeds what the header promised. Declaring a small
 * size does not buy an attacker a large inflate; it caps them at their own
 * lie. So once we know `0 < header.size <= limit`, the real allocation is
 * bounded too.
 *
 * That guarantee has one hole, and it is the reason this function exists
 * rather than a bare `if (entry.header.size > limit)` at each call site:
 * adm-zip applies the cap only `if (expectedLength > 0)`. An entry
 * declaring **size 0** therefore gets no cap at all, while also sailing
 * past any `size > limit` comparison. Measured against adm-zip 0.5.16 on
 * Node 22, a 204 KB archive whose size fields were patched to 0 drove
 * +405 MB of RSS inside a single `getData()` call before failing its CRC
 * check -- the memory is spent first and the error arrives too late to
 * matter. Rejecting a non-directory entry that declares 0 bytes closes it.
 *
 * The returned buffer is re-checked against `limit` as well. That is
 * belt-and-braces: it costs one comparison and it means a future adm-zip
 * that stops applying `maxOutputLength` degrades to a late error instead of
 * an unbounded one. `zip-bomb.test.ts` pins the library behaviour this
 * reasoning rests on, so the assumption fails loudly rather than silently.
 */
export function readZipEntry(
  entry: ZipEntry,
  limit: number,
  label: string
): Buffer {
  const declared = entry.header.size;

  if (declared > limit) {
    throw new ZipLimitError(
      `${label} declares ${declared} bytes, over the ${limit} byte limit`
    );
  }

  // Size 0 is the uncapped path described above. A real empty file is
  // indistinguishable from a bomb here, and an empty game file or manifest
  // is useless anyway, so both are refused.
  if (declared <= 0) {
    throw new ZipLimitError(
      `${label} declares no uncompressed size, which cannot be bounded safely`
    );
  }

  const data = entry.getData();

  if (data.length > limit) {
    throw new ZipLimitError(
      `${label} expanded to ${data.length} bytes, over the ${limit} byte limit`
    );
  }

  return data;
}

/**
 * Checks an archive as a whole, before any entry is read.
 *
 * Per-entry limits do not bound an archive's total cost: 512 entries that
 * each sit just under a 50 MB cap still add up to ~25 GB written to disk.
 * This is the gap the per-entry check cannot see, so it is enforced here
 * against the declared sizes, which `readZipEntry` then holds each entry to
 * individually.
 */
export function assertArchiveWithinLimits(zip: AdmZip): void {
  const entries = zip.getEntries();

  if (entries.length > MAX_ARCHIVE_ENTRIES) {
    throw new ZipLimitError(
      `Archive has ${entries.length} entries, over the ${MAX_ARCHIVE_ENTRIES} entry limit`
    );
  }

  let total = 0;
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    total += entry.header.size;
    if (total > MAX_ARCHIVE_BYTES) {
      throw new ZipLimitError(
        `Archive declares more than ${MAX_ARCHIVE_BYTES} bytes uncompressed in total`
      );
    }
  }
}
