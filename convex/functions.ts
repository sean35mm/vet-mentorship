import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

// Send session reminders for upcoming sessions
export const sendSessionReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Format dates for comparison
    const todayStr = now.toISOString().split('T')[0] || '';
    const reminderTimeStr = thirtyMinutesFromNow.toTimeString().slice(0, 5) || '';
    
    // Find sessions starting in 30 minutes
    const upcomingSessions = await ctx.db
      .query('sessions')
      .withIndex('by_date', (q) => q.eq('scheduledDate', todayStr))
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'scheduled'),
          q.eq(q.field('scheduledTime'), reminderTimeStr)
        )
      )
      .collect();

    for (const session of upcomingSessions) {
      const mentee = await ctx.db.get(session.menteeId);
      const mentor = await ctx.db.get(session.mentorId);
      
      if (!mentee || !mentor) continue;

      // Check if reminders already sent for this session
      const existingReminders = await ctx.db
        .query('notifications')
        .filter((q) => 
          q.and(
            q.eq(q.field('relatedSessionId'), session._id),
            q.eq(q.field('type'), 'session'),
            q.eq(q.field('title'), 'Session Reminder')
          )
        )
        .collect();

      if (existingReminders.length > 0) continue;

      const sessionTime = `${session.scheduledDate} at ${session.scheduledTime}`;
      
      // Send reminder to mentee
      await ctx.db.insert('notifications', {
        userId: session.menteeId,
        type: 'session',
        title: 'Session Reminder',
        message: `Your mentorship session with ${mentor.firstName} ${mentor.lastName} starts in 30 minutes (${sessionTime}).`,
        isRead: false,
        isActionable: true,
        actions: {
          primary: { label: 'Join Session', action: 'join_session' },
          secondary: { label: 'Reschedule', action: 'reschedule_session' },
        },
        relatedUserId: session.mentorId,
        relatedSessionId: session._id,
        metadata: {
          sessionId: session._id,
        },
        createdAt: Date.now(),
      });

      // Send reminder to mentor
      await ctx.db.insert('notifications', {
        userId: session.mentorId,
        type: 'session',
        title: 'Session Reminder',
        message: `Your mentorship session with ${mentee.firstName} ${mentee.lastName} starts in 30 minutes (${sessionTime}).`,
        isRead: false,
        isActionable: true,
        actions: {
          primary: { label: 'Join Session', action: 'join_session' },
          secondary: { label: 'Reschedule', action: 'reschedule_session' },
        },
        relatedUserId: session.menteeId,
        relatedSessionId: session._id,
        metadata: {
          sessionId: session._id,
        },
        createdAt: Date.now(),
      });
    }
  },
});

// Send daily digest notifications
export const sendDailyDigest = internalMutation({
  args: {},
  handler: async (ctx) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = yesterday.setHours(23, 59, 59, 999);

    // Get all active users
    const activeUsers = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const user of activeUsers) {
      // Count activities from yesterday
      const newRequests = await ctx.db
        .query('mentorshipRequests')
        .withIndex('by_mentor', (q) => q.eq('mentorId', user._id))
        .filter((q) => 
          q.and(
            q.gte(q.field('createdAt'), yesterdayStart),
            q.lte(q.field('createdAt'), yesterdayEnd)
          )
        )
        .collect();

      const completedSessions = await ctx.db
        .query('sessions')
        .filter((q) => 
          q.and(
            q.or(
              q.eq(q.field('menteeId'), user._id),
              q.eq(q.field('mentorId'), user._id)
            ),
            q.eq(q.field('status'), 'completed'),
            q.gte(q.field('updatedAt'), yesterdayStart),
            q.lte(q.field('updatedAt'), yesterdayEnd)
          )
        )
        .collect();

      // Only send digest if there's activity
      if (newRequests.length > 0 || completedSessions.length > 0) {
        let message = 'Your daily summary: ';
        const activities = [];
        
        if (newRequests.length > 0) {
          activities.push(`${newRequests.length} new request${newRequests.length > 1 ? 's' : ''}`);
        }
        
        if (completedSessions.length > 0) {
          activities.push(`${completedSessions.length} completed session${completedSessions.length > 1 ? 's' : ''}`);
        }
        
        message += activities.join(', ') + '.';

        await ctx.db.insert('notifications', {
          userId: user._id,
          type: 'system',
          title: 'Daily Summary',
          message,
          isRead: false,
          isActionable: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});
