"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function SupabaseTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    addResult('Starting Supabase tests...');

    // Test 1: Check user authentication
    addResult(`User authenticated: ${user ? 'YES' : 'NO'}`);
    if (user) {
      addResult(`User ID: ${user.id}`);
      addResult(`User email: ${user.email}`);
    }

    // Test 2: Check Supabase client
    addResult(`Supabase client created: ${supabase ? 'YES' : 'NO'}`);

    // Test 3: Test basic connection
    try {
      const { data, error } = await supabase.auth.getUser();
      addResult(`Auth test: ${error ? 'FAILED' : 'SUCCESS'}`);
      if (error) addResult(`Auth error: ${error.message}`);
    } catch (err) {
      addResult(`Auth test error: ${err}`);
    }

    // Test 4: Test tweets table access
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .limit(1);
      
      addResult(`Table access test: ${error ? 'FAILED' : 'SUCCESS'}`);
      if (error) {
        addResult(`Table error: ${error.message}`);
        addResult(`Error code: ${error.code}`);
        addResult(`Error details: ${error.details}`);
      } else {
        addResult(`Table accessible: YES`);
        addResult(`Sample data count: ${data?.length || 0}`);
      }
    } catch (err) {
      addResult(`Table test error: ${err}`);
    }

    // Test 5: Test insert (if user exists)
    if (user) {
      try {
        const testDate = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('tweets')
          .upsert({
            user_id: user.id,
            date: testDate,
            count: 999, // Test value
          })
          .select();

        addResult(`Insert test: ${error ? 'FAILED' : 'SUCCESS'}`);
        if (error) {
          addResult(`Insert error: ${error.message}`);
          addResult(`Insert error code: ${error.code}`);
        } else {
          addResult(`Insert successful: ${data?.length || 0} rows affected`);
        }
      } catch (err) {
        addResult(`Insert test error: ${err}`);
      }
    }

    addResult('Tests completed!');
  };

  return (
    <Card className="bg-black border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runTests} className="mb-4">
          Run Tests
        </Button>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="text-xs text-gray-300 font-mono">
              {result}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
