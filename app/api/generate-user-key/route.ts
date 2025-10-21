import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser, createUserApiKey, getUserApiKeys } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Generate an API key for a GitHub-authenticated user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubId, email, name, avatarUrl, tier = 'free' } = body;

    if (!githubId || !email) {
      return NextResponse.json(
        { error: 'GitHub ID and email are required' },
        { status: 400 }
      );
    }

    // Find or create user in database
    const user = await findOrCreateUser({
      id: githubId,
      email,
      name,
      avatar_url: avatarUrl,
    });

    // Check if user already has an active API key
    const existingKeys = await getUserApiKeys(user.id);
    if (existingKeys.length > 0) {
      // Return existing key info (without the actual key for security)
      return NextResponse.json({
        success: true,
        user,
        hasExistingKey: true,
        keyInfo: {
          kid: existingKeys[0].kid,
          tier: existingKeys[0].tier,
          name: existingKeys[0].name,
        },
      });
    }

    // Generate new API key via zodforge-api
    const response = await fetch(`${API_URL}/api/v1/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // This requires an admin API key - we'll need to add one
        Authorization: `Bearer ${process.env.ZODFORGE_ADMIN_API_KEY}`,
      },
      body: JSON.stringify({
        customerId: user.id,
        name: `${name || email}'s Key`,
        tier,
        metadata: {
          createdBy: 'github-oauth',
          environment: 'production',
          githubId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to generate API key' },
        { status: response.status }
      );
    }

    const apiKeyData = await response.json();

    // Store the API key link in our database
    await createUserApiKey(
      user.id,
      apiKeyData.payload.kid,
      tier,
      apiKeyData.payload.name
    );

    return NextResponse.json({
      success: true,
      user,
      apiKey: apiKeyData.apiKey, // Only return this once
      payload: apiKeyData.payload,
    });
  } catch (error) {
    console.error('Key generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
