import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The patch is to remove `this.createCampusSignage();` and `this.updateQuestMarkers();`
    # which do not exist on the class and are causing TypeScript errors.

    content = content.replace('    this.createCampusSignage();\n', '')
    content = content.replace('      this.updateQuestMarkers();\n', '')

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")

patch_file('game/scenes/OpenWorldScene.ts')
