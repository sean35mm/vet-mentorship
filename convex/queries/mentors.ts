import { query } from '../_generated/server';
import { v } from 'convex/values';

// Search mentors with basic filters
export const searchMentors = query({
  args: { 
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    let mentorsQuery = ctx.db
      .query('users')
      .withIndex('by_mentor_status', (q) => 
        q.eq('isMentor', true).eq('isActive', true)
      );

    const mentors = await mentorsQuery.collect();

    // Filter by search term if provided
    let filteredMentors = mentors;
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredMentors = mentors.filter(mentor => 
        mentor.firstName.toLowerCase().includes(searchLower) ||
        mentor.lastName.toLowerCase().includes(searchLower) ||
        mentor.currentRole?.toLowerCase().includes(searchLower) ||
        mentor.company?.toLowerCase().includes(searchLower) ||
        mentor.industry?.toLowerCase().includes(searchLower) ||
        mentor.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
        mentor.mentorshipAreas?.some(area => area.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const paginatedMentors = filteredMentors.slice(offset, offset + limit);

    // Get additional data for each mentor
    const mentorsWithData = await Promise.all(
      paginatedMentors.map(async (mentor) => {
        // Get availability summary
        const availability = await ctx.db
          .query('availability')
          .withIndex('by_user', (q) => q.eq('userId', mentor._id))
          .filter((q) => q.eq(q.field('isActive'), true))
          .collect();

        // Get review stats
        const reviews = await ctx.db
          .query('reviews')
          .withIndex('by_reviewee_public', (q) => 
            q.eq('revieweeId', mentor._id).eq('isPublic', true).eq('isApproved', true)
          )
          .collect();

        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        return {
          _id: mentor._id,
          firstName: mentor.firstName,
          lastName: mentor.lastName,
          profileImage: mentor.profileImage,
          bio: mentor.bio,
          location: mentor.location,
          militaryBranch: mentor.militaryBranch,
          militaryRank: mentor.militaryRank,
          yearsOfService: mentor.yearsOfService,
          currentRole: mentor.currentRole,
          company: mentor.company,
          industry: mentor.industry,
          skills: mentor.skills,
          mentorshipAreas: mentor.mentorshipAreas,
          isVerified: mentor.isVerified,
          hasAvailability: availability.length > 0,
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length,
          createdAt: mentor.createdAt,
        };
      })
    );

    return {
      mentors: mentorsWithData,
      total: filteredMentors.length,
      hasMore: offset + limit < filteredMentors.length,
    };
  },
});

// Advanced mentor filtering
export const filterMentors = query({
  args: {
    industry: v.optional(v.string()),
    militaryBranch: v.optional(v.string()),
    location: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    mentorshipAreas: v.optional(v.array(v.string())),
    minRating: v.optional(v.number()),
    hasAvailability: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    // Start with all active mentors
    const allMentors = await ctx.db
      .query('users')
      .withIndex('by_mentor_status', (q) => 
        q.eq('isMentor', true).eq('isActive', true)
      )
      .collect();

    // Apply filters
    let filteredMentors = allMentors;

    if (args.industry) {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.industry?.toLowerCase() === args.industry!.toLowerCase()
      );
    }

    if (args.militaryBranch) {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.militaryBranch === args.militaryBranch
      );
    }

    if (args.location) {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.location?.toLowerCase().includes(args.location!.toLowerCase())
      );
    }

    if (args.skills && args.skills.length > 0) {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.skills?.some(skill => 
          args.skills!.some(filterSkill => 
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    if (args.mentorshipAreas && args.mentorshipAreas.length > 0) {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.mentorshipAreas?.some(area => 
          args.mentorshipAreas!.some(filterArea => 
            area.toLowerCase().includes(filterArea.toLowerCase())
          )
        )
      );
    }

    // Get additional data and apply remaining filters
    const mentorsWithData = await Promise.all(
      filteredMentors.map(async (mentor) => {
        // Get availability
        const availability = await ctx.db
          .query('availability')
          .withIndex('by_user', (q) => q.eq('userId', mentor._id))
          .filter((q) => q.eq(q.field('isActive'), true))
          .collect();

        // Get review stats
        const reviews = await ctx.db
          .query('reviews')
          .withIndex('by_reviewee_public', (q) => 
            q.eq('revieweeId', mentor._id).eq('isPublic', true).eq('isApproved', true)
          )
          .collect();

        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        return {
          _id: mentor._id,
          firstName: mentor.firstName,
          lastName: mentor.lastName,
          profileImage: mentor.profileImage,
          bio: mentor.bio,
          location: mentor.location,
          militaryBranch: mentor.militaryBranch,
          militaryRank: mentor.militaryRank,
          yearsOfService: mentor.yearsOfService,
          currentRole: mentor.currentRole,
          company: mentor.company,
          industry: mentor.industry,
          skills: mentor.skills,
          mentorshipAreas: mentor.mentorshipAreas,
          isVerified: mentor.isVerified,
          hasAvailability: availability.length > 0,
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length,
          createdAt: mentor.createdAt,
        };
      })
    );

    // Apply rating and availability filters
    let finalMentors = mentorsWithData;

    if (args.minRating) {
      finalMentors = finalMentors.filter(mentor => 
        mentor.avgRating >= args.minRating! || mentor.totalReviews === 0
      );
    }

    if (args.hasAvailability) {
      finalMentors = finalMentors.filter(mentor => mentor.hasAvailability);
    }

    // Sort by rating (highest first), then by total reviews
    finalMentors.sort((a, b) => {
      if (a.avgRating !== b.avgRating) {
        return b.avgRating - a.avgRating;
      }
      return b.totalReviews - a.totalReviews;
    });

    // Apply pagination
    const paginatedMentors = finalMentors.slice(offset, offset + limit);

    return {
      mentors: paginatedMentors,
      total: finalMentors.length,
      hasMore: offset + limit < finalMentors.length,
    };
  },
});

// Get unique filter options for the search interface
export const getFilterOptions = query({
  args: {},
  handler: async (ctx) => {
    const mentors = await ctx.db
      .query('users')
      .withIndex('by_mentor_status', (q) => 
        q.eq('isMentor', true).eq('isActive', true)
      )
      .collect();

    const industries = new Set<string>();
    const militaryBranches = new Set<string>();
    const locations = new Set<string>();
    const skills = new Set<string>();
    const mentorshipAreas = new Set<string>();

    mentors.forEach(mentor => {
      if (mentor.industry) industries.add(mentor.industry);
      if (mentor.militaryBranch) militaryBranches.add(mentor.militaryBranch);
      if (mentor.location) locations.add(mentor.location);
      mentor.skills?.forEach(skill => skills.add(skill));
      mentor.mentorshipAreas?.forEach(area => mentorshipAreas.add(area));
    });

    return {
      industries: Array.from(industries).sort(),
      militaryBranches: Array.from(militaryBranches).sort(),
      locations: Array.from(locations).sort(),
      skills: Array.from(skills).sort(),
      mentorshipAreas: Array.from(mentorshipAreas).sort(),
    };
  },
});