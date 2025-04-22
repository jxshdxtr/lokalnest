-- Check for all RPC functions that might reference admin_users

-- Check auth schema
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'auth' AND
    pg_get_functiondef(p.oid) LIKE '%admin_users%';

-- Check storage schema
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'storage' AND
    pg_get_functiondef(p.oid) LIKE '%admin_users%';

-- Check supabase_functions schema
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'supabase_functions' AND
    pg_get_functiondef(p.oid) LIKE '%admin_users%';

-- Check for any schema that might contain admin-related functions
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    (p.proname LIKE '%admin%' OR p.proname LIKE '%seller%' OR p.proname LIKE '%verif%') AND
    pg_get_functiondef(p.oid) LIKE '%admin_users%'; 