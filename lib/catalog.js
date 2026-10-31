// Looks up bookable items in the database. Used by the cart and bookings APIs
// so names and prices always come from the database, never from the browser.

export const ITEM_TYPES = {
  gear: 'GEAR',
  photographer: 'PHOTOGRAPHER',
  package: 'PACKAGE'
}

const PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80'

// db can be the prisma client or a transaction client
export async function findItem(db, itemType, itemId) {
  if (itemType === 'GEAR') {
    const gear = await db.gear.findUnique({ where: { id: itemId } })
    return gear && {
      name: gear.name,
      unitPrice: gear.pricePerDay,
      image: gear.image,
      category: gear.category,
      available: gear.status === 'AVAILABLE'
    }
  }
  if (itemType === 'PHOTOGRAPHER') {
    const photographer = await db.photographer.findUnique({ where: { id: itemId } })
    return photographer && {
      name: `ช่างภาพ: ${photographer.name}`,
      unitPrice: photographer.pricePerHalf,
      image: photographer.avatar,
      category: photographer.specialty,
      available: true
    }
  }
  if (itemType === 'PACKAGE') {
    const pkg = await db.package.findUnique({ where: { id: itemId } })
    return pkg && {
      name: `แพ็กเกจ ${pkg.name}`,
      unitPrice: pkg.price,
      image: PACKAGE_IMAGE,
      category: '',
      available: true
    }
  }
  return null
}
