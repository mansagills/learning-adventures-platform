import { describe, it, expect, vi } from 'vitest';
import { generateVerificationCode } from './certificateUtils';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    courseCertificate: {
      findUnique: vi.fn().mockResolvedValue(null)
    }
  }
}));

describe('generateVerificationCode', () => {
  it('should generate a 12-character alphanumeric code', async () => {
    const code = await generateVerificationCode();
    expect(code.length).toBe(12);
    expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
  });
});
