-- Find all functions that reference admin_users
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    pg_get_functiondef(p.oid) LIKE '%admin_users%';

-- Check if is_admin function uses admin_users
SELECT 
    proname AS function_name,
    prosrc AS function_source
FROM 
    pg_proc 
WHERE 
    proname = 'is_admin';

-- Check for any function related to handle_seller_verification
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    p.proname ILIKE '%seller%' OR 
    p.proname ILIKE '%verification%' OR
    p.proname ILIKE '%admin%'; 