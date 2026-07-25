import os
import re

def fix_app(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # Still some duplicates:
    # 188, 212. Wait, earlier there was another block. Let's just remove duplicate declarations.
    # We can do this safely by just commenting them out or changing const to something else.
    # Actually, we can just replace the specific lines if we find them.

    content = content.replace("    const handleCollectibleCollected = (_data: any) => { /* Phase D: implement collectible rewards */ };", "")
    content = content.replace("const handleZoneChanged = (data: { zone: { displayName: string; neonAccent: string; neonDim: string } }) => {\n      setCurrentZone(data.zone);\n      setShowZoneSign(true);\n      setTimeout(() => setShowZoneSign(false), 4000);\n    };", "", 1)
    content = content.replace("const handleNpcDialog = (data: NpcDialogState) => setNpcDialog(data);", "", 1)

    with open(filepath, 'w') as f:
        f.write(content)

fix_app('app/world/page.tsx')
