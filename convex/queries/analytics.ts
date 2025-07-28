import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get dashboard analytics for a user
export const getDashboardAnalytics = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get session statistics
    const allSessions = await ctx.db
      .query('sessions')
      .filter((q) => 
        q.or(
          q.eq(q.field('menteeId'), args.userId),
          q.eq(q.field('mentorId'), args.userId)
        )
      )
      .collect();

    const recentSessions = allSessions.filter(s => s.createdAt >= thirtyDaysAgo);
    const completedSessions = allSessions.filter(s => s.status === 'completed');
    const totalHours = completedSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / 60;

    // Get request statistics
    const sentRequests = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentee', (q) => q.eq('menteeId', args.userId))
      .collect();

    const receivedRequests = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.userId))
      .collect();

    // Get review statistics
    const reviewsReceived = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', args.userId))
      .filter((q) => q.eq(q.field('isPublic'), true))
      .collect();

    const averageRating = reviewsReceived.length > 0 
      ? reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length 
      : 0;

    // Weekly session trend (last 8 weeks)
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = now - (i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);
      const weekSessions = allSessions.filter(s => 
        s.createdAt >= weekStart && s.createdAt < weekEnd && s.status === 'completed'
      );
      
      weeklyTrend.push({
        week: `Week ${8 - i}`,
        sessions: weekSessions.length,
        hours: weekSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / 60,
      });
    }

    // Request status distribution
    const requestStatusCounts = {
      pending: [...sentRequests, ...receivedRequests].filter(r => r.status === 'pending').length,
      accepted: [...sentRequests, ...receivedRequests].filter(r => r.status === 'accepted').length,
      completed: [...sentRequests, ...receivedRequests].filter(r => r.status === 'completed').length,
      declined: [...sentRequests, ...receivedRequests].filter(r => r.status === 'declined').length,
      cancelled: [...sentRequests, ...receivedRequests].filter(r => r.status === 'cancelled').length,
    };

    return {
      overview: {
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviewsReceived.length,
        recentSessions: recentSessions.length,
      },
      weeklyTrend,
      requestStatusCounts,
      recentActivity: {
        lastWeekSessions: allSessions.filter(s => s.createdAt >= sevenDaysAgo).length,
        pendingRequests: requestStatusCounts.pending,
        upcomingSessions: allSessions.filter(s => 
          s.status === 'scheduled' && 
          new Date(s.scheduledDate).getTime() >= new Date().setHours(0, 0, 0, 0)
        ).length,
      }
    };
  },
});

// Get mentorship areas analytics
export const getMentorshipAreasAnalytics = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query('mentorshipRequests')
      .filter((q) => 
        q.or(
          q.eq(q.field('menteeId'), args.userId),
          q.eq(q.field('mentorId'), args.userId)
        )
      )
      .collect();

    const areasCounts: Record<string, number> = {};
    
    requests.forEach(request => {
      if (request.mentorshipArea) {
        areasCounts[request.mentorshipArea] = (areasCounts[request.mentorshipArea] || 0) + 1;
      }
    });

    return Object.entries(areasCounts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 areas
  },
});

// Get platform-wide analytics (for admin dashboard)
export const getPlatformAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // User statistics
    const allUsers = await ctx.db.query('users').collect();
    const activeUsers = allUsers.filter(u => u.isActive);
    const mentors = activeUsers.filter(u => u.isMentor);
    const mentees = activeUsers.filter(u => u.isMentee);
    const recentUsers = allUsers.filter(u => u.createdAt >= thirtyDaysAgo);

    // Session statistics
    const allSessions = await ctx.db.query('sessions').collect();
    const completedSessions = allSessions.filter(s => s.status === 'completed');
    const recentSessions = allSessions.filter(s => s.createdAt >= thirtyDaysAgo);

    // Request statistics
    const allRequests = await ctx.db.query('mentorshipRequests').collect();
    const recentRequests = allRequests.filter(r => r.createdAt >= thirtyDaysAgo);

    // Monthly growth trend (last 12 months)
    const monthlyGrowth = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthUsers = allUsers.filter(u => 
        u.createdAt >= monthStart.getTime() && u.createdAt < monthEnd.getTime()
      );
      
      const monthSessions = allSessions.filter(s => 
        s.createdAt >= monthStart.getTime() && s.createdAt < monthEnd.getTime()
      );

      monthlyGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: monthUsers.length,
        sessions: monthSessions.length,
      });
    }

    return {
      users: {
        total: allUsers.length,
        active: activeUsers.length,
        mentors: mentors.length,
        mentees: mentees.length,
        recent: recentUsers.length,
      },
      sessions: {
        total: allSessions.length,
        completed: completedSessions.length,
        recent: recentSessions.length,
        totalHours: Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / 60),
      },
      requests: {
        total: allRequests.length,
        recent: recentRequests.length,
        acceptanceRate: allRequests.length > 0 
          ? Math.round((allRequests.filter(r => r.status === 'accepted').length / allRequests.length) * 100)
          : 0,
      },
      monthlyGrowth,
    };
  },
});
