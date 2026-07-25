import os
import re

def fix_test(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # The issue is the double metadata.json in the getEntry mock for package_upload_security.test.ts
    # Let's replace the whole mock for adm-zip.

    mock_start = "vi.mock('adm-zip', () => {"
    mock_end = "});"

    if mock_start in content:
        new_mock = """vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor(buffer: any) {}
      getEntry(name: string) {
        if (name === 'metadata.json') {
          return {
            getData: () =>
              Buffer.from(
                JSON.stringify({
                  id: '../../../../tmp/hacked',
                  title: 'Hacked Game',
                  description: 'This is a test',
                  gameFile: 'index.html',
                })
              ),
            header: { size: 100 }
          };
        }
        if (name === 'index.html') {
          return {
            getData: () => Buffer.from('<h1>You have been hacked</h1>'),
            header: { size: 100 }
          };
        }
        return null;
      }
    },
  };
});"""
        # regex replace from mock_start to mock_end
        content = re.sub(r"vi\.mock\('adm-zip', \(\) => \{.*?\}\);\n", new_mock + "\n", content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

files = [
    'tests/security/package_upload_security.test.ts',
    'demo/la-campus-demo/tests/security/package_upload_security.test.ts'
]

for file in files:
    fix_test(file)
