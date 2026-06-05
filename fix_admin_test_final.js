const fs = require('fs');
let testCode = fs.readFileSync('tests/security/admin_escalation.test.ts', 'utf8');

testCode = testCode.replace(
  /toBe\(\/\'Password must be at least 8 characters\'\/\)/g,
  /toBe('Password must be at least 8 characters')/
);

testCode = testCode.replace(
  /toBe\(\/\'Password must be at least 8 characters\'\/\);/g,
  /toBe('Password must be at least 8 characters');/
);

testCode = testCode.replace(
  /\)\/\.toBe\('Password must be at least 8 characters'\);\/;/g,
  ").toBe('Password must be at least 8 characters');"
);

testCode = testCode.replace(
  /\)\/\.toBe\('Password must be at least 8 characters'\);\//g,
  ").toBe('Password must be at least 8 characters');"
);

fs.writeFileSync('tests/security/admin_escalation.test.ts', testCode);
