-- Find triggers that might be referencing admin_users
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    pg_get_triggerdef(t.oid) AS trigger_definition,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_trigger t
JOIN 
    pg_class c ON t.tgrelid = c.oid
JOIN 
    pg_proc p ON t.tgfoid = p.oid
WHERE 
    pg_get_functiondef(p.oid) LIKE '%admin_users%'
    OR pg_get_triggerdef(t.oid) LIKE '%admin_users%';

-- Find all triggers specifically on the seller_verifications table
SELECT 
    t.tgname AS trigger_name,
    pg_get_triggerdef(t.oid) AS trigger_definition,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM 
    pg_trigger t
JOIN 
    pg_class c ON t.tgrelid = c.oid
JOIN 
    pg_proc p ON t.tgfoid = p.oid
WHERE 
    c.relname = 'seller_verifications'; 