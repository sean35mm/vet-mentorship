'use client';

import * as React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Notification } from '@/components/ui/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  isLoading: boolean;
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: Id<'users'>;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
}) => {
  // Real-time Convex queries
  const convexNotifications = useQuery(
    api.queries.notifications.getUserNotifications,
    userId ? { userId } : 'skip'
  );

  const convexUnreadCount = useQuery(
    api.queries.notifications.getUnreadCount,
    userId ? { userId } : 'skip'
  );

  // Convex mutations
  const markAsReadMutation = useMutation(
    api.mutations.notifications.markAsRead
  );
  const markAllAsReadMutation = useMutation(
    api.mutations.notifications.markAllAsRead
  );
  const deleteNotificationMutation = useMutation(
    api.mutations.notifications.deleteNotification
  );
  const clearAllMutation = useMutation(
    api.mutations.notifications.clearAllNotifications
  );
  const createNotificationMutation = useMutation(
    api.mutations.notifications.createNotification
  );

  // Handle notification actions
  const handleNotificationAction = React.useCallback(
    (action: string, notificationId: Id<'notifications'>) => {
      console.log(
        `Handling action: ${action} for notification: ${notificationId}`
      );
      // TODO: Implement specific action handlers based on action type
      switch (action) {
        case 'accept_request':
          // Handle accept request
          break;
        case 'decline_request':
          // Handle decline request
          break;
        case 'join_session':
          // Handle join session
          break;
        case 'reschedule_session':
          // Handle reschedule session
          break;
        default:
          console.log('Unknown action:', action);
      }
    },
    []
  );

  // Transform Convex data to UI format
  const notifications = React.useMemo(() => {
    if (!convexNotifications) return [];

    return convexNotifications.map(
      (notification): Notification => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: new Date(notification.createdAt).toISOString(),
        read: notification.isRead,
        actionable: notification.isActionable,
        user: notification.relatedUser
          ? {
              name: notification.relatedUser.name,
              avatar: notification.relatedUser.avatar,
            }
          : undefined,
        actions: notification.actions
          ? {
              primary: notification.actions.primary
                ? {
                    label: notification.actions.primary.label,
                    action: () =>
                      handleNotificationAction(
                        notification.actions!.primary!.action,
                        notification._id
                      ),
                  }
                : undefined,
              secondary: notification.actions.secondary
                ? {
                    label: notification.actions.secondary.label,
                    action: () =>
                      handleNotificationAction(
                        notification.actions!.secondary!.action,
                        notification._id
                      ),
                  }
                : undefined,
            }
          : undefined,
        metadata: notification.metadata,
      })
    );
  }, [convexNotifications, handleNotificationAction]);

  const unreadCount = convexUnreadCount ?? 0;
  const isLoading = convexNotifications === undefined;

  const addNotification = React.useCallback(
    async (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
      if (!userId) return;

      await createNotificationMutation({
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        isActionable: notificationData.actionable,
        actions: notificationData.actions
          ? {
              primary: notificationData.actions.primary
                ? {
                    label: notificationData.actions.primary.label,
                    action: 'custom_action', // Map UI actions to action identifiers
                  }
                : undefined,
              secondary: notificationData.actions.secondary
                ? {
                    label: notificationData.actions.secondary.label,
                    action: 'custom_action',
                  }
                : undefined,
            }
          : undefined,
        metadata: notificationData.metadata,
      });
    },
    [userId, createNotificationMutation]
  );

  const markAsRead = React.useCallback(
    async (id: string) => {
      await markAsReadMutation({ notificationId: id as Id<'notifications'> });
    },
    [markAsReadMutation]
  );

  const markAllAsRead = React.useCallback(async () => {
    if (!userId) return;
    await markAllAsReadMutation({ userId });
  }, [userId, markAllAsReadMutation]);

  const deleteNotification = React.useCallback(
    async (id: string) => {
      await deleteNotificationMutation({
        notificationId: id as Id<'notifications'>,
      });
    },
    [deleteNotificationMutation]
  );

  const clearAll = React.useCallback(async () => {
    if (!userId) return;
    await clearAllMutation({ userId });
  }, [userId, clearAllMutation]);

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      isLoading,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      isLoading,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

// Hook for creating toast notifications
export const useToast = () => {
  const { addNotification } = useNotifications();

  const toast = React.useCallback(
    (title: string, message: string, type: Notification['type'] = 'system') => {
      addNotification({
        type,
        title,
        message,
        read: false,
        actionable: false,
      });
    },
    [addNotification]
  );

  const success = React.useCallback(
    (title: string, message: string) => {
      toast(title, message, 'system');
    },
    [toast]
  );

  const error = React.useCallback(
    (title: string, message: string) => {
      toast(title, message, 'system');
    },
    [toast]
  );

  const info = React.useCallback(
    (title: string, message: string) => {
      toast(title, message, 'system');
    },
    [toast]
  );

  return { toast, success, error, info };
};
