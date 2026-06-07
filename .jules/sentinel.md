## 2024-05-27 - Replace predictable Math.random() with cryptographically secure crypto.randomInt()
**Vulnerability:** The application was using the non-cryptographically secure `Math.random()` to generate verification codes for certificates in `lib/certificates/certificateUtils.ts`.
**Learning:** This is a common pattern where developers default to `Math.random()` for string/token generation because it's built-in and easy, without considering its predictability. An attacker could potentially predict verification codes.
**Prevention:** Always use Node's `crypto` module (e.g., `crypto.randomBytes` or `crypto.randomInt`) when generating sensitive tokens, verification codes, or passwords. `crypto.randomInt` is ideal for selecting characters from a string to avoid modulo bias.
