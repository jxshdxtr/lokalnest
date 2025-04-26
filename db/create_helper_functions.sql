-- Create helper function to get column information for a table
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = CURRENT_SCHEMA()
    AND c.table_name = get_table_columns.table_name
  ORDER BY 
    c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_table_columns('notification_preferences');

-- Create an RPC endpoint for this function
COMMENT ON FUNCTION get_table_columns(TEXT) IS 'Safely retrieve column information for a table';

-- Check if the extension to support RLS exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_graphql'
  ) THEN
    -- Note: The actual extension name might be different in your system
    -- If you have an extension like postgREST or pg_graphql, you can expose functions
    
    -- In PostgREST, exposing a function makes it available as an RPC endpoint
    -- The following is a generic example, actual implementation depends on your setup
    GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO anon;
  END IF;
END
$$; 