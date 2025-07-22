import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get all requests for a user (both sent and received)
export const getRequestsByUser = query({
  args: { 
    userId: v.id('users'),
    type: v.optional(v.union(v.literal('sent'), v.literal('received'), v.literal('all'))),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('completed'),
      v.literal('cancelled')
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    const type = args.type || 'all';

    let requests = [];

    // Get sent requests (user as mentee)
    if (type === 'sent' || type === 'all') {
      const sentRequests = await ctx.db
        .query('mentorshipRequests')
        .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
        .collect();
      
      requests.push(...sentRequests.map(req => ({ ...req, requestType: 'sent' as const })));
    }

    // Get received requests (user as mentor)
    if (type === 'received' || type === 'all') {
      const receivedRequests = await ctx.db
        .query('mentorshipRequests')
        .withIndex('by_mentor', (q) => q.eq('mentorId', args.userId))
        .collect();
      
      requests.push(...receivedRequests.map(req => ({ ...req, requestType: 'received' as const })));
    }

    // Filter by status if provided
    if (args.status) {
      requests = requests.filter(req => req.status === args.status);
    }

    // Sort by creation date (newest first)
    requests.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination
    const paginatedRequests = requests.slice(offset, offset + limit);

    // Get additional data for each request
    const requestsWithData = await Promise.all(
      paginatedRequests.map(async (request) => {
        // Get mentor and mentee information
        const mentor = await ctx.db.get(request.mentorId);
        const mentee = await ctx.db.get(request.menteeId);

        return {
          _id: request._id,
          mentorId: request.mentorId,
          menteeId: request.menteeId,
          requestedDate: request.requestedDate,
          requestedTime: request.requestedTime,
          duration: request.duration,
          subject: request.subject,
          message: request.message,
          mentorshipArea: request.mentorshipArea,
          status: request.status,
          mentorResponse: request.mentorResponse,
          requestType: request.requestType,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          respondedAt: request.respondedAt,
          mentor: mentor ? {
            _id: mentor._id,
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            profileImage: mentor.profileImage,
            currentRole: mentor.currentRole,
            company: mentor.company,
          } : null,
          mentee: mentee ? {
            _id: mentee._id,
            firstName: mentee.firstName,
            lastName: mentee.lastName,
            profileImage: mentee.profileImage,
            currentRole: mentee.currentRole,
            company: mentee.company,
          } : null,
        };
      })
    );

    return {
      requests: requestsWithData,
      total: requests.length,
      hasMore: offset + limit < requests.length,
    };
  },
});

// Get pending requests for a mentor
export const getPendingRequests = query({
  args: { 
    mentorId: v.id('users'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const offset = args.offset || 0;

    const pendingRequests = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentor_status', (q) => 
        q.eq('mentorId', args.mentorId).eq('status', 'pending')
      )
      .order('desc')
      .take(limit + offset);

    // Apply pagination
    const paginatedRequests = pendingRequests.slice(offset, offset + limit);

    // Get mentee information for each request
    const requestsWithMentees = await Promise.all(
      paginatedRequests.map(async (request) => {
        const mentee = await ctx.db.get(request.menteeId);
        
        return {
          _id: request._id,
          menteeId: request.menteeId,
          requestedDate: request.requestedDate,
          requestedTime: request.requestedTime,
          duration: request.duration,
          subject: request.subject,
          message: request.message,
          mentorshipArea: request.mentorshipArea,
          createdAt: request.createdAt,
          mentee: mentee ? {
            _id: mentee._id,
            firstName: mentee.firstName,
            lastName: mentee.lastName,
            profileImage: mentee.profileImage,
            currentRole: mentee.currentRole,
            company: mentee.company,
            militaryBranch: mentee.militaryBranch,
            militaryRank: mentee.militaryRank,
          } : null,
        };
      })
    );

    return {
      requests: requestsWithMentees,
      total: pendingRequests.length,
      hasMore: offset + limit < pendingRequests.length,
    };
  },
});

// Get request details by ID
export const getRequestById = query({
  args: { requestId: v.id('mentorshipRequests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    // Get mentor and mentee information
    const mentor = await ctx.db.get(request.mentorId);
    const mentee = await ctx.db.get(request.menteeId);

    return {
      _id: request._id,
      mentorId: request.mentorId,
      menteeId: request.menteeId,
      requestedDate: request.requestedDate,
      requestedTime: request.requestedTime,
      duration: request.duration,
      subject: request.subject,
      message: request.message,
      mentorshipArea: request.mentorshipArea,
      status: request.status,
      mentorResponse: request.mentorResponse,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      respondedAt: request.respondedAt,
      mentor: mentor ? {
        _id: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        profileImage: mentor.profileImage,
        currentRole: mentor.currentRole,
        company: mentor.company,
        industry: mentor.industry,
        militaryBranch: mentor.militaryBranch,
        militaryRank: mentor.militaryRank,
      } : null,
      mentee: mentee ? {
        _id: mentee._id,
        firstName: mentee.firstName,
        lastName: mentee.lastName,
        profileImage: mentee.profileImage,
        currentRole: mentee.currentRole,
        company: mentee.company,
        industry: mentee.industry,
        militaryBranch: mentee.militaryBranch,
        militaryRank: mentee.militaryRank,
      } : null,
    };
  },
});

// Get request statistics for a user
export const getRequestStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Get all requests where user is mentee
    const sentRequests = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
      .collect();

    // Get all requests where user is mentor
    const receivedRequests = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.userId))
      .collect();

    // Calculate statistics
    const sentStats = {
      total: sentRequests.length,
      pending: sentRequests.filter(r => r.status === 'pending').length,
      accepted: sentRequests.filter(r => r.status === 'accepted').length,
      declined: sentRequests.filter(r => r.status === 'declined').length,
      completed: sentRequests.filter(r => r.status === 'completed').length,
      cancelled: sentRequests.filter(r => r.status === 'cancelled').length,
    };

    const receivedStats = {
      total: receivedRequests.length,
      pending: receivedRequests.filter(r => r.status === 'pending').length,
      accepted: receivedRequests.filter(r => r.status === 'accepted').length,
      declined: receivedRequests.filter(r => r.status === 'declined').length,
      completed: receivedRequests.filter(r => r.status === 'completed').length,
      cancelled: receivedRequests.filter(r => r.status === 'cancelled').length,
    };

    // Calculate acceptance rate as mentor
    const acceptanceRate = receivedStats.total > 0 
      ? Math.round((receivedStats.accepted / (receivedStats.accepted + receivedStats.declined)) * 100) || 0
      : 0;

    return {
      sent: sentStats,
      received: receivedStats,
      acceptanceRate,
    };
  },
});