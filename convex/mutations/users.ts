import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Create a new user from Clerk webhook
export const createUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by Clerk ID
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Also check by email to prevent duplicates
    const existingByEmail = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase().trim()))
      .unique();

    if (existingByEmail) {
      // Update existing user with Clerk ID
      await ctx.db.patch(existingByEmail._id, {
        clerkId: args.clerkId,
        updatedAt: Date.now(),
      });
      return existingByEmail._id;
    }

    // Create new user with minimal required fields
    const now = Date.now();
    const userId = await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email.toLowerCase().trim(),
      firstName: args.firstName.trim() || 'User',
      lastName: args.lastName.trim() || '',
      profileImage: args.profileImage,
      isMentor: false,
      isMentee: true,
      isVerified: false,
      isActive: true,
      profileComplete: false, // Will complete via modal
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Create a new user (manual creation)
export const createUser = mutation({
  args: {
    clerkId: v.optional(v.string()),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),
    militaryBranch: v.optional(v.union(
      v.literal('Army'),
      v.literal('Navy'),
      v.literal('Air Force'),
      v.literal('Marines'),
      v.literal('Coast Guard'),
      v.literal('Space Force')
    )),
    militaryRank: v.optional(v.string()),
    yearsOfService: v.optional(v.number()),
    currentRole: v.optional(v.string()),
    company: v.optional(v.string()),
    industry: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    linkedinProfile: v.optional(v.string()),
    isMentor: v.boolean(),
    isMentee: v.boolean(),
    mentorshipAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error('Invalid email format');
    }

    // Validate required fields
    if (!args.firstName.trim() || !args.lastName.trim()) {
      throw new Error('First name and last name are required');
    }

    if (!args.isMentor && !args.isMentee) {
      throw new Error('User must be either a mentor, mentee, or both');
    }

    const now = Date.now();

    const userId = await ctx.db.insert('users', {
      clerkId: args.clerkId || `manual_${Date.now()}`, // Fallback for manual creation
      email: args.email.toLowerCase().trim(),
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      profileImage: args.profileImage,
      bio: args.bio?.trim(),
      location: args.location?.trim(),
      timezone: args.timezone,
      militaryBranch: args.militaryBranch,
      militaryRank: args.militaryRank?.trim(),
      yearsOfService: args.yearsOfService,
      currentRole: args.currentRole?.trim(),
      company: args.company?.trim(),
      industry: args.industry?.trim(),
      skills: args.skills?.map(skill => skill.trim()).filter(skill => skill.length > 0),
      linkedinProfile: args.linkedinProfile?.trim(),
      isMentor: args.isMentor,
      isMentee: args.isMentee,
      mentorshipAreas: args.mentorshipAreas?.map(area => area.trim()).filter(area => area.length > 0),
      isVerified: false, // Will be verified later
      isActive: true,
      profileComplete: false, // Will be completed via profile completion modal
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id('users'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),
    militaryBranch: v.optional(v.union(
      v.literal('Army'),
      v.literal('Navy'),
      v.literal('Air Force'),
      v.literal('Marines'),
      v.literal('Coast Guard'),
      v.literal('Space Force')
    )),
    militaryRank: v.optional(v.string()),
    yearsOfService: v.optional(v.number()),
    currentRole: v.optional(v.string()),
    company: v.optional(v.string()),
    industry: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    linkedinProfile: v.optional(v.string()),
    isMentor: v.optional(v.boolean()),
    isMentee: v.optional(v.boolean()),
    mentorshipAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare update object with only provided fields
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) {
      if (!args.firstName.trim()) {
        throw new Error('First name cannot be empty');
      }
      updates.firstName = args.firstName.trim();
    }

    if (args.lastName !== undefined) {
      if (!args.lastName.trim()) {
        throw new Error('Last name cannot be empty');
      }
      updates.lastName = args.lastName.trim();
    }

    if (args.profileImage !== undefined) updates.profileImage = args.profileImage;
    if (args.bio !== undefined) updates.bio = args.bio?.trim();
    if (args.location !== undefined) updates.location = args.location?.trim();
    if (args.timezone !== undefined) updates.timezone = args.timezone;
    if (args.militaryBranch !== undefined) updates.militaryBranch = args.militaryBranch;
    if (args.militaryRank !== undefined) updates.militaryRank = args.militaryRank?.trim();
    if (args.yearsOfService !== undefined) updates.yearsOfService = args.yearsOfService;
    if (args.currentRole !== undefined) updates.currentRole = args.currentRole?.trim();
    if (args.company !== undefined) updates.company = args.company?.trim();
    if (args.industry !== undefined) updates.industry = args.industry?.trim();
    if (args.linkedinProfile !== undefined) updates.linkedinProfile = args.linkedinProfile?.trim();
    if (args.isMentor !== undefined) updates.isMentor = args.isMentor;
    if (args.isMentee !== undefined) updates.isMentee = args.isMentee;

    if (args.skills !== undefined) {
      updates.skills = args.skills.map(skill => skill.trim()).filter(skill => skill.length > 0);
    }

    if (args.mentorshipAreas !== undefined) {
      updates.mentorshipAreas = args.mentorshipAreas.map(area => area.trim()).filter(area => area.length > 0);
    }

    // Validate that user is still either mentor or mentee
    const finalIsMentor = updates.isMentor !== undefined ? updates.isMentor : user.isMentor;
    const finalIsMentee = updates.isMentee !== undefined ? updates.isMentee : user.isMentee;

    if (!finalIsMentor && !finalIsMentee) {
      throw new Error('User must be either a mentor, mentee, or both');
    }

    await ctx.db.patch(args.userId, updates);
    return args.userId;
  },
});

// Update user verification status (admin function)
export const updateVerificationStatus = mutation({
  args: {
    userId: v.id('users'),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, {
      isVerified: args.isVerified,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Update user active status
export const updateActiveStatus = mutation({
  args: {
    userId: v.id('users'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Complete user profile (sets profileComplete to true)
export const completeProfile = mutation({
  args: {
    userId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.string(),
    location: v.string(),
    militaryBranch: v.union(
      v.literal('Army'),
      v.literal('Navy'),
      v.literal('Air Force'),
      v.literal('Marines'),
      v.literal('Coast Guard'),
      v.literal('Space Force')
    ),
    militaryRank: v.string(),
    yearsOfService: v.number(),
    currentRole: v.optional(v.string()),
    company: v.optional(v.string()),
    industry: v.string(),
    skills: v.array(v.string()),
    isMentor: v.boolean(),
    isMentee: v.boolean(),
    mentorshipAreas: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate required fields
    if (!args.firstName.trim() || !args.lastName.trim()) {
      throw new Error('First name and last name are required');
    }

    if (!args.bio.trim()) {
      throw new Error('Bio is required');
    }

    if (!args.location.trim()) {
      throw new Error('Location is required');
    }

    if (!args.militaryRank.trim()) {
      throw new Error('Military rank is required');
    }

    if (!args.industry.trim()) {
      throw new Error('Industry is required');
    }

    if (args.skills.length === 0) {
      throw new Error('At least one skill is required');
    }

    if (!args.isMentor && !args.isMentee) {
      throw new Error('User must be either a mentor, mentee, or both');
    }

    if (args.mentorshipAreas.length === 0) {
      throw new Error('At least one mentorship area is required');
    }

    // Update user profile with all required information
    await ctx.db.patch(args.userId, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      bio: args.bio.trim(),
      location: args.location.trim(),
      militaryBranch: args.militaryBranch,
      militaryRank: args.militaryRank.trim(),
      yearsOfService: args.yearsOfService,
      currentRole: args.currentRole?.trim(),
      company: args.company?.trim(),
      industry: args.industry.trim(),
      skills: args.skills.map(skill => skill.trim()).filter(skill => skill.length > 0),
      isMentor: args.isMentor,
      isMentee: args.isMentee,
      mentorshipAreas: args.mentorshipAreas.map(area => area.trim()).filter(area => area.length > 0),
      profileComplete: true,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Delete user account (soft delete by setting inactive)
export const deleteUser = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete by setting inactive
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // TODO: In a real application, you might want to:
    // 1. Cancel all pending requests
    // 2. Notify users with upcoming sessions
    // 3. Archive user data according to privacy policies

    return args.userId;
  },
});