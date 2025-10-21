#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * Checks if all required environment variables are configured
 */

const requiredEnvVars = {
  // NextAuth
  NEXTAUTH_SECRET: 'NextAuth encryption secret (generate with: openssl rand -base64 32)',
  NEXTAUTH_URL: 'Your deployment URL (e.g., https://zodforge-dashboard.vercel.app)',

  // API Configuration
  NEXT_PUBLIC_API_URL: 'ZodForge API URL (https://web-production-f15d.up.railway.app)',

  // GitHub OAuth
  GITHUB_ID: 'GitHub OAuth Client ID (from https://github.com/settings/developers)',
  GITHUB_SECRET: 'GitHub OAuth Client Secret (from GitHub OAuth app)',

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL (from Supabase dashboard)',
  SUPABASE_SERVICE_KEY: 'Supabase service role key (from Supabase dashboard → Settings → API)',

  // Admin Key
  ZODFORGE_ADMIN_API_KEY: 'Admin API key for generating user keys (generate in zodforge-api)',

  // Stripe (Optional - for billing)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key (optional)',
  STRIPE_SECRET_KEY: 'Stripe secret key (optional)',
};

console.log('🔍 Verifying Environment Variables...\n');

let missingVars = [];
let presentVars = [];
let placeholderVars = [];

for (const [varName, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];

  if (!value) {
    missingVars.push({ varName, description });
  } else if (value.includes('your-') || value.includes('change-in-production')) {
    placeholderVars.push({ varName, description, value });
  } else {
    presentVars.push(varName);
  }
}

// Print results
if (presentVars.length > 0) {
  console.log('✅ Configured Variables:');
  presentVars.forEach(varName => {
    const maskedValue = process.env[varName].substring(0, 10) + '...';
    console.log(`   ${varName}: ${maskedValue}`);
  });
  console.log('');
}

if (placeholderVars.length > 0) {
  console.log('⚠️  Placeholder Values (Need Replacement):');
  placeholderVars.forEach(({ varName, description, value }) => {
    console.log(`   ${varName}: ${value}`);
    console.log(`      → ${description}`);
  });
  console.log('');
}

if (missingVars.length > 0) {
  console.log('❌ Missing Variables:');
  missingVars.forEach(({ varName, description }) => {
    console.log(`   ${varName}`);
    console.log(`      → ${description}`);
  });
  console.log('');
}

// Summary
const totalRequired = Object.keys(requiredEnvVars).length - 2; // Stripe is optional
const configured = presentVars.length;
const needsWork = missingVars.length + placeholderVars.length;

console.log('📊 Summary:');
console.log(`   Required: ${totalRequired} variables`);
console.log(`   Configured: ${configured} variables`);
console.log(`   Needs Work: ${needsWork} variables`);
console.log('');

if (needsWork === 0) {
  console.log('🎉 All required environment variables are configured!');
  console.log('   Ready to deploy to production.');
  process.exit(0);
} else {
  console.log('📝 Next Steps:');
  console.log('   1. Follow GITHUB-OAUTH-SETUP.md for detailed setup instructions');
  console.log('   2. See QUICK-DEPLOY-NOW.md for deployment checklist');
  console.log('   3. Run this script again after updating .env.local');
  process.exit(1);
}
