import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The issue in game/entities/NPC.ts is around line 41:
    # constructor(
    #   ...
    #   questConfigOrFinalDialogLine?: QuestGiverConfig | (() => void),
    #   onFinalDialogLine?: () => void
    #   private readonly onFinalDialogLine?: () => void
    # )
    #
    # The duplicate `onFinalDialogLine` is missing a comma and is redundant anyway because
    # `private readonly onFinalDialogLine` is declared as a class property on line 29:
    # `private readonly onFinalDialogLine?: () => void;`

    # We will remove the redundant parameter in the constructor

    pattern = r"(onFinalDialogLine\?: \(\) => void\n)\s+private readonly onFinalDialogLine\?: \(\) => void"
    replacement = r"\1"

    new_content = re.sub(pattern, replacement, content)

    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Patched {filepath}")

patch_file('game/entities/NPC.ts')
