const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mailer = require('./mailer');

async function test() {
  try {
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    if (!lastOrder) {
      console.log('No order found to test.');
      return;
    }

    console.log(`Triggering emails for order #${lastOrder.orderNumber}...`);
    await mailer.sendCustomerOrderConfirmation(lastOrder);
    await mailer.sendAdminNewOrderAlert(lastOrder);
    console.log('Success!');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
