import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('=== CATEGORIES ===');
  categories.forEach(c => console.log(`ID: ${c.id}\nName: ${c.name}\n`));

  const units = await prisma.unit.findMany();
  console.log('\n=== UNITS ===');
  units.forEach(u => console.log(`ID: ${u.id}\nName: ${u.name}\n`));

  const offers = await prisma.offer.findMany();
  console.log('\n=== OFFERS ===');
  offers.forEach(o => console.log(`ID: ${o.id}\nTitle: ${o.title}\n`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
