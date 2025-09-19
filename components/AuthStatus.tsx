'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthStatus() {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <div className="p-4 bg-yellow-100 text-yellow-800">Loading auth state...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Auth Status</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify({
          isAuthenticated: !!user,
          user: user ? {
            id: user.id,
            email: user.email,
            lastSignIn: user.last_sign_in_at,
          } : null,
          session: session ? {
            expiresAt: session.expires_at ? new Date(Number(session.expires_at) * 1000).toISOString() : 'N/A',
            accessToken: session.access_token ? `${session.access_token.substring(0, 10)}...` : 'N/A',
          } : null,
        }, null, 2)}
      </pre>
    </div>
  );
}
