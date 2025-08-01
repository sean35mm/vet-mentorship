import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get all notifications for a user (with real-time updates)
export const getUserNotifications = query({
  args: { userId: v.id('users') },
  returns: v.array(v.object({
    _id: v.id('notifications'),
    _creationTime: v.number(),
    userId: v.id('users'),
    type: v.union(
      v.literal('request'),
      v.literal('session'),
      v.literal('review'),
      v.literal('system'),
      v.literal('reminder')
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    isActionable: v.boolean(),
    actions: v.optional(v.object({
      primary: v.optional(v.object({
        label: v.string(),
        action: v.string(),
      })),
      secondary: v.optional(v.object({
        label: v.string(),
        action: v.string(),
      })),
    })),
    relatedUserId: v.optional(v.id('users')),
    relatedRequestId: v.optional(v.id('mentorshipRequests')),
    relatedSessionId: v.optional(v.id('sessions')),
    relatedReviewId: v.optional(v.id('reviews')),
    metadata: v.optional(v.object({
      requestId: v.optional(v.string()),
      sessionId: v.optional(v.string()),
      reviewId: v.optional(v.string()),
    })),
    createdAt: v.number(),
    relatedUser: v.union(v.object({
      id: v.id('users'),
      name: v.string(),
      avatar: v.optional(v.string()),
    }), v.null()),
  })),
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
  returns: v.number(),
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
  returns: v.array(v.object({
    _id: v.id('notifications'),
    _creationTime: v.number(),
    userId: v.id('users'),
    type: v.union(
      v.literal('request'),
      v.literal('session'),
      v.literal('review'),
      v.literal('system'),
      v.literal('reminder')
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    isActionable: v.boolean(),
    actions: v.optional(v.object({
      primary: v.optional(v.object({
        label: v.string(),
        action: v.string(),
      })),
      secondary: v.optional(v.object({
        label: v.string(),
        action: v.string(),
      })),
    })),
    relatedUserId: v.optional(v.id('users')),
    relatedRequestId: v.optional(v.id('mentorshipRequests')),
    relatedSessionId: v.optional(v.id('sessions')),
    relatedReviewId: v.optional(v.id('reviews')),
    metadata: v.optional(v.object({
      requestId: v.optional(v.string()),
      sessionId: v.optional(v.string()),
      reviewId: v.optional(v.string()),
    })),
    createdAt: v.number(),
    relatedUser: v.union(v.object({
      id: v.id('users'),
      name: v.string(),
      avatar: v.optional(v.string()),
    }), v.null()),
  })),
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