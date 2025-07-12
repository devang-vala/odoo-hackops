import { useEffect, useRef, useCallback } from 'react';
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/notifications';

export const useRealTimeNotifications = (userId, onNewNotification) => {
  const channelRef = useRef(null);

  // Memoize the callback to prevent unnecessary re-subscriptions
  const memoizedCallback = useCallback(onNewNotification, [onNewNotification]);

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;

    // Subscribe to real-time notifications
    const channel = subscribeToNotifications(userId, memoizedCallback);
    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromNotifications(userId);
      channelRef.current = null;
    };
  }, [userId, memoizedCallback]);

  return channelRef.current;
}; 