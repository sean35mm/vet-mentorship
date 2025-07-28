import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get user's availability schedule
export const getAvailability = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query('availability')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Group by day of week for easier frontend consumption
    const schedule = availability.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek]?.push({
        _id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt,
      });
      return acc;
    }, {} as Record<number, any[]>);

    return schedule;
  },
});

// Get available time slots for a specific mentor on a specific date
export const getAvailableSlots = query({
  args: { 
    mentorId: v.id('users'),
    date: v.string(), // Format: "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    // Get the day of week from the date (0 = Sunday, 6 = Saturday)
    const date = new Date(args.date);
    const dayOfWeek = date.getDay();

    // Get mentor's availability for this day
    const availability = await ctx.db
      .query('availability')
      .withIndex('by_user_day', (q) => 
        q.eq('userId', args.mentorId).eq('dayOfWeek', dayOfWeek)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (availability.length === 0) {
      return [];
    }

    // Get existing sessions/requests for this date to exclude booked slots
    const existingSessions = await ctx.db
      .query('sessions')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.mentorId))
      .filter((q) => q.eq(q.field('scheduledDate'), args.date))
      .filter((q) => 
        q.or(
          q.eq(q.field('status'), 'scheduled'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect();

    const existingRequests = await ctx.db
      .query('mentorshipRequests')
      .withIndex('by_mentor', (q) => q.eq('mentorId', args.mentorId))
      .filter((q) => q.eq(q.field('requestedDate'), args.date))
      .filter((q) => 
        q.or(
          q.eq(q.field('status'), 'pending'),
          q.eq(q.field('status'), 'accepted')
        )
      )
      .collect();

    // Create list of booked time slots
    const bookedSlots = new Set([
      ...existingSessions.map(s => s.scheduledTime),
      ...existingRequests.map(r => r.requestedTime)
    ]);

    // Generate available 1-hour slots from availability windows
    const availableSlots = [];
    
    for (const slot of availability) {
      const startHour = parseInt((slot.startTime || "0:0").split(":")[0] || "0");
      const endHour = parseInt((slot.endTime || "0:0").split(":")[0] || "0");
      
      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        
        if (!bookedSlots.has(timeSlot)) {
          availableSlots.push({
            time: timeSlot,
            displayTime: formatTime(timeSlot),
          });
        }
      }
    }

    return availableSlots.sort((a, b) => a.time.localeCompare(b.time));
  },
});

// Get mentor's weekly availability summary
export const getAvailabilitySummary = query({
  args: { mentorId: v.id('users') },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query('availability')
      .withIndex('by_user', (q) => q.eq('userId', args.mentorId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const summary = {
      totalHoursPerWeek: 0,
      daysAvailable: new Set<number>(),
      earliestTime: '23:59',
      latestTime: '00:00',
    };

    availability.forEach(slot => {
      const startHour = parseInt((slot.startTime || "0:0").split(":")[0] || "0");
      const endHour = parseInt((slot.endTime || "0:0").split(":")[0] || "0");
      const duration = endHour - startHour;
      
      summary.totalHoursPerWeek += duration;
      summary.daysAvailable.add(slot.dayOfWeek);
      
      if (slot.startTime < summary.earliestTime) {
        summary.earliestTime = slot.startTime;
      }
      if (slot.endTime > summary.latestTime) {
        summary.latestTime = slot.endTime;
      }
    });

    return {
      totalHoursPerWeek: summary.totalHoursPerWeek,
      daysAvailable: Array.from(summary.daysAvailable).sort(),
      earliestTime: summary.earliestTime,
      latestTime: summary.latestTime,
      hasAvailability: availability.length > 0,
    };
  },
});

// Helper function to format time for display
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours || "0");
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes || "00"} ${ampm}`;
}