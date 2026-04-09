export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { apiUser, error } = await getApiUser();
    if (error || !apiUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const shopItem = await prisma.shopItem.findUnique({ where: { itemId } });
    if (!shopItem || !shopItem.isAvailable) {
      return NextResponse.json({ error: 'Item not available' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      include: {
        level: true,
        character: { include: { inventory: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.character) {
      return NextResponse.json({ error: 'No character found' }, { status: 400 });
    }

    const userLevel = user.level?.currentLevel ?? 1;
    if (userLevel < shopItem.levelRequirement) {
      return NextResponse.json({ error: `Requires Level ${shopItem.levelRequirement}` }, { status: 400 });
    }

    const currentCurrency = user.level?.currency ?? 0;
    if (currentCurrency < shopItem.price) {
      return NextResponse.json(
        { error: `Not enough coins. Need ${shopItem.price}, have ${currentCurrency}` },
        { status: 400 }
      );
    }

    const inventory = user.character.inventory;
    const existingItems: any[] = Array.isArray(inventory?.items) ? (inventory.items as any[]) : [];

    if (shopItem.type !== 'CONSUMABLE') {
      const alreadyOwned = existingItems.some((i: any) => i.id === shopItem.itemId);
      if (alreadyOwned) {
        return NextResponse.json({ error: 'You already own this item' }, { status: 400 });
      }
    }

    const newItem = {
      id: shopItem.itemId,
      type: shopItem.type,
      name: shopItem.name,
      iconEmoji: shopItem.iconEmoji,
      effects: shopItem.effects,
      quantity: 1,
      acquiredAt: new Date().toISOString(),
    };

    let updatedItems: any[];
    if (shopItem.type === 'CONSUMABLE') {
      const existing = existingItems.find((i: any) => i.id === shopItem.itemId);
      if (existing) {
        updatedItems = existingItems.map((i: any) =>
          i.id === shopItem.itemId ? { ...i, quantity: (i.quantity ?? 1) + 1 } : i
        );
      } else {
        updatedItems = [...existingItems, newItem];
      }
    } else {
      updatedItems = [...existingItems, newItem];
    }

    const [updatedLevel] = await prisma.$transaction([
      prisma.userLevel.update({
        where: { userId: user.id },
        data: { currency: { decrement: shopItem.price } },
        select: { currency: true },
      }),
      inventory
        ? prisma.inventory.update({
            where: { characterId: user.character.id },
            data: { items: updatedItems },
          })
        : prisma.inventory.create({
            data: {
              characterId: user.character.id,
              items: updatedItems,
            },
          }),
    ]);

    return NextResponse.json({
      success: true,
      item: newItem,
      newBalance: updatedLevel.currency,
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
