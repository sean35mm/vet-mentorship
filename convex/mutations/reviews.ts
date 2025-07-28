import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Create a review for a completed session
export const createReview = mutation({
  args: {
    sessionId: v.id('sessions'),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(), // 1-5 stars
    feedback: v.string(),
    communicationRating: v.optional(v.number()), // 1-5 stars
    helpfulnessRating: v.optional(v.number()), // 1-5 stars
    professionalismRating: v.optional(v.number()), // 1-5 stars
    isPublic: v.optional(v.boolean()), // Default true
  },
  handler: async (ctx, args) => {
    // Verify that the session exists and is completed
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'completed') {
      throw new Error('Can only review completed sessions');
    }

    // Verify that the reviewer was part of the session
    if (session.mentorId !== args.reviewerId && session.menteeId !== args.reviewerId) {
      throw new Error('You can only review sessions you participated in');
    }

    // Verify that the reviewee was the other party in the session
    const expectedRevieweeId = session.mentorId === args.reviewerId 
      ? session.menteeId 
      : session.mentorId;

    if (args.revieweeId !== expectedRevieweeId) {
      throw new Error('Invalid reviewee for this session');
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query('reviews')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .filter((q) => q.eq(q.field('reviewerId'), args.reviewerId))
      .first();

    if (existingReview) {
      throw new Error('You have already reviewed this session');
    }

    // Validate rating values
    if (args.rating < 1 || args.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (args.communicationRating !== undefined && (args.communicationRating < 1 || args.communicationRating > 5)) {
      throw new Error('Communication rating must be between 1 and 5');
    }

    if (args.helpfulnessRating !== undefined && (args.helpfulnessRating < 1 || args.helpfulnessRating > 5)) {
      throw new Error('Helpfulness rating must be between 1 and 5');
    }

    if (args.professionalismRating !== undefined && (args.professionalismRating < 1 || args.professionalismRating > 5)) {
      throw new Error('Professionalism rating must be between 1 and 5');
    }

    // Validate feedback
    if (!args.feedback.trim()) {
      throw new Error('Feedback is required');
    }

    if (args.feedback.trim().length < 10) {
      throw new Error('Feedback must be at least 10 characters long');
    }

    const now = Date.now();

    const reviewId = await ctx.db.insert('reviews', {
      sessionId: args.sessionId,
      reviewerId: args.reviewerId,
      revieweeId: args.revieweeId,
      rating: args.rating,
      feedback: args.feedback.trim(),
      ...(args.communicationRating !== undefined ? { communicationRating: args.communicationRating } : {}),
      ...(args.helpfulnessRating !== undefined ? { helpfulnessRating: args.helpfulnessRating } : {}),
      ...(args.professionalismRating !== undefined ? { professionalismRating: args.professionalismRating } : {}),
      isPublic: args.isPublic !== undefined ? args.isPublic : true,
      isApproved: true, // Auto-approve for now, could add moderation later
      createdAt: now,
      updatedAt: now,
    });

    return reviewId;
  },
});

// Update a review (within a certain time period)
export const updateReview = mutation({
  args: {
    reviewId: v.id('reviews'),
    reviewerId: v.id('users'),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
    communicationRating: v.optional(v.number()),
    helpfulnessRating: v.optional(v.number()),
    professionalismRating: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify that the user is the reviewer
    if (review.reviewerId !== args.reviewerId) {
      throw new Error('You can only update your own reviews');
    }

    // Check if review is still editable (within 24 hours of creation)
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (review.createdAt < twentyFourHoursAgo) {
      throw new Error('Reviews can only be edited within 24 hours of creation');
    }

    // Prepare update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.rating !== undefined) {
      if (args.rating < 1 || args.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      updates.rating = args.rating;
    }

    if (args.feedback !== undefined) {
      if (!args.feedback.trim()) {
        throw new Error('Feedback cannot be empty');
      }
      if (args.feedback.trim().length < 10) {
        throw new Error('Feedback must be at least 10 characters long');
      }
      updates.feedback = args.feedback.trim();
    }

    if (args.communicationRating !== undefined) {
      if (args.communicationRating < 1 || args.communicationRating > 5) {
        throw new Error('Communication rating must be between 1 and 5');
      }
      updates.communicationRating = args.communicationRating;
    }

    if (args.helpfulnessRating !== undefined) {
      if (args.helpfulnessRating < 1 || args.helpfulnessRating > 5) {
        throw new Error('Helpfulness rating must be between 1 and 5');
      }
      updates.helpfulnessRating = args.helpfulnessRating;
    }

    if (args.professionalismRating !== undefined) {
      if (args.professionalismRating < 1 || args.professionalismRating > 5) {
        throw new Error('Professionalism rating must be between 1 and 5');
      }
      updates.professionalismRating = args.professionalismRating;
    }

    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
    }

    await ctx.db.patch(args.reviewId, updates);
    return args.reviewId;
  },
});

// Respond to a review (by the reviewee)
export const respondToReview = mutation({
  args: {
    reviewId: v.id('reviews'),
    revieweeId: v.id('users'),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify that the user is the reviewee
    if (review.revieweeId !== args.revieweeId) {
      throw new Error('You can only respond to reviews about you');
    }

    // Validate response
    if (!args.response.trim()) {
      throw new Error('Response cannot be empty');
    }

    if (args.response.trim().length < 5) {
      throw new Error('Response must be at least 5 characters long');
    }

    const now = Date.now();

    await ctx.db.patch(args.reviewId, {
      response: args.response.trim(),
      respondedAt: now,
      updatedAt: now,
    });

    return args.reviewId;
  },
});

// Update review response
export const updateReviewResponse = mutation({
  args: {
    reviewId: v.id('reviews'),
    revieweeId: v.id('users'),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify that the user is the reviewee
    if (review.revieweeId !== args.revieweeId) {
      throw new Error('You can only update responses to reviews about you');
    }

    // Check if there's already a response
    if (!review.response) {
      throw new Error('No existing response to update');
    }

    // Validate response
    if (!args.response.trim()) {
      throw new Error('Response cannot be empty');
    }

    if (args.response.trim().length < 5) {
      throw new Error('Response must be at least 5 characters long');
    }

    await ctx.db.patch(args.reviewId, {
      response: args.response.trim(),
      updatedAt: Date.now(),
    });

    return args.reviewId;
  },
});

// Delete a review (within a certain time period)
export const deleteReview = mutation({
  args: {
    reviewId: v.id('reviews'),
    reviewerId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify that the user is the reviewer
    if (review.reviewerId !== args.reviewerId) {
      throw new Error('You can only delete your own reviews');
    }

    // Check if review is still deletable (within 1 hour of creation)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (review.createdAt < oneHourAgo) {
      throw new Error('Reviews can only be deleted within 1 hour of creation');
    }

    await ctx.db.delete(args.reviewId);
    return args.reviewId;
  },
});

// Report a review (for moderation)
export const reportReview = mutation({
  args: {
    reviewId: v.id('reviews'),
    reporterId: v.id('users'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Validate reason
    if (!args.reason.trim()) {
      throw new Error('Report reason is required');
    }

    // In a real application, you would:
    // 1. Create a reports table to track this
    // 2. Notify moderators
    // 3. Potentially hide the review pending review

    // For now, we'll just mark the review as needing approval
    await ctx.db.patch(args.reviewId, {
      isApproved: false,
      updatedAt: Date.now(),
    });

    return args.reviewId;
  },
});

// Moderate a review (admin function)
export const moderateReview = mutation({
  args: {
    reviewId: v.id('reviews'),
    isApproved: v.boolean(),
    moderatorNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // In a real application, you would verify admin permissions here

    await ctx.db.patch(args.reviewId, {
      isApproved: args.isApproved,
      updatedAt: Date.now(),
    });

    return args.reviewId;
  },
});