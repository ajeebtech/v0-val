import { Suspense } from 'react';
import { Metadata } from 'next';
import LoginForm from './login-form';
import LoginClient from './login-client';

export const metadata: Metadata = {
  title: 'Login - L.I.F.E OS',
  description: 'Sign in to your L.I.F.E OS account',
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
