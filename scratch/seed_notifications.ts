import { NotificationService } from '../src/app/modules/notification/notification.service.js';
import { prisma } from '../src/helpers.ts/prisma.js';

const seed = async () => {
    try {
        console.log('Seeding notifications...');

        // 1. Send to a specific User
        const userId = 'cmnut8os20000tvewhb2r4edk'; 
        await NotificationService.sendToUser(
            userId,
            'Order Update #456',
            'Your order has been picked up by the driver.',
            'ORDER_UPDATE'
        );
        console.log('✅ Sent individual user notification');

        // 2. Send to a specific Operator
        const operatorId = 'cmnutb2a40004tvewqg4mam5l'; 
        await NotificationService.sendToUser(
            operatorId,
            'New Ad Subscription Request',
            'Someone requested a new laundry ad in your area.',
            'SYSTEM'
        );
        console.log('✅ Sent operator alert');

        // 3. Send to Administrators
        await NotificationService.sendToAdmins(
            'System Security Patch',
            'Platform security patch applied successfully at 10 PM.'
        );
        console.log('✅ Broadcast to all Admins');

        // 4. Send to all Operators
        await NotificationService.sendToOperators(
            'Platform Commission Change',
            'New fee structure starting next month. Check the dashboard.'
        );
        console.log('✅ Broadcast to all Operators');

        // 5. Send to Everyone (Broadcast)
        await NotificationService.sendToAll(
            'Holiday Sale 🔥',
            'Get 50% off on all laundry services this weekend!'
        );
        console.log('✅ Sent broadcast to everyone');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding notifications:', err);
        process.exit(1);
    }
};

seed();
