import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  // Verify environment variables
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('Missing NEXT_PUBLIC_CONVEX_URL environment variable');
    return NextResponse.json(
      { error: 'Convex URL not configured' },
      { status: 500 }
    );
  }

  // Get webhook signature from headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify required headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing required webhook headers');
    return NextResponse.json(
      { error: 'Missing webhook headers' },
      { status: 400 }
    );
  }

  // Get the request body
  const payload = await req.text();

  try {
    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;

    console.log('Webhook event received:', evt.type);

    // Handle different webhook events
    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${evt.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }
}

async function handleUserCreated(userData: any) {
  try {
    console.log('Creating user in Convex:', userData.id);
    
    const userId = await convex.mutation(api.mutations.users.createUserFromClerk, {
      clerkId: userData.id,
      email: userData.email_addresses[0]?.email_address || '',
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      profileImage: userData.image_url || undefined,
    });

    console.log('User created successfully in Convex:', userId);
  } catch (error) {
    console.error('Failed to create user in Convex:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  try {
    console.log('User updated in Clerk:', userData.id);
    
    // Find user by Clerk ID and update their profile
    // Note: You might want to add an updateUserFromClerk mutation for this
    console.log('User update handling not yet implemented');
  } catch (error) {
    console.error('Failed to update user in Convex:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  try {
    console.log('User deleted in Clerk:', userData.id);
    
    // Find user by Clerk ID and deactivate them
    // Note: You might want to add a deactivateUserFromClerk mutation for this
    console.log('User deletion handling not yet implemented');
  } catch (error) {
    console.error('Failed to delete user in Convex:', error);
    throw error;
  }
}