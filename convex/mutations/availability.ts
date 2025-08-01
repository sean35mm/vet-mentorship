import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Set availability for a mentor (replaces all existing availability)
export const setAvailability = mutation({
  args: {
    userId: v.id('users'),
    availability: v.array(v.object({
      dayOfWeek: v.number(), // 0 = Sunday, 6 = Saturday
      startTime: v.string(), // Format: "HH:MM"
      endTime: v.string(),   // Format: "HH:MM"
    })),
  },
  returns: v.array(v.id('availability')),
  handler: async (ctx, args) => {
    // Verify that the user exists and is a mentor
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isMentor) {
      throw new Error('Only mentors can set availability');
    }

    // Validate availability data
    for (const slot of args.availability) {
      // Validate day of week
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        throw new Error('Time must be in HH:MM format');
      }

      // Validate that start time is before end time
      const startMinutes = timeToMinutes(slot.startTime);
      const endMinutes = timeToMinutes(slot.endTime);

      if (startMinutes >= endMinutes) {
        throw new Error('Start time must be before end time');
      }

      // Validate minimum session length (at least 1 hour)
      if (endMinutes - startMinutes < 60) {
        throw new Error('Availability slots must be at least 1 hour long');
      }
    }

    // Check for overlapping time slots on the same day
    const daySlots = new Map<number, Array<{startTime: string, endTime: string}>>();
    
    for (const slot of args.availability) {
      if (!daySlots.has(slot.dayOfWeek)) {
        daySlots.set(slot.dayOfWeek, []);
      }
      daySlots.get(slot.dayOfWeek)!.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }

    // Check for overlaps within each day
    for (const [day, slots] of daySlots.entries()) {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];
          
          const start1 = slot1 ? timeToMinutes(slot1.startTime) : 0;
          const end1 = slot1 ? timeToMinutes(slot1.endTime) : 0;
          const start2 = slot2 ? timeToMinutes(slot2.startTime) : 0;
          const end2 = slot2 ? timeToMinutes(slot2.endTime) : 0;

          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            throw new Error(`Overlapping time slots found for day ${day}`);
          }
        }
      }
    }

    // Delete all existing availability for this user
    const existingAvailability = await ctx.db
      .query('availability')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    for (const existing of existingAvailability) {
      await ctx.db.delete(existing._id);
    }

    // Insert new availability slots
    const now = Date.now();
    const insertPromises = args.availability.map(slot => 
      ctx.db.insert('availability', {
        userId: args.userId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    );

    const availabilityIds = await Promise.all(insertPromises);
    return availabilityIds;
  },
});

// Add a single availability time slot
export const addTimeSlot = mutation({
  args: {
    userId: v.id('users'),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
  },
  returns: v.id('availability'),
  handler: async (ctx, args) => {
    // Verify that the user exists and is a mentor
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isMentor) {
      throw new Error('Only mentors can set availability');
    }

    // Validate input
    if (args.dayOfWeek < 0 || args.dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(args.startTime) || !timeRegex.test(args.endTime)) {
      throw new Error('Time must be in HH:MM format');
    }

    const startMinutes = timeToMinutes(args.startTime);
    const endMinutes = timeToMinutes(args.endTime);

    if (startMinutes >= endMinutes) {
      throw new Error('Start time must be before end time');
    }

    if (endMinutes - startMinutes < 60) {
      throw new Error('Time slot must be at least 1 hour long');
    }

    // Check for overlapping slots on the same day
    const existingSlots = await ctx.db
      .query('availability')
      .withIndex('by_user_day', (q) => 
        q.eq('userId', args.userId).eq('dayOfWeek', args.dayOfWeek)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const existing of existingSlots) {
      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime);

      // Check for overlap
      if (startMinutes < existingEnd && existingStart < endMinutes) {
        throw new Error('This time slot overlaps with existing availability');
      }
    }

    const now = Date.now();

    const availabilityId = await ctx.db.insert('availability', {
      userId: args.userId,
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return availabilityId;
  },
});

// Update a specific time slot
export const updateTimeSlot = mutation({
  args: {
    availabilityId: v.id('availability'),
    userId: v.id('users'),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.id('availability'),
  handler: async (ctx, args) => {
    const availability = await ctx.db.get(args.availabilityId);
    if (!availability) {
      throw new Error('Availability slot not found');
    }

    // Verify that the user owns this availability slot
    if (availability.userId !== args.userId) {
      throw new Error('You can only update your own availability');
    }

    // Prepare update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    let newStartTime = availability.startTime;
    let newEndTime = availability.endTime;

    if (args.startTime !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(args.startTime)) {
        throw new Error('Start time must be in HH:MM format');
      }
      updates.startTime = args.startTime;
      newStartTime = args.startTime;
    }

    if (args.endTime !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(args.endTime)) {
        throw new Error('End time must be in HH:MM format');
      }
      updates.endTime = args.endTime;
      newEndTime = args.endTime;
    }

    if (args.isActive !== undefined) {
      updates.isActive = args.isActive;
    }

    // Validate that start time is before end time
    const startMinutes = timeToMinutes(newStartTime);
    const endMinutes = timeToMinutes(newEndTime);

    if (startMinutes >= endMinutes) {
      throw new Error('Start time must be before end time');
    }

    if (endMinutes - startMinutes < 60) {
      throw new Error('Time slot must be at least 1 hour long');
    }

    // Check for overlaps with other slots (excluding this one)
    if (args.startTime !== undefined || args.endTime !== undefined) {
      const otherSlots = await ctx.db
        .query('availability')
        .withIndex('by_user_day', (q) => 
          q.eq('userId', args.userId).eq('dayOfWeek', availability.dayOfWeek)
        )
        .filter((q) => 
          q.and(
            q.neq(q.field('_id'), args.availabilityId),
            q.eq(q.field('isActive'), true)
          )
        )
        .collect();

      for (const other of otherSlots) {
        const otherStart = timeToMinutes(other.startTime);
        const otherEnd = timeToMinutes(other.endTime);

        // Check for overlap
        if (startMinutes < otherEnd && otherStart < endMinutes) {
          throw new Error('Updated time slot would overlap with existing availability');
        }
      }
    }

    await ctx.db.patch(args.availabilityId, updates);
    return args.availabilityId;
  },
});

// Delete a time slot
export const deleteTimeSlot = mutation({
  args: {
    availabilityId: v.id('availability'),
    userId: v.id('users'),
  },
  returns: v.id('availability'),
  handler: async (ctx, args) => {
    const availability = await ctx.db.get(args.availabilityId);
    if (!availability) {
      throw new Error('Availability slot not found');
    }

    // Verify that the user owns this availability slot
    if (availability.userId !== args.userId) {
      throw new Error('You can only delete your own availability');
    }

    // Check if there are any upcoming sessions during this time slot
    const today = new Date().toISOString().split('T')[0];
    
    const upcomingSessions = await ctx.db
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

    // Check if any upcoming sessions fall within this availability slot
    for (const session of upcomingSessions) {
      const sessionDate = new Date(session.scheduledDate);
      const sessionDayOfWeek = sessionDate.getDay();
      
      if (sessionDayOfWeek === availability.dayOfWeek) {
        const sessionTime = timeToMinutes(session.scheduledTime);
        const slotStart = timeToMinutes(availability.startTime);
        const slotEnd = timeToMinutes(availability.endTime);
        
        if (sessionTime >= slotStart && sessionTime < slotEnd) {
          throw new Error('Cannot delete availability slot with upcoming sessions. Please reschedule or cancel the sessions first.');
        }
      }
    }

    await ctx.db.delete(args.availabilityId);
    return args.availabilityId;
  },
});

// Clear all availability for a user
export const clearAvailability = mutation({
  args: {
    userId: v.id('users'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Verify that the user exists and is a mentor
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isMentor) {
      throw new Error('Only mentors can clear availability');
    }

    // Check for upcoming sessions
    const today = new Date().toISOString().split('T')[0];
    
    const upcomingSessions = await ctx.db
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

    if (upcomingSessions.length > 0) {
      throw new Error('Cannot clear availability with upcoming sessions. Please reschedule or cancel the sessions first.');
    }

    // Delete all availability slots
    const existingAvailability = await ctx.db
      .query('availability')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const deletePromises = existingAvailability.map(slot => 
      ctx.db.delete(slot._id)
    );

    await Promise.all(deletePromises);
    return existingAvailability.length;
  },
});

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}