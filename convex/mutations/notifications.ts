import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const createNotification = mutation({
  args: {
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
    isActionable: v.optional(v.boolean()),
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
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      isActionable: args.isActionable ?? false,
      actions: args.actions,
      relatedUserId: args.relatedUserId,
      relatedRequestId: args.relatedRequestId,
      relatedSessionId: args.relatedSessionId,
      relatedReviewId: args.relatedReviewId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => 
        q.eq('userId', args.userId).eq('isRead', false)
      )
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt: Date.now(),
        })
      )
    );
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const clearAllNotifications = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const userNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    await Promise.all(
      userNotifications.map((notification) =>
        ctx.db.delete(notification._id)
      )
    );
  },
});

export const createRequestNotification = mutation({
  args: {
    mentorId: v.id('users'),
    menteeId: v.id('users'),
    requestId: v.id('mentorshipRequests'),
    menteeName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      userId: args.mentorId,
      type: 'request',
      title: 'New Mentorship Request',
      message: `${args.menteeName} wants to schedule a mentorship session with you.`,
      isRead: false,
      isActionable: true,
      actions: {
        primary: { label: 'Accept', action: 'accept_request' },
        secondary: { label: 'Decline', action: 'decline_request' },
      },
      relatedUserId: args.menteeId,
      relatedRequestId: args.requestId,
      metadata: {
        requestId: args.requestId,
      },
      createdAt: Date.now(),
    });
  },
});

export const createSessionReminderNotification = mutation({
  args: {
    userId: v.id('users'),
    sessionId: v.id('sessions'),
    otherUserName: v.string(),
    scheduledTime: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      userId: args.userId,
      type: 'session',
      title: 'Session Reminder',
      message: `Your mentorship session with ${args.otherUserName} starts at ${args.scheduledTime}.`,
      isRead: false,
      isActionable: true,
      actions: {
        primary: { label: 'Join Session', action: 'join_session' },
        secondary: { label: 'Reschedule', action: 'reschedule_session' },
      },
      relatedSessionId: args.sessionId,
      metadata: {
        sessionId: args.sessionId,
      },
      createdAt: Date.now(),
    });
  },
});

export const createReviewNotification = mutation({
  args: {
    userId: v.id('users'),
    reviewerId: v.id('users'),
    reviewId: v.id('reviews'),
    reviewerName: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      userId: args.userId,
      type: 'review',
      title: 'New Review Received',
      message: `${args.reviewerName} left a ${args.rating}-star review for your recent session.`,
      isRead: false,
      isActionable: false,
      relatedUserId: args.reviewerId,
      relatedReviewId: args.reviewId,
      metadata: {
        reviewId: args.reviewId,
      },
      createdAt: Date.now(),
    });
  },
});