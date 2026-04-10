const fs = require('fs');

let content = fs.readFileSync('tests/security/save_content_auth.test.ts', 'utf-8');

// Replace next-auth/next with our own mock structure for getApiUser
content = content.replace(
  "vi.mock('next-auth/next', () => ({\n  getServerSession: vi.fn(),\n}));",
  "vi.mock('@/lib/api-auth', () => ({\n  getApiUser: vi.fn(),\n}));"
);

content = content.replace(
  "import { getServerSession } from 'next-auth/next';",
  "import { getApiUser } from '@/lib/api-auth';"
);

// Replace getServerSession mock calls with getApiUser
content = content.replace(
  "(getServerSession as any).mockResolvedValue(null);",
  "(getApiUser as any).mockResolvedValue({ apiUser: null, error: 'Unauthorized' });"
);

content = content.replace(
  "(getServerSession as any).mockResolvedValue({\n      user: {\n        role: 'STUDENT',\n      },\n    });",
  "(getApiUser as any).mockResolvedValue({\n      apiUser: {\n        role: 'STUDENT',\n      },\n    });"
);

content = content.replace(
  "(getServerSession as any).mockResolvedValue({\n      user: {\n        role: 'ADMIN',\n      },\n    });",
  "(getApiUser as any).mockResolvedValue({\n      apiUser: {\n        role: 'ADMIN',\n      },\n    });"
);

content = content.replace(
  "(getServerSession as any).mockResolvedValue({\n      user: {\n        role: 'TEACHER',\n      },\n    });",
  "(getApiUser as any).mockResolvedValue({\n      apiUser: {\n        role: 'TEACHER',\n      },\n    });"
);

fs.writeFileSync('tests/security/save_content_auth.test.ts', content);
