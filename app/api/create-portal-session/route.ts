import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Implement Stripe Customer Portal
  // This requires:
  // 1. Install stripe: npm install stripe
  // 2. Get customer ID from Supabase (linked to API key)
  // 3. Create portal session
  // 4. Redirect to portal URL

  // For now, redirect to pricing page
  return NextResponse.redirect('https://zodforge.dev/#pricing');
}
