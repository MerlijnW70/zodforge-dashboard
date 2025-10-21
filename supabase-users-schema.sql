-- ZodForge User Management Schema
-- Run this in your Supabase SQL Editor

-- Users table (stores GitHub OAuth user data)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User API Keys table (links users to their API keys)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kid TEXT UNIQUE NOT NULL, -- JWT key ID from zodforge-api
  tier TEXT NOT NULL DEFAULT 'free', -- free, pro, enterprise
  name TEXT NOT NULL DEFAULT 'Default Key',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_kid ON user_api_keys(kid);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own API keys"
  ON user_api_keys
  FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own API keys"
  ON user_api_keys
  FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Service role can do everything (for API operations)
CREATE POLICY "Service role full access users"
  ON users
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access api keys"
  ON user_api_keys
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores GitHub OAuth user information';
COMMENT ON TABLE user_api_keys IS 'Links users to their ZodForge API keys';
COMMENT ON COLUMN user_api_keys.kid IS 'JWT Key ID from the zodforge-api JWT system';
COMMENT ON COLUMN user_api_keys.tier IS 'Subscription tier: free, pro, or enterprise';
