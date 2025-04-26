import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to get the column information for a table
 * @param tableName The name of the table to inspect
 */
export async function getTableInfo(tableName: string) {
  try {
    // This query retrieves column information from PostgreSQL's information_schema
    const { data, error } = await supabase.rpc('get_table_info', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error('Error fetching table info:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getTableInfo:', error);
    return null;
  }
}

/**
 * Create a seller profile record for testing
 * @param sellerId The seller ID to create or update
 * @param profileData The profile data to set
 */
export async function createTestSellerProfile(sellerId: string, profileData: any) {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .upsert({
        id: sellerId,
        ...profileData,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating test seller profile:', error);
      return false;
    }
    
    console.log('Test seller profile created/updated:', data);
    return true;
  } catch (error) {
    console.error('Error in createTestSellerProfile:', error);
    return false;
  }
}

/**
 * Direct SQL query to insert seller profile data
 * @param sellerId The seller ID to create or update
 * @param profileData The profile data to set
 */
export async function directSQLInsert(sellerId: string, profileData: any) {
  // Build SQL statement based on the keys in profileData
  const keys = Object.keys(profileData).concat(['id', 'updated_at']);
  const values = Object.values(profileData).concat([sellerId, new Date().toISOString()]);
  
  try {
    // Create parameterized query to avoid SQL injection
    let params: any[] = [];
    let paramPlaceholders = [];
    
    for (let i = 0; i < values.length; i++) {
      params.push(values[i]);
      paramPlaceholders.push(`$${i+1}`);
    }
    
    const query = `
      INSERT INTO seller_profiles (${keys.join(', ')})
      VALUES (${paramPlaceholders.join(', ')})
      ON CONFLICT (id) 
      DO UPDATE SET
        ${keys.map((key, i) => i > 0 ? `${key} = $${i+1}` : '').filter(Boolean).join(', ')}
    `;
    
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: query,
      params: params
    });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in directSQLInsert:', error);
    return false;
  }
} 