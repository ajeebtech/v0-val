'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Welcome to L.I.F.E. OS</CardTitle>
          <CardDescription>
            The ultimate OS for rebels. Making the web for brave individuals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Hello, {user.email}! You're now logged in and ready to explore the L.I.F.E. OS platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                Account Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
