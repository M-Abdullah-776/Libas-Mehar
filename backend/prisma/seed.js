const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.discipline.count();
  if (count > 0) {
    console.log('🌱 Database already seeded. Ensuring admin account exists...');
    const adminEmail = 'admin@libasmehar.com';
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const hash = await bcrypt.hash('Admin@1234', 12);
      await prisma.user.create({
        data: {
          name: 'Libas Mehar Admin',
          email: adminEmail,
          passwordHash: hash,
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin account created!');
    } else {
      console.log('✅ Admin account already exists!');
    }
    return;
  }

  console.log('🧹 Database empty. Cleaning and seeding initial tables...');

  // ──────────────────────────────────────────
  // 1. ADMIN ACCOUNT
  // ──────────────────────────────────────────
  const adminEmail = 'admin@libasmehar.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@1234', 12);
    await prisma.user.create({
      data: {
        name: 'Libas Mehar Admin',
        email: adminEmail,
        passwordHash: hash,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin account verified');
  }

  // ──────────────────────────────────────────
  // 2. DISCIPLINES (Categories)
  // ──────────────────────────────────────────
  console.log('🌱 Creating categories (disciplines)...');
  const man = await prisma.discipline.create({
    data: { name: 'Man', slug: 'man', description: 'Premium Men\'s Traditional Shalwar Kameez and Kurta Pajama suits.', sortOrder: 1 },
  });
  const woman = await prisma.discipline.create({
    data: { name: 'Woman', slug: 'woman', description: 'Elegant Women\'s 3-Piece Embroidered Lawn, luxury Chiffon, and Spun Silk suits.', sortOrder: 2 },
  });
  const kids = await prisma.discipline.create({
    data: { name: 'Kids', slug: 'kids', description: 'Soft, traditional cotton Kurta Shalwar suits for children.', sortOrder: 3 },
  });
  const fabrics = await prisma.discipline.create({
    data: { name: 'Fabrics', slug: 'fabrics', description: 'Unstitched Egyptian Giza Cotton, Pure Spun Silk Boski, and summer lawn suit lengths.', sortOrder: 4 },
  });

  // ──────────────────────────────────────────
  // 3. COLLECTIONS
  // ──────────────────────────────────────────
  console.log('🌱 Creating detailed collections...');
  
  // Man collections
  const mensGiza = await prisma.collection.create({
    data: { name: 'Egyptian Giza Suits', slug: 'mens-giza', tagline: 'Premium Men\'s Shalwar Kameez', disciplineId: man.id, heroImageUrl: '/products/men-sky-blue.png' },
  });
  const mensBoski = await prisma.collection.create({
    data: { name: 'Traditional Spun Silk Boski', slug: 'mens-boski', tagline: 'Heritage Spun Silk Suits', disciplineId: man.id, heroImageUrl: '/products/men-sand-beige.png' },
  });
  const mensLinen = await prisma.collection.create({
    data: { name: 'Premium Cotton Linen', slug: 'mens-linen', tagline: 'Lightweight & Breathable Kurta Suits', disciplineId: man.id, heroImageUrl: '/products/men-charcoal.png' },
  });

  // Woman collections
  const womensLawn = await prisma.collection.create({
    data: { name: '3-Piece Embroidered Lawn', slug: 'womens-lawn', tagline: 'Rich Floral & Traditional Lawn Suits', disciplineId: woman.id, heroImageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800' },
  });
  const womensChiffon = await prisma.collection.create({
    data: { name: 'Luxury Chiffon Collection', slug: 'womens-chiffon', tagline: 'Formal Handworked Chiffon Suits', disciplineId: woman.id, heroImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800' },
  });
  const womensSilk = await prisma.collection.create({
    data: { name: 'Premium Jacquard Silk', slug: 'womens-silk', tagline: 'Rich Pure Silk Outfits', disciplineId: woman.id, heroImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800' },
  });

  // Kids collections
  const kidsCotton = await prisma.collection.create({
    data: { name: 'Kids Classic Cotton', slug: 'kids-cotton', tagline: 'Soft, Breathable Kurta Shalwar', disciplineId: kids.id, heroImageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800' },
  });
  const kidsLinen = await prisma.collection.create({
    data: { name: 'Kids Soft Linen', slug: 'kids-linen', tagline: 'Gentle Pastel Summer Suits', disciplineId: kids.id, heroImageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800' },
  });

  // Fabrics collections
  const gizaFabric = await prisma.collection.create({
    data: { name: 'Giza Cotton Suit Lengths', slug: 'giza-fabric', tagline: 'Premium Unstitched Suits by the Yard', disciplineId: fabrics.id, heroImageUrl: '/products/men-sand-beige.png' },
  });
  const boskiFabric = await prisma.collection.create({
    data: { name: 'Spun Silk Boski Bolts', slug: 'boski-fabric', tagline: 'Traditional Silk Boski Suit Lengths', disciplineId: fabrics.id, heroImageUrl: '/products/men-emerald.png' },
  });

  // ──────────────────────────────────────────
  // 4. PRODUCTS (24 premium traditional suits with multiple views)
  // ──────────────────────────────────────────
  console.log('🌱 Seeding premium traditional suits...');
  const products = [
    // ------------------- MEN'S GIZA COTTON SUITS -------------------
    {
      slug: 'men-giza-camel',
      data: {
        name: 'Men\'s Giza Cotton Shalwar Kameez — Camel',
        description: 'Luxurious long-staple Egyptian Giza cotton unstitched suit in Camel beige. Clean matte texture with a soft drape, perfect for traditional tailoring.',
        basePrice: 5850.0,
        collectionId: mensGiza.id,
        isBestseller: true,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Camel', size: 'Unstitched', sku: 'MG-CAMEL-001', stock: 40 }] },
        stitchOptions: { create: [{ name: 'Unstitched', extraCost: 0 }, { name: 'Standard Stitching', extraCost: 1500 }, { name: 'Custom Measurements', extraCost: 2500 }] },
      },
    },
    {
      slug: 'men-giza-navy',
      data: {
        name: 'Men\'s Giza Cotton Shalwar Kameez — Midnight Navy',
        description: 'Rich dark navy Giza cotton unstitched suit fabric. Lightweight, premium, and breathable, ideal for classic Pakistani Shalwar Kameez.',
        basePrice: 6200.0,
        collectionId: mensGiza.id,
        isBestseller: true,
        images: { create: [
          { url: '/products/men-charcoal.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Midnight Navy', size: 'Unstitched', sku: 'MG-NAVY-002', stock: 30 }] },
      },
    },
    {
      slug: 'men-giza-ivory',
      data: {
        name: 'Men\'s Giza Cotton Shalwar Kameez — Ivory White',
        description: 'Timeless ivory white Giza cotton unstitched suit. Fine crisp finish that holds starch beautifully for Pakistani formal events.',
        basePrice: 5850.0,
        collectionId: mensGiza.id,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Ivory White', size: 'Unstitched', sku: 'MG-IVY-003', stock: 35 }] },
      },
    },
    {
      slug: 'men-giza-grey',
      data: {
        name: 'Men\'s Giza Cotton Shalwar Kameez — Slate Grey',
        description: 'Sleek slate grey Egyptian Giza cotton unstitched suit. Unmatched structural strength and rich drape for a tailored fit.',
        basePrice: 5950.0,
        collectionId: mensGiza.id,
        images: { create: [
          { url: '/products/men-charcoal.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Slate Grey', size: 'Unstitched', sku: 'MG-GREY-004', stock: 25 }] },
      },
    },

    // ------------------- NEW: ADDED PRODUCTS WITH SPECIFIC COLOR fabric MODEL POSES -------------------
    {
      slug: 'men-kurta-sky-blue',
      data: {
        name: 'Men\'s Luxury Kurta Suit — Sky Blue',
        description: 'Premium sky blue traditional Pakistani Kurta Suit. Tailored with double-needle stitching on the placket and collar. Soft finish and comfortable fall.',
        basePrice: 6500.0,
        collectionId: mensGiza.id,
        isBestseller: true,
        images: { create: [
          { url: '/products/men-sky-blue.png', sortOrder: 0 }
        ] },
        variants: { create: [{ color: 'Sky Blue', size: 'Unstitched', sku: 'MG-SKYBLUE-001', stock: 35 }] },
        stitchOptions: { create: [{ name: 'Unstitched', extraCost: 0 }, { name: 'Standard Stitching', extraCost: 1500 }, { name: 'Custom Measurements', extraCost: 2500 }] },
      },
    },
    {
      slug: 'men-kurta-emerald',
      data: {
        name: 'Men\'s Designer Kurta Suit — Emerald Green',
        description: 'Exquisite emerald green traditional Kurta Shalwar suit. Tailored from long-staple soft cotton fibers, offering ultimate comfort and an eye-catching look.',
        basePrice: 6500.0,
        collectionId: mensGiza.id,
        isBestseller: true,
        images: { create: [
          { url: '/products/men-emerald.png', sortOrder: 0 }
        ] },
        variants: { create: [{ color: 'Emerald Green', size: 'Unstitched', sku: 'MG-EMERALD-001', stock: 30 }] },
      },
    },
    {
      slug: 'men-kurta-charcoal',
      data: {
        name: 'Men\'s Premium Shalwar Kameez — Charcoal Grey',
        description: 'Deep charcoal grey Pakistani traditional suit package, tailored from structured fabric for an elegant formal fall, perfect for evening wear.',
        basePrice: 6300.0,
        collectionId: mensGiza.id,
        images: { create: [
          { url: '/products/men-charcoal.png', sortOrder: 0 }
        ] },
        variants: { create: [{ color: 'Charcoal Grey', size: 'Unstitched', sku: 'MG-CHARCOAL-001', stock: 25 }] },
      },
    },
    {
      slug: 'men-kurta-sand-beige',
      data: {
        name: 'Men\'s Traditional Shalwar Kameez — Royal Beige',
        description: 'Royal sand beige unstitched Shalwar Kameez suit length, designed for everyday distinction, breathability, and premium comfort.',
        basePrice: 5900.0,
        collectionId: mensGiza.id,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 }
        ] },
        variants: { create: [{ color: 'Sand Beige', size: 'Unstitched', sku: 'MG-SANDBEIGE-001', stock: 40 }] },
      },
    },

    // ------------------- MEN'S BOSKI SUITS -------------------
    {
      slug: 'men-boski-silk-8',
      data: {
        name: 'Men\'s Pure Spun Silk Boski Suit — 8-Pound',
        description: 'Authentic 8-pound weight Chinese spun silk Boski unstitched suit package. Traditional luxury drape, off-white color, and classic shine.',
        basePrice: 8500.0,
        collectionId: mensBoski.id,
        isBestseller: true,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Silk Ivory', size: 'Unstitched', sku: 'BS-IVY-001', stock: 15 }] },
        stitchOptions: { create: [{ name: 'Unstitched', extraCost: 0 }, { name: 'Standard Stitching', extraCost: 1800 }, { name: 'Custom Measurements', extraCost: 2800 }] },
      },
    },
    {
      slug: 'men-boski-silk-10',
      data: {
        name: 'Men\'s Pure Spun Silk Boski Suit — 10-Pound',
        description: 'Heavyweight 10-pound Chinese spun silk Boski unstitched suit package. Maximum fall, formal finish, and traditional cream color.',
        basePrice: 10500.0,
        collectionId: mensBoski.id,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Rich Cream', size: 'Unstitched', sku: 'BS-CREAM-002', stock: 20 }] },
      },
    },

    // ------------------- MEN'S LINEN SUITS -------------------
    {
      slug: 'men-linen-beige',
      data: {
        name: 'Men\'s Cotton Linen Kurta Suit — Sand Beige',
        description: 'Breathable, premium cotton-linen blend unstitched suit in sand beige. Relaxed drape, perfect for informal traditional summer wear.',
        basePrice: 4800.0,
        collectionId: mensLinen.id,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Sand Beige', size: 'Unstitched', sku: 'ML-BEIGE-001', stock: 30 }] },
      },
    },
    {
      slug: 'men-linen-olive',
      data: {
        name: 'Men\'s Cotton Linen Kurta Suit — Olive Green',
        description: 'Lightweight linen blend unstitched suit fabric dyed in earthy olive green. Perfect breathability and tailored neatness for kurtas.',
        basePrice: 4800.0,
        collectionId: mensLinen.id,
        images: { create: [
          { url: '/products/men-emerald.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Olive Green', size: 'Unstitched', sku: 'ML-OLIVE-002', stock: 25 }] },
      },
    },

    // ------------------- WOMEN'S EMBROIDERED LAWN SUITS -------------------
    {
      slug: 'women-lawn-rust',
      data: {
        name: 'Women\'s 3-Piece Embroidered Lawn Suit — Vibrant Rust',
        description: 'Stunning 3-piece unstitched printed lawn suit with detailed thread embroidery patches on neck and borders, paired with a matching chiffon dupatta.',
        basePrice: 6500.0,
        collectionId: womensLawn.id,
        isBestseller: true,
        images: { create: [
          { url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Rust Floral', size: 'Unstitched', sku: 'WL-RUST-001', stock: 20 }] },
      },
    },
    {
      slug: 'women-lawn-teal',
      data: {
        name: 'Women\'s 3-Piece Digital Lawn Suit — Oceanic Teal',
        description: 'Exquisite teal lawn shirt with digital prints, matching trousers, and a pure silk dupatta. Perfectly lightweight for warm Pakistani summers.',
        basePrice: 5800.0,
        collectionId: womensLawn.id,
        images: { create: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Oceanic Teal', size: 'Unstitched', sku: 'WL-TEAL-002', stock: 25 }] },
      },
    },
    {
      slug: 'women-lawn-crimson',
      data: {
        name: 'Women\'s 3-Piece Embroidered Lawn Suit — Crimson Ruby',
        description: 'Classic crimson red unstitched 3-piece lawn suit, decorated with heavy zari embroidery on organza patches and a net dupatta.',
        basePrice: 6800.0,
        collectionId: womensLawn.id,
        images: { create: [
          { url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Crimson Ruby', size: 'Unstitched', sku: 'WL-CRIM-003', stock: 18 }] },
      },
    },

    // ------------------- WOMEN'S CHIFFON SUITS -------------------
    {
      slug: 'women-chiffon-pink',
      data: {
        name: 'Women\'s 3-Piece Embroidered Chiffon Suit — Blush Pink',
        description: 'Elegant formal 3-piece chiffon set featuring handworked mirror embroidery, raw-silk trousers, and an embroidered chiffon dupatta.',
        basePrice: 12500.0,
        collectionId: womensChiffon.id,
        isBestseller: true,
        images: { create: [
          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Blush Pink', size: 'Unstitched', sku: 'WC-PINK-001', stock: 15 }] },
      },
    },
    {
      slug: 'women-chiffon-lavender',
      data: {
        name: 'Women\'s 3-Piece Silk Chiffon Suit — Lilac Lavender',
        description: 'Exquisite lavender shade chiffon suit with silver tilla thread weaving, silk borders, and matching inner lining. Designed for weddings and festivals.',
        basePrice: 13200.0,
        collectionId: womensChiffon.id,
        images: { create: [
          { url: 'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Lilac Lavender', size: 'Unstitched', sku: 'WC-LAV-002', stock: 12 }] },
      },
    },

    // ------------------- WOMEN'S SILK SUITS -------------------
    {
      slug: 'women-silk-mustard',
      data: {
        name: 'Women\'s 3-Piece Jacquard Silk Suit — Golden Mustard',
        description: 'Pure Chinese spun silk base 3-piece suit with traditional jacquard motifs in golden mustard. Incredible fall and luxurious hand-feel.',
        basePrice: 9500.0,
        collectionId: womensSilk.id,
        isBestseller: true,
        images: { create: [
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Golden Mustard', size: 'Unstitched', sku: 'WS-MUST-001', stock: 15 }] },
      },
    },

    // ------------------- KIDS' COTTON SUITS -------------------
    {
      slug: 'kids-cotton-blue',
      data: {
        name: 'Kids Kurta Shalwar Suit — Sky Blue',
        description: 'Extra soft, allergen-free pure cotton unstitched fabric for comfortable kids\' traditional kurtas and shalwars.',
        basePrice: 2800.0,
        collectionId: kidsCotton.id,
        images: { create: [
          { url: '/products/men-sky-blue.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Sky Blue', size: 'Unstitched', sku: 'KD-BLUE-001', stock: 50 }] },
      },
    },
    {
      slug: 'kids-cotton-mint',
      data: {
        name: 'Kids Kurta Shalwar Suit — Mint Green',
        description: 'Lightweight summer cotton unstitched suit fabric in a playful pastel mint green shade, gentle on young skin.',
        basePrice: 2800.0,
        collectionId: kidsCotton.id,
        images: { create: [
          { url: '/products/men-emerald.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Mint Green', size: 'Unstitched', sku: 'KD-MINT-002', stock: 45 }] },
      },
    },

    // ------------------- KIDS' LINEN SUITS -------------------
    {
      slug: 'kids-linen-yellow',
      data: {
        name: 'Kids Kurta Shalwar Suit — Pastel Yellow',
        description: 'Ultra breathable pastel yellow cotton-linen unstitched suit. Extremely comfortable for kids during Eid.',
        basePrice: 3200.0,
        collectionId: kidsLinen.id,
        images: { create: [
          { url: '/products/men-sky-blue.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Pastel Yellow', size: 'Unstitched', sku: 'KD-YEL-003', stock: 30 }] },
      },
    },

    // ------------------- FABRICS SUITS (GIZA) -------------------
    {
      slug: 'fabric-giza-white',
      data: {
        name: 'Premium Giza Cotton Unstitched Suit — Arctic White',
        description: 'Premium Giza cotton unstitched suit package (4 yards). High thread count, crisp texture, ideal for custom Shalwar Kameez suits.',
        basePrice: 4500.0,
        collectionId: gizaFabric.id,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Arctic White', size: '4 Yards', sku: 'FAB-GIZA-WHT', stock: 80 }] },
      },
    },

    // ------------------- FABRICS SUITS (BOSKI) -------------------
    {
      slug: 'fabric-boski-cream',
      data: {
        name: 'Premium Spun Silk Boski Unstitched Suit — Royal Cream',
        description: 'Traditional Chinese spun silk fabric in royal cream color. Sold in unstitched suit lengths (4 meters) for custom Shalwar Kameez.',
        basePrice: 9500.0,
        collectionId: boskiFabric.id,
        isBestseller: true,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Royal Cream', size: '4 Meters', sku: 'FAB-BOSKI-CRM', stock: 50 }] },
      },
    },

    // ------------------- FABRICS SUITS (LATHA) -------------------
    {
      slug: 'fabric-latha-cotton',
      data: {
        name: 'Traditional Latha Shalwar Kameez Suit — Bleached White',
        description: 'Classic crisp latha cotton unstitched suit package with high starch-holding capability. Traditional Pakistani formal wear.',
        basePrice: 4200.0,
        collectionId: gizaFabric.id,
        images: { create: [
          { url: '/products/men-sand-beige.png', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800', sortOrder: 1 }
        ] },
        variants: { create: [{ color: 'Bleached White', size: '4.5 Meters', sku: 'FAB-LATHA-WHT', stock: 65 }] },
      },
    },
  ];

  for (const p of products) {
    const createdProduct = await prisma.product.create({ data: { slug: p.slug, ...p.data } });
    console.log(`  ✅ Added Product: ${p.data.name}`);

    // Create 2-3 sample reviews for each product
    await prisma.review.create({
      data: {
        userId: (await prisma.user.findFirst()).id,
        productId: createdProduct.id,
        rating: 5,
        title: 'Outstanding Quality & Craftsmanship',
        comment: 'Extremely satisfied with the fabric quality and overall finish. Truly premium fitting!',
        isVerifiedPurchase: true,
      },
    });

    await prisma.review.create({
      data: {
        userId: (await prisma.user.findFirst()).id,
        productId: createdProduct.id,
        rating: 4,
        title: 'Great Color & Quick Delivery',
        comment: 'The shade matches the photos perfectly. Fast nationwide delivery within 3 days.',
        isVerifiedPurchase: true,
      },
    });
  }

  console.log('\n🎉 Detailed SQLite Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
