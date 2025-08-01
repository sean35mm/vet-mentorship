import { query } from "../_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  returns: v.object({
    id: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    return {
      id: identity.tokenIdentifier,
      email: identity.email,
      name: identity.name,
      profilePictureUrl: identity.pictureUrl,
    };
  },
});

export const getAuthStatus = query({
  args: {},
  returns: v.object({
    isAuthenticated: v.boolean(),
    user: v.union(
      v.object({
        id: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
      }),
      v.null()
    ),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return {
      isAuthenticated: identity !== null,
      user: identity ? {
        id: identity.tokenIdentifier,
        email: identity.email,
        name: identity.name,
      } : null,
    };
  },
});