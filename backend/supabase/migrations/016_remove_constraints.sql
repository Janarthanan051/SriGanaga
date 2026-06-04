-- 016_remove_constraints.sql
-- Relax constraints on roles to allow dynamic scaling and more granular sub-roles.
-- And fix sales_orders to allow proper insertion if we ever need more flexible check constraints.

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Reload schema
NOTIFY pgrst, 'reload schema';
