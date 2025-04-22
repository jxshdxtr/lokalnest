-- Check JWT claims configuration
SELECT 
  setting 
FROM pg_settings 
WHERE name = 'jwt.claims.role';

-- Check authentication functions
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'auth'
  AND pg_get_functiondef(p.oid) LIKE '%admin_users%';

-- Examine function behavior for administrator checks
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin';

-- Check RLS policy auth functions
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%auth.uid()%'
  AND pg_get_functiondef(p.oid) LIKE '%admin%'; 