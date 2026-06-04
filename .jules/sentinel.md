## 2025-02-28 - [Predictable Random Number Generation in Verification Codes]
**Vulnerability:** The `generateVerificationCode` function in `lib/certificates/certificateUtils.ts` used `Math.random()` to generate verification codes.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG), making its outputs predictable and susceptible to attack.
**Prevention:** Use a CSPRNG like `crypto.randomInt()` from the built-in Node.js `crypto` module when generating unguessable values like verification codes.
