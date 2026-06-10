## 2025-02-28 - Insecure Randomness in Core Utility Files
**Vulnerability:** Weak PRNG (`Math.random()`) used for generating usernames, certificate verification codes, and workflow IDs in multiple core utility files (`lib/usernameGenerator.ts`, `lib/certificates/certificateUtils.ts`, `lib/agents/ContentAgentOrchestrator.ts`).
**Learning:** This is a classic insecure randomness vulnerability where predictable values might be used as identifiers or secrets, exposing the system to enumeration or impersonation.
**Prevention:** Standardized the use of `crypto.randomInt()` and `crypto.randomUUID()` in all instances where secure random values are needed.
