import os
import re

def fix_app(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # The error is in app/world/page.tsx line 217-221
    # They are redefining handleNpcDialog, handleCollectibleCollected, handleZoneChanged
    content = content.replace("    const handleNpcDialog = (data: NpcDialogState) => setNpcDialog(data);\n\n    const handleCollectibleCollected = (_data: any) => { /* Phase D: implement collectible rewards */ };\n\n    const handleZoneChanged = (data: { zone: { displayName: string; neonAccent: string; neonDim: string } }) => {\n      setCurrentZone(data.zone);\n      setShowZoneSign(true);\n      setTimeout(() => setShowZoneSign(false), 4000);\n    };", "")

    # Also missing components QuestLog, QuestOfferDialog
    if "import { QuestLog }" not in content:
        content = content.replace("import NpcDialogOverlay from '@/components/world/NpcDialogOverlay';", "import NpcDialogOverlay from '@/components/world/NpcDialogOverlay';\nimport QuestLog from '@/components/world/QuestLog';\nimport QuestOfferDialog from '@/components/world/QuestOfferDialog';")

    with open(filepath, 'w') as f:
        f.write(content)

fix_app('app/world/page.tsx')
