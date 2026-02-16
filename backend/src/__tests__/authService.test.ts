import { authService } from '../services/authService';
import prisma from '../prisma/client';

describe('AuthService Integration', () => {
    jest.setTimeout(60000);
    const timestamp = Date.now();
    const testUid = `firebase-uid-${timestamp}`;
    const testEmail = `test-${timestamp}@example.com`;
    const testName = 'Integration Test User';

    afterAll(async () => {
        // Cleanup
        await prisma.user.deleteMany({
            where: {
                email: { contains: timestamp.toString() }
            }
        });
        await prisma.$disconnect();
    });

    it('should create a new user when syncing for the first time', async () => {
        const user = await authService.syncUser(testUid, testEmail, testName);

        expect(user).toBeDefined();
        expect(user.email).toBe(testEmail);
        expect((user as any).firebaseUid).toBe(testUid);
        expect(user.name).toBe(testName);
        expect(user.id).toBeDefined();
    }, 60000);

    it('should return existing user when syncing again', async () => {
        // Sync again
        const user = await authService.syncUser(testUid, testEmail, 'Updated Name');

        expect(user.email).toBe(testEmail);
        expect((user as any).firebaseUid).toBe(testUid);
        // Should update name
        expect(user.name).toBe('Updated Name');
    }, 60000);

    it('should link existing user by email if firebaseUid is missing', async () => {
        const legacyEmail = `legacy-${timestamp}@example.com`;
        const legacyUid = `firebase-uid-legacy-${timestamp}`;

        // Create legacy user manually
        await prisma.user.create({
            data: {
                email: legacyEmail,
                name: 'Legacy User',
                password: 'hashedpassword',
                // firebaseUid is null
            }
        });

        // Sync with this email but new UID
        const user = await authService.syncUser(legacyUid, legacyEmail, 'Legacy User Synced');

        expect(user.email).toBe(legacyEmail);
        expect((user as any).firebaseUid).toBe(legacyUid);
        expect(user.name).toBe('Legacy User Synced');
    }, 60000);
});
