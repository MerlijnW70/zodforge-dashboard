import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyApiKey } from './api-client';

export const authConfig: NextAuthConfig = {
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.apiKey = (user as any).apiKey;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.tier = (user as any).tier;
        token.kid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.apiKey = token.apiKey as string;
        session.user.tier = token.tier as string;
        session.user.kid = token.kid as string;
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
