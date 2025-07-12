// Utility functions for creating notifications

export const createNotification = async (notificationData) => {
  try {
    // Check if we're running on server side
    const isServer = typeof window === 'undefined';
    
    let url;
    if (isServer) {
      // Server-side: use absolute URL with process.env.NEXT_PUBLIC_APP_URL or a default
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      url = `${baseUrl}/api/notification`;
    } else {
      // Client-side: can use relative URL
      url = '/api/notification';
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Extract mentions from content (@username)
export const extractMentions = (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Real-time notification functions using Pusher
export const subscribeToNotifications = (userId, onNewNotification) => {
  if (typeof window === 'undefined') return null;

  // Dynamic import to avoid SSR issues
  import('./pusher').then(({ pusherClient, CHANNELS, EVENTS }) => {
    if (!pusherClient) return null;
    
    const channel = pusherClient.subscribe(CHANNELS.USER_NOTIFICATIONS(userId));
    
    channel.bind(EVENTS.NEW_NOTIFICATION, (data) => {
      onNewNotification(data.notification);
    });

    channel.bind(EVENTS.NOTIFICATION_READ, (data) => {
      // Handle notification read event if needed
    });

    channel.bind(EVENTS.ALL_NOTIFICATIONS_READ, (data) => {
      // Handle all notifications read event if needed
    });

    return channel;
  }).catch(error => {
    console.error('Error loading Pusher:', error);
  });
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = (userId) => {
  if (typeof window === 'undefined') return;

  import('./pusher').then(({ pusherClient, CHANNELS }) => {
    if (!pusherClient) return;
    
    try {
      pusherClient.unsubscribe(CHANNELS.USER_NOTIFICATIONS(userId));
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  }).catch(error => {
    console.error('Error loading Pusher for unsubscribe:', error);
  });
};

// Create notification when someone answers a question
export const notifyQuestionAnswered = async (questionAuthorId, answerAuthorName, questionTitle, questionId) => {
  if (questionAuthorId === answerAuthorName) return; // Don't notify self

  await createNotification({
    user: questionAuthorId,
    type: 'answer',
    message: `${answerAuthorName} answered your question: "${questionTitle}"`,
    link: `/questions/${questionId}`
  });
};

// Create notification when someone comments on an answer
export const notifyAnswerCommented = async (answerAuthorId, commentAuthorName, questionTitle, questionId) => {
  if (answerAuthorId === commentAuthorName) return; // Don't notify self

  await createNotification({
    user: answerAuthorId,
    type: 'comment',
    message: `${commentAuthorName} commented on your answer to: "${questionTitle}"`,
    link: `/questions/${questionId}`
  });
};

// Create notification when someone comments on a question
export const notifyQuestionCommented = async (questionAuthorId, commentAuthorName, questionTitle, questionId) => {
  if (questionAuthorId === commentAuthorName) return; // Don't notify self

  await createNotification({
    user: questionAuthorId,
    type: 'comment',
    message: `${commentAuthorName} commented on your question: "${questionTitle}"`,
    link: `/questions/${questionId}`
  });
};

// Create notification when answer is accepted
export const notifyAnswerAccepted = async (answerAuthorId, questionAuthorName, questionTitle, questionId) => {
  if (answerAuthorId === questionAuthorName) return; // Don't notify self

  await createNotification({
    user: answerAuthorId,
    type: 'answer',
    message: `${questionAuthorName} accepted your answer to: "${questionTitle}"`,
    link: `/questions/${questionId}`
  });
};

// Create notification when someone replies to an answer
export const notifyAnswerReplied = async (answerAuthorId, replyAuthorName, questionTitle, questionId) => {
  if (answerAuthorId === replyAuthorName) return; // Don't notify self

  await createNotification({
    user: answerAuthorId,
    type: 'reply',
    message: `${replyAuthorName} replied to your answer on: "${questionTitle}"`,
    link: `/questions/${questionId}`
  });
};

// Create notification for mentions (@username)
export const notifyMention = async (mentionedUserId, mentionerName, content, questionId) => {
  if (mentionedUserId === mentionerName) return; // Don't notify self

  await createNotification({
    user: mentionedUserId,
    type: 'mention',
    message: `${mentionerName} mentioned you in a comment`,
    link: `/questions/${questionId}`
  });
};