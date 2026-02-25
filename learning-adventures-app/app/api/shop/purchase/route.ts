import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/shop/purchase
 * Body: { itemId: string }
 * Deducts coins and adds the item to the character's inventory.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    // Load shop item
    const shopItem = await prisma.shopItem.findUnique({ where: { itemId } });

    if (!shopItem || !shopItem.isAvailable) {
      return NextResponse.json({ error: 'Item not available' }, { status: 404 });
    }

    // Load user with level and character
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    // Check level requirement
    const userLevel = user.level?.currentLevel ?? 1;
    if (userLevel < shopItem.levelRequirement) {
      return NextResponse.json(
        { error: `Requires Level ${shopItem.levelRequirement}` },
        { status: 400 }
      );
    }

    // Check sufficient coins
    const currentCurrency = user.level?.currency ?? 0;
    if (currentCurrency < shopItem.price) {
      return NextResponse.json(
        { error: `Not enough coins. Need ${shopItem.price}, have ${currentCurrency}` },
        { status: 400 }
      );
    }

    // Deduct coins
    await prisma.userLevel.update({
      where: { userId: user.id },
      data: { currency: { decrement: shopItem.price } },
    });

    // Add item to inventory
    const inventory = user.character.inventory;
    const existingItems: any[] = Array.isArray(inventory?.items) ? (inventory.items as any[]) : [];

    // For consumables, stack quantity; for equipment/pets, add as unique entry
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
      // Equipment/Pet — only one of each
      const alreadyOwned = existingItems.some((i: any) => i.id === shopItem.itemId);
      if (alreadyOwned) {
        // Refund coins since they already own it
        await prisma.userLevel.update({
          where: { userId: user.id },
          data: { currency: { increment: shopItem.price } },
        });
        return NextResponse.json({ error: 'You already own this item' }, { status: 400 });
      }
      updatedItems = [...existingItems, newItem];
    }

    // Save updated inventory
    if (inventory) {
      await prisma.inventory.update({
        where: { characterId: user.character.id },
        data: { items: updatedItems },
      });
    } else {
      await prisma.inventory.create({
        data: {
          characterId: user.character.id,
          items: updatedItems,
        },
      });
    }

    // Fetch updated currency
    const updatedLevel = await prisma.userLevel.findUnique({
      where: { userId: user.id },
      select: { currency: true },
    });

    return NextResponse.json({
      success: true,
      item: newItem,
      newBalance: updatedLevel?.currency ?? 0,
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
