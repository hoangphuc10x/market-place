/* eslint-disable no-console */
/**
 * Demo seed — populates the marketplace with realistic fashion data.
 *
 * Idempotent: re-running upserts on slugs so existing rows update in place.
 * Pass `--reset` (or set SEED_RESET=1) to truncate every domain table first.
 *
 * Determinism: `faker.seed(42)` makes runs reproducible. Bump the number when
 * you want a new shuffle (or pass --rand for non-deterministic).
 */
import { PrismaClient, ProductStatus, StoreCategory, StoreStatus, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const args = new Set(process.argv.slice(2));
const RESET = args.has('--reset') || process.env.SEED_RESET === '1';
const NON_DETERMINISTIC = args.has('--rand');

if (!NON_DETERMINISTIC) faker.seed(42);

// ─── shared password for all demo accounts ──────────────────────────────────
const DEMO_PASSWORD = 'password';

// ─── image generation ───────────────────────────────────────────────────────
// picsum.photos with seeded paths — deterministic AND guaranteed to load.
// Not fashion-themed (random photos), but that's a fair tradeoff vs. Unsplash
// IDs that may 404. Will swap for real seller-uploaded images via Google Drive
// (and later R2) once upload UI lands.
const picsum = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const productImage = (storeSlug: string, productIdx: number, imgIdx: number) =>
  picsum(`${storeSlug}-p${productIdx}-${imgIdx}`);

const coverImage = (storeSlug: string) => picsum(`${storeSlug}-cover`, 1600, 900);

// ─── stores to seed ─────────────────────────────────────────────────────────
type StoreDef = {
  slug: string;
  name: string;
  bio: string;
  category: StoreCategory;
  themeId: 'atelier' | 'tokyo' | 'pastel';
  primaryColor: string;
  tagline: string;
  productCount: number;
};

const STORES: StoreDef[] = [
  {
    slug: 'linhstudio',
    name: 'Linh Studio',
    bio: 'Handpicked vintage and slow-made pieces from Hà Nội.',
    category: 'VINTAGE',
    themeId: 'atelier',
    primaryColor: '#1a1a1a',
    tagline: 'Slow fashion, Hà Nội.',
    productCount: 8,
  },
  {
    slug: 'nord-atelier',
    name: 'Nord Atelier',
    bio: 'Scandinavian minimalism, made small-batch in Copenhagen.',
    category: 'DESIGNER',
    themeId: 'atelier',
    primaryColor: '#2a2e35',
    tagline: 'Quiet wardrobe.',
    productCount: 7,
  },
  {
    slug: 'tokyodrift',
    name: 'Tokyo Drift',
    bio: 'Saigon streetwear with Tokyo energy. Drops monthly.',
    category: 'STREETWEAR',
    themeId: 'tokyo',
    primaryColor: '#FF4D6D',
    tagline: 'Tokyo nights, Saigon streets.',
    productCount: 10,
  },
  {
    slug: '199x-archive',
    name: '199x Archive',
    bio: 'Curated 90s deadstock and grail pieces. One-of-one only.',
    category: 'VINTAGE',
    themeId: 'tokyo',
    primaryColor: '#E63946',
    tagline: '1OF1 · DEADSTOCK · NO RESTOCKS',
    productCount: 6,
  },
  {
    slug: 'cottoncloud',
    name: 'Cotton Cloud',
    bio: 'Hand-loomed cotton, dyed with plants. Made in Bali by a tiny team.',
    category: 'HANDMADE',
    themeId: 'pastel',
    primaryColor: '#F4A8C0',
    tagline: 'Soft and slow ♡',
    productCount: 7,
  },
  {
    slug: 'tinytoes',
    name: 'Tiny Toes',
    bio: 'Organic cotton basics for little ones aged 0–6.',
    category: 'KIDS',
    themeId: 'pastel',
    primaryColor: '#FFB4A2',
    tagline: 'Little wardrobe, big love',
    productCount: 5,
  },
  {
    slug: 'solekick',
    name: 'Sole Kick',
    bio: 'Pre-loved sneakers, authenticated. Pickup in District 1 or ship anywhere.',
    category: 'SHOES',
    themeId: 'tokyo',
    primaryColor: '#06D6A0',
    tagline: 'Verified · Worn-in · Yours next.',
    productCount: 6,
  },
];

// ─── product name generation ────────────────────────────────────────────────
const PRODUCT_TEMPLATES: Record<StoreCategory, string[]> = {
  STREETWEAR: [
    '{{adj}} Boxy Tee — {{color}}',
    '{{adj}} Cargo Pants — {{color}}',
    'Oversized Hoodie — {{color}}',
    'Workwear Jacket — {{color}}',
    'Graphic Crew — {{color}}',
    'Trail Shell — {{color}}',
    'Acid-Wash Denim — {{color}}',
  ],
  DESIGNER: [
    '{{fabric}} Overcoat — {{color}}',
    'Tailored {{item}} — {{color}}',
    'Pleated {{item}} — {{color}}',
    'Architectural {{item}} — {{color}}',
    '{{fabric}} Trouser — {{color}}',
  ],
  VINTAGE: [
    '90s {{item}} — {{color}}',
    'Y2K {{item}} — {{color}}',
    'Vintage {{fabric}} {{item}}',
    'Deadstock {{item}} — {{color}}',
    'Archive {{item}}',
  ],
  HANDMADE: [
    'Hand-Loomed {{item}} — {{color}}',
    'Plant-Dyed {{item}} — {{color}}',
    'Block-Print {{item}} — {{color}}',
    'Crochet {{item}} — {{color}}',
  ],
  ACCESSORIES: [
    '{{fabric}} Crossbody — {{color}}',
    'Pearl Hair Clip — {{color}}',
    'Silk Scarf — {{color}}',
    'Bucket Hat — {{color}}',
  ],
  SHOES: [
    'Air Force 1 — Triple {{color}}',
    'Samba OG — {{color}}',
    'Jordan 1 Low — {{color}}',
    'Onitsuka Mexico 66 — {{color}}',
    'New Balance 990v6 — {{color}}',
    'Dr. Martens 1460 — {{color}}',
  ],
  FORMAL: [
    'Single-Breasted {{item}} — {{color}}',
    'Silk Slip {{item}} — {{color}}',
    'Bias-Cut Gown — {{color}}',
    '{{fabric}} Tuxedo {{item}} — {{color}}',
  ],
  ATHLEISURE: [
    'Studio Legging — {{color}}',
    'Soft Crop Top — {{color}}',
    'Tech Track Pant — {{color}}',
  ],
  KIDS: ['Bear Onesie — {{color}}', 'Mini Tee — {{color}}', 'Pull-On Pants — {{color}}'],
  OTHER: ['Mystery Piece — {{color}}'],
};

const ADJECTIVES = ['Cropped', 'Oversized', 'Slouchy', 'Boxy', 'Slim', 'Relaxed', 'Tapered'];
const FABRICS = ['Wool', 'Silk', 'Linen', 'Cotton', 'Denim', 'Cashmere', 'Tencel'];
const ITEMS = ['Shirt', 'Dress', 'Pant', 'Coat', 'Skirt', 'Blazer', 'Vest'];
const COLORS = [
  { name: 'Ivory', hex: '#F5F0E6' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Olive', hex: '#708238' },
  { name: 'Noir', hex: '#0A0A0A' },
  { name: 'Bone', hex: '#E3DAC9' },
  { name: 'Rust', hex: '#B7410E' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Sage', hex: '#9CAF88' },
  { name: 'Blush', hex: '#FAD5C9' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;

function buildProductName(category: StoreCategory, color: string): string {
  const templates = PRODUCT_TEMPLATES[category];
  const tpl = faker.helpers.arrayElement(templates);
  return tpl
    .replace('{{adj}}', faker.helpers.arrayElement(ADJECTIVES))
    .replace('{{fabric}}', faker.helpers.arrayElement(FABRICS))
    .replace('{{item}}', faker.helpers.arrayElement(ITEMS))
    .replace('{{color}}', color);
}

function slugify(s: string, salt: number): string {
  return `${s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)}-${salt}`;
}

// ─── main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`▸ seed start ${RESET ? '(--reset: wiping data first)' : ''}`);

  if (RESET) await wipe();

  const passwordHash = await hash(DEMO_PASSWORD, 10);

  // ── admin ─────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@threadly.dev' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'admin@threadly.dev',
      displayName: 'Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // ── buyer accounts ────────────────────────────────────────────────────────
  const buyers = await Promise.all(
    [
      ['mai@test.dev', 'Mai'],
      ['huy@test.dev', 'Huy'],
      ['ngoc@test.dev', 'Ngọc'],
      ['phong@test.dev', 'Phong'],
      ['vy@test.dev', 'Vy'],
    ].map(([email, name]) =>
      prisma.user.upsert({
        where: { email: email! },
        update: { passwordHash },
        create: {
          email: email!,
          displayName: name!,
          passwordHash,
          role: 'BUYER',
        },
      }),
    ),
  );

  // ── stores ────────────────────────────────────────────────────────────────
  let totalProducts = 0;

  for (const def of STORES) {
    const sellerEmail = `${def.slug}@sellers.dev`;
    const seller = await prisma.user.upsert({
      where: { email: sellerEmail },
      update: { passwordHash, role: 'SELLER' },
      create: {
        email: sellerEmail,
        displayName: def.name,
        passwordHash,
        role: UserRole.SELLER,
      },
    });

    const store = await prisma.store.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        bio: def.bio,
        category: def.category,
        status: StoreStatus.ACTIVE,
        theme: themeConfigFor(def),
      },
      create: {
        slug: def.slug,
        name: def.name,
        bio: def.bio,
        category: def.category,
        status: StoreStatus.ACTIVE,
        ownerId: seller.id,
        theme: themeConfigFor(def),
      },
    });

    // products for this store
    const created = await Promise.all(
      Array.from({ length: def.productCount }).map((_, idx) =>
        createProduct(store.id, def.slug, def.category, idx),
      ),
    );

    await prisma.store.update({
      where: { id: store.id },
      data: { productCount: created.length },
    });

    totalProducts += created.length;
    console.log(`  ✓ /${def.slug.padEnd(18)} ${def.themeId.padEnd(8)} ${created.length} products`);
  }

  // ── reviews ───────────────────────────────────────────────────────────────
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  let reviewCount = 0;
  for (const p of allProducts) {
    // ~40% of products get 1-3 reviews
    if (faker.number.float({ min: 0, max: 1 }) > 0.4) continue;
    const reviewers = faker.helpers.arrayElements(
      buyers,
      faker.number.int({ min: 1, max: Math.min(3, buyers.length) }),
    );
    for (const buyer of reviewers) {
      await prisma.productReview
        .upsert({
          where: { productId_userId: { productId: p.id, userId: buyer.id } },
          update: {},
          create: {
            productId: p.id,
            userId: buyer.id,
            rating: faker.number.int({ min: 3, max: 5 }),
            body: faker.helpers.arrayElement([
              'Great quality, exactly as pictured.',
              'Fabric feels lovely. Sizing runs a touch large.',
              'Shipped fast, packaging was beautiful.',
              "I'd buy from this shop again.",
              'Fits perfect. Love the color.',
              null,
            ]),
          },
        })
        .then(() => reviewCount++);
    }
  }

  // ── follows ───────────────────────────────────────────────────────────────
  const allStores = await prisma.store.findMany({ select: { id: true } });
  let followCount = 0;
  for (const buyer of buyers) {
    const follow = faker.helpers.arrayElements(
      allStores,
      faker.number.int({ min: 1, max: Math.min(4, allStores.length) }),
    );
    for (const s of follow) {
      await prisma.storeFollower
        .upsert({
          where: { storeId_userId: { storeId: s.id, userId: buyer.id } },
          update: {},
          create: { storeId: s.id, userId: buyer.id },
        })
        .then(() => followCount++);
    }
  }
  // denormalize followerCount on each store
  for (const s of allStores) {
    const count = await prisma.storeFollower.count({ where: { storeId: s.id } });
    await prisma.store.update({ where: { id: s.id }, data: { followerCount: count } });
  }

  console.log('');
  console.log('▸ summary');
  console.log(`  stores            ${STORES.length}`);
  console.log(`  products          ${totalProducts}`);
  console.log(`  reviews           ${reviewCount}`);
  console.log(`  follows           ${followCount}`);
  console.log(`  buyer accounts    ${buyers.length} (pw: "${DEMO_PASSWORD}")`);
  console.log('  admin             admin@threadly.dev');
  console.log('');
  console.log('▸ try /linhstudio · /tokyodrift · /cottoncloud · /nord-atelier');
}

// ─── helpers ────────────────────────────────────────────────────────────────

function themeConfigFor(def: StoreDef) {
  return {
    themeId: def.themeId,
    primaryColor: def.primaryColor,
    logoUrl: null,
    coverImageUrl: coverImage(def.slug),
    tagline: def.tagline,
    sections:
      def.themeId === 'pastel'
        ? ['hero', 'featured-products', 'about', 'newsletter', 'all-products']
        : ['hero', 'featured-products', 'lookbook', 'about', 'all-products'],
  };
}

async function createProduct(
  storeId: string,
  storeSlug: string,
  category: StoreCategory,
  idx: number,
) {
  const color = faker.helpers.arrayElement(COLORS);
  const title = buildProductName(category, color.name);
  const slug = slugify(title, idx);

  // 1-3 deterministic images per product
  const imageCount = faker.number.int({ min: 1, max: 3 });
  const imgs = Array.from({ length: imageCount }, (_, i) => productImage(storeSlug, idx, i));

  // Size variants — accessories/shoes/kids have different size shapes
  const sizesForCategory = sizesFor(category);
  const basePrice = priceFor(category);

  return prisma.product.upsert({
    where: { storeId_slug: { storeId, slug } },
    update: {},
    create: {
      storeId,
      slug,
      title,
      description: faker.lorem.paragraph({ min: 2, max: 4 }),
      status: ProductStatus.ACTIVE,
      tags: tagsFor(category, color.name),
      details: {
        material: faker.helpers.arrayElement([
          '100% organic cotton',
          'Wool blend (70/30)',
          'Heavyweight 14oz denim',
          'Silk twill',
          'Linen-cotton',
          null,
        ]),
        careInstructions: 'Cold wash, hang dry. Do not bleach.',
        modelHeightCm: faker.helpers.arrayElement([165, 170, 175, 180, null]),
        modelWearsSize: faker.helpers.arrayElement(['S', 'M', 'L', null]),
        origin: faker.helpers.arrayElement(['Vietnam', 'Japan', 'Italy', 'Portugal', null]),
      },
      priceFromAmount: basePrice,
      priceFromCurrency: 'VND',
      images: {
        create: imgs.map((url, position) => ({ url, position })),
      },
      variants: {
        create: sizesForCategory.map((size, vi) => ({
          sku: `${slug.toUpperCase().slice(0, 20)}-${size}-${vi}`,
          priceAmount: basePrice,
          priceCurrency: 'VND',
          stock: faker.number.int({ min: 0, max: 12 }),
          attributes: {
            size: size as 'S' | 'M' | 'L' | 'XS' | 'XL' | null,
            customSize: null,
            color: color.name,
            colorHex: color.hex,
          },
        })),
      },
    },
  });
}

function sizesFor(category: StoreCategory): string[] {
  if (category === 'SHOES') return ['39', '40', '41', '42', '43'];
  if (category === 'KIDS') return ['0-3M', '3-6M', '6-12M', '1-2Y'];
  if (category === 'ACCESSORIES') return ['ONE_SIZE'];
  return faker.helpers.arrayElements(SIZES as unknown as string[], { min: 3, max: 5 });
}

function priceFor(category: StoreCategory): number {
  const ranges: Record<StoreCategory, [number, number]> = {
    STREETWEAR: [450_000, 1_200_000],
    DESIGNER: [1_800_000, 6_500_000],
    VINTAGE: [800_000, 2_400_000],
    HANDMADE: [600_000, 1_500_000],
    ACCESSORIES: [200_000, 800_000],
    SHOES: [2_000_000, 4_500_000],
    FORMAL: [1_500_000, 5_000_000],
    ATHLEISURE: [400_000, 1_100_000],
    KIDS: [180_000, 480_000],
    OTHER: [300_000, 1_000_000],
  };
  const [lo, hi] = ranges[category];
  // Round to nearest 50k VND
  return Math.round(faker.number.int({ min: lo, max: hi }) / 50_000) * 50_000;
}

function tagsFor(category: StoreCategory, colorName: string): string[] {
  const base = [colorName.toLowerCase(), category.toLowerCase()];
  const flavor = faker.helpers.arrayElements(
    ['new', 'bestseller', 'limited', 'sustainable', 'small-batch', 'unisex'],
    { min: 0, max: 2 },
  );
  return [...new Set([...base, ...flavor])];
}

async function wipe() {
  // Delete in FK-safe order
  await prisma.$transaction([
    prisma.orderLine.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartLine.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.productReview.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.storeFollower.deleteMany(),
    prisma.store.deleteMany(),
    prisma.address.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('  ✗ wiped existing data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
