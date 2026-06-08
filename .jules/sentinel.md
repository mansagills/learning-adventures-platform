## 2025-02-28 - Insecure Randomness Replace with Crypto
**Vulnerability:** Weak PRNG (`Math.random()`) was used to generate unguessable values including verification codes, workflow IDs, and anonymous usernames.
**Learning:** This exposes the application to token predictability and potential account/data inference. The `crypto` module (`randomInt`, `randomUUID`) should be used for security-sensitive or globally unique random values.
**Prevention:** Avoid `Math.random()` when generating security tokens, IDs, or sensitive usernames. Use `crypto.randomInt()` or `crypto.randomUUID()` instead.
