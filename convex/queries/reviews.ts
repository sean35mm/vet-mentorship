import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get reviews for a mentor
export const getReviewsByMentor = query({
  args: { 
    mentorId: v.id('users'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    reviews: v.array(v.object({
      _id: v.id('reviews'),
      sessionId: v.id('sessions'),
      rating: v.number(),
      feedback: v.string(),
      communicationRating: v.optional(v.number()),
      helpfulnessRating: v.optional(v.number()),
      professionalismRating: v.optional(v.number()),
      response: v.optional(v.string()),
      respondedAt: v.optional(v.number()),
      createdAt: v.number(),
      reviewer: v.union(v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        profileImage: v.optional(v.string()),
        currentRole: v.optional(v.string()),
        company: v.optional(v.string()),
        militaryBranch: v.optional(v.union(
          v.literal('Army'),
          v.literal('Navy'),
          v.literal('Air Force'),
          v.literal('Marines'),
          v.literal('Coast Guard'),
          v.literal('Space Force')
        )),
        militaryRank: v.optional(v.string()),
      }), v.null()),
      session: v.union(v.object({
        scheduledDate: v.string(),
        duration: v.optional(v.number()),
      }), v.null()),
    })),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee_public', (q) => 
        q.eq('revieweeId', args.mentorId).eq('isPublic', true).eq('isApproved', true)
      )
      .order('desc')
      .take(limit + offset);

    // Apply pagination
    const paginatedReviews = reviews.slice(offset, offset + limit);

    // Get reviewer information for each review
    const reviewsWithReviewers = await Promise.all(
      paginatedReviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const session = await ctx.db.get(review.sessionId);

        return {
          _id: review._id,
          sessionId: review.sessionId,
          rating: review.rating,
          feedback: review.feedback,
          communicationRating: review.communicationRating,
          helpfulnessRating: review.helpfulnessRating,
          professionalismRating: review.professionalismRating,
          response: review.response,
          respondedAt: review.respondedAt,
          createdAt: review.createdAt,
          reviewer: reviewer ? {
            _id: reviewer._id,
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            profileImage: reviewer.profileImage,
            currentRole: reviewer.currentRole,
            company: reviewer.company,
            militaryBranch: reviewer.militaryBranch,
            militaryRank: reviewer.militaryRank,
          } : null,
          session: session ? {
            scheduledDate: session.scheduledDate,
            duration: session.duration,
          } : null,
        };
      })
    );

    return {
      reviews: reviewsWithReviewers,
      total: reviews.length,
      hasMore: offset + limit < reviews.length,
    };
  },
});

// Get review statistics for a mentor
export const getReviewStats = query({
  args: { mentorId: v.id('users') },
  returns: v.object({
    totalReviews: v.number(),
    averageRating: v.number(),
    ratingDistribution: v.record(v.string(), v.number()),
    averageCommunicationRating: v.number(),
    averageHelpfulnessRating: v.number(),
    averageProfessionalismRating: v.number(),
    responseRate: v.number(),
  }),
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee_public', (q) => 
        q.eq('revieweeId', args.mentorId).eq('isPublic', true).eq('isApproved', true)
      )
      .collect();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageCommunicationRating: 0,
        averageHelpfulnessRating: 0,
        averageProfessionalismRating: 0,
        responseRate: 0,
      };
    }

    // Calculate overall statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    // Ensure all ratings 1-5 are represented
    for (let i = 1; i <= 5; i++) {
      if (!ratingDistribution[i]) ratingDistribution[i] = 0;
    }

    // Calculate detailed rating averages (only for reviews that have them)
    const communicationReviews = reviews.filter(r => r.communicationRating !== undefined);
    const helpfulnessReviews = reviews.filter(r => r.helpfulnessRating !== undefined);
    const professionalismReviews = reviews.filter(r => r.professionalismRating !== undefined);

    const averageCommunicationRating = communicationReviews.length > 0
      ? communicationReviews.reduce((sum, review) => sum + review.communicationRating!, 0) / communicationReviews.length
      : 0;

    const averageHelpfulnessRating = helpfulnessReviews.length > 0
      ? helpfulnessReviews.reduce((sum, review) => sum + review.helpfulnessRating!, 0) / helpfulnessReviews.length
      : 0;

    const averageProfessionalismRating = professionalismReviews.length > 0
      ? professionalismReviews.reduce((sum, review) => sum + review.professionalismRating!, 0) / professionalismReviews.length
      : 0;

    // Calculate response rate (how often mentor responds to reviews)
    const reviewsWithResponse = reviews.filter(r => r.response && r.response.trim().length > 0);
    const responseRate = (reviewsWithResponse.length / totalReviews) * 100;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      averageCommunicationRating: Math.round(averageCommunicationRating * 10) / 10,
      averageHelpfulnessRating: Math.round(averageHelpfulnessRating * 10) / 10,
      averageProfessionalismRating: Math.round(averageProfessionalismRating * 10) / 10,
      responseRate: Math.round(responseRate),
    };
  },
});

// Get reviews written by a user (as reviewer)
export const getReviewsByReviewer = query({
  args: { 
    reviewerId: v.id('users'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    reviews: v.array(v.object({
      _id: v.id('reviews'),
      sessionId: v.id('sessions'),
      rating: v.number(),
      feedback: v.string(),
      communicationRating: v.optional(v.number()),
      helpfulnessRating: v.optional(v.number()),
      professionalismRating: v.optional(v.number()),
      isPublic: v.boolean(),
      isApproved: v.boolean(),
      response: v.optional(v.string()),
      respondedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      reviewee: v.union(v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        profileImage: v.optional(v.string()),
        currentRole: v.optional(v.string()),
        company: v.optional(v.string()),
      }), v.null()),
      session: v.union(v.object({
        scheduledDate: v.string(),
        scheduledTime: v.string(),
        duration: v.optional(v.number()),
      }), v.null()),
    })),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewer', (q) => q.eq('reviewerId', args.reviewerId))
      .order('desc')
      .take(limit + offset);

    // Apply pagination
    const paginatedReviews = reviews.slice(offset, offset + limit);

    // Get reviewee information for each review
    const reviewsWithReviewees = await Promise.all(
      paginatedReviews.map(async (review) => {
        const reviewee = await ctx.db.get(review.revieweeId);
        const session = await ctx.db.get(review.sessionId);

        return {
          _id: review._id,
          sessionId: review.sessionId,
          rating: review.rating,
          feedback: review.feedback,
          communicationRating: review.communicationRating,
          helpfulnessRating: review.helpfulnessRating,
          professionalismRating: review.professionalismRating,
          isPublic: review.isPublic,
          isApproved: review.isApproved,
          response: review.response,
          respondedAt: review.respondedAt,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          reviewee: reviewee ? {
            _id: reviewee._id,
            firstName: reviewee.firstName,
            lastName: reviewee.lastName,
            profileImage: reviewee.profileImage,
            currentRole: reviewee.currentRole,
            company: reviewee.company,
          } : null,
          session: session ? {
            scheduledDate: session.scheduledDate,
            scheduledTime: session.scheduledTime,
            duration: session.duration,
          } : null,
        };
      })
    );

    return {
      reviews: reviewsWithReviewees,
      total: reviews.length,
      hasMore: offset + limit < reviews.length,
    };
  },
});

// Get review by ID
export const getReviewById = query({
  args: { reviewId: v.id('reviews') },
  returns: v.union(v.object({
    _id: v.id('reviews'),
    sessionId: v.id('sessions'),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    feedback: v.string(),
    communicationRating: v.optional(v.number()),
    helpfulnessRating: v.optional(v.number()),
    professionalismRating: v.optional(v.number()),
    isPublic: v.boolean(),
    isApproved: v.boolean(),
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    reviewer: v.union(v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      profileImage: v.optional(v.string()),
      currentRole: v.optional(v.string()),
      company: v.optional(v.string()),
      militaryBranch: v.optional(v.union(
        v.literal('Army'),
        v.literal('Navy'),
        v.literal('Air Force'),
        v.literal('Marines'),
        v.literal('Coast Guard'),
        v.literal('Space Force')
      )),
      militaryRank: v.optional(v.string()),
    }), v.null()),
    reviewee: v.union(v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      profileImage: v.optional(v.string()),
      currentRole: v.optional(v.string()),
      company: v.optional(v.string()),
      militaryBranch: v.optional(v.union(
        v.literal('Army'),
        v.literal('Navy'),
        v.literal('Air Force'),
        v.literal('Marines'),
        v.literal('Coast Guard'),
        v.literal('Space Force')
      )),
      militaryRank: v.optional(v.string()),
    }), v.null()),
    session: v.union(v.object({
      scheduledDate: v.string(),
      scheduledTime: v.string(),
      duration: v.optional(v.number()),
    }), v.null()),
  }), v.null()),
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) return null;

    // Get reviewer and reviewee information
    const reviewer = await ctx.db.get(review.reviewerId);
    const reviewee = await ctx.db.get(review.revieweeId);
    const session = await ctx.db.get(review.sessionId);

    return {
      _id: review._id,
      sessionId: review.sessionId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      rating: review.rating,
      feedback: review.feedback,
      communicationRating: review.communicationRating,
      helpfulnessRating: review.helpfulnessRating,
      professionalismRating: review.professionalismRating,
      isPublic: review.isPublic,
      isApproved: review.isApproved,
      response: review.response,
      respondedAt: review.respondedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewer: reviewer ? {
        _id: reviewer._id,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        profileImage: reviewer.profileImage,
        currentRole: reviewer.currentRole,
        company: reviewer.company,
        militaryBranch: reviewer.militaryBranch,
        militaryRank: reviewer.militaryRank,
      } : null,
      reviewee: reviewee ? {
        _id: reviewee._id,
        firstName: reviewee.firstName,
        lastName: reviewee.lastName,
        profileImage: reviewee.profileImage,
        currentRole: reviewee.currentRole,
        company: reviewee.company,
        militaryBranch: reviewee.militaryBranch,
        militaryRank: reviewee.militaryRank,
      } : null,
      session: session ? {
        scheduledDate: session.scheduledDate,
        scheduledTime: session.scheduledTime,
        duration: session.duration,
      } : null,
    };
  },
});

// Get pending reviews for a user (sessions they need to review)
export const getPendingReviews = query({
  args: { userId: v.id('users') },
  returns: v.array(v.object({
    sessionId: v.id('sessions'),
    mentorId: v.id('users'),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    duration: v.optional(v.number()),
    completedAt: v.number(),
    mentor: v.union(v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      profileImage: v.optional(v.string()),
      currentRole: v.optional(v.string()),
      company: v.optional(v.string()),
    }), v.null()),
    request: v.union(v.object({
      subject: v.string(),
      mentorshipArea: v.optional(v.string()),
    }), v.null()),
  })),
  handler: async (ctx, args) => {
    // Get completed sessions where user was mentee
    const completedSessions = await ctx.db
      .query('sessions')
      .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'completed'))
      .collect();

    // Get existing reviews by this user
    const existingReviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewer', (q) => q.eq('reviewerId', args.userId))
      .collect();

    const reviewedSessionIds = new Set(existingReviews.map(r => r.sessionId));

    // Filter sessions that haven't been reviewed yet
    const sessionsNeedingReview = completedSessions.filter(
      session => !reviewedSessionIds.has(session._id)
    );

    // Get mentor information for each session
    const pendingReviews = await Promise.all(
      sessionsNeedingReview.map(async (session) => {
        const mentor = await ctx.db.get(session.mentorId);
        const request = await ctx.db.get(session.requestId);

        return {
          sessionId: session._id,
          mentorId: session.mentorId,
          scheduledDate: session.scheduledDate,
          scheduledTime: session.scheduledTime,
          duration: session.duration,
          completedAt: session.updatedAt,
          mentor: mentor ? {
            _id: mentor._id,
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            profileImage: mentor.profileImage,
            currentRole: mentor.currentRole,
            company: mentor.company,
          } : null,
          request: request ? {
            subject: request.subject,
            mentorshipArea: request.mentorshipArea,
          } : null,
        };
      })
    );

    return pendingReviews.sort((a, b) => b.completedAt - a.completedAt);
  },
});