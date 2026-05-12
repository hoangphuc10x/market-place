/* eslint-disable no-console */
import { PrismaClient, StoreCategory, ProductStatus, StoreStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('seeding…');

  const owner = await prisma.user.upsert({
    where: { email: 'linh@example.com' },
    update: {},
    create: {
      email: 'linh@example.com',
      displayName: 'Linh',
      role: 'SELLER',
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: 'linhstudio' },
    update: {},
    create: {
      slug: 'linhstudio',
      name: 'Linh Studio',
      bio: 'Handpicked vintage and slow-made pieces from Hà Nội.',
      category: StoreCategory.VINTAGE,
      status: StoreStatus.ACTIVE,
      ownerId: owner.id,
      theme: {
        themeId: 'atelier',
        primaryColor: '#1a1a1a',
        accentColor: '#c8a97e',
        logoUrl: null,
        coverImageUrl: null,
        tagline: 'Slow fashion, Hà Nội.',
        sections: ['hero', 'featured-products', 'lookbook', 'all-products'],
      },
    },
  });

  const products = [
    {
      slug: 'wool-overcoat-camel',
      title: 'Wool Overcoat — Camel',
      description: 'A 1970s-inspired single-breasted overcoat in camel wool.',
      tags: ['outerwear', 'wool', 'minimal'],
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200',
      ],
      variants: [
        { size: 'S', stock: 3, priceAmount: 2_400_000 },
        { size: 'M', stock: 5, priceAmount: 2_400_000 },
        { size: 'L', stock: 2, priceAmount: 2_400_000 },
      ],
    },
    {
      slug: 'silk-slip-dress-noir',
      title: 'Silk Slip Dress — Noir',
      description: 'Bias-cut silk dress with adjustable straps.',
      tags: ['dress', 'silk', 'evening'],
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200'],
      variants: [
        { size: 'XS', stock: 4, priceAmount: 1_800_000 },
        { size: 'S', stock: 6, priceAmount: 1_800_000 },
        { size: 'M', stock: 3, priceAmount: 1_800_000 },
      ],
    },
    {
      slug: 'linen-shirt-ecru',
      title: 'Linen Shirt — Ecru',
      description: 'Lightweight European linen, oversized cut.',
      tags: ['shirt', 'linen', 'summer'],
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200'],
      variants: [
        { size: 'S', stock: 8, priceAmount: 950_000 },
        { size: 'M', stock: 10, priceAmount: 950_000 },
        { size: 'L', stock: 7, priceAmount: 950_000 },
      ],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {},
      create: {
        storeId: store.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        status: ProductStatus.ACTIVE,
        tags: p.tags,
        details: {
          material: null,
          careInstructions: null,
          modelHeightCm: null,
          modelWearsSize: null,
          origin: 'Vietnam',
        },
        priceFromAmount: Math.min(...p.variants.map((v) => v.priceAmount)),
        priceFromCurrency: 'VND',
        images: {
          create: p.images.map((url, position) => ({ url, position })),
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: `${p.slug}-${v.size}`.toUpperCase(),
            priceAmount: v.priceAmount,
            priceCurrency: 'VND',
            stock: v.stock,
            attributes: { size: v.size, customSize: null, color: null, colorHex: null },
          })),
        },
      },
    });
  }

  await prisma.store.update({
    where: { id: store.id },
    data: { productCount: products.length },
  });

  console.log(`seeded ${products.length} products under /${store.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
