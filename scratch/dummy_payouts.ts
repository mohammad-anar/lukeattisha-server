import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Find an operator with a wallet and at least one store
  const operator = await prisma.operator.findFirst({
    include: { 
      operatorWallet: true, 
      stores: true,
      user: true 
    }
  });

  if (!operator) {
    console.error("❌ No operator found in the database.");
    return;
  }

  if (!operator.operatorWallet) {
    console.log("Creating wallet for operator...");
    await prisma.operatorWallet.create({
      data: { operatorId: operator.id, balance: 0 }
    });
  }

  if (operator.stores.length === 0) {
    console.error("❌ Operator has no stores. Please create a store for this operator first.");
    return;
  }

  const walletId = operator.operatorWallet?.id || (await prisma.operatorWallet.findUnique({ where: { operatorId: operator.id } }))?.id;
  if (!walletId) {
    console.error("❌ Failed to resolve walletId.");
    return;
  }
  const operatorId = operator.id;
  const storeId = operator.stores[0].id;

  console.log(`🚀 Seeding dummy payout history for:`);
  console.log(`   Operator: ${operator.user.name} (${operatorId})`);
  console.log(`   Store:    ${operator.stores[0].name} (${storeId})`);

  // 2. Ensure we have at least one dummy order to link revenue transactions
  let order = await prisma.order.findFirst();
  if (!order) {
    console.log("Creating a dummy order for linking...");
    const user = await prisma.user.findFirst({ where: { role: 'USER' } });
    if (!user) {
        console.error("❌ No user found to create a dummy order.");
        return;
    }
    order = await prisma.order.create({
        data: {
            orderNumber: `DUMMY-${Math.floor(Math.random() * 100000)}`,
            userId: user.id,
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            subtotal: 100,
            platformFee: 10,
            totalAmount: 110,
            scheduledDate: new Date(),
        }
    });
  }

  // 3. Create dummy ORDER_REVENUE transactions (Earning for Store)
  console.log("Adding dummy earnings (ORDER_REVENUE)...");
  for (let i = 1; i <= 5; i++) {
    // Create/Ensure OperatorOrder exists for this transaction
    await prisma.operatorOrder.create({
        data: {
            orderId: order.id,
            operatorId,
            storeId,
            subtotal: 50 + i * 5,
            transferAmount: 45 + i * 5,
            transferStatus: 'COMPLETED',
        }
    });

    await prisma.operatorWalletTransaction.create({
        data: {
            walletId,
            operatorId,
            amount: 45 + i * 5,
            type: 'ORDER_REVENUE',
            orderId: order.id,
            note: `Revenue credit for order ${order.orderNumber} (Store: ${operator.stores[0].name})`,
        }
    });
  }

  // 4. Create dummy WITHDRAWAL transactions (Payouts as transfers to bank)
  console.log("Adding dummy payouts (WITHDRAWAL)...");
  for (let i = 1; i <= 3; i++) {
    const withdrawal = await prisma.withdrawal.create({
        data: {
            operatorId,
            amount: 50 * i,
            status: 'DISBURSED',
            stripeTransferId: `tr_dummy_${Math.random().toString(36).substring(7)}`,
        }
    });

    await prisma.operatorWalletTransaction.create({
        data: {
            walletId,
            operatorId,
            amount: 50 * i,
            type: 'WITHDRAWAL',
            withdrawalId: withdrawal.id,
            note: `Weekly payout to bank account - Batch #${i}`,
        }
    });
  }

  console.log("✅ Dummy payout/transaction history created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding dummy data:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
