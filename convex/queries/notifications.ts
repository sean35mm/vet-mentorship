import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get all notifications for a user (with real-time updates)
export const getUserNotifications = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    // Get related user data for notifications
    const notificationsWithUsers = await Promise.all(
      notifications.map(async (notification) => {
        let relatedUser = null;
        if (notification.relatedUserId) {
          relatedUser = await ctx.db.get(notification.relatedUserId);
        }

        return {
          ...notification,
          relatedUser: relatedUser ? {
            id: relatedUser._id,
            name: `${relatedUser.firstName} ${relatedUser.lastName}`,
            avatar: relatedUser.profileImage,
          } : null,
        };
      })
    );

    return notificationsWithUsers;
  },
});

// Get unread notification count for a user
export const getUnreadCount = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => 
        q.eq('userId', args.userId).eq('isRead', false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

// Get recent notifications (last 24 hours)
export const getRecentNotifications = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.gte(q.field('createdAt'), twentyFourHoursAgo))
      .order('desc')
      .take(10);

    // Get related user data
    const notificationsWithUsers = await Promise.all(
      notifications.map(async (notification) => {
        let relatedUser = null;
        if (notification.relatedUserId) {
          relatedUser = await ctx.db.get(notification.relatedUserId);
        }

        return {
          ...notification,
          relatedUser: relatedUser ? {
            id: relatedUser._id,
            name: `${relatedUser.firstName} ${relatedUser.lastName}`,
            avatar: relatedUser.profileImage,
          } : null,
        };
      })
    );

    return notificationsWithUsers;
  },
});