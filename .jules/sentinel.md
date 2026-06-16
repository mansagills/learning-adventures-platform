## 2024-05-27 - SSTI / RCE in Source Code Generation
**Vulnerability:** A Server-Side Template Injection (SSTI) / Remote Code Execution (RCE) vulnerability was found in the `app/api/internal/update-catalog/route.ts` endpoint, where user input was interpolated directly into a template literal string to generate executable TypeScript source code.
**Learning:** Whenever dynamically building source code from untrusted input, direct string interpolation is highly dangerous as attackers can break out of the string bounds.
**Prevention:** Always serialize untrusted data into code using secure, built-in methods like `JSON.stringify()`, which safely escapes characters and prevents breakout.
