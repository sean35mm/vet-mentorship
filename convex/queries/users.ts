import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get user by ID
export const getUserById = query({
  args: { userId: v.id('users') },
  returns: v.union(v.object({
    _id: v.id('users'),
    _creationTime: v.number(),
    clerkId: v.string(),
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
    isVerified: v.boolean(),
    isActive: v.boolean(),
    profileComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  returns: v.union(v.object({
    _id: v.id('users'),
    _creationTime: v.number(),
    clerkId: v.string(),
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
    isVerified: v.boolean(),
    isActive: v.boolean(),
    profileComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();
    return user;
  },
});

// Get user profile with public information only
export const getUserProfile = query({
  args: { userId: v.id('users') },
  returns: v.union(v.object({
    _id: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
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
    isVerified: v.boolean(),
    createdAt: v.number(),
  }), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Return only public profile information
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      militaryBranch: user.militaryBranch,
      militaryRank: user.militaryRank,
      yearsOfService: user.yearsOfService,
      currentRole: user.currentRole,
      company: user.company,
      industry: user.industry,
      skills: user.skills,
      linkedinProfile: user.linkedinProfile,
      isMentor: user.isMentor,
      isMentee: user.isMentee,
      mentorshipAreas: user.mentorshipAreas,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  },
});

// Get current user's full profile (includes private information)
export const getCurrentUser = query({
  args: { userId: v.id('users') },
  returns: v.union(v.object({
    _id: v.id('users'),
    _creationTime: v.number(),
    clerkId: v.string(),
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
    isVerified: v.boolean(),
    isActive: v.boolean(),
    profileComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }), v.null()),
  handler: async (ctx, args) => {
    // In a real app, you'd get the current user from authentication context
    // For now, we'll use the provided userId
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Check if user exists by email
export const userExistsByEmail = query({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();
    return !!user;
  },
});