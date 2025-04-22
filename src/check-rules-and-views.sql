-- Check for rules that might reference admin_users
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    r.rulename AS rule_name,
    pg_get_ruledef(r.oid) AS rule_definition
FROM 
    pg_rewrite r
JOIN 
    pg_class c ON r.ev_class = c.oid
JOIN 
    pg_namespace n ON c.relnamespace = n.oid
WHERE 
    pg_get_ruledef(r.oid) LIKE '%admin_users%';

-- Check for views that might reference admin_users
SELECT 
    n.nspname AS schema_name,
    c.relname AS view_name,
    pg_get_viewdef(c.oid) AS view_definition
FROM 
    pg_class c
JOIN 
    pg_namespace n ON c.relnamespace = n.oid
WHERE 
    c.relkind = 'v' AND
    pg_get_viewdef(c.oid) LIKE '%admin_users%';

-- Look for materialized views
SELECT 
    n.nspname AS schema_name,
    c.relname AS matview_name,
    pg_get_viewdef(c.oid) AS matview_definition
FROM 
    pg_class c
JOIN 
    pg_namespace n ON c.relnamespace = n.oid
WHERE 
    c.relkind = 'm' AND
    pg_get_viewdef(c.oid) LIKE '%admin_users%';

-- Check publications and subscriptions (for logical replication)
SELECT 
    pubname, 
    pubtables
FROM 
    pg_publication
WHERE 
    pubtables::text LIKE '%admin_users%'; 