import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table - stores user profiles and authentication data
  users: defineTable({
    // Authentication
    clerkId: v.string(),
    
    // Basic profile information
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),
    
    // Military background
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
    
    // Professional information
    currentRole: v.optional(v.string()),
    company: v.optional(v.string()),
    industry: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    linkedinProfile: v.optional(v.string()),
    
    // Mentorship preferences
    isMentor: v.boolean(),
    isMentee: v.boolean(),
    mentorshipAreas: v.optional(v.array(v.string())),
    
    // Account status
    isVerified: v.boolean(),
    isActive: v.boolean(),
    profileComplete: v.boolean(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_mentor_status', ['isMentor', 'isActive'])
    .index('by_industry', ['industry'])
    .index('by_military_branch', ['militaryBranch']),

  // Availability table - stores mentor availability schedules
  availability: defineTable({
    userId: v.id('users'),
    
    // Weekly schedule (0 = Sunday, 6 = Saturday)
    dayOfWeek: v.number(),
    startTime: v.string(), // Format: "HH:MM" (24-hour)
    endTime: v.string(),   // Format: "HH:MM" (24-hour)
    
    // Availability status
    isActive: v.boolean(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_day', ['userId', 'dayOfWeek'])
    .index('by_active', ['isActive']),

  // Mentorship requests table
  mentorshipRequests: defineTable({
    menteeId: v.id('users'),
    mentorId: v.id('users'),
    
    // Request details
    requestedDate: v.string(), // Format: "YYYY-MM-DD"
    requestedTime: v.string(), // Format: "HH:MM"
    duration: v.number(), // Duration in minutes (default: 60)
    
    // Request content
    subject: v.string(),
    message: v.string(),
    mentorshipArea: v.optional(v.string()),
    
    // Status tracking
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    
    // Response from mentor
    mentorResponse: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index('by_mentee', ['menteeId'])
    .index('by_mentor', ['mentorId'])
    .index('by_status', ['status'])
    .index('by_mentor_status', ['mentorId', 'status'])
    .index('by_date', ['requestedDate']),

  // Sessions table - completed mentorship sessions
  sessions: defineTable({
    requestId: v.id('mentorshipRequests'),
    menteeId: v.id('users'),
    mentorId: v.id('users'),
    
    // Session details
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    duration: v.optional(v.number()), // Actual duration in minutes
    
    // Session status
    status: v.union(
      v.literal('scheduled'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('no_show'),
      v.literal('cancelled')
    ),
    
    // Call details (for future phone integration)
    callSid: v.optional(v.string()),
    callStatus: v.optional(v.string()),
    
    // Notes
    mentorNotes: v.optional(v.string()),
    menteeNotes: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_request', ['requestId'])
    .index('by_mentee', ['menteeId'])
    .index('by_mentor', ['mentorId'])
    .index('by_status', ['status'])
    .index('by_date', ['scheduledDate']),

  // Reviews table - session feedback and ratings
  reviews: defineTable({
    sessionId: v.id('sessions'),
    reviewerId: v.id('users'), // Who wrote the review
    revieweeId: v.id('users'), // Who is being reviewed
    
    // Review content
    rating: v.number(), // 1-5 stars
    feedback: v.string(),
    
    // Review categories (optional detailed ratings)
    communicationRating: v.optional(v.number()),
    helpfulnessRating: v.optional(v.number()),
    professionalismRating: v.optional(v.number()),
    
    // Review status
    isPublic: v.boolean(),
    isApproved: v.boolean(),
    
    // Response from reviewee
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_session', ['sessionId'])
    .index('by_reviewer', ['reviewerId'])
    .index('by_reviewee', ['revieweeId'])
    .index('by_reviewee_public', ['revieweeId', 'isPublic', 'isApproved']),

  // Notifications table - system notifications for users
  notifications: defineTable({
    userId: v.id('users'),
    
    // Notification content
    type: v.union(
      v.literal('request'),
      v.literal('session'),
      v.literal('review'),
      v.literal('system'),
      v.literal('reminder')
    ),
    title: v.string(),
    message: v.string(),
    
    // Notification status
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    
    // Actionable notifications
    isActionable: v.boolean(),
    actions: v.optional(v.object({
      primary: v.optional(v.object({
        label: v.string(),
        action: v.string(), // Action identifier
      })),
      secondary: v.optional(v.object({
        label: v.string(),
        action: v.string(),
      })),
    })),
    
    // Related data
    relatedUserId: v.optional(v.id('users')), // User who triggered the notification
    relatedRequestId: v.optional(v.id('mentorshipRequests')),
    relatedSessionId: v.optional(v.id('sessions')),
    relatedReviewId: v.optional(v.id('reviews')),
    
    // Metadata
    metadata: v.optional(v.object({
      requestId: v.optional(v.string()),
      sessionId: v.optional(v.string()),
      reviewId: v.optional(v.string()),
    })),
    
    // Timestamps
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_unread', ['userId', 'isRead'])
    .index('by_type', ['type'])
    .index('by_created', ['createdAt']),

  // Messages table - for future chat functionality
  messages: defineTable({
    senderId: v.id('users'),
    receiverId: v.id('users'),
    requestId: v.optional(v.id('mentorshipRequests')),
    
    // Message content
    content: v.string(),
    messageType: v.union(
      v.literal('text'),
      v.literal('system'),
      v.literal('notification')
    ),
    
    // Message status
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
  })
    .index('by_sender', ['senderId'])
    .index('by_receiver', ['receiverId'])
    .index('by_conversation', ['senderId', 'receiverId'])
    .index('by_request', ['requestId'])
    .index('by_unread', ['receiverId', 'isRead']),
});