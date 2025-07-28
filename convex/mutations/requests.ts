import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Create a mentorship request
export const createRequest = mutation({
  args: {
    menteeId: v.id('users'),
    mentorId: v.id('users'),
    requestedDate: v.string(), // Format: "YYYY-MM-DD"
    requestedTime: v.string(), // Format: "HH:MM"
    duration: v.optional(v.number()), // Duration in minutes, default 60
    subject: v.string(),
    message: v.string(),
    mentorshipArea: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate that mentee and mentor exist and are active
    const mentee = await ctx.db.get(args.menteeId);
    const mentor = await ctx.db.get(args.mentorId);

    if (!mentee || !mentee.isActive) {
      throw new Error('Mentee not found or inactive');
    }

    if (!mentor || !mentor.isActive) {
      throw new Error('Mentor not found or inactive');
    }

    // Validate that mentor is actually a mentor
    if (!mentor.isMentor) {
      throw new Error('User is not available as a mentor');
    }

    // Validate that mentee is actually a mentee
    if (!mentee.isMentee) {
      throw new Error('User is not registered as a mentee');
    }

    // Validate that mentee is not requesting themselves
    if (args.menteeId === args.mentorId) {
      throw new Error('Cannot request mentorship from yourself');
    }

    // Validate date format and that it's in the future
    const requestDate = new Date(args.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(requestDate.getTime())) {
      throw new Error('Invalid date format');
    }

    if (requestDate < today) {
      throw new Error('Cannot request mentorship for past dates');
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(args.requestedTime)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }

    // Validate required fields
    if (!args.subject.trim()) {
      throw new Error('Subject is required');
    }

    if (!args.message.trim()) {
      throw new Error('Message is required');
    }

    // Check if mentor has availability for this day/time
    const dayOfWeek = requestDate.getDay();
    const availability = await ctx.db
      .query('availability')
      .withIndex('by_user_day', (q) => 
        q.eq('userId', args.mentorId).eq('dayOfWeek', dayOfWeek)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (availability.length === 0) {
      throw new Error('Mentor is not available on this day');
    }

    // Check if the requested time falls within mentor's availability
    const requestedHour = parseInt((args.requestedTime || "0:0").split(":")[0] || "0");
    const isTimeAvailable = availability.some(slot => {
      const startHour = parseInt((slot.startTime || "0:0").split(":")[0] || "0");
      const endHour = parseInt((slot.endTime || "0:0").split(":")[0] || "0");
      return requestedHour >= startHour && requestedHour < endHour;
    });

    if (!isTimeAvailable) {
      throw new Error('Mentor is not available at this time');
    }

    // Check for existing requests/sessions at this time
    const existingRequest = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.mentorId))
      .filter((q) => 
        q.and(
          q.eq(q.field('requestedDate'), args.requestedDate),
          q.eq(q.field('requestedTime'), args.requestedTime),
          q.or(
            q.eq(q.field('status'), 'pending'),
            q.eq(q.field('status'), 'accepted')
          )
        )
      )
      .first();

    if (existingRequest) {
      throw new Error('This time slot is already requested or booked');
    }

    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.mentorId))
      .filter((q) => 
        q.and(
          q.eq(q.field('scheduledDate'), args.requestedDate),
          q.eq(q.field('scheduledTime'), args.requestedTime),
          q.or(
            q.eq(q.field('status'), 'scheduled'),
            q.eq(q.field('status'), 'in_progress')
          )
        )
      )
      .first();

    if (existingSession) {
      throw new Error('This time slot is already booked');
    }

    const now = Date.now();

    const requestId = await ctx.db.insert('mentorshipRequests', {
      menteeId: args.menteeId,
      mentorId: args.mentorId,
      requestedDate: args.requestedDate,
      requestedTime: args.requestedTime,
      duration: args.duration || 60,
      subject: args.subject.trim(),
      message: args.message.trim(),
      ...(args.mentorshipArea ? { mentorshipArea: args.mentorshipArea.trim() } : {}),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for mentor
    await ctx.db.insert('notifications', {
      userId: args.mentorId,
      type: 'request',
      title: 'New Mentorship Request',
      message: `${mentee.firstName} ${mentee.lastName} wants to schedule a mentorship session with you.`,
      isRead: false,
      isActionable: true,
      actions: {
        primary: { label: 'Accept', action: 'accept_request' },
        secondary: { label: 'Decline', action: 'decline_request' },
      },
      relatedUserId: args.menteeId,
      relatedRequestId: requestId,
      metadata: {
        requestId: requestId,
      },
      createdAt: now,
    });

    return requestId;
  },
});

// Accept a mentorship request
export const acceptRequest = mutation({
  args: {
    requestId: v.id('mentorshipRequests'),
    mentorId: v.id('users'),
    mentorResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Verify that the user is the mentor for this request
    if (request.mentorId !== args.mentorId) {
      throw new Error('Unauthorized: You are not the mentor for this request');
    }

    // Verify that the request is still pending
    if (request.status !== 'pending') {
      throw new Error('Request is no longer pending');
    }

    // Check if the time slot is still available
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.mentorId))
      .filter((q) => 
        q.and(
          q.eq(q.field('scheduledDate'), request.requestedDate),
          q.eq(q.field('scheduledTime'), request.requestedTime),
          q.or(
            q.eq(q.field('status'), 'scheduled'),
            q.eq(q.field('status'), 'in_progress')
          )
        )
      )
      .first();

    if (existingSession) {
      throw new Error('Time slot is no longer available');
    }

    const now = Date.now();

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: 'accepted',
      ...(args.mentorResponse ? { mentorResponse: args.mentorResponse.trim() } : {}),
      respondedAt: now,
      updatedAt: now,
    });

    // Create a session for the accepted request
    const sessionId = await ctx.db.insert('sessions', {
      requestId: args.requestId,
      menteeId: request.menteeId,
      mentorId: request.mentorId,
      scheduledDate: request.requestedDate,
      scheduledTime: request.requestedTime,
      duration: request.duration,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for mentee about acceptance
    const mentee = await ctx.db.get(request.menteeId);
    const mentor = await ctx.db.get(request.mentorId);
    
    if (mentee && mentor) {
      await ctx.db.insert('notifications', {
        userId: request.menteeId,
        type: 'request',
        title: 'Request Accepted',
        message: `${mentor.firstName} ${mentor.lastName} accepted your mentorship request for ${request.requestedDate} at ${request.requestedTime}.`,
        isRead: false,
        isActionable: false,
        relatedUserId: request.mentorId,
        relatedRequestId: args.requestId,
        relatedSessionId: sessionId,
        metadata: {
          requestId: args.requestId,
          sessionId: sessionId,
        },
        createdAt: now,
      });
    }

    return { requestId: args.requestId, sessionId };
  },
});

// Decline a mentorship request
export const declineRequest = mutation({
  args: {
    requestId: v.id('mentorshipRequests'),
    mentorId: v.id('users'),
    mentorResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Verify that the user is the mentor for this request
    if (request.mentorId !== args.mentorId) {
      throw new Error('Unauthorized: You are not the mentor for this request');
    }

    // Verify that the request is still pending
    if (request.status !== 'pending') {
      throw new Error('Request is no longer pending');
    }

    const now = Date.now();

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: 'declined',
      ...(args.mentorResponse ? { mentorResponse: args.mentorResponse.trim() } : {}),
      respondedAt: now,
      updatedAt: now,
    });

    // Create notification for mentee about decline
    const mentee = await ctx.db.get(request.menteeId);
    const mentor = await ctx.db.get(request.mentorId);
    
    if (mentee && mentor) {
      await ctx.db.insert('notifications', {
        userId: request.menteeId,
        type: 'request',
        title: 'Request Declined',
        message: `${mentor.firstName} ${mentor.lastName} declined your mentorship request.${args.mentorResponse ? ` Reason: ${args.mentorResponse}` : ''}`,
        isRead: false,
        isActionable: false,
        relatedUserId: request.mentorId,
        relatedRequestId: args.requestId,
        metadata: {
          requestId: args.requestId,
        },
        createdAt: now,
      });
    }

    return args.requestId;
  },
});

// Cancel a mentorship request (by mentee)
export const cancelRequest = mutation({
  args: {
    requestId: v.id('mentorshipRequests'),
    menteeId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Verify that the user is the mentee for this request
    if (request.menteeId !== args.menteeId) {
      throw new Error('Unauthorized: You are not the mentee for this request');
    }

    // Only allow cancellation of pending or accepted requests
    if (!['pending', 'accepted'].includes(request.status)) {
      throw new Error('Cannot cancel this request');
    }

    const now = Date.now();

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: 'cancelled',
      updatedAt: now,
    });

    // If the request was accepted, also cancel the associated session
    if (request.status === 'accepted') {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_request', (q) => q.eq('requestId', args.requestId))
        .first();

      if (session) {
        await ctx.db.patch(session._id, {
          status: 'cancelled',
          updatedAt: now,
        });
      }
    }

    return args.requestId;
  },
});

// Update request message (before it's responded to)
export const updateRequest = mutation({
  args: {
    requestId: v.id('mentorshipRequests'),
    menteeId: v.id('users'),
    subject: v.optional(v.string()),
    message: v.optional(v.string()),
    mentorshipArea: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Verify that the user is the mentee for this request
    if (request.menteeId !== args.menteeId) {
      throw new Error('Unauthorized: You are not the mentee for this request');
    }

    // Only allow updates to pending requests
    if (request.status !== 'pending') {
      throw new Error('Cannot update request that has been responded to');
    }

    // Prepare update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.subject !== undefined) {
      if (!args.subject.trim()) {
        throw new Error('Subject cannot be empty');
      }
      updates.subject = args.subject.trim();
    }

    if (args.message !== undefined) {
      if (!args.message.trim()) {
        throw new Error('Message cannot be empty');
      }
      updates.message = args.message.trim();
    }

    if (args.mentorshipArea !== undefined) {
      updates.mentorshipArea = args.mentorshipArea?.trim();
    }

    await ctx.db.patch(args.requestId, updates);
    return args.requestId;
  },
});
