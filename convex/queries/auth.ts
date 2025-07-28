import { query } from "../_generated/server";

export const getCurrentUser = query({
  args: {},
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