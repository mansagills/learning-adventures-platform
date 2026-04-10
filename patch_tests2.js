const fs = require('fs');

let content = fs.readFileSync('tests/security/save_content_auth.test.ts', 'utf-8');

content = content.replace(
  '// Mock authOptions (just an object)',
  '// Mock api-auth\nvi.mock("@/lib/api-auth", () => ({\n  getApiUser: mocks.getApiUser,\n}));\n\n// Mock authOptions (just an object)'
);

if (content.includes('getApiUser')) {
  console.log('Already mocked');
} else {
  // Add getApiUser to hoisted mocks
  content = content.replace(
    'const mocks = vi.hoisted(() => ({',
    'const mocks = vi.hoisted(() => ({\n  getApiUser: vi.fn(),'
  );

  content = content.replace(
    'mocks.existsSync.mockReturnValue(true);',
    'mocks.existsSync.mockReturnValue(true);\n    mocks.getApiUser.mockResolvedValue({ apiUser: null, error: null });'
  );

  content = content.replace(
    'mocks.getServerSession.mockResolvedValue(null);',
    'mocks.getServerSession.mockResolvedValue(null);\n    mocks.getApiUser.mockResolvedValue({ apiUser: null, error: "Unauthorized" });'
  );

  content = content.replace(
    'user: { role: \'STUDENT\' },\n    });',
    'user: { role: \'STUDENT\' },\n    });\n    mocks.getApiUser.mockResolvedValue({ apiUser: { role: \'STUDENT\' }, error: null });'
  );

  content = content.replace(
    'user: { role: \'ADMIN\' },\n    });\n\n    const req =',
    'user: { role: \'ADMIN\' },\n    });\n    mocks.getApiUser.mockResolvedValue({ apiUser: { role: \'ADMIN\' }, error: null });\n\n    const req ='
  );

  fs.writeFileSync('tests/security/save_content_auth.test.ts', content);
}
