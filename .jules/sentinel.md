## 2025-02-20 - Insecure Random Number Generation for Verification Codes
**Vulnerability:** The `generateVerificationCode` function in `lib/certificates/certificateUtils.ts` used `Math.random()` to generate characters for secure verification codes.
**Learning:** `Math.random()` is not cryptographically secure and is predictable, which makes verification codes guessable. When generating security-sensitive tokens, IDs, or verification codes, predictable pseudo-random number generators must be avoided.
**Prevention:** Always use Node.js `crypto` module (e.g. `crypto.randomInt` or `crypto.randomBytes`) for generating any value that needs to be unguessable or secure against brute-force attacks.
