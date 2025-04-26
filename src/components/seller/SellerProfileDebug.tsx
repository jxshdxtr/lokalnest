import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * A debug component to help troubleshoot seller profile issues
 */
const SellerProfileDebug = () => {
  const [loading, setLoading] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const checkTableSchema = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('You must be signed in');
        return;
      }
      
      setUserId(user.id);
      
      // Use our specialized function to get the seller_profiles columns
      const { data, error } = await supabase.rpc('get_seller_profiles_columns');
      
      if (error) {
        console.error('Error fetching schema:', error);
        toast.error(`Failed to fetch schema information: ${error.message}`);
        return;
      }
      
      setSchemaInfo(data);
      toast.success('Schema retrieved successfully');
    } catch (error) {
      console.error('Error checking schema:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runDirectInsert = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('You must be signed in');
        return;
      }
      
      // Prepare test data
      const testData = {
        business_name: 'Debug Test Store',
        description: 'Test store for debugging',
        contact_email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test Location',
        updated_at: new Date().toISOString()
      };
      
      // Try direct insert with RPC
      const { data, error } = await supabase.rpc('insert_seller_profile', {
        user_id: user.id,
        profile_data: testData
      });
      
      if (error) {
        console.error('Error inserting test data:', error);
        toast.error(`Failed to insert test data: ${error.message}`);
        return;
      }
      
      console.log('Insert result:', data);
      toast.success('Test data inserted successfully');
    } catch (error) {
      console.error('Error running direct insert:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to check the database for the current profile
  const checkCurrentProfile = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('You must be signed in');
        return;
      }
      
      // Query the profile directly
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          toast.info('No seller profile found for your user ID');
        } else {
          console.error('Error fetching profile:', error);
          toast.error(`Failed to fetch profile: ${error.message}`);
        }
        return;
      }
      
      console.log('Current profile:', data);
      toast.success('Found existing profile');
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearConsole = () => {
    console.clear();
    toast.success('Console cleared');
  };

  return (
    <Card className="mt-8 border-dashed border-orange-300">
      <CardHeader className="bg-orange-50">
        <CardTitle className="text-orange-800">Debug Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Debug Mode</AlertTitle>
          <AlertDescription>
            These tools are for development and debugging purposes only.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="outline" 
            onClick={checkTableSchema} 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check Table Schema
          </Button>
          
          <Button 
            variant="outline" 
            onClick={runDirectInsert} 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Direct Insert
          </Button>

          <Button 
            variant="outline" 
            onClick={checkCurrentProfile} 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check Current Profile
          </Button>

          <Button 
            variant="ghost" 
            onClick={clearConsole}
            className="ml-auto"
          >
            Clear Console
          </Button>
        </div>
        
        {userId && (
          <div className="text-xs text-muted-foreground">
            <p>User ID: {userId}</p>
          </div>
        )}
        
        {schemaInfo && (
          <div className="mt-4 overflow-auto max-h-[300px] border rounded-md p-2">
            <h3 className="text-sm font-medium mb-2">seller_profiles schema:</h3>
            <table className="text-xs min-w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 py-1 text-left">Column</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Nullable</th>
                </tr>
              </thead>
              <tbody>
                {schemaInfo.map((col: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="px-2 py-1">{col.column_name}</td>
                    <td className="px-2 py-1">{col.data_type}</td>
                    <td className="px-2 py-1">{col.is_nullable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerProfileDebug; 