import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get session history for a user
export const getSessionHistory = query({
  args: { 
    userId: v.id('users'),
    role: v.optional(v.union(v.literal('mentor'), v.literal('mentee'), v.literal('all'))),
    status: v.optional(v.union(
      v.literal('scheduled'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('no_show'),
      v.literal('cancelled')
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    const role = args.role || 'all';

    let sessions = [];

    // Get sessions where user is mentor
    if (role === 'mentor' || role === 'all') {
      const mentorSessions = await ctx.db
        .query('sessions')
        .withIndex('by_mentor', (q) => q.eq('mentorId', args.userId))
        .collect();
      
      sessions.push(...mentorSessions.map(session => ({ ...session, userRole: 'mentor' as const })));
    }

    // Get sessions where user is mentee
    if (role === 'mentee' || role === 'all') {
      const menteeSessions = await ctx.db
        .query('sessions')
        .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
        .collect();
      
      sessions.push(...menteeSessions.map(session => ({ ...session, userRole: 'mentee' as const })));
    }

    // Filter by status if provided
    if (args.status) {
      sessions = sessions.filter(session => session.status === args.status);
    }

    // Sort by scheduled date (newest first)
    sessions.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime();
      const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedSessions = sessions.slice(offset, offset + limit);

    // Get additional data for each session
    const sessionsWithData = await Promise.all(
      paginatedSessions.map(async (session) => {
        // Get mentor and mentee information
        const mentor = await ctx.db.get(session.mentorId);
        const mentee = await ctx.db.get(session.menteeId);
        
        // Get the original request
        const request = await ctx.db.get(session.requestId);

        return {
          _id: session._id,
          requestId: session.requestId,
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          scheduledDate: session.scheduledDate,
          scheduledTime: session.scheduledTime,
          actualStartTime: session.actualStartTime,
          actualEndTime: session.actualEndTime,
          duration: session.duration,
          status: session.status,
          callSid: session.callSid,
          callStatus: session.callStatus,
          mentorNotes: session.mentorNotes,
          menteeNotes: session.menteeNotes,
          userRole: session.userRole,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
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
          request: request ? {
            subject: request.subject,
            mentorshipArea: request.mentorshipArea,
          } : null,
        };
      })
    );

    return {
      sessions: sessionsWithData,
      total: sessions.length,
      hasMore: offset + limit < sessions.length,
    };
  },
});

// Get upcoming sessions for a user
export const getUpcomingSessions = query({
  args: { 
    userId: v.id('users'),
    role: v.optional(v.union(v.literal('mentor'), v.literal('mentee'), v.literal('all'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const role = args.role || 'all';
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    let sessions = [];

    // Get sessions where user is mentor
    if (role === 'mentor' || role === 'all') {
      const mentorSessions = await ctx.db
        .query('sessions')
        .withIndex('by_mentor', (q) => q.eq('mentorId', args.userId))
        .filter((q) => 
          q.and(
            q.gte(q.field("scheduledDate"), today || new Date().toISOString()),
            q.or(
              q.eq(q.field('status'), 'scheduled'),
              q.eq(q.field('status'), 'in_progress')
            )
          )
        )
        .collect();
      
      sessions.push(...mentorSessions.map(session => ({ ...session, userRole: 'mentor' as const })));
    }

    // Get sessions where user is mentee
    if (role === 'mentee' || role === 'all') {
      const menteeSessions = await ctx.db
        .query('sessions')
        .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
        .filter((q) => 
          q.and(
            q.gte(q.field("scheduledDate"), today || new Date().toISOString()),
            q.or(
              q.eq(q.field('status'), 'scheduled'),
              q.eq(q.field('status'), 'in_progress')
            )
          )
        )
        .collect();
      
      sessions.push(...menteeSessions.map(session => ({ ...session, userRole: 'mentee' as const })));
    }

    // Sort by scheduled date and time (earliest first)
    sessions.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime();
      const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime();
      return dateA - dateB;
    });

    // Apply limit
    const limitedSessions = sessions.slice(0, limit);

    // Get additional data for each session
    const sessionsWithData = await Promise.all(
      limitedSessions.map(async (session) => {
        // Get mentor and mentee information
        const mentor = await ctx.db.get(session.mentorId);
        const mentee = await ctx.db.get(session.menteeId);
        
        // Get the original request
        const request = await ctx.db.get(session.requestId);

        return {
          _id: session._id,
          requestId: session.requestId,
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          scheduledDate: session.scheduledDate,
          scheduledTime: session.scheduledTime,
          duration: session.duration || 60,
          status: session.status,
          userRole: session.userRole,
          createdAt: session.createdAt,
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
          request: request ? {
            subject: request.subject,
            mentorshipArea: request.mentorshipArea,
          } : null,
        };
      })
    );

    return sessionsWithData;
  },
});

// Get session details by ID
export const getSessionById = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    // Get mentor and mentee information
    const mentor = await ctx.db.get(session.mentorId);
    const mentee = await ctx.db.get(session.menteeId);
    
    // Get the original request
    const request = await ctx.db.get(session.requestId);

    return {
      _id: session._id,
      requestId: session.requestId,
      mentorId: session.mentorId,
      menteeId: session.menteeId,
      scheduledDate: session.scheduledDate,
      scheduledTime: session.scheduledTime,
      actualStartTime: session.actualStartTime,
      actualEndTime: session.actualEndTime,
      duration: session.duration,
      status: session.status,
      callSid: session.callSid,
      callStatus: session.callStatus,
      mentorNotes: session.mentorNotes,
      menteeNotes: session.menteeNotes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
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
      request: request ? {
        subject: request.subject,
        message: request.message,
        mentorshipArea: request.mentorshipArea,
      } : null,
    };
  },
});

// Get session statistics for a user
export const getSessionStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Get all sessions where user is mentor
    const mentorSessions = await ctx.db
      .query('sessions')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.userId))
      .collect();

    // Get all sessions where user is mentee
    const menteeSessions = await ctx.db
      .query('sessions')
      .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
      .collect();

    // Calculate statistics
    const mentorStats = {
      total: mentorSessions.length,
      completed: mentorSessions.filter(s => s.status === 'completed').length,
      scheduled: mentorSessions.filter(s => s.status === 'scheduled').length,
      cancelled: mentorSessions.filter(s => s.status === 'cancelled').length,
      noShow: mentorSessions.filter(s => s.status === 'no_show').length,
      totalHours: mentorSessions
        .filter(s => s.status === 'completed' && s.duration)
        .reduce((sum, s) => sum + (s.duration || 0), 0) / 60, // Convert minutes to hours
    };

    const menteeStats = {
      total: menteeSessions.length,
      completed: menteeSessions.filter(s => s.status === 'completed').length,
      scheduled: menteeSessions.filter(s => s.status === 'scheduled').length,
      cancelled: menteeSessions.filter(s => s.status === 'cancelled').length,
      noShow: menteeSessions.filter(s => s.status === 'no_show').length,
      totalHours: menteeSessions
        .filter(s => s.status === 'completed' && s.duration)
        .reduce((sum, s) => sum + (s.duration || 0), 0) / 60, // Convert minutes to hours
    };

    return {
      asMentor: mentorStats,
      asMentee: menteeStats,
      totalSessions: mentorStats.total + menteeStats.total,
      totalCompletedSessions: mentorStats.completed + menteeStats.completed,
      totalHours: Math.round((mentorStats.totalHours + menteeStats.totalHours) * 10) / 10,
    };
  },
});