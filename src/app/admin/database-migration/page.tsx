'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function DatabaseMigrationPage() {
  const [loading, setLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/supabase-migration');
      const data = await response.json();

      if (response.ok) {
        setMigrationResult({ success: true });
      } else {
        setMigrationResult({ success: false, error: data.error || 'Unknown error' });
      }
    } catch (error) {
      setMigrationResult({ success: false, error: 'Failed to run migration' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
          <CardDescription>
            Run this migration to add image support to messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            This migration will:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
            <li>Add an <code>image_url</code> column to the <code>messages</code> table</li>
            <li>Create a <code>messages</code> storage bucket for image uploads</li>
            <li>Set appropriate permissions for the bucket</li>
          </ul>

          {migrationResult && (
            <div className={`mt-6 p-4 rounded-md ${migrationResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                {migrationResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">Migration completed successfully</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">Migration failed: {migrationResult.error}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={runMigration}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              'Run Migration'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 