import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The issue in app/world/page.tsx is duplicate declarations of handleNpcDialog, handleCollectibleCollected, and handleZoneChanged.
    # We will remove the duplicates and the unused QuestLog and QuestOfferDialog imports/uses if they exist.

    content = re.sub(
r"""    const handleNpcDialog = \(data: NpcDialogState\) => setNpcDialog\(data\);
    // Placeholder for Phase D collectible handling
    const handleCollectibleCollected = \(_data: any\) => \{ /\* Phase D: implement collectible rewards \*/ \};

    const handleZoneChanged = \(data: \{ zone: \{ displayName: string; neonAccent: string; neonDim: string \} \}\) => \{
      document.documentElement.style.setProperty\('--hud-accent', data.zone.neonAccent\);
      document.documentElement.style.setProperty\('--hud-accent-dim', data.zone.neonDim\);
      setZoneBanner\(data.zone.displayName\);
      setTimeout\(\(\) => setZoneBanner\(null\), 2800\);
    \};\n""", "", content)

    # Check for missing imports: 'QuestLog' and 'QuestOfferDialog'
    if 'QuestLog' not in content.split('import')[0] and 'import { QuestLog } from' not in content:
        content = "import { QuestLog } from '@/components/world/QuestLog';\n" + content
    if 'QuestOfferDialog' not in content.split('import')[0] and 'import { QuestOfferDialog } from' not in content:
        content = "import { QuestOfferDialog } from '@/components/world/QuestOfferDialog';\n" + content

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")

patch_file('app/world/page.tsx')
