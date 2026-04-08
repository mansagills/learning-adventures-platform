import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/inventory/equip
 * Body: { itemId: string }  — itemId from inventory (e.g. 'wizard-hat')
 * Equips the item in the appropriate slot on the character.
 * If itemId is null/empty for a slot, it unequips.
 */
export async function POST(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: apiUser.email },
      include: {
        character: { include: { inventory: true } },
      },
    });

    if (!user?.character) {
      return NextResponse.json({ error: 'No character found' }, { status: 404 });
    }

    const inventoryItems: any[] = (user.character.inventory?.items as any[]) ?? [];
    const item = inventoryItems.find((i) => i.id === itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not in inventory' }, { status: 400 });
    }

    if (item.type === 'CONSUMABLE') {
      return NextResponse.json({ error: 'Consumables cannot be equipped' }, { status: 400 });
    }

    // Determine which slot to use from the item's effects
    const slot = item.effects?.slot ?? (item.type === 'PET' ? 'pet' : null);

    if (!slot) {
      return NextResponse.json({ error: 'Item has no equip slot' }, { status: 400 });
    }

    const currentEquipment = (user.character.equipment as Record<string, string | null>) ?? {};
    const newEquipment = { ...currentEquipment, [slot]: itemId };

    await prisma.character.update({
      where: { id: user.character.id },
      data: { equipment: newEquipment },
    });

    return NextResponse.json({ success: true, equipment: newEquipment });
  } catch (error) {
    console.error('Error equipping item:', error);
    return NextResponse.json({ error: 'Failed to equip item' }, { status: 500 });
  }
}
