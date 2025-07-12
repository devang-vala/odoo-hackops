'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Bell } from 'lucide-react';

export default function NotificationDropdown({ isOpen, onClose, userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(
          notifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        
        // Dispatch event for unread count update
        window.dispatchEvent(new CustomEvent('notification-read'));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        setNotifications(
          notifications.map(n => ({ ...n, isRead: true }))
        );
        
        // Dispatch event for unread count update
        window.dispatchEvent(new CustomEvent('all-notifications-read'));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!isOpen) return null;

  // For demo purposes - sample notifications
  const sampleNotifications = [
    {
      id: 1, 
      title: "Your question received an answer", 
      message: "John Doe answered your question about React hooks.",
      createdAt: "2025-07-11T12:30:00Z",
      isRead: false,
      link: "/questions/1"
    },
    {
      id: 2, 
      title: "Your answer was accepted", 
      message: "Jane Smith accepted your answer about Next.js authentication.",
      createdAt: "2025-07-10T15:45:00Z",
      isRead: true,
      link: "/questions/2"
    },
    {
      id: 3, 
      title: "Comment on your question", 
      message: "Alex Johnson commented on your question about CSS Grid.",
      createdAt: "2025-07-09T09:20:00Z",
      isRead: false,
      link: "/questions/3"
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] z-50">
      <div className="p-4 border-b-2 border-gray-200 flex justify-between items-center">
        <h3 className="font-bold">Notifications</h3>
        <button 
          onClick={markAllAsRead}
          className="text-sm text-[#00d447] hover:underline font-medium"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <div className="w-6 h-6 border-2 border-[#00d447] border-t-transparent animate-spin"></div>
          </div>
        ) : displayNotifications.length > 0 ? (
          <div>
            {displayNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-b border-gray-200 hover:bg-gray-50 ${!notification.isRead ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 ${!notification.isRead ? 'bg-[#00d447]' : 'bg-gray-300'}`}></div>
                  <div className="ml-3 flex-1">
                    <Link href={notification.link || '#'}>
                      <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                      <div className="text-sm text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </Link>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 text-gray-400 hover:text-[#00d447]"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 text-center">
        <Link href="/notifications">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            View all notifications
          </button>
        </Link>
      </div>
    </div>
  );
}