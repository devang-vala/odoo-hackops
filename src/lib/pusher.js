import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance (only available on server)
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Client-side Pusher instance (only available on client)
let pusherClient = null;

if (typeof window !== 'undefined') {
  pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });
}

export { pusherClient };

// Channel names
export const CHANNELS = {
  NOTIFICATIONS: 'notifications',
  USER_NOTIFICATIONS: (userId) => `user-${userId}`,
};

// Event names
export const EVENTS = {
  NEW_NOTIFICATION: 'new-notification',
  NOTIFICATION_READ: 'notification-read',
  ALL_NOTIFICATIONS_READ: 'all-notifications-read',
}; 