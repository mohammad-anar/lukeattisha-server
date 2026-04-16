import { PrismaClient, IssueStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const userId = 'cmnut8os20000tvewhb2r4edk';
  const operatorId1 = 'cmnutb2ab0007tvew8qk3ajso';
  const operatorId2 = 'cmnwbmiw8005ntvi435bq4k6o';
  const orderId = 'cmnwd2llj000btva8kzcjjvxl';

  const issues = [
    {
      orderId,
      userId,
      operatorId: operatorId1,
      issueTitle: 'Damaged Clothes',
      description: 'My favorite shirt was returned with a tear in the sleeve.',
      status: 'ESCALATED' as IssueStatus,
      isEscalated: true,
      createdAt: new Date(),
    },
    {
      orderId,
      userId,
      operatorId: operatorId1,
      issueTitle: 'Missing Item',
      description: 'One of my socks is missing from the bundle.',
      status: 'PENDING' as IssueStatus,
      isEscalated: false,
      createdAt: new Date(),
    },
    {
      orderId,
      userId,
      operatorId: operatorId2,
      issueTitle: 'Late Delivery',
      description: 'The operator was 3 hours late for the delivery.',
      status: 'RESOLVED' as IssueStatus,
      isEscalated: false,
      createdAt: new Date(),
    },
     {
      orderId,
      userId,
      operatorId: operatorId2,
      issueTitle: 'Payment Issue',
      description: 'I was double charged for the pickup fee.',
      status: 'ESCALATED' as IssueStatus,
      isEscalated: true,
      createdAt: new Date(),
    }
  ];

  console.log('Creating dummy order issues...');
  for (const issue of issues) {
    const result = await prisma.orderIssue.create({
      data: issue
    });
    console.log(`Created issue: ${result.id}`);
  }

  console.log('Done!');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
