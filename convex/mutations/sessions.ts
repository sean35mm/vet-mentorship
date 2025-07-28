import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Create a session (usually called automatically when request is accepted)
export const createSession = mutation({
  args: {
    requestId: v.id('mentorshipRequests'),
    menteeId: v.id('users'),
    mentorId: v.id('users'),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify that the request exists and is accepted
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'accepted') {
      throw new Error('Can only create sessions for accepted requests');
    }

    // Verify that mentee and mentor match the request
    if (request.menteeId !== args.menteeId || request.mentorId !== args.mentorId) {
      throw new Error('Mentee and mentor must match the original request');
    }

    // Check if session already exists for this request
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_request', (q) => q.eq('requestId', args.requestId))
      .first();

    if (existingSession) {
      throw new Error('Session already exists for this request');
    }

    const now = Date.now();

    const sessionId = await ctx.db.insert('sessions', {
      requestId: args.requestId,
      menteeId: args.menteeId,
      mentorId: args.mentorId,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      duration: args.duration || 60,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    });

    return sessionId;
  },
});

// Update session details
export const updateSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    userId: v.id('users'),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    mentorNotes: v.optional(v.string()),
    menteeNotes: v.optional(v.string()),
    callSid: v.optional(v.string()),
    callStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify that the user is either the mentor or mentee
    if (session.mentorId !== args.userId && session.menteeId !== args.userId) {
      throw new Error('Unauthorized: You are not part of this session');
    }

    // Only allow updates to scheduled sessions for date/time changes
    if ((args.scheduledDate || args.scheduledTime) && session.status !== 'scheduled') {
      throw new Error('Can only reschedule sessions that are still scheduled');
    }

    // Prepare update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    // Only mentor can update mentor notes
    if (args.mentorNotes !== undefined && session.mentorId === args.userId) {
      updates.mentorNotes = args.mentorNotes.trim();
    }

    // Only mentee can update mentee notes
    if (args.menteeNotes !== undefined && session.menteeId === args.userId) {
      updates.menteeNotes = args.menteeNotes.trim();
    }

    // System updates (call information)
    if (args.callSid !== undefined) updates.callSid = args.callSid;
    if (args.callStatus !== undefined) updates.callStatus = args.callStatus;
    if (args.duration !== undefined) updates.duration = args.duration;

    // Reschedule session (both parties should be able to request this)
    if (args.scheduledDate !== undefined) {
      // Validate date format and that it's in the future
      const newDate = new Date(args.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(newDate.getTime())) {
        throw new Error('Invalid date format');
      }

      if (newDate < today) {
        throw new Error('Cannot reschedule to a past date');
      }

      updates.scheduledDate = args.scheduledDate;
    }

    if (args.scheduledTime !== undefined) {
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(args.scheduledTime)) {
        throw new Error('Invalid time format. Use HH:MM format');
      }

      updates.scheduledTime = args.scheduledTime;
    }

    await ctx.db.patch(args.sessionId, updates);
    return args.sessionId;
  },
});

// Start a session
export const startSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify that the user is either the mentor or mentee
    if (session.mentorId !== args.userId && session.menteeId !== args.userId) {
      throw new Error('Unauthorized: You are not part of this session');
    }

    // Only allow starting scheduled sessions
    if (session.status !== 'scheduled') {
      throw new Error('Can only start scheduled sessions');
    }

    const now = Date.now();

    await ctx.db.patch(args.sessionId, {
      status: 'in_progress',
      actualStartTime: now,
      updatedAt: now,
    });

    // Create notifications for both parties about session start
    const mentee = await ctx.db.get(session.menteeId);
    const mentor = await ctx.db.get(session.mentorId);
    
    if (mentee && mentor) {
      // Notify the other party that session has started
      const otherUserId = args.userId === session.mentorId ? session.menteeId : session.mentorId;
      const currentUserName = args.userId === session.mentorId ? `${mentor.firstName} ${mentor.lastName}` : `${mentee.firstName} ${mentee.lastName}`;
      
      await ctx.db.insert('notifications', {
        userId: otherUserId,
        type: 'session',
        title: 'Session Started',
        message: `Your mentorship session with ${currentUserName} has started.`,
        isRead: false,
        isActionable: true,
        actions: {
          primary: { label: 'Join Session', action: 'join_session' },
        },
        relatedUserId: args.userId,
        relatedSessionId: args.sessionId,
        metadata: {
          sessionId: args.sessionId,
        },
        createdAt: now,
      });
    }

    return args.sessionId;
  },
});

// Complete a session
export const completeSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    userId: v.id('users'),
    actualDuration: v.optional(v.number()), // Actual duration in minutes
    mentorNotes: v.optional(v.string()),
    menteeNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify that the user is either the mentor or mentee
    if (session.mentorId !== args.userId && session.menteeId !== args.userId) {
      throw new Error('Unauthorized: You are not part of this session');
    }

    // Only allow completing in-progress sessions
    if (session.status !== 'in_progress') {
      throw new Error('Can only complete sessions that are in progress');
    }

    const now = Date.now();

    // Prepare update object
    const updates: any = {
      status: 'completed',
      actualEndTime: now,
      updatedAt: now,
    };

    if (args.actualDuration !== undefined) {
      updates.duration = args.actualDuration;
    }

    // Only mentor can update mentor notes
    if (args.mentorNotes !== undefined && session.mentorId === args.userId) {
      updates.mentorNotes = args.mentorNotes.trim();
    }

    // Only mentee can update mentee notes
    if (args.menteeNotes !== undefined && session.menteeId === args.userId) {
      updates.menteeNotes = args.menteeNotes.trim();
    }

    await ctx.db.patch(args.sessionId, updates);

    // Update the original request status to completed
    await ctx.db.patch(session.requestId, {
      status: 'completed',
      updatedAt: now,
    });

    // Create notifications for both parties about session completion
    const mentee = await ctx.db.get(session.menteeId);
    const mentor = await ctx.db.get(session.mentorId);
    
    if (mentee && mentor) {
      // Notify both parties about completion and request for review
      const notifications = [
        {
          userId: session.menteeId,
          otherUserName: `${mentor.firstName} ${mentor.lastName}`,
        },
        {
          userId: session.mentorId,
          otherUserName: `${mentee.firstName} ${mentee.lastName}`,
        },
      ];
      
      for (const notif of notifications) {
        await ctx.db.insert('notifications', {
          userId: notif.userId,
          type: 'session',
          title: 'Session Completed',
          message: `Your mentorship session with ${notif.otherUserName} has been completed. Please consider leaving a review.`,
          isRead: false,
          isActionable: true,
          actions: {
            primary: { label: 'Leave Review', action: 'leave_review' },
          },
          relatedUserId: notif.userId === session.menteeId ? session.mentorId : session.menteeId,
          relatedSessionId: args.sessionId,
          metadata: {
            sessionId: args.sessionId,
          },
          createdAt: now,
        });
      }
    }

    return args.sessionId;
  },
});

// Cancel a session
export const cancelSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    userId: v.id('users'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify that the user is either the mentor or mentee
    if (session.mentorId !== args.userId && session.menteeId !== args.userId) {
      throw new Error('Unauthorized: You are not part of this session');
    }

    // Only allow cancelling scheduled or in-progress sessions
    if (!['scheduled', 'in_progress'].includes(session.status)) {
      throw new Error('Cannot cancel this session');
    }

    const now = Date.now();

    // Prepare update object
    const updates: any = {
      status: 'cancelled',
      updatedAt: now,
    };

    // Add cancellation reason as a note
    if (args.reason) {
      const reasonNote = `Cancelled: ${args.reason.trim()}`;
      if (session.mentorId === args.userId) {
        updates.mentorNotes = session.mentorNotes 
          ? `${session.mentorNotes}\n\n${reasonNote}`
          : reasonNote;
      } else {
        updates.menteeNotes = session.menteeNotes 
          ? `${session.menteeNotes}\n\n${reasonNote}`
          : reasonNote;
      }
    }

    await ctx.db.patch(args.sessionId, updates);

    // Update the original request status to cancelled
    await ctx.db.patch(session.requestId, {
      status: 'cancelled',
      updatedAt: now,
    });

    return args.sessionId;
  },
});

// Mark session as no-show
export const markNoShow = mutation({
  args: {
    sessionId: v.id('sessions'),
    userId: v.id('users'),
    noShowParty: v.union(v.literal('mentor'), v.literal('mentee'), v.literal('both')),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify that the user is either the mentor or mentee
    if (session.mentorId !== args.userId && session.menteeId !== args.userId) {
      throw new Error('Unauthorized: You are not part of this session');
    }

    // Only allow marking no-show for scheduled sessions
    if (session.status !== 'scheduled') {
      throw new Error('Can only mark no-show for scheduled sessions');
    }

    const now = Date.now();

    // Prepare update object
    const updates: any = {
      status: 'no_show',
      updatedAt: now,
    };

    // Add no-show information as notes
    if (args.notes || args.noShowParty) {
      const noShowNote = `No-show: ${args.noShowParty}${args.notes ? ` - ${args.notes.trim()}` : ''}`;
      if (session.mentorId === args.userId) {
        updates.mentorNotes = session.mentorNotes 
          ? `${session.mentorNotes}\n\n${noShowNote}`
          : noShowNote;
      } else {
        updates.menteeNotes = session.menteeNotes 
          ? `${session.menteeNotes}\n\n${noShowNote}`
          : noShowNote;
      }
    }

    await ctx.db.patch(args.sessionId, updates);

    // Update the original request status
    await ctx.db.patch(session.requestId, {
      status: 'completed', // Mark as completed even if no-show for tracking
      updatedAt: now,
    });

    return args.sessionId;
  },
});
