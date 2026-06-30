const fs = require('fs');

const testPath = 'tests/security/save_content_vuln.test.ts';
let content = fs.readFileSync(testPath, 'utf8');

// Replace getServerSession mocks with getApiUser mocks
content = content.replace(
  `mocks.getServerSession = vi.fn();`,
  `mocks.getApiUser = vi.fn();`
);

content = content.replace(
  /getServerSession: vi\.fn\(\),/g,
  `getApiUser: vi.fn(),\n  getServerSession: vi.fn(),`
);

content = content.replace(
  /\/\/ Mock next-auth\nvi\.mock\('next-auth', \(\) => \(\{\n  getServerSession: mocks\.getServerSession,\n\}\)\);/,
  `// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}));

// Mock api-auth
vi.mock('@/lib/api-auth', () => ({
  getApiUser: mocks.getApiUser,
}));`
);

content = content.replace(
  /mocks\.getServerSession\.mockResolvedValue\(null\);/g,
  `mocks.getApiUser.mockResolvedValue({ apiUser: null, error: { status: 401 } });`
);

content = content.replace(
  /mocks\.getServerSession\.mockResolvedValue\(\{\n\s*user: \{ role: 'STUDENT' \},\n\s*\}\);/g,
  `mocks.getApiUser.mockResolvedValue({ apiUser: { role: 'STUDENT' }, error: null });`
);

content = content.replace(
  /mocks\.getServerSession\.mockResolvedValue\(\{\n\s*user: \{ role: 'ADMIN' \},\n\s*\}\);/g,
  `mocks.getApiUser.mockResolvedValue({ apiUser: { role: 'ADMIN' }, error: null });`
);


fs.writeFileSync(testPath, content);
console.log("Patched " + testPath);
