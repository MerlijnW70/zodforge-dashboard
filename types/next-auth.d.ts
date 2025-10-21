import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      apiKey: string;
      tier: string;
      kid: string;
      userId?: string;
      loginMethod?: 'github' | 'apikey';
    };
  }

  interface User {
    apiKey: string;
    tier: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    apiKey: string;
    tier: string;
    kid: string;
    userId?: string;
    loginMethod?: string;
  }
}
