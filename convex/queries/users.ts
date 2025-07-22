import { query } from '../_generated/server';
import { v } from 'convex/values';

// Get user by ID
export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
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
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();
    return !!user;
  },
});