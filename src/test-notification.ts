import notificationService from './services/notification.service';
import prisma from './config/database';

async function testNotification() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        fcmToken: {
          not: null
        }
      }
    });

    if (!user || !user.fcmToken) {
      console.log('No user with FCM token found');
      return;
    }

    console.log(`Sending test notification to ${user.name} (${user.phone})`);
    console.log(`Token: ${user.fcmToken}`);

    const response = await notificationService.sendPushNotification(
      user.fcmToken,
      'Test Notification',
      'This is a test notification from the backend debugger',
      { type: 'test' }
    );

    console.log('Success response:', response);
  } catch (error) {
    console.error('Error sending test notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotification();
