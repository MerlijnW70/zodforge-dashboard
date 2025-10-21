import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import { verifyApiKey } from './api-client';
import { findOrCreateUser, getUserApiKeys } from './supabase';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      name: 'API Key',
      credentials: {
        apiKey: { label: 'API Key', type: 'password', placeholder: 'zf_...' },
      },
      async authorize(credentials) {
        if (!credentials?.apiKey || typeof credentials.apiKey !== 'string') {
          return null;
        }

        const apiKeyData = await verifyApiKey(credentials.apiKey);

        if (!apiKeyData || !apiKeyData.success) {
          return null;
        }

        return {
          id: apiKeyData.key.kid,
          name: apiKeyData.key.name,
          email: apiKeyData.key.customerId,
          apiKey: credentials.apiKey,
          tier: apiKeyData.key.tier,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For GitHub OAuth, ensure user has an API key
      if (account?.provider === 'github' && profile) {
        try {
          // Find or create user and get/create their API key
          const dbUser = await findOrCreateUser({
            id: profile.id as string,
            email: profile.email as string,
            name: profile.name as string,
            avatar_url: (profile as any).avatar_url,
          });

          // Check if user has API keys
          const apiKeys = await getUserApiKeys(dbUser.id);

          if (apiKeys.length === 0) {
            // Generate API key for new user
            const response = await fetch(
              `${process.env.NEXTAUTH_URL}/api/generate-user-key`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  githubId: profile.id,
                  email: profile.email,
                  name: profile.name,
                  avatarUrl: (profile as any).avatar_url,
                  tier: 'free',
                }),
              }
            );

            if (!response.ok) {
              console.error('Failed to generate API key for new user');
              return false;
            }
          }

          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        if (account?.provider === 'github') {
          // GitHub OAuth - fetch their API key
          try {
            const dbUser = await findOrCreateUser({
              id: profile!.id as string,
              email: profile!.email as string,
              name: profile!.name as string,
              avatar_url: (profile as any)?.avatar_url,
            });

            const apiKeys = await getUserApiKeys(dbUser.id);

            if (apiKeys.length > 0) {
              // Fetch the actual API key from the zodforge-api
              const keyResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/api-keys/me`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.ZODFORGE_ADMIN_API_KEY}`,
                  },
                }
              );

              token.kid = apiKeys[0].kid;
              token.tier = apiKeys[0].tier;
              token.userId = dbUser.id;
              token.loginMethod = 'github';
            }
          } catch (error) {
            console.error('JWT callback error:', error);
          }
        } else {
          // API Key login
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.apiKey = (user as any).apiKey;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.tier = (user as any).tier;
          token.kid = user.id;
          token.loginMethod = 'apikey';
        }

        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.apiKey = token.apiKey as string;
        session.user.tier = token.tier as string;
        session.user.kid = token.kid as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.userId = token.userId as string;
        session.user.loginMethod = token.loginMethod as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
