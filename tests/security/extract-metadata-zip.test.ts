/**
 * The extract-metadata route reads a zip from public/ and parses its
 * metadata.json. These tests put real archives on disk, because adm-zip is
 * Node-side code (see zip-bomb.test.ts for why this runs in the node
 * environment).
 *
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import AdmZip from 'adm-zip';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn(async () => ({ apiUser: { id: 'u1', role: 'ADMIN' } })),
}));

import { POST } from '@/app/api/internal/extract-metadata/route';

const dirName = '__extract-metadata-test__';
const dir = join(process.cwd(), 'public', dirName);

/** Rewrites an entry's declared uncompressed size, as an attacker would. */
function patchDeclaredSize(buf: Buffer, from: number, to: number): Buffer {
  const out = Buffer.from(buf);
  for (let i = 0; i + 4 <= out.length; i++) {
    if (out.readUInt32LE(i) === from) out.writeUInt32LE(to, i);
  }
  return out;
}

function writeZip(name: string, files: Record<string, Buffer>): string {
  const zip = new AdmZip();
  for (const [path, data] of Object.entries(files)) zip.addFile(path, data);
  writeFileSync(join(dir, name), zip.toBuffer());
  return `/${dirName}/${name}`;
}

function post(zipPath: string) {
  return POST(
    new NextRequest('http://localhost/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({ zipPath }),
    })
  );
}

describe('Security: extract-metadata zip limits', () => {
  beforeAll(() => mkdirSync(dir, { recursive: true }));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('reads an ordinary metadata.json', async () => {
    const zipPath = writeZip('ok.zip', {
      'metadata.json': Buffer.from(JSON.stringify({ title: 'Hello' })),
      'index.html': Buffer.from('<html></html>'),
    });
    const res = await post(zipPath);
    expect(res.status).toBe(200);
    expect((await res.json()).metadata.title).toBe('Hello');
  });

  it('refuses a metadata.json over the 1 MB limit with a 400', async () => {
    const zipPath = writeZip('big.zip', {
      'metadata.json': Buffer.alloc(2 * 1024 * 1024, 0x20),
    });
    const res = await post(zipPath);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/over the 1048576 byte limit/);
  });

  it('refuses a zip bomb that declares 0 bytes with a 400', async () => {
    // The bypass the old code had: a size of 0 passed its "> 1 MB" check,
    // and adm-zip does not cap getData() for an entry declaring 0 bytes.
    const size = 4 * 1024 * 1024;
    const zip = new AdmZip();
    zip.addFile('metadata.json', Buffer.alloc(size, 0x20));
    writeFileSync(
      join(dir, 'bomb.zip'),
      patchDeclaredSize(zip.toBuffer(), size, 0)
    );
    const res = await post(`/${dirName}/bomb.zip`);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/declares no uncompressed size/);
  });
});
