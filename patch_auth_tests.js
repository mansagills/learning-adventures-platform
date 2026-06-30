const fs = require('fs');

const testFiles = [
  'tests/api/auth/signup.test.ts',
  'tests/api/auth/signup-vuln.test.ts',
  'tests/security/admin_escalation.test.ts',
  'tests/security/auth_role_validation.test.ts',
  'tests/security/signup_mass_assignment.test.ts',
  'tests/security/signup_validation.test.ts'
];

for (const file of testFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Add supabase service client mock
    if (!content.includes(`vi.mock('../../lib/supabase/server'`)) {
      content = content.replace(
        /(describe\('.*?', \(\) => \{)/,
        `vi.mock('@/lib/supabase/server', () => ({\n  createServiceClient: vi.fn().mockReturnValue({\n    auth: {\n      admin: {\n        createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),\n      },\n    },\n  }),\n}));\n\n$1`
      );
    }

    fs.writeFileSync(file, content);
    console.log("Patched " + file);
  }
}
