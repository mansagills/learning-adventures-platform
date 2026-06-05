const fs = require('fs');
let testCode = fs.readFileSync('tests/security/admin_escalation.test.ts', 'utf8');

testCode = testCode.replace(
  /'Password must be at least 8 characters long'/g,
  /'Password must be at least 8 characters'/
);

if (!testCode.includes('vi.mock(\'../../lib/supabase/server\'')) {
    testCode = testCode.replace(
        "vi.mock('bcryptjs', () => ({",
        `vi.mock('../../lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'supabase-user-123' } },
          error: null
        })
      }
    }
  }))
}));\n\nvi.mock('bcryptjs', () => ({`
    );
}

fs.writeFileSync('tests/security/admin_escalation.test.ts', testCode);
