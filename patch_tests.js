const fs = require('fs');

let content = fs.readFileSync('tests/security/save_content_vuln.test.ts', 'utf-8');

// Add getApiUser to hoisted mocks
content = content.replace(
  'const mocks = vi.hoisted(() => ({',
  'const mocks = vi.hoisted(() => ({\n  getApiUser: vi.fn(),'
);

// Add api-auth mock
content = content.replace(
  '// Mock authOptions (just an object)',
  '// Mock api-auth\nvi.mock("@/lib/api-auth", () => ({\n  getApiUser: mocks.getApiUser,\n}));\n\n// Mock authOptions (just an object)'
);

// Update beforeEach
content = content.replace(
  'mocks.existsSync.mockReturnValue(true);',
  'mocks.existsSync.mockReturnValue(true);\n    mocks.getApiUser.mockResolvedValue({ apiUser: null, error: null });'
);

// Update first test
content = content.replace(
  'mocks.getServerSession.mockResolvedValue(null);',
  'mocks.getServerSession.mockResolvedValue(null);\n    mocks.getApiUser.mockResolvedValue({ apiUser: null, error: "Unauthorized" });'
);

// Update second test
content = content.replace(
  'user: { role: \'STUDENT\' },\n    });',
  'user: { role: \'STUDENT\' },\n    });\n    mocks.getApiUser.mockResolvedValue({ apiUser: { role: \'STUDENT\' }, error: null });'
);

// Update third test
content = content.replace(
  'user: { role: \'ADMIN\' },\n    });\n\n    const maliciousFileName =',
  'user: { role: \'ADMIN\' },\n    });\n    mocks.getApiUser.mockResolvedValue({ apiUser: { role: \'ADMIN\' }, error: null });\n\n    const maliciousFileName ='
);

// Update fourth test
content = content.replace(
  'user: { role: \'ADMIN\' },\n    });\n\n    const validFileName =',
  'user: { role: \'ADMIN\' },\n    });\n    mocks.getApiUser.mockResolvedValue({ apiUser: { role: \'ADMIN\' }, error: null });\n\n    const validFileName ='
);

fs.writeFileSync('tests/security/save_content_vuln.test.ts', content);
