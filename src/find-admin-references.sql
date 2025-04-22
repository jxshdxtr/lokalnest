-- Find any remaining references to admin_users in database policies, functions, triggers, or views
-- This script will help you locate and fix any remaining references

-- Check for tables or views referencing admin_users
SELECT
    referencing_schema,
    referencing_table,
    referencing_column
FROM (
    SELECT
        ccu.table_schema AS referencing_schema,
        ccu.table_name AS referencing_table,
        ccu.column_name AS referencing_column
    FROM
        information_schema.constraint_column_usage ccu
    JOIN
        information_schema.table_constraints tc
        ON ccu.constraint_name = tc.constraint_name
    WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND (ccu.table_name = 'admin_users' OR tc.table_name = 'admin_users')
) AS fk_references;

-- Check for RLS policies that might reference admin_users
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM
    pg_policies
WHERE
    qual::text LIKE '%admin_users%' OR with_check::text LIKE '%admin_users%';

-- Check for functions that might reference admin_users
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM
    pg_proc p
    LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
    pg_get_functiondef(p.oid) LIKE '%admin_users%'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema');

-- Check for views that might reference admin_users
SELECT
    table_schema,
    table_name,
    view_definition
FROM
    information_schema.views
WHERE
    view_definition LIKE '%admin_users%';