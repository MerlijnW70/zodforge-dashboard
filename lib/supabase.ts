import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Server-side client with service role key (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types
export interface User {
  id: string;
  github_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserApiKey {
  id: string;
  user_id: string;
  kid: string;
  tier: 'free' | 'pro' | 'enterprise';
  name: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

// User operations
export async function findOrCreateUser(githubProfile: {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}): Promise<User> {
  // Try to find existing user by GitHub ID
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('github_id', githubProfile.id)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({
      github_id: githubProfile.id,
      email: githubProfile.email,
      name: githubProfile.name || null,
      avatar_url: githubProfile.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return newUser;
}

// API Key operations
export async function getUserApiKeys(userId: string): Promise<UserApiKey[]> {
  const { data, error } = await supabaseAdmin
    .from('user_api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to get API keys: ${error.message}`);
  }

  return data || [];
}

export async function createUserApiKey(
  userId: string,
  kid: string,
  tier: 'free' | 'pro' | 'enterprise' = 'free',
  name: string = 'Default Key'
): Promise<UserApiKey> {
  const { data, error } = await supabaseAdmin
    .from('user_api_keys')
    .insert({
      user_id: userId,
      kid,
      tier,
      name,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return data;
}

export async function getApiKeyByKid(kid: string): Promise<UserApiKey | null> {
  const { data } = await supabaseAdmin
    .from('user_api_keys')
    .select('*')
    .eq('kid', kid)
    .eq('is_active', true)
    .single();

  return data;
}

export async function updateApiKeyLastUsed(kid: string): Promise<void> {
  await supabaseAdmin
    .from('user_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('kid', kid);
}
