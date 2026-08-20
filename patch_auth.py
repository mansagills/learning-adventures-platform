import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # It seems `fallbackUser` is missing. Let's provide a quick implementation at the top or replace it.

    # Check if there is an import or function for fallbackUser
    if 'fallbackUser' not in content.split('export')[0]:
        fallback_func = """
const fallbackUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  role: 'STUDENT',
  name: supabaseUser.email?.split('@')[0] || 'User',
  displayName: null,
  avatarUrl: null,
  avatarBackground: null,
  level: 1,
  xp: 0,
  coins: 0,
  gems: 0,
  streak: 0,
  title: null,
  gradeLevel: null,
  subjects: [],
});
"""
        content = content.replace("export function useAuth() {", fallback_func + "\nexport function useAuth() {")

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")

patch_file('hooks/useAuth.ts')
