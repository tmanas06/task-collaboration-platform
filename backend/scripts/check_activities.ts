
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkActivities() {
    try {
        // Get the most recent board
        const board = await prisma.board.findFirst({
            orderBy: { updatedAt: 'desc' },
            include: { activities: true }
        });

        if (!board) {
            console.log('No boards found.');
            return;
        }

        console.log(`Checking board: ${board.title} (${board.id})`);
        console.log(`Activity count: ${board.activities.length}`);

        if (board.activities.length > 0) {
            console.log('Recent 5 activities:');
            const recentActivities = await prisma.activity.findMany({
                where: { boardId: board.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { user: true }
            });
            console.table(recentActivities.map(a => ({
                action: a.action,
                user: a.user.name,
                metadata: JSON.stringify(a.metadata),
                created: a.createdAt
            })));
        } else {
            console.log('No activities found for this board.');
        }

        // Check total activities in DB
        const totalActivities = await prisma.activity.count();
        console.log(`Total activities in DB: ${totalActivities}`);

    } catch (error) {
        console.error('Error checking activities:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkActivities();
