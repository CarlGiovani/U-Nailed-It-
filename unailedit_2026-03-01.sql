--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id bigint NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id bigint NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    start_date date NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    images text[] DEFAULT '{}'::text[],
    CONSTRAINT announcements_check CHECK (((end_date IS NULL) OR (end_date >= start_date)))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.announcements ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id bigint NOT NULL,
    customer_id bigint,
    service_id bigint,
    booking_date date NOT NULL,
    booking_time time without time zone NOT NULL,
    total_price numeric(10,2) NOT NULL,
    downpayment numeric(10,2) NOT NULL,
    notes text,
    proof_payment_path text,
    status text DEFAULT 'pending_payment'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    approved_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    completed_at timestamp without time zone,
    service_variant_id bigint,
    expires_at timestamp with time zone,
    review_token text,
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['pending_payment'::text, 'pending_approval'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'completed'::text, 'expired'::text, 'abandoned'::text]))),
    CONSTRAINT positive_price_check CHECK (((total_price >= (0)::numeric) AND (downpayment >= (0)::numeric)))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: calendar_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_slots (
    id bigint NOT NULL,
    service_id bigint,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.calendar_slots OWNER TO postgres;

--
-- Name: calendar_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calendar_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calendar_slots_id_seq OWNER TO postgres;

--
-- Name: calendar_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calendar_slots_id_seq OWNED BY public.calendar_slots.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    facebook_link text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: payment_intents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_intents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    service_id bigint NOT NULL,
    service_variant_id bigint,
    booking_date date NOT NULL,
    booking_time time without time zone NOT NULL,
    proof_path text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now(),
    total_price numeric,
    downpayment numeric,
    booking_id bigint,
    CONSTRAINT payment_intents_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'expired'::text, 'used'::text])))
);


ALTER TABLE public.payment_intents OWNER TO postgres;

--
-- Name: policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policies (
    id bigint NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.policies OWNER TO postgres;

--
-- Name: policies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.policies ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: portfolio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio (
    id bigint NOT NULL,
    title text,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    images text[] NOT NULL
);


ALTER TABLE public.portfolio OWNER TO postgres;

--
-- Name: portfolio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_id_seq OWNER TO postgres;

--
-- Name: portfolio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolio_id_seq OWNED BY public.portfolio.id;


--
-- Name: revenue_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_logs (
    id bigint NOT NULL,
    booking_id bigint,
    amount numeric(10,2) NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.revenue_logs OWNER TO postgres;

--
-- Name: revenue_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenue_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenue_logs_id_seq OWNER TO postgres;

--
-- Name: revenue_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenue_logs_id_seq OWNED BY public.revenue_logs.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    booking_id bigint,
    rating smallint NOT NULL,
    comment text,
    image_url text,
    is_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_categories (
    id bigint NOT NULL,
    service_id bigint,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


ALTER TABLE public.service_categories OWNER TO postgres;

--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_categories_id_seq OWNER TO postgres;

--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: service_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_variants (
    id bigint NOT NULL,
    category_id bigint,
    body_part text NOT NULL,
    size text,
    price numeric(10,2) NOT NULL,
    downpayment numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_variants OWNER TO postgres;

--
-- Name: service_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_variants_id_seq OWNER TO postgres;

--
-- Name: service_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_variants_id_seq OWNED BY public.service_variants.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id bigint NOT NULL,
    name text NOT NULL,
    description text,
    duration interval,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: calendar_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_slots ALTER COLUMN id SET DEFAULT nextval('public.calendar_slots_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: portfolio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio ALTER COLUMN id SET DEFAULT nextval('public.portfolio_id_seq'::regclass);


--
-- Name: revenue_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_logs ALTER COLUMN id SET DEFAULT nextval('public.revenue_logs_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: service_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_variants ALTER COLUMN id SET DEFAULT nextval('public.service_variants_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
6771d55f-7660-47df-8058-b79f66a5b277	6771d55f-7660-47df-8058-b79f66a5b277	{"sub": "6771d55f-7660-47df-8058-b79f66a5b277", "email": "seanstaana0510@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-01-06 16:09:20.480168+00	2026-01-06 16:09:20.480231+00	2026-01-06 16:09:20.480231+00	d0c244d7-d009-4b8e-9ff6-085422cfdb1c
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
bdc181e4-48ae-4c68-8fb9-92f3f8462957	2026-01-06 16:27:33.590499+00	2026-01-06 16:27:33.590499+00	password	9b663151-4d71-4b67-8583-3b11f9d99a6c
91943859-207b-4d40-a805-36fbd0bbc6f5	2026-01-08 19:21:22.991498+00	2026-01-08 19:21:22.991498+00	password	3dfdde5b-0ba6-4dfa-a238-a9fcae4410d8
c5c4f96b-db3d-401c-bc97-52f6ae620046	2026-01-10 17:21:45.574684+00	2026-01-10 17:21:45.574684+00	password	98f7385f-111e-488b-8c6c-b9123c535751
1f4431d2-3a3c-4f88-afcf-bf2717268033	2026-01-10 18:12:18.497351+00	2026-01-10 18:12:18.497351+00	password	66fd34ba-de4e-42cc-9976-7a1c12c558cf
89306dae-0f65-4db5-be70-fc61be1cc10f	2026-01-11 18:18:28.699409+00	2026-01-11 18:18:28.699409+00	password	39305951-6610-4cb2-bae4-a5fdd1af6459
f5825fa0-0cb5-4d14-9b35-26c8bbf8c604	2026-01-14 10:24:37.834692+00	2026-01-14 10:24:37.834692+00	password	9f4285db-899e-402b-a0ea-0c281f3fcee6
788f71fb-ff26-4423-a07a-173b010158d8	2026-01-14 11:49:25.059196+00	2026-01-14 11:49:25.059196+00	password	7a3a1d7d-28aa-40ba-bfae-b0e61f11919c
324c7cb1-4dcf-4a2a-ac3c-c31c96ed82a9	2026-01-14 12:54:32.07273+00	2026-01-14 12:54:32.07273+00	password	deef7c23-d32c-40d2-a754-6a601282bbf8
e0c2033a-c632-402e-b6df-8b4e6b7cd18d	2026-01-14 13:02:49.694357+00	2026-01-14 13:02:49.694357+00	password	0ef5eb45-362f-4074-b935-dfc026e1a0f4
a24c1752-ea30-4574-8652-f6461823ecab	2026-01-14 15:58:12.81831+00	2026-01-14 15:58:12.81831+00	password	dbea1461-62e1-4e59-82aa-a3bff1b95d7f
b8c08b38-c416-48a8-9444-6601ccbb8da9	2026-01-16 07:51:17.584435+00	2026-01-16 07:51:17.584435+00	password	0313c41f-664f-4c9f-84fe-9aadb9d819ba
b7250daa-d56f-4198-894b-4dab297022e2	2026-01-16 14:11:57.256636+00	2026-01-16 14:11:57.256636+00	password	98d55bef-7535-43e8-877d-f0afb11aa0a2
f89aa726-486a-44b6-925b-de4c9dced904	2026-01-17 09:40:32.604324+00	2026-01-17 09:40:32.604324+00	password	7c8a5ae7-4421-4cdc-8d1f-0bb509139a0b
fee07971-e402-4f3f-bcfe-0aec6f1f6228	2026-01-17 12:06:14.299248+00	2026-01-17 12:06:14.299248+00	password	1235fded-270f-48f3-988a-7b2531767a10
061e25bf-0ed5-4b14-8f4c-beb8f3772be5	2026-01-17 13:40:55.01694+00	2026-01-17 13:40:55.01694+00	password	3c0d2f06-5fa6-4097-81d7-954c9bcbff6f
c32b45ab-7538-4674-a846-dd8a59b1d0a2	2026-01-17 18:35:03.033532+00	2026-01-17 18:35:03.033532+00	password	e1c03dc9-4424-4e10-8042-2e6ab7a6c543
97658795-3a1e-46af-a701-b4a385271283	2026-01-17 19:55:15.727361+00	2026-01-17 19:55:15.727361+00	password	7a3c1af8-5515-446e-82a5-7f31c3a69cef
0ea01844-b374-4c10-89fd-ae20cb9a6209	2026-01-20 04:35:49.769181+00	2026-01-20 04:35:49.769181+00	password	36d7b35c-d2ff-48b0-a259-fcc14ef1668b
cb95687b-5e96-4c33-86a0-7bb88d911743	2026-01-21 04:55:12.465281+00	2026-01-21 04:55:12.465281+00	password	6cf00ba1-1edc-4ae6-a442-16b5b05bf6c4
f9c87ee7-e3a3-4875-9e0b-220f543c3215	2026-01-25 04:22:30.576248+00	2026-01-25 04:22:30.576248+00	password	5af8308f-977f-40ea-868e-93f602cad8a5
8f5c64e0-abd0-483d-b0f9-94af303afe2f	2026-01-25 07:05:59.46743+00	2026-01-25 07:05:59.46743+00	password	58ecd9b9-df6f-49ed-be37-76aa0bf7c469
ce37d503-879c-49b0-b895-ec950210a904	2026-01-25 15:00:48.708243+00	2026-01-25 15:00:48.708243+00	password	2daba060-665a-4f5c-be3a-665628763920
44ea4c0f-bfbc-4cb3-a6e5-46bf13c29353	2026-01-27 11:00:30.385269+00	2026-01-27 11:00:30.385269+00	password	1d6dc627-8c05-4e04-8d74-04684d4cbe9c
9ad351d0-8f7f-46f2-95f6-db74f2dccb71	2026-01-30 15:50:43.691833+00	2026-01-30 15:50:43.691833+00	password	8d033310-b219-4724-8485-b2d9c0a35ab1
6f13cce2-544e-4c93-80e4-d0e0b6e8169f	2026-01-31 09:05:49.961627+00	2026-01-31 09:05:49.961627+00	password	a3c23b10-1aa7-4dd9-aad4-727d4672c25f
799c1248-e0d3-4fd9-93b3-cede3c115153	2026-02-01 03:49:52.02644+00	2026-02-01 03:49:52.02644+00	password	12f51cc5-5f3c-41af-9188-2ce9a7404643
9dff2746-d254-46e6-b02a-a283d041ccdd	2026-02-01 07:49:27.085382+00	2026-02-01 07:49:27.085382+00	password	8abdde91-ee1b-451d-996f-a98632d9ec8f
55cbcbd1-16db-4173-a398-946e1b23d964	2026-02-01 08:59:50.901778+00	2026-02-01 08:59:50.901778+00	password	96b21be3-4159-45c2-9f02-a7851944ce6f
5747ad84-53df-49af-9871-3c9af86acd31	2026-02-05 05:05:17.8064+00	2026-02-05 05:05:17.8064+00	password	dfdd0da9-5500-430f-8991-6763c12fbd29
5fa7f64c-6df9-4343-bc04-3f467e0bb355	2026-02-06 00:05:01.134128+00	2026-02-06 00:05:01.134128+00	password	83e087f1-58f5-419d-8dd8-ac829b6908eb
91c387c5-7a71-411d-9e74-2f271ccbf22f	2026-02-06 09:52:20.491936+00	2026-02-06 09:52:20.491936+00	password	20727570-7d61-4136-8193-87b0a688f3cd
a06d578c-57d2-4354-8240-655def790d07	2026-02-06 10:39:37.648902+00	2026-02-06 10:39:37.648902+00	password	a9dff737-3a75-4455-8968-56596bcf1bdb
1b050dc6-5b22-4b5c-a843-47e083d89211	2026-02-07 07:37:08.750908+00	2026-02-07 07:37:08.750908+00	password	5a9186ef-4d2b-4799-93c0-4428092b030b
acdd3b0c-f4fb-4539-af0a-89992c448709	2026-02-07 08:49:42.562308+00	2026-02-07 08:49:42.562308+00	password	b8c9f43e-0157-4ea1-ba6e-c991b06e86fd
e19f7827-012d-4a6b-9cc6-ffae89bdbf54	2026-02-08 04:05:21.38946+00	2026-02-08 04:05:21.38946+00	password	09e0696b-299a-408d-b2ed-9c4f3f2b64fe
f747fb25-774a-4e39-92f8-5dbfb5380a28	2026-02-08 04:05:23.370586+00	2026-02-08 04:05:23.370586+00	password	e3b3fa89-5eca-4e46-a049-03d19c362302
9a548f20-79fc-4cbe-a345-8e0d1002cb95	2026-02-08 04:15:44.100539+00	2026-02-08 04:15:44.100539+00	password	aba5997a-fa47-4e40-a9cf-c022fe874002
b33591a9-a684-4b5b-be3f-849107c4301b	2026-02-08 10:15:05.578143+00	2026-02-08 10:15:05.578143+00	password	8d28a985-eb36-4a86-b2e0-4dbdc6c3d96e
191dea90-65f8-4edc-9ba9-039846f7c613	2026-02-08 11:36:46.992477+00	2026-02-08 11:36:46.992477+00	password	dc6b09e1-e6cf-4ad1-afe6-fb108633b610
76a0b7b8-b633-419b-a39e-9d0c01c9f1a5	2026-02-08 12:49:38.594154+00	2026-02-08 12:49:38.594154+00	password	71afb4ab-d177-4633-bbf3-0e4d4ea90d92
869bf881-9ac4-4119-a302-ea0d9a432043	2026-02-08 15:32:06.372166+00	2026-02-08 15:32:06.372166+00	password	1ddfb050-772a-4528-95a2-02d36ae1f763
82dfbcb1-dac8-40eb-bd81-2a3dcab3189e	2026-02-08 16:29:56.995447+00	2026-02-08 16:29:56.995447+00	password	0c061de1-6a49-4d3b-a213-81bf7f4ce076
4dd790d2-753f-4082-9661-77bf5ef67268	2026-02-10 16:11:42.667521+00	2026-02-10 16:11:42.667521+00	password	c6599fdf-b0d8-402a-88f5-b5dc5f3a8453
d3922f40-e439-425e-9708-36d3e32d439a	2026-02-12 03:03:44.202315+00	2026-02-12 03:03:44.202315+00	password	7eb43c6c-6a83-4001-b53e-0bdff0569a6b
2e0a4d8d-7f0b-4cae-8028-3c564140b0a5	2026-02-13 04:40:13.131505+00	2026-02-13 04:40:13.131505+00	password	5db7f176-6840-4ef1-b511-ecd1df9b4dfd
6d5c9bf8-93d6-46fe-a18a-c234fd10ccec	2026-02-15 00:23:51.901715+00	2026-02-15 00:23:51.901715+00	password	3b1e29f4-9f1d-47eb-b2e0-b7e329bcdfce
638f5d8a-7834-48b4-bac1-b92373ec68e1	2026-02-15 00:38:23.862814+00	2026-02-15 00:38:23.862814+00	password	0e8b3d91-db92-45c7-a7e0-812d78988d89
3a9722c7-6d6c-4b8a-9df2-67560ad21e8f	2026-02-15 00:42:48.807803+00	2026-02-15 00:42:48.807803+00	password	a20fc0f9-24bc-4ca5-9f65-132b1fb67021
b56efe3d-7d18-4112-adfd-db80254a419b	2026-02-15 00:43:34.24098+00	2026-02-15 00:43:34.24098+00	password	eeda055d-5a24-4af4-bfec-16adfc8510f3
a8783a85-626a-4573-885b-0b4382184e68	2026-02-15 00:53:25.794001+00	2026-02-15 00:53:25.794001+00	password	a6d16df2-d4b4-46e0-8445-cb3ed74fa9c2
6f9305ce-b64a-4ac3-8585-b937492bac06	2026-02-15 01:06:42.723518+00	2026-02-15 01:06:42.723518+00	password	5b11c9ec-8354-422d-a4fb-016218dfdb60
b638e8c2-ecdb-4b5c-a87c-b5b3c0980c4e	2026-02-15 01:57:05.69296+00	2026-02-15 01:57:05.69296+00	password	d350c8f6-d8fc-4956-aee3-2cfd299ae940
0b94f2da-2683-4e26-9494-7fbb3255e548	2026-02-15 03:03:47.964912+00	2026-02-15 03:03:47.964912+00	password	3d1a201d-4735-4738-be9d-28110462fcb0
95462f44-82e9-4d76-a4c8-e505598d2ad7	2026-02-15 06:08:37.183436+00	2026-02-15 06:08:37.183436+00	password	ca6203c5-03d1-4c9a-937a-a494d43875d7
08a81534-b212-4f5f-83f3-494290cb4fd5	2026-02-15 07:13:29.698325+00	2026-02-15 07:13:29.698325+00	password	77d8db9b-b6a1-4806-b9e4-161652b92a5f
5436d161-a5da-4744-8a57-ed81473cee7c	2026-02-15 08:16:08.390306+00	2026-02-15 08:16:08.390306+00	password	ad7bd40a-6ae0-4547-ad3e-12171e14ba6e
3615a3cb-bef8-441d-bde1-d86370cb7e65	2026-02-15 08:26:20.601791+00	2026-02-15 08:26:20.601791+00	password	69af3957-3de4-46ea-a51a-0070ec715a76
913b495b-0bad-4afc-b0d5-7a0c3bad462a	2026-02-15 08:50:09.742062+00	2026-02-15 08:50:09.742062+00	password	f412e62a-ca21-4a39-9444-c38fc1d70b46
91bd5a95-3b80-4e6b-8b7e-fd4510d18f10	2026-02-15 08:50:40.500834+00	2026-02-15 08:50:40.500834+00	password	63a78c79-2636-448d-a89f-795c5d8f5fe7
959f1714-234e-40fc-81a0-fed36ddd5b3c	2026-02-15 12:50:21.222982+00	2026-02-15 12:50:21.222982+00	password	82b354ff-1cf2-4709-9de2-a92dbc35f22f
239ed5ae-4510-4176-aee6-3e07f7138746	2026-02-15 13:01:45.087389+00	2026-02-15 13:01:45.087389+00	password	dc04fe1d-79eb-483b-841c-1d97c3d63398
f23857f4-a99d-4671-a9d8-45bb41fac0cb	2026-02-16 02:50:41.105943+00	2026-02-16 02:50:41.105943+00	password	25897c28-6817-40db-89f8-9d6d040f0dd4
be66ccda-ef10-4d1e-8250-6e23afc2f368	2026-02-16 04:05:31.912113+00	2026-02-16 04:05:31.912113+00	password	2bc647bd-a5d9-48ba-92b6-6e5fe53f7b42
da30f288-8d51-4d7f-b938-0a25b7f6b943	2026-02-19 03:37:22.022897+00	2026-02-19 03:37:22.022897+00	password	fddcddb3-c1b9-4c04-954a-c270a7659f27
473b18d9-6a22-4026-9c90-8f198728ee92	2026-02-19 04:21:44.848946+00	2026-02-19 04:21:44.848946+00	password	4bc895b7-2717-4e05-8b5c-24f91f1974ca
c39ae888-c41b-4f89-a9ce-54493fa1418c	2026-02-25 08:51:22.524061+00	2026-02-25 08:51:22.524061+00	password	8e1e61b5-2595-4e98-9900-cdaad184811a
0a53f449-2eda-48e2-8d05-011cba8bb429	2026-02-26 02:12:50.962209+00	2026-02-26 02:12:50.962209+00	password	2d957885-46a5-49f5-8892-661b891becca
bb4235fa-3c01-4874-a939-be7a7c58320e	2026-02-26 02:24:13.7077+00	2026-02-26 02:24:13.7077+00	password	e5082866-ef4a-4cf6-9144-d259c427e94f
6613c763-c3f6-45bc-916f-7b962155c1d8	2026-02-26 02:56:34.421032+00	2026-02-26 02:56:34.421032+00	password	4f819191-18aa-467e-b8c1-9257468f0c5f
e1fcc156-5136-4db7-bb79-1747965b8d0f	2026-02-26 03:04:20.187114+00	2026-02-26 03:04:20.187114+00	password	d60963f9-8217-42c6-bf8c-24fdbbce8c0e
a4e57503-9fdf-4518-af2a-b2e1804a564c	2026-02-26 04:37:19.746839+00	2026-02-26 04:37:19.746839+00	password	1173d0f2-d2e8-4977-b855-6285daefa06b
4e6e232b-a886-49d8-a415-8012108df685	2026-02-26 05:53:55.033528+00	2026-02-26 05:53:55.033528+00	password	9372165d-416d-4b07-be8c-40c096b6dfc9
2ff51465-2f2f-49da-ac98-11cb331b3b2e	2026-02-26 06:33:47.696956+00	2026-02-26 06:33:47.696956+00	password	9b60ab00-83bf-42f9-8554-2cded0f674ca
c6ee9cb5-1a4b-417c-b904-7bc3845eae98	2026-02-26 06:52:46.13844+00	2026-02-26 06:52:46.13844+00	password	cedc135b-dfdc-4529-b038-715776235fc2
7c4bdae9-a3d0-4be5-a552-4713a589c3df	2026-02-26 06:55:44.476332+00	2026-02-26 06:55:44.476332+00	password	63dcba89-0003-4116-a492-5a2433e4e752
a9bc4ec0-3eae-4c7c-ad3f-4085b4cd555e	2026-02-26 06:56:51.996071+00	2026-02-26 06:56:51.996071+00	password	9d2660a4-a2f0-4665-a54a-58ca99e653be
fe237f93-38a7-4e24-b3e6-d0376b17b771	2026-02-28 12:03:02.517935+00	2026-02-28 12:03:02.517935+00	password	c77eb8ae-e992-444b-9386-f095a9669a83
b4f31a6c-4a76-4558-963b-8070146788eb	2026-03-01 00:58:30.169936+00	2026-03-01 00:58:30.169936+00	password	497131b9-5188-4b67-bddc-4183a5f6aa43
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	hetjjxwzowou	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-06 16:27:33.542542+00	2026-01-06 16:27:33.542542+00	\N	bdc181e4-48ae-4c68-8fb9-92f3f8462957
00000000-0000-0000-0000-000000000000	2	hrhsll4l7r5v	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-08 19:21:22.978112+00	2026-01-08 19:21:22.978112+00	\N	91943859-207b-4d40-a805-36fbd0bbc6f5
00000000-0000-0000-0000-000000000000	3	4hxsfpx7j4ao	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-10 17:21:45.544006+00	2026-01-10 17:21:45.544006+00	\N	c5c4f96b-db3d-401c-bc97-52f6ae620046
00000000-0000-0000-0000-000000000000	4	sr7mlmoj2ksi	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-10 18:12:18.477215+00	2026-01-10 18:12:18.477215+00	\N	1f4431d2-3a3c-4f88-afcf-bf2717268033
00000000-0000-0000-0000-000000000000	5	xpgzjx2yqal4	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-11 18:18:28.680993+00	2026-01-11 18:18:28.680993+00	\N	89306dae-0f65-4db5-be70-fc61be1cc10f
00000000-0000-0000-0000-000000000000	6	6lnkyom2dr3g	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-14 10:24:37.82153+00	2026-01-14 10:24:37.82153+00	\N	f5825fa0-0cb5-4d14-9b35-26c8bbf8c604
00000000-0000-0000-0000-000000000000	7	ej64wh2ogj5k	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-14 11:49:25.049036+00	2026-01-14 11:49:25.049036+00	\N	788f71fb-ff26-4423-a07a-173b010158d8
00000000-0000-0000-0000-000000000000	8	atxf2b5wxjom	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-14 12:54:32.047915+00	2026-01-14 12:54:32.047915+00	\N	324c7cb1-4dcf-4a2a-ac3c-c31c96ed82a9
00000000-0000-0000-0000-000000000000	9	vvmtykylewas	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-14 13:02:49.67585+00	2026-01-14 13:02:49.67585+00	\N	e0c2033a-c632-402e-b6df-8b4e6b7cd18d
00000000-0000-0000-0000-000000000000	10	xebkxpoxdutl	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-14 15:58:12.780673+00	2026-01-14 15:58:12.780673+00	\N	a24c1752-ea30-4574-8652-f6461823ecab
00000000-0000-0000-0000-000000000000	11	zcy75476xwdv	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-16 07:51:17.561702+00	2026-01-16 07:51:17.561702+00	\N	b8c08b38-c416-48a8-9444-6601ccbb8da9
00000000-0000-0000-0000-000000000000	12	4adhwk7eaatl	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-16 14:11:57.219035+00	2026-01-16 14:11:57.219035+00	\N	b7250daa-d56f-4198-894b-4dab297022e2
00000000-0000-0000-0000-000000000000	13	bcz7lxf3ivwz	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-17 09:40:32.564445+00	2026-01-17 09:40:32.564445+00	\N	f89aa726-486a-44b6-925b-de4c9dced904
00000000-0000-0000-0000-000000000000	14	ghlvs3bmggf5	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-17 12:06:14.278694+00	2026-01-17 12:06:14.278694+00	\N	fee07971-e402-4f3f-bcfe-0aec6f1f6228
00000000-0000-0000-0000-000000000000	15	zwvs3qjxtijv	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-17 13:40:55.00965+00	2026-01-17 18:21:22.219448+00	\N	061e25bf-0ed5-4b14-8f4c-beb8f3772be5
00000000-0000-0000-0000-000000000000	16	3dpf62pdvjdj	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-17 18:21:22.243834+00	2026-01-17 18:21:22.243834+00	zwvs3qjxtijv	061e25bf-0ed5-4b14-8f4c-beb8f3772be5
00000000-0000-0000-0000-000000000000	17	yqkjdslp7qwk	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-17 18:35:03.01892+00	2026-01-17 19:33:16.521312+00	\N	c32b45ab-7538-4674-a846-dd8a59b1d0a2
00000000-0000-0000-0000-000000000000	18	b7nyypqvlpu2	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-17 19:33:16.534962+00	2026-01-17 19:33:16.534962+00	yqkjdslp7qwk	c32b45ab-7538-4674-a846-dd8a59b1d0a2
00000000-0000-0000-0000-000000000000	19	hqtjmixkyote	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-17 19:55:15.701814+00	2026-01-18 04:37:29.359099+00	\N	97658795-3a1e-46af-a701-b4a385271283
00000000-0000-0000-0000-000000000000	20	guc2e6gpjmgb	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-18 04:37:29.390071+00	2026-01-18 05:46:22.922382+00	hqtjmixkyote	97658795-3a1e-46af-a701-b4a385271283
00000000-0000-0000-0000-000000000000	21	ey2hu4sgz34x	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-18 05:46:22.941734+00	2026-01-18 06:44:52.102267+00	guc2e6gpjmgb	97658795-3a1e-46af-a701-b4a385271283
00000000-0000-0000-0000-000000000000	22	zcgqzqsvg4f5	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-18 06:44:52.118191+00	2026-01-18 10:26:41.386821+00	ey2hu4sgz34x	97658795-3a1e-46af-a701-b4a385271283
00000000-0000-0000-0000-000000000000	23	mlg7nbpqniir	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-18 10:26:41.399339+00	2026-01-18 10:26:41.399339+00	zcgqzqsvg4f5	97658795-3a1e-46af-a701-b4a385271283
00000000-0000-0000-0000-000000000000	24	6bol357uurn3	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-20 04:35:49.746527+00	2026-01-20 04:35:49.746527+00	\N	0ea01844-b374-4c10-89fd-ae20cb9a6209
00000000-0000-0000-0000-000000000000	25	n2oomarbjweg	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-21 04:55:12.42442+00	2026-01-21 04:55:12.42442+00	\N	cb95687b-5e96-4c33-86a0-7bb88d911743
00000000-0000-0000-0000-000000000000	26	nzqowarkvykr	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-25 04:22:30.554937+00	2026-01-25 07:05:45.099526+00	\N	f9c87ee7-e3a3-4875-9e0b-220f543c3215
00000000-0000-0000-0000-000000000000	27	fmpp5rd7yvx6	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-25 07:05:45.131376+00	2026-01-25 07:05:45.131376+00	nzqowarkvykr	f9c87ee7-e3a3-4875-9e0b-220f543c3215
00000000-0000-0000-0000-000000000000	28	lxwc63ipespb	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-25 07:05:59.466181+00	2026-01-25 07:05:59.466181+00	\N	8f5c64e0-abd0-483d-b0f9-94af303afe2f
00000000-0000-0000-0000-000000000000	29	p2v5xime3x4c	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-25 15:00:48.671403+00	2026-01-25 15:00:48.671403+00	\N	ce37d503-879c-49b0-b895-ec950210a904
00000000-0000-0000-0000-000000000000	30	thmneryuprkv	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-27 11:00:30.370065+00	2026-01-27 11:00:30.370065+00	\N	44ea4c0f-bfbc-4cb3-a6e5-46bf13c29353
00000000-0000-0000-0000-000000000000	31	uiogqfzpuqau	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-30 15:50:43.664149+00	2026-01-30 15:50:43.664149+00	\N	9ad351d0-8f7f-46f2-95f6-db74f2dccb71
00000000-0000-0000-0000-000000000000	32	p2k427bracd7	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-31 09:05:49.924736+00	2026-01-31 10:04:11.360204+00	\N	6f13cce2-544e-4c93-80e4-d0e0b6e8169f
00000000-0000-0000-0000-000000000000	33	vqkw2pjyc4ci	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-31 10:04:11.382229+00	2026-01-31 11:53:24.556154+00	p2k427bracd7	6f13cce2-544e-4c93-80e4-d0e0b6e8169f
00000000-0000-0000-0000-000000000000	34	spi3i37y4z32	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-31 11:53:24.578442+00	2026-01-31 13:16:14.089966+00	vqkw2pjyc4ci	6f13cce2-544e-4c93-80e4-d0e0b6e8169f
00000000-0000-0000-0000-000000000000	35	7wsmdyu6p4hu	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-01-31 13:16:14.112422+00	2026-01-31 14:14:37.943281+00	spi3i37y4z32	6f13cce2-544e-4c93-80e4-d0e0b6e8169f
00000000-0000-0000-0000-000000000000	36	lchedqnipcta	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-01-31 14:14:37.956921+00	2026-01-31 14:14:37.956921+00	7wsmdyu6p4hu	6f13cce2-544e-4c93-80e4-d0e0b6e8169f
00000000-0000-0000-0000-000000000000	37	ie7up2qisldw	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-01 03:49:51.989736+00	2026-02-01 03:49:51.989736+00	\N	799c1248-e0d3-4fd9-93b3-cede3c115153
00000000-0000-0000-0000-000000000000	38	xpjpylmc6qdq	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-01 07:49:27.058863+00	2026-02-01 07:49:27.058863+00	\N	9dff2746-d254-46e6-b02a-a283d041ccdd
00000000-0000-0000-0000-000000000000	39	xbifbn44gk4i	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-01 08:59:50.881641+00	2026-02-01 08:59:50.881641+00	\N	55cbcbd1-16db-4173-a398-946e1b23d964
00000000-0000-0000-0000-000000000000	40	o4umlqmldyz2	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-05 05:05:17.772541+00	2026-02-05 05:05:17.772541+00	\N	5747ad84-53df-49af-9871-3c9af86acd31
00000000-0000-0000-0000-000000000000	41	yf47p5t755g5	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-06 00:05:01.095544+00	2026-02-06 00:05:01.095544+00	\N	5fa7f64c-6df9-4343-bc04-3f467e0bb355
00000000-0000-0000-0000-000000000000	42	eo5epiwtjtct	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-06 09:52:20.464636+00	2026-02-06 09:52:20.464636+00	\N	91c387c5-7a71-411d-9e74-2f271ccbf22f
00000000-0000-0000-0000-000000000000	43	yfpt3wmccbfz	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-06 10:39:37.640584+00	2026-02-06 10:39:37.640584+00	\N	a06d578c-57d2-4354-8240-655def790d07
00000000-0000-0000-0000-000000000000	44	og5hggrlpkl2	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-07 07:37:08.722768+00	2026-02-07 07:37:08.722768+00	\N	1b050dc6-5b22-4b5c-a843-47e083d89211
00000000-0000-0000-0000-000000000000	45	lo7hzv75e4ff	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-07 08:49:42.545571+00	2026-02-07 08:49:42.545571+00	\N	acdd3b0c-f4fb-4539-af0a-89992c448709
00000000-0000-0000-0000-000000000000	46	5wrv7vsvm7q5	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 04:05:21.353864+00	2026-02-08 04:05:21.353864+00	\N	e19f7827-012d-4a6b-9cc6-ffae89bdbf54
00000000-0000-0000-0000-000000000000	47	5bylmvnismeb	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 04:05:23.369246+00	2026-02-08 04:05:23.369246+00	\N	f747fb25-774a-4e39-92f8-5dbfb5380a28
00000000-0000-0000-0000-000000000000	48	jmhkloq4iic2	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-02-08 04:15:44.088019+00	2026-02-08 07:24:59.902976+00	\N	9a548f20-79fc-4cbe-a345-8e0d1002cb95
00000000-0000-0000-0000-000000000000	49	bawlhdgceceg	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-02-08 07:24:59.926008+00	2026-02-08 08:23:13.156862+00	jmhkloq4iic2	9a548f20-79fc-4cbe-a345-8e0d1002cb95
00000000-0000-0000-0000-000000000000	50	r7e7yslf57cw	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 08:23:13.170211+00	2026-02-08 08:23:13.170211+00	bawlhdgceceg	9a548f20-79fc-4cbe-a345-8e0d1002cb95
00000000-0000-0000-0000-000000000000	51	vafzzq2p3jh6	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 10:15:05.560806+00	2026-02-08 10:15:05.560806+00	\N	b33591a9-a684-4b5b-be3f-849107c4301b
00000000-0000-0000-0000-000000000000	52	6mbn3ohw3w6d	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 11:36:46.968443+00	2026-02-08 11:36:46.968443+00	\N	191dea90-65f8-4edc-9ba9-039846f7c613
00000000-0000-0000-0000-000000000000	53	qpa57eqgnzte	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 12:49:38.58258+00	2026-02-08 12:49:38.58258+00	\N	76a0b7b8-b633-419b-a39e-9d0c01c9f1a5
00000000-0000-0000-0000-000000000000	54	kkvybhv3yvg3	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 15:32:06.341971+00	2026-02-08 15:32:06.341971+00	\N	869bf881-9ac4-4119-a302-ea0d9a432043
00000000-0000-0000-0000-000000000000	55	zcptqwfsiaeo	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-08 16:29:56.980798+00	2026-02-08 16:29:56.980798+00	\N	82dfbcb1-dac8-40eb-bd81-2a3dcab3189e
00000000-0000-0000-0000-000000000000	56	eqi7thazgaya	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-10 16:11:42.644311+00	2026-02-10 16:11:42.644311+00	\N	4dd790d2-753f-4082-9661-77bf5ef67268
00000000-0000-0000-0000-000000000000	57	oayfv4cwhhkq	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-12 03:03:44.169601+00	2026-02-12 03:03:44.169601+00	\N	d3922f40-e439-425e-9708-36d3e32d439a
00000000-0000-0000-0000-000000000000	58	7c6et4bueeth	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-13 04:40:13.098753+00	2026-02-13 04:40:13.098753+00	\N	2e0a4d8d-7f0b-4cae-8028-3c564140b0a5
00000000-0000-0000-0000-000000000000	59	nmzuuar2i74u	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 00:23:51.85316+00	2026-02-15 00:23:51.85316+00	\N	6d5c9bf8-93d6-46fe-a18a-c234fd10ccec
00000000-0000-0000-0000-000000000000	60	ovvrszrp43zx	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 00:38:23.843501+00	2026-02-15 00:38:23.843501+00	\N	638f5d8a-7834-48b4-bac1-b92373ec68e1
00000000-0000-0000-0000-000000000000	61	lfhmzhzbnrjb	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 00:42:48.800842+00	2026-02-15 00:42:48.800842+00	\N	3a9722c7-6d6c-4b8a-9df2-67560ad21e8f
00000000-0000-0000-0000-000000000000	62	lqmakzoyr74c	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 00:43:34.23967+00	2026-02-15 00:43:34.23967+00	\N	b56efe3d-7d18-4112-adfd-db80254a419b
00000000-0000-0000-0000-000000000000	63	egx3a76jixla	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 00:53:25.781535+00	2026-02-15 00:53:25.781535+00	\N	a8783a85-626a-4573-885b-0b4382184e68
00000000-0000-0000-0000-000000000000	64	mmk4di7vnjok	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 01:06:42.706044+00	2026-02-15 01:06:42.706044+00	\N	6f9305ce-b64a-4ac3-8585-b937492bac06
00000000-0000-0000-0000-000000000000	65	x4qdcqlpv4it	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 01:57:05.656029+00	2026-02-15 01:57:05.656029+00	\N	b638e8c2-ecdb-4b5c-a87c-b5b3c0980c4e
00000000-0000-0000-0000-000000000000	66	kcloh5zb6l7t	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 03:03:47.934846+00	2026-02-15 03:03:47.934846+00	\N	0b94f2da-2683-4e26-9494-7fbb3255e548
00000000-0000-0000-0000-000000000000	67	a7shkaj5pcw5	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 06:08:37.149515+00	2026-02-15 06:08:37.149515+00	\N	95462f44-82e9-4d76-a4c8-e505598d2ad7
00000000-0000-0000-0000-000000000000	68	chehibytdv47	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 07:13:29.677593+00	2026-02-15 07:13:29.677593+00	\N	08a81534-b212-4f5f-83f3-494290cb4fd5
00000000-0000-0000-0000-000000000000	69	xrkdzpiym3wq	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 08:16:08.366212+00	2026-02-15 08:16:08.366212+00	\N	5436d161-a5da-4744-8a57-ed81473cee7c
00000000-0000-0000-0000-000000000000	70	veumvmmurxsl	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 08:26:20.596461+00	2026-02-15 08:26:20.596461+00	\N	3615a3cb-bef8-441d-bde1-d86370cb7e65
00000000-0000-0000-0000-000000000000	71	7b7lvsxtpmrq	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 08:50:09.718515+00	2026-02-15 08:50:09.718515+00	\N	913b495b-0bad-4afc-b0d5-7a0c3bad462a
00000000-0000-0000-0000-000000000000	72	5nkmqim6gkjq	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 08:50:40.498279+00	2026-02-15 08:50:40.498279+00	\N	91bd5a95-3b80-4e6b-8b7e-fd4510d18f10
00000000-0000-0000-0000-000000000000	73	s25fut4w7k4u	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 12:50:21.194943+00	2026-02-15 12:50:21.194943+00	\N	959f1714-234e-40fc-81a0-fed36ddd5b3c
00000000-0000-0000-0000-000000000000	74	6zggdgfz6vpp	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-02-15 13:01:45.070097+00	2026-02-15 13:59:46.479219+00	\N	239ed5ae-4510-4176-aee6-3e07f7138746
00000000-0000-0000-0000-000000000000	75	jmzaruokdsyq	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-15 13:59:46.502206+00	2026-02-15 13:59:46.502206+00	6zggdgfz6vpp	239ed5ae-4510-4176-aee6-3e07f7138746
00000000-0000-0000-0000-000000000000	76	xtri2mih2q3x	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-16 02:50:41.078213+00	2026-02-16 02:50:41.078213+00	\N	f23857f4-a99d-4671-a9d8-45bb41fac0cb
00000000-0000-0000-0000-000000000000	77	2fc2fgo3l454	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-16 04:05:31.885668+00	2026-02-16 04:05:31.885668+00	\N	be66ccda-ef10-4d1e-8250-6e23afc2f368
00000000-0000-0000-0000-000000000000	78	dx2qgwbskx6n	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-19 03:37:22.009663+00	2026-02-19 03:37:22.009663+00	\N	da30f288-8d51-4d7f-b938-0a25b7f6b943
00000000-0000-0000-0000-000000000000	79	ir2bkkby3i4s	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-19 04:21:44.826901+00	2026-02-19 04:21:44.826901+00	\N	473b18d9-6a22-4026-9c90-8f198728ee92
00000000-0000-0000-0000-000000000000	80	pyxkgqozevsz	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-25 08:51:22.502149+00	2026-02-25 08:51:22.502149+00	\N	c39ae888-c41b-4f89-a9ce-54493fa1418c
00000000-0000-0000-0000-000000000000	81	2mmvl7uj4ko5	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 02:12:50.923856+00	2026-02-26 02:12:50.923856+00	\N	0a53f449-2eda-48e2-8d05-011cba8bb429
00000000-0000-0000-0000-000000000000	82	wnxkcvdiuupu	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 02:24:13.689805+00	2026-02-26 02:24:13.689805+00	\N	bb4235fa-3c01-4874-a939-be7a7c58320e
00000000-0000-0000-0000-000000000000	83	uc24knwqoef2	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 02:56:34.391447+00	2026-02-26 02:56:34.391447+00	\N	6613c763-c3f6-45bc-916f-7b962155c1d8
00000000-0000-0000-0000-000000000000	84	n2ijvrnpyjvz	6771d55f-7660-47df-8058-b79f66a5b277	t	2026-02-26 03:04:20.163915+00	2026-02-26 04:02:29.422873+00	\N	e1fcc156-5136-4db7-bb79-1747965b8d0f
00000000-0000-0000-0000-000000000000	85	wm2d3phs3rnw	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 04:02:29.448454+00	2026-02-26 04:02:29.448454+00	n2ijvrnpyjvz	e1fcc156-5136-4db7-bb79-1747965b8d0f
00000000-0000-0000-0000-000000000000	86	pp46tkf2g7xo	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 04:37:19.729843+00	2026-02-26 04:37:19.729843+00	\N	a4e57503-9fdf-4518-af2a-b2e1804a564c
00000000-0000-0000-0000-000000000000	87	5fdypgo3vnyg	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 05:53:54.997745+00	2026-02-26 05:53:54.997745+00	\N	4e6e232b-a886-49d8-a415-8012108df685
00000000-0000-0000-0000-000000000000	88	epvmwq4iht5f	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 06:33:47.67266+00	2026-02-26 06:33:47.67266+00	\N	2ff51465-2f2f-49da-ac98-11cb331b3b2e
00000000-0000-0000-0000-000000000000	89	35dtorfxyfxp	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 06:52:46.107762+00	2026-02-26 06:52:46.107762+00	\N	c6ee9cb5-1a4b-417c-b904-7bc3845eae98
00000000-0000-0000-0000-000000000000	90	tvsoypqroahr	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 06:55:44.473598+00	2026-02-26 06:55:44.473598+00	\N	7c4bdae9-a3d0-4be5-a552-4713a589c3df
00000000-0000-0000-0000-000000000000	91	lr77tjee2u5x	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-26 06:56:51.994048+00	2026-02-26 06:56:51.994048+00	\N	a9bc4ec0-3eae-4c7c-ad3f-4085b4cd555e
00000000-0000-0000-0000-000000000000	92	sovje2agxlbj	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-02-28 12:03:02.476814+00	2026-02-28 12:03:02.476814+00	\N	fe237f93-38a7-4e24-b3e6-d0376b17b771
00000000-0000-0000-0000-000000000000	93	sgh7klxvkzj3	6771d55f-7660-47df-8058-b79f66a5b277	f	2026-03-01 00:58:30.13366+00	2026-03-01 00:58:30.13366+00	\N	b4f31a6c-4a76-4558-963b-8070146788eb
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
bdc181e4-48ae-4c68-8fb9-92f3f8462957	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-06 16:27:33.494561+00	2026-01-06 16:27:33.494561+00	\N	aal1	\N	\N	node	136.158.3.19	\N	\N	\N	\N	\N
91943859-207b-4d40-a805-36fbd0bbc6f5	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-08 19:21:22.952841+00	2026-01-08 19:21:22.952841+00	\N	aal1	\N	\N	node	136.158.33.54	\N	\N	\N	\N	\N
c5c4f96b-db3d-401c-bc97-52f6ae620046	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-10 17:21:45.512762+00	2026-01-10 17:21:45.512762+00	\N	aal1	\N	\N	node	136.158.33.54	\N	\N	\N	\N	\N
1f4431d2-3a3c-4f88-afcf-bf2717268033	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-10 18:12:18.445951+00	2026-01-10 18:12:18.445951+00	\N	aal1	\N	\N	node	136.158.33.54	\N	\N	\N	\N	\N
89306dae-0f65-4db5-be70-fc61be1cc10f	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-11 18:18:28.653432+00	2026-01-11 18:18:28.653432+00	\N	aal1	\N	\N	node	136.158.33.54	\N	\N	\N	\N	\N
f5825fa0-0cb5-4d14-9b35-26c8bbf8c604	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-14 10:24:37.801172+00	2026-01-14 10:24:37.801172+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
788f71fb-ff26-4423-a07a-173b010158d8	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-14 11:49:25.038748+00	2026-01-14 11:49:25.038748+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
324c7cb1-4dcf-4a2a-ac3c-c31c96ed82a9	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-14 12:54:32.024335+00	2026-01-14 12:54:32.024335+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
e0c2033a-c632-402e-b6df-8b4e6b7cd18d	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-14 13:02:49.647845+00	2026-01-14 13:02:49.647845+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
a24c1752-ea30-4574-8652-f6461823ecab	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-14 15:58:12.730834+00	2026-01-14 15:58:12.730834+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
b8c08b38-c416-48a8-9444-6601ccbb8da9	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-16 07:51:17.530089+00	2026-01-16 07:51:17.530089+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
b7250daa-d56f-4198-894b-4dab297022e2	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-16 14:11:57.17473+00	2026-01-16 14:11:57.17473+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
f89aa726-486a-44b6-925b-de4c9dced904	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-17 09:40:32.512838+00	2026-01-17 09:40:32.512838+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
fee07971-e402-4f3f-bcfe-0aec6f1f6228	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-17 12:06:14.248546+00	2026-01-17 12:06:14.248546+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
061e25bf-0ed5-4b14-8f4c-beb8f3772be5	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-17 13:40:54.992401+00	2026-01-17 18:21:22.274802+00	\N	aal1	\N	2026-01-17 18:21:22.27468	node	136.158.32.125	\N	\N	\N	\N	\N
c32b45ab-7538-4674-a846-dd8a59b1d0a2	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-17 18:35:02.984926+00	2026-01-17 19:33:16.553205+00	\N	aal1	\N	2026-01-17 19:33:16.553078	node	136.158.32.125	\N	\N	\N	\N	\N
959f1714-234e-40fc-81a0-fed36ddd5b3c	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 12:50:21.159748+00	2026-02-15 12:50:21.159748+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
239ed5ae-4510-4176-aee6-3e07f7138746	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 13:01:45.049109+00	2026-02-15 13:59:46.533423+00	\N	aal1	\N	2026-02-15 13:59:46.533309	node	136.158.32.237	\N	\N	\N	\N	\N
97658795-3a1e-46af-a701-b4a385271283	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-17 19:55:15.664338+00	2026-01-18 10:26:41.42318+00	\N	aal1	\N	2026-01-18 10:26:41.42306	node	136.158.32.125	\N	\N	\N	\N	\N
0ea01844-b374-4c10-89fd-ae20cb9a6209	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-20 04:35:49.724072+00	2026-01-20 04:35:49.724072+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
cb95687b-5e96-4c33-86a0-7bb88d911743	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-21 04:55:12.373234+00	2026-01-21 04:55:12.373234+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
f9c87ee7-e3a3-4875-9e0b-220f543c3215	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-25 04:22:30.538589+00	2026-01-25 07:05:45.168602+00	\N	aal1	\N	2026-01-25 07:05:45.16848	node	136.158.32.125	\N	\N	\N	\N	\N
8f5c64e0-abd0-483d-b0f9-94af303afe2f	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-25 07:05:59.457305+00	2026-01-25 07:05:59.457305+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
ce37d503-879c-49b0-b895-ec950210a904	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-25 15:00:48.624563+00	2026-01-25 15:00:48.624563+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
44ea4c0f-bfbc-4cb3-a6e5-46bf13c29353	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-27 11:00:30.347271+00	2026-01-27 11:00:30.347271+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
9ad351d0-8f7f-46f2-95f6-db74f2dccb71	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-30 15:50:43.615663+00	2026-01-30 15:50:43.615663+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
f23857f4-a99d-4671-a9d8-45bb41fac0cb	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-16 02:50:41.050731+00	2026-02-16 02:50:41.050731+00	\N	aal1	\N	\N	node	110.54.132.80	\N	\N	\N	\N	\N
be66ccda-ef10-4d1e-8250-6e23afc2f368	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-16 04:05:31.851643+00	2026-02-16 04:05:31.851643+00	\N	aal1	\N	\N	node	175.176.40.236	\N	\N	\N	\N	\N
da30f288-8d51-4d7f-b938-0a25b7f6b943	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-19 03:37:21.988375+00	2026-02-19 03:37:21.988375+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
6f13cce2-544e-4c93-80e4-d0e0b6e8169f	6771d55f-7660-47df-8058-b79f66a5b277	2026-01-31 09:05:49.878562+00	2026-01-31 14:14:37.981945+00	\N	aal1	\N	2026-01-31 14:14:37.981804	node	136.158.32.125	\N	\N	\N	\N	\N
799c1248-e0d3-4fd9-93b3-cede3c115153	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-01 03:49:51.953791+00	2026-02-01 03:49:51.953791+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
9dff2746-d254-46e6-b02a-a283d041ccdd	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-01 07:49:27.024678+00	2026-02-01 07:49:27.024678+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
55cbcbd1-16db-4173-a398-946e1b23d964	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-01 08:59:50.862544+00	2026-02-01 08:59:50.862544+00	\N	aal1	\N	\N	node	136.158.32.125	\N	\N	\N	\N	\N
5747ad84-53df-49af-9871-3c9af86acd31	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-05 05:05:17.719004+00	2026-02-05 05:05:17.719004+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
5fa7f64c-6df9-4343-bc04-3f467e0bb355	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-06 00:05:01.052038+00	2026-02-06 00:05:01.052038+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
91c387c5-7a71-411d-9e74-2f271ccbf22f	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-06 09:52:20.428196+00	2026-02-06 09:52:20.428196+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
a06d578c-57d2-4354-8240-655def790d07	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-06 10:39:37.624174+00	2026-02-06 10:39:37.624174+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
1b050dc6-5b22-4b5c-a843-47e083d89211	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-07 07:37:08.708308+00	2026-02-07 07:37:08.708308+00	\N	aal1	\N	\N	node	27.49.16.112	\N	\N	\N	\N	\N
acdd3b0c-f4fb-4539-af0a-89992c448709	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-07 08:49:42.526386+00	2026-02-07 08:49:42.526386+00	\N	aal1	\N	\N	node	27.49.16.112	\N	\N	\N	\N	\N
e19f7827-012d-4a6b-9cc6-ffae89bdbf54	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 04:05:21.310722+00	2026-02-08 04:05:21.310722+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
f747fb25-774a-4e39-92f8-5dbfb5380a28	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 04:05:23.368138+00	2026-02-08 04:05:23.368138+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
473b18d9-6a22-4026-9c90-8f198728ee92	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-19 04:21:44.804233+00	2026-02-19 04:21:44.804233+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
9a548f20-79fc-4cbe-a345-8e0d1002cb95	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 04:15:44.064596+00	2026-02-08 08:23:13.191031+00	\N	aal1	\N	2026-02-08 08:23:13.190919	node	136.158.32.65	\N	\N	\N	\N	\N
b33591a9-a684-4b5b-be3f-849107c4301b	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 10:15:05.54328+00	2026-02-08 10:15:05.54328+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
191dea90-65f8-4edc-9ba9-039846f7c613	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 11:36:46.939564+00	2026-02-08 11:36:46.939564+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
76a0b7b8-b633-419b-a39e-9d0c01c9f1a5	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 12:49:38.56518+00	2026-02-08 12:49:38.56518+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
869bf881-9ac4-4119-a302-ea0d9a432043	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:32:06.303653+00	2026-02-08 15:32:06.303653+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
82dfbcb1-dac8-40eb-bd81-2a3dcab3189e	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 16:29:56.967934+00	2026-02-08 16:29:56.967934+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
4dd790d2-753f-4082-9661-77bf5ef67268	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-10 16:11:42.619068+00	2026-02-10 16:11:42.619068+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
d3922f40-e439-425e-9708-36d3e32d439a	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-12 03:03:44.126406+00	2026-02-12 03:03:44.126406+00	\N	aal1	\N	\N	node	136.158.32.65	\N	\N	\N	\N	\N
2e0a4d8d-7f0b-4cae-8028-3c564140b0a5	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-13 04:40:13.057099+00	2026-02-13 04:40:13.057099+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
6d5c9bf8-93d6-46fe-a18a-c234fd10ccec	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 00:23:51.804266+00	2026-02-15 00:23:51.804266+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
638f5d8a-7834-48b4-bac1-b92373ec68e1	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 00:38:23.816863+00	2026-02-15 00:38:23.816863+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
3a9722c7-6d6c-4b8a-9df2-67560ad21e8f	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 00:42:48.780612+00	2026-02-15 00:42:48.780612+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
b56efe3d-7d18-4112-adfd-db80254a419b	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 00:43:34.237593+00	2026-02-15 00:43:34.237593+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
a8783a85-626a-4573-885b-0b4382184e68	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 00:53:25.76115+00	2026-02-15 00:53:25.76115+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
6f9305ce-b64a-4ac3-8585-b937492bac06	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 01:06:42.675221+00	2026-02-15 01:06:42.675221+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
b638e8c2-ecdb-4b5c-a87c-b5b3c0980c4e	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 01:57:05.618816+00	2026-02-15 01:57:05.618816+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
0b94f2da-2683-4e26-9494-7fbb3255e548	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 03:03:47.900514+00	2026-02-15 03:03:47.900514+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
95462f44-82e9-4d76-a4c8-e505598d2ad7	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 06:08:37.105185+00	2026-02-15 06:08:37.105185+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
08a81534-b212-4f5f-83f3-494290cb4fd5	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 07:13:29.649944+00	2026-02-15 07:13:29.649944+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
5436d161-a5da-4744-8a57-ed81473cee7c	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:16:08.330487+00	2026-02-15 08:16:08.330487+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
3615a3cb-bef8-441d-bde1-d86370cb7e65	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:26:20.583718+00	2026-02-15 08:26:20.583718+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
913b495b-0bad-4afc-b0d5-7a0c3bad462a	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:50:09.706969+00	2026-02-15 08:50:09.706969+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
91bd5a95-3b80-4e6b-8b7e-fd4510d18f10	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:50:40.495485+00	2026-02-15 08:50:40.495485+00	\N	aal1	\N	\N	node	136.158.32.237	\N	\N	\N	\N	\N
c39ae888-c41b-4f89-a9ce-54493fa1418c	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-25 08:51:22.478608+00	2026-02-25 08:51:22.478608+00	\N	aal1	\N	\N	node	209.35.162.110	\N	\N	\N	\N	\N
0a53f449-2eda-48e2-8d05-011cba8bb429	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:12:50.874111+00	2026-02-26 02:12:50.874111+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
bb4235fa-3c01-4874-a939-be7a7c58320e	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:24:13.666993+00	2026-02-26 02:24:13.666993+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
6613c763-c3f6-45bc-916f-7b962155c1d8	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:56:34.357702+00	2026-02-26 02:56:34.357702+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
e1fcc156-5136-4db7-bb79-1747965b8d0f	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 03:04:20.136764+00	2026-02-26 04:02:29.485951+00	\N	aal1	\N	2026-02-26 04:02:29.485188	node	136.158.32.193	\N	\N	\N	\N	\N
a4e57503-9fdf-4518-af2a-b2e1804a564c	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 04:37:19.704404+00	2026-02-26 04:37:19.704404+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
4e6e232b-a886-49d8-a415-8012108df685	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 05:53:54.955694+00	2026-02-26 05:53:54.955694+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
2ff51465-2f2f-49da-ac98-11cb331b3b2e	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 06:33:47.62904+00	2026-02-26 06:33:47.62904+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
c6ee9cb5-1a4b-417c-b904-7bc3845eae98	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 06:52:46.067452+00	2026-02-26 06:52:46.067452+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
7c4bdae9-a3d0-4be5-a552-4713a589c3df	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 06:55:44.47159+00	2026-02-26 06:55:44.47159+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
a9bc4ec0-3eae-4c7c-ad3f-4085b4cd555e	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 06:56:51.992322+00	2026-02-26 06:56:51.992322+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
fe237f93-38a7-4e24-b3e6-d0376b17b771	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-28 12:03:02.422737+00	2026-02-28 12:03:02.422737+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
b4f31a6c-4a76-4558-963b-8070146788eb	6771d55f-7660-47df-8058-b79f66a5b277	2026-03-01 00:58:30.096371+00	2026-03-01 00:58:30.096371+00	\N	aal1	\N	\N	node	136.158.32.193	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	6771d55f-7660-47df-8058-b79f66a5b277	authenticated	authenticated	seanstaana0510@gmail.com	$2a$10$BrtjCQntZLZttFL.OkzsqeoRC7v2tyeJ9iOO6E441KGF85MWuR8eu	2026-01-06 16:09:20.4994+00	\N		\N		\N			\N	2026-03-01 00:58:30.096268+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-01-06 16:09:20.453357+00	2026-03-01 00:58:30.167417+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, username, email, password_hash, created_at) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, image_url, start_date, end_date, is_active, created_at, updated_at, images) FROM stdin;
5	50% Early Bird Discount! 🐦	lanning ahead pays off! Book any of our premium services at least two weeks in advance and enjoy a 20% discount on your total bill. Whether it's for home maintenance or a professional consultation, secure your slot early and save more. Use the code EARLY20 upon checkout. Limited slots only!	\N	2026-02-27	2026-03-04	t	2026-02-26 02:27:32.482166	2026-02-26 02:27:32.482166	{https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/announcement-images/2e305237-c73c-438e-92ce-c0902e8b7008.jpg}
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, customer_id, service_id, booking_date, booking_time, total_price, downpayment, notes, proof_payment_path, status, created_at, updated_at, approved_at, cancelled_at, completed_at, service_variant_id, expires_at, review_token) FROM stdin;
\.


--
-- Data for Name: calendar_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_slots (id, service_id, date, "time", is_available, created_at, updated_at) FROM stdin;
1374	14	2026-02-27	09:00:00	f	2026-02-26 06:43:43.317855	2026-02-26 06:43:43.317855
1373	14	2026-02-26	09:00:00	f	2026-02-26 06:43:43.317855	2026-02-26 06:43:43.317855
1375	14	2026-03-01	09:00:00	t	2026-02-28 12:23:11.181472	2026-02-28 12:23:11.181472
1376	14	2026-03-02	09:00:00	t	2026-02-28 12:23:11.181472	2026-02-28 12:23:11.181472
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, full_name, email, phone, facebook_link, created_at) FROM stdin;
1	Juan Dela Cruz	juan@example.com	09123456789	https://facebook.com/juan	2026-01-07 18:58:37.023476
2	Juan Dela Cruz	seanstaana0510@gmail.com	09123456789	https://facebook.com/juan	2026-01-14 11:53:29.162228
\.


--
-- Data for Name: payment_intents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_intents (id, email, service_id, service_variant_id, booking_date, booking_time, proof_path, expires_at, status, created_at, total_price, downpayment, booking_id) FROM stdin;
\.


--
-- Data for Name: policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policies (id, title, content, is_active, created_at, updated_at) FROM stdin;
5	Booking and Reservation Policy	All bookings must be made through the official booking system (website, app, or authorized personnel).A booking is considered confirmed only after payment confirmation or receipt of a confirmation email/message Customers must provide accurate and complete information when making a reservation. The company reserves the right to decline incomplete or suspicious bookings.Double bookings caused by incorrect customer information will not be the responsibility of the company.	t	2026-02-12 03:09:08.813019	2026-02-12 03:09:08.813019
6	Payment and Confirmation Policy	Full or partial payment may be required to secure a reservation.Accepted payment methods will be listed in the booking system. Bookings without completed payment within the specified timeframe will be automatically canceled. A confirmation receipt will be sent once payment is successfully processed. Any payment disputes must be reported within 48 hours of the transaction.	t	2026-02-12 03:11:52.166398	2026-02-12 03:11:52.166398
7	Cancellation and Refund Policy	Cancellations must be made through the official booking platform. Cancellations made within the allowed cancellation window (e.g., 24–48 hours before schedule) may qualify for a refund. Late cancellations may incur a cancellation fee. No-shows are non-refundable unless otherwise stated. Refund processing may take 5–14 business days depending on the payment provider.	t	2026-02-12 03:13:11.969457	2026-02-12 03:13:11.969457
8	No-Show and Late Arrival Policy	Customers arriving late may have their booking shortened to avoid delays for other customers. Arrivals beyond a grace period (e.g., 15 minutes) may be marked as a no-show. No-shows may result in forfeiture of payment. Repeated no-shows may lead to booking restrictions. The company reserves the right to refuse future bookings in cases of repeated policy violations.	t	2026-02-12 03:15:00.013499	2026-02-12 03:15:00.013499
\.


--
-- Data for Name: portfolio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio (id, title, description, created_at, images) FROM stdin;
13	💅 Classic French Tips	A timeless nail style that never goes out of trend. Clean white tips paired with a soft nude base for an elegant and polished look—perfect for everyday wear or formal occasions.	2026-02-08 15:44:17.952487	{https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/portfolio/portfolio/fee8e58c-bc29-4ba5-9507-f671e70fa2a0.jpg,https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/portfolio/portfolio/87dd41a1-9924-4f27-9ff9-2fa4668b909a.jpg}
14	🌸 Pastel Gel Nails	Soft pastel shades finished with long-lasting gel polish. This design gives a fresh, youthful, and classy vibe that’s perfect for any season.	2026-02-08 15:45:39.662541	{https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/portfolio/portfolio/f6881a3c-f666-4c83-8a76-c6e09226f337.jpg,https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/portfolio/portfolio/7ad5f6ae-79b2-411d-8b78-d27eabb1dcc6.jpg}
15	🌙 Matte Black Nails	Soft pastel shades finished with long-lasting gel polish. This design gives a fresh, youthful, and classy vibe that’s perfect for any season.	2026-02-08 16:11:31.659756	{https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/portfolio/portfolio/b8a2a631-f478-47e9-af29-5845f1b50d1a.jpg}
\.


--
-- Data for Name: revenue_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenue_logs (id, booking_id, amount, note, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, booking_id, rating, comment, image_url, is_approved, created_at) FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_categories (id, service_id, name, created_at, updated_at, is_active) FROM stdin;
4	13	Refill	2026-02-08 16:29:00.487975	2026-02-08 16:29:00.487975	t
5	14	Flower design	2026-02-15 08:45:19.727137	2026-02-15 08:45:19.727137	t
\.


--
-- Data for Name: service_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_variants (id, category_id, body_part, size, price, downpayment, is_active, created_at, updated_at) FROM stdin;
8	4	Hands	S	700.00	300.00	t	2026-02-08 16:30:28.152937	2026-02-08 16:30:28.152937
9	4	Hands	M	1000.00	500.00	t	2026-02-08 16:30:42.952871	2026-02-08 16:30:42.952871
10	4	Hands	L	1300.00	700.00	t	2026-02-08 16:30:58.756914	2026-02-08 16:30:58.756914
11	5	Hands	small	700.00	300.00	t	2026-02-15 08:47:23.951354	2026-02-15 08:47:23.951354
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, duration, image_url, is_active, created_at, updated_at) FROM stdin;
13	Refill nails	refill nails	01:30:00	https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/services-images/services/1770568092372-img3.jpg	t	2026-02-08 16:28:13.078647	2026-02-15 08:26:34.862
14	Nails art 1	test	00:00:03	https://ccxthgciaubemdihkrit.supabase.co/storage/v1/object/public/services-images/services/1771145010136-img4.jpg	t	2026-02-15 08:43:31.500695	2026-02-16 02:54:20.82
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-01-05 15:20:08
20211116045059	2026-01-05 15:20:09
20211116050929	2026-01-05 15:20:10
20211116051442	2026-01-05 15:20:10
20211116212300	2026-01-05 15:20:11
20211116213355	2026-01-05 15:20:12
20211116213934	2026-01-05 15:20:12
20211116214523	2026-01-05 15:20:13
20211122062447	2026-01-05 15:20:14
20211124070109	2026-01-05 15:20:15
20211202204204	2026-01-05 15:20:15
20211202204605	2026-01-05 15:20:16
20211210212804	2026-01-05 15:20:18
20211228014915	2026-01-05 15:20:18
20220107221237	2026-01-05 15:20:19
20220228202821	2026-01-05 15:20:20
20220312004840	2026-01-05 15:20:20
20220603231003	2026-01-05 15:20:21
20220603232444	2026-01-05 15:20:22
20220615214548	2026-01-05 15:20:23
20220712093339	2026-01-05 15:20:23
20220908172859	2026-01-05 15:20:24
20220916233421	2026-01-05 15:20:25
20230119133233	2026-01-05 15:20:25
20230128025114	2026-01-05 15:20:26
20230128025212	2026-01-05 15:20:27
20230227211149	2026-01-05 15:20:27
20230228184745	2026-01-05 15:20:28
20230308225145	2026-01-05 15:20:29
20230328144023	2026-01-05 15:20:29
20231018144023	2026-01-05 15:20:30
20231204144023	2026-01-05 15:20:31
20231204144024	2026-01-05 15:20:32
20231204144025	2026-01-05 15:20:32
20240108234812	2026-01-05 15:20:33
20240109165339	2026-01-05 15:20:33
20240227174441	2026-01-05 15:20:35
20240311171622	2026-01-05 15:20:35
20240321100241	2026-01-05 15:20:37
20240401105812	2026-01-05 15:20:38
20240418121054	2026-01-05 15:20:39
20240523004032	2026-01-05 15:20:42
20240618124746	2026-01-05 15:20:42
20240801235015	2026-01-05 15:20:43
20240805133720	2026-01-05 15:20:43
20240827160934	2026-01-05 15:20:44
20240919163303	2026-01-05 15:20:45
20240919163305	2026-01-05 15:20:46
20241019105805	2026-01-05 15:20:46
20241030150047	2026-01-05 15:20:49
20241108114728	2026-01-05 15:20:49
20241121104152	2026-01-05 15:20:50
20241130184212	2026-01-05 15:20:51
20241220035512	2026-01-05 15:20:51
20241220123912	2026-01-05 15:20:52
20241224161212	2026-01-05 15:20:53
20250107150512	2026-01-05 15:20:53
20250110162412	2026-01-05 15:20:54
20250123174212	2026-01-05 15:20:54
20250128220012	2026-01-05 15:20:55
20250506224012	2026-01-05 15:20:56
20250523164012	2026-01-05 15:20:56
20250714121412	2026-01-05 15:20:57
20250905041441	2026-01-05 15:20:57
20251103001201	2026-01-05 15:20:58
20251120212548	2026-02-15 08:26:14
20251120215549	2026-02-15 08:26:15
20260218120000	2026-02-28 01:33:58
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
payment-proofs	payment-proofs	\N	2026-01-10 14:29:36.388654+00	2026-01-10 14:29:36.388654+00	f	f	\N	\N	\N	STANDARD
services-images	services-images	\N	2026-01-16 04:27:30.736083+00	2026-01-16 04:27:30.736083+00	t	f	\N	\N	\N	STANDARD
portfolio	portfolio	\N	2026-01-21 04:02:28.550387+00	2026-01-21 04:02:28.550387+00	t	f	\N	\N	\N	STANDARD
review-images	review-images	\N	2026-02-08 12:01:12.193625+00	2026-02-08 12:01:12.193625+00	t	f	\N	\N	\N	STANDARD
announcement-images	announcement-images	\N	2026-02-13 02:22:28.929014+00	2026-02-13 02:22:28.929014+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-01-05 15:20:07.529778
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-01-05 15:20:07.573645
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-01-05 15:20:07.603896
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-01-05 15:20:07.671045
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-01-05 15:20:07.674942
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-01-05 15:20:07.683903
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-01-05 15:20:07.687494
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-01-05 15:20:07.699731
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-01-05 15:20:07.706128
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-01-05 15:20:07.710529
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-01-05 15:20:07.714567
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-01-05 15:20:07.742643
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-01-05 15:20:07.746613
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-01-05 15:20:07.750312
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-01-05 15:20:07.753871
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-01-05 15:20:07.759799
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-01-05 15:20:07.763735
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-01-05 15:20:07.769577
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-01-05 15:20:07.785261
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-01-05 15:20:07.797089
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-01-05 15:20:07.801837
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-01-05 15:20:07.805587
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-01-05 15:20:09.205056
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-01-05 15:20:09.244661
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-01-05 15:20:09.248637
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-01-05 15:20:09.259001
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-01-05 15:20:09.264468
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-05 15:20:09.284627
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-01-05 15:20:07.581019
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-01-05 15:20:07.679188
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-01-05 15:20:07.69122
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-01-05 15:20:07.695277
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-01-05 15:20:07.809844
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-01-05 15:20:07.821788
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-01-05 15:20:08.331238
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-01-05 15:20:08.33698
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-01-05 15:20:08.342476
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-01-05 15:20:09.085481
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-01-05 15:20:09.177167
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-01-05 15:20:09.185819
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-01-05 15:20:09.187764
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-01-05 15:20:09.193118
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-01-05 15:20:09.197584
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-01-05 15:20:09.209649
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-01-05 15:20:09.217265
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-01-05 15:20:09.222578
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-01-05 15:20:09.229132
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-01-05 15:20:09.234038
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-01-05 15:20:09.240723
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-01-05 15:20:09.26837
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-10 11:27:22.832251
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-10 11:27:22.967843
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-02-10 11:27:22.969262
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-10 11:27:23.104133
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-10 11:27:23.105969
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-10 11:27:23.107401
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-02-10 11:27:23.115323
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
e160a0b9-44b9-42e0-974c-1cc09d9c5eb4	payment-proofs	booking_2/1768068230136_ARTCARD FANBASE(SEAN) (12).jpg	\N	2026-01-10 18:03:48.7452+00	2026-01-10 18:03:48.7452+00	2026-01-10 18:03:48.7452+00	{"eTag": "\\"007ed2996bcd8559afcfe0d67728c128\\"", "size": 134030, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T18:03:49.000Z", "contentLength": 134030, "httpStatusCode": 200}	3a606104-9b87-4a84-bdf2-fd91c6c415de	\N	{}
20b246e6-f7c0-42f2-84d4-db5ae00d610a	payment-proofs	payment-proofs/25368980-840a-4af0-9b24-a0e61b227218	\N	2026-02-07 01:44:57.534859+00	2026-02-07 01:44:57.534859+00	2026-02-07 01:44:57.534859+00	{"eTag": "\\"0d0c2208f7f2014ec8efdd30bb830bd4\\"", "size": 130444, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T01:44:58.000Z", "contentLength": 130444, "httpStatusCode": 200}	8ad2815b-b0da-4429-8f27-a10d82c6258c	\N	{}
a0cee826-53cb-4de1-a25f-0a2b6176892c	payment-proofs	booking_1/1768069636861_737400.jpg	\N	2026-01-10 18:27:17.53876+00	2026-01-10 18:27:17.53876+00	2026-01-10 18:27:17.53876+00	{"eTag": "\\"6b3f0f782d346d98e2f3d37010f18d51-2\\"", "size": 5903793, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T18:27:18.000Z", "contentLength": 5903793, "httpStatusCode": 200}	d5eadd9d-fdf1-4671-b58b-6dc9843e81f9	\N	{}
01219a6b-5420-406e-bc3e-9f83f728356d	services-images	services/1768550176386-WIN_20260111_02_25_03_Pro.jpg	\N	2026-01-16 07:56:16.12377+00	2026-01-16 07:56:16.12377+00	2026-01-16 07:56:16.12377+00	{"eTag": "\\"166124b458fb075aaafafbadfbcc4614\\"", "size": 37872, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T07:56:17.000Z", "contentLength": 37872, "httpStatusCode": 200}	d4c5621d-35b0-49dc-95b2-dfb825308603	\N	{}
51d2ab2b-e788-4f64-869b-c1bf0f6e628a	review-images	reviews/59c66e0f-33af-443f-a5f3-1ddef7f8dabf.jpg	\N	2026-02-08 13:10:46.067208+00	2026-02-08 13:10:46.067208+00	2026-02-08 13:10:46.067208+00	{"eTag": "\\"2b7973edc70d5e74e50dc1924b4fc4a9\\"", "size": 59972, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T13:10:47.000Z", "contentLength": 59972, "httpStatusCode": 200}	9861dcbb-6aea-4029-b4ed-5f4e0e7c711e	\N	{}
999f3821-51d0-425e-b7b8-23277cc6f92a	services-images	services/1768550310611-WIN_20260111_02_25_03_Pro.jpg	\N	2026-01-16 07:58:30.440714+00	2026-01-16 07:58:30.440714+00	2026-01-16 07:58:30.440714+00	{"eTag": "\\"166124b458fb075aaafafbadfbcc4614\\"", "size": 37872, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T07:58:31.000Z", "contentLength": 37872, "httpStatusCode": 200}	5511c470-46b1-4f94-b16a-737b7a6b19d5	\N	{}
18c8703b-5687-4114-b26f-6715f9dcf5c6	portfolio	portfolio/440c7e3c-750a-48b6-b54e-9d5c37b5dcca.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:39:42.470963+00	2026-02-08 15:39:42.470963+00	2026-02-08 15:39:42.470963+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:39:43.000Z", "contentLength": 205216, "httpStatusCode": 200}	0ea63860-6807-4085-829c-1aef1216cb65	6771d55f-7660-47df-8058-b79f66a5b277	{}
e9c51a56-0203-4fb6-ab17-df3bc71bcf46	services-images	services/1768550527509-WIN_20260111_02_25_03_Pro.jpg	\N	2026-01-16 08:02:07.302638+00	2026-01-16 08:02:07.302638+00	2026-01-16 08:02:07.302638+00	{"eTag": "\\"166124b458fb075aaafafbadfbcc4614\\"", "size": 37872, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T08:02:08.000Z", "contentLength": 37872, "httpStatusCode": 200}	f184cd13-2725-4c98-96f8-fc7a9d02b6de	\N	{}
6f44547f-6985-4a21-b21d-2343f3984dfc	portfolio	portfolio/7bcfe872-94f1-42da-81d6-68eeab32f99b.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:40:42.515969+00	2026-02-08 15:40:42.515969+00	2026-02-08 15:40:42.515969+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:40:43.000Z", "contentLength": 331367, "httpStatusCode": 200}	7074c8aa-2cad-46bc-a33f-4891f4f03f28	6771d55f-7660-47df-8058-b79f66a5b277	{}
a6d4cea6-17cd-4d25-b800-35a952427dbf	services-images	services/1768551039036-WIN_20260111_02_25_03_Pro.jpg	\N	2026-01-16 08:10:38.89911+00	2026-01-16 08:10:38.89911+00	2026-01-16 08:10:38.89911+00	{"eTag": "\\"166124b458fb075aaafafbadfbcc4614\\"", "size": 37872, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T08:10:39.000Z", "contentLength": 37872, "httpStatusCode": 200}	b7664048-618a-40ca-a18d-581b5f369e3d	\N	{}
74a6e2e2-cb9d-4d8a-8530-1d51c34b1535	services-images	services/1768573697451-WIN_20260111_02_25_03_Pro.jpg	\N	2026-01-16 14:28:18.763893+00	2026-01-16 14:28:18.763893+00	2026-01-16 14:28:18.763893+00	{"eTag": "\\"166124b458fb075aaafafbadfbcc4614\\"", "size": 37872, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T14:28:19.000Z", "contentLength": 37872, "httpStatusCode": 200}	00f00919-fb35-4ba8-998b-c97fa154c752	\N	{}
98f127fe-e5b0-470f-8e40-764f74a7f41a	payment-proofs	booking_9/1768913758147_420660319_848826330326492_8998767964481513805_n.jpg	\N	2026-01-20 12:55:58.7562+00	2026-01-20 12:55:58.7562+00	2026-01-20 12:55:58.7562+00	{"eTag": "\\"8788cbefcc13e4c1c898500d6a25fbdd\\"", "size": 96413, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-20T12:55:59.000Z", "contentLength": 96413, "httpStatusCode": 200}	01c60a3b-e0af-4489-8c40-e6e29f6b01a3	\N	{}
8cabd839-83cf-4e1e-95db-ae44ac3ffd9e	portfolio	portfolio/2fff0b64-62b2-48a2-82c2-7a67d5116a31.png	\N	2026-01-21 05:20:23.656329+00	2026-01-21 05:20:23.656329+00	2026-01-21 05:20:23.656329+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:20:24.000Z", "contentLength": 617284, "httpStatusCode": 200}	f4af4c74-010a-4bde-b110-81d504f6d060	\N	{}
8367293e-0669-42d5-869b-4f6d7ce1826e	portfolio	portfolio/d69f7239-946c-4e4c-b8e9-613c6831d470.jpg	\N	2026-01-21 05:20:23.983953+00	2026-01-21 05:20:23.983953+00	2026-01-21 05:20:23.983953+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:20:24.000Z", "contentLength": 46586, "httpStatusCode": 200}	80f76364-f156-41d7-94df-1735ac922eca	\N	{}
2c2eb6c6-96db-4184-ab3d-c09714a10f25	portfolio	portfolio/8033207b-54e1-43fb-aea7-43aed2185f42.png	\N	2026-01-21 05:20:57.516821+00	2026-01-21 05:20:57.516821+00	2026-01-21 05:20:57.516821+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:20:58.000Z", "contentLength": 617284, "httpStatusCode": 200}	4ea8e07e-7f45-44f9-9c16-bf92a0a74202	\N	{}
d2e2be3d-81eb-431e-80c4-123c67f980f9	portfolio	portfolio/01cdc01d-2720-47ea-aa1d-2391e35e32ea.jpg	\N	2026-01-21 05:20:57.932578+00	2026-01-21 05:20:57.932578+00	2026-01-21 05:20:57.932578+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:20:58.000Z", "contentLength": 46586, "httpStatusCode": 200}	2ab98274-f4df-474f-9f21-64b36c78ad69	\N	{}
1d066adc-7487-412a-a4e7-fd0f0c57bf63	payment-proofs	payment-proofs/f37089bc-43cb-4db0-8a2f-09259ae01753	\N	2026-02-07 02:03:44.685702+00	2026-02-07 02:03:44.685702+00	2026-02-07 02:03:44.685702+00	{"eTag": "\\"34064b460fd6b0d6d1adffa96462c631\\"", "size": 1503712, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T02:03:45.000Z", "contentLength": 1503712, "httpStatusCode": 200}	79514e97-efd6-4985-b541-0ec7e3bbfecf	\N	{}
13746e48-58fc-400c-8957-af7aaefd2614	portfolio	portfolio/a036503e-13dc-4dd1-a7e6-9416a32759f6.png	\N	2026-01-21 05:23:27.497858+00	2026-01-21 05:23:27.497858+00	2026-01-21 05:23:27.497858+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:23:28.000Z", "contentLength": 617284, "httpStatusCode": 200}	9ab49151-f8f7-4914-9d40-2b06a19802f7	\N	{}
78226c70-e0dd-407d-9aea-4a112d6c74ac	portfolio	portfolio/050e81d1-26aa-4c37-88da-e156fe922ec1.jpg	\N	2026-01-21 05:23:27.991947+00	2026-01-21 05:23:27.991947+00	2026-01-21 05:23:27.991947+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:23:28.000Z", "contentLength": 46586, "httpStatusCode": 200}	1c8bceb2-ccba-4728-bb73-192c26a5524c	\N	{}
3abe532b-2648-4916-983f-8f7982ae05b0	portfolio	portfolio/bb348c9e-310f-491a-8d15-48be4640859f.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:36:11.432623+00	2026-02-08 15:36:11.432623+00	2026-02-08 15:36:11.432623+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:36:12.000Z", "contentLength": 331367, "httpStatusCode": 200}	4f181477-84c5-49b0-8a12-d8d8605b98d0	6771d55f-7660-47df-8058-b79f66a5b277	{}
15c2e7c1-736d-4e65-95e6-d1f78e199d54	portfolio	portfolio/f139d389-ad71-4647-ab4e-b1661e866999.png	\N	2026-01-21 05:28:58.465566+00	2026-01-21 05:28:58.465566+00	2026-01-21 05:28:58.465566+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:28:59.000Z", "contentLength": 617284, "httpStatusCode": 200}	44f86122-c5af-4776-a721-8a5db5caebe7	\N	{}
93923c61-f6ed-48f5-a1c8-6330b2d1e4fa	portfolio	portfolio/74c9c329-e493-413b-8301-a92583cf530a.jpg	\N	2026-01-21 05:28:58.857991+00	2026-01-21 05:28:58.857991+00	2026-01-21 05:28:58.857991+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:28:59.000Z", "contentLength": 46586, "httpStatusCode": 200}	d0cc8275-4414-4ce5-a93b-eee2d5b306b9	\N	{}
4c398632-6d72-45e3-9037-615f27c0036d	portfolio	portfolio/6791ca2e-9378-42aa-97a5-a0c1fe744479.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:36:12.188984+00	2026-02-08 15:36:12.188984+00	2026-02-08 15:36:12.188984+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:36:13.000Z", "contentLength": 205216, "httpStatusCode": 200}	34ddd5e3-1fdf-46c9-be9f-f4863bf449f6	6771d55f-7660-47df-8058-b79f66a5b277	{}
da911cbf-f61b-422a-a233-0a83b88b7173	portfolio	portfolio/e356f892-3fcb-4ddb-b322-e5faea8fe6a2.png	\N	2026-01-21 05:46:36.629332+00	2026-01-21 05:46:36.629332+00	2026-01-21 05:46:36.629332+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:46:37.000Z", "contentLength": 617284, "httpStatusCode": 200}	5ee3351f-7a2e-4b70-8166-4f7ec15a4f1c	\N	{}
17cd6355-b5f9-4f38-97e9-0bee9925d449	portfolio	portfolio/824ed543-1965-45e5-a34e-ee4533ee576b.jpg	\N	2026-01-21 05:46:37.024417+00	2026-01-21 05:46:37.024417+00	2026-01-21 05:46:37.024417+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:46:37.000Z", "contentLength": 46586, "httpStatusCode": 200}	efe42b40-1964-4776-a37e-88b822cf5f85	\N	{}
7f964e90-9f70-491b-beda-a9c6be66be37	portfolio	portfolio/e38ad94d-da19-4619-baa2-3bbd95d64923.png	\N	2026-01-21 05:46:54.141267+00	2026-01-21 05:46:54.141267+00	2026-01-21 05:46:54.141267+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:46:55.000Z", "contentLength": 617284, "httpStatusCode": 200}	910c3f40-31be-417a-826c-b56aac93aa5d	\N	{}
981010bf-02b9-4eb3-bfcc-9a0d856b80d5	portfolio	portfolio/67c0fa2d-191f-45e9-9197-9f858089f7f2.jpg	\N	2026-01-21 05:46:54.502145+00	2026-01-21 05:46:54.502145+00	2026-01-21 05:46:54.502145+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:46:55.000Z", "contentLength": 46586, "httpStatusCode": 200}	7a26c4c1-1ead-4c8c-9242-84495867200b	\N	{}
bf7f6ffe-eb99-4fbe-ab7d-a29f540fe821	portfolio	portfolio/3c8cf92f-26fb-4f58-824e-1d421b0345ae.png	\N	2026-01-21 05:47:17.787842+00	2026-01-21 05:47:17.787842+00	2026-01-21 05:47:17.787842+00	{"eTag": "\\"b11b34b50e5b2d01fefd7dfa0a88084d\\"", "size": 617284, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:47:18.000Z", "contentLength": 617284, "httpStatusCode": 200}	4a661018-813a-4d31-b288-5422893e9f2b	\N	{}
1c12b4fe-a64a-4feb-bc9f-17eb9bd84df0	portfolio	portfolio/173a3b4a-6cbd-4d02-ba09-75ea14f29409.jpg	\N	2026-01-21 05:47:18.205357+00	2026-01-21 05:47:18.205357+00	2026-01-21 05:47:18.205357+00	{"eTag": "\\"e517aa5f4643098376d788ec79a218a2\\"", "size": 46586, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T05:47:19.000Z", "contentLength": 46586, "httpStatusCode": 200}	b0da0747-20dc-4791-933e-8ad97aff59cd	\N	{}
00c17d74-bb53-48f3-b7c3-45a3e05bf90e	services-images	services/1769325028800-Tshirt_Design 1.png	\N	2026-01-25 07:10:30.874786+00	2026-01-25 07:10:30.874786+00	2026-01-25 07:10:30.874786+00	{"eTag": "\\"6e258721da558a3f869e44905dc7886c\\"", "size": 1074566, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-25T07:10:31.000Z", "contentLength": 1074566, "httpStatusCode": 200}	e80a4c02-f729-4fbd-ad20-ca7e4d824e6c	\N	{}
710d78e4-dc87-4493-a81f-fe4ef0523ac2	payment-proofs	payment-proofs/4492b590-5166-4867-866a-616c4cb4c371	\N	2026-02-07 07:31:47.690198+00	2026-02-07 07:31:47.690198+00	2026-02-07 07:31:47.690198+00	{"eTag": "\\"82660af9fd021a4df705ab272147be8d\\"", "size": 701865, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T07:31:48.000Z", "contentLength": 701865, "httpStatusCode": 200}	b80eca6e-5bf2-400d-909c-2cfeb8151d8d	\N	{}
4b274a96-8946-46d9-8805-956873715a25	payment-proofs	payment-proofs/86034eb1-6400-46af-87c2-992334104484	\N	2026-01-27 11:29:27.277953+00	2026-01-27 11:29:27.277953+00	2026-01-27 11:29:27.277953+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T11:29:28.000Z", "contentLength": 181721, "httpStatusCode": 200}	6586172f-5090-4ead-aac5-3718882a9cf3	\N	{}
d4c37cfd-35ac-45fb-bb30-af8564361fb5	payment-proofs	payment-proofs/a3d75d38-2615-4e1e-9f58-9941ff924123	\N	2026-01-27 11:46:15.455247+00	2026-01-27 11:46:15.455247+00	2026-01-27 11:46:15.455247+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T11:46:16.000Z", "contentLength": 181721, "httpStatusCode": 200}	78e03eaa-b7f1-4f5b-8e64-f3f16c07e8bf	\N	{}
46586b33-dbec-4e64-8b51-0cbf230cbe67	portfolio	portfolio/c728501d-7429-4935-a9c3-8a2aa302f58e.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:36:44.723552+00	2026-02-08 15:36:44.723552+00	2026-02-08 15:36:44.723552+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:36:45.000Z", "contentLength": 331367, "httpStatusCode": 200}	bce83f6b-9262-450a-b4ba-4fc642d35215	6771d55f-7660-47df-8058-b79f66a5b277	{}
fa9e18b6-e361-4d54-88b1-a093eae06961	payment-proofs	payment-proofs/69350544-16d2-465e-8547-fac0386aa508	\N	2026-01-27 11:56:46.474903+00	2026-01-27 11:56:46.474903+00	2026-01-27 11:56:46.474903+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T11:56:47.000Z", "contentLength": 181721, "httpStatusCode": 200}	1884a1a1-db35-4adb-ab32-16b296f9c53d	\N	{}
cfafe13a-07a9-4ce1-b235-4ed3d2f79916	payment-proofs	payment-proofs/85021c45-23df-4d38-b9c0-ebc33a4e9ae4	\N	2026-01-27 12:14:17.730377+00	2026-01-27 12:14:17.730377+00	2026-01-27 12:14:17.730377+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T12:14:18.000Z", "contentLength": 181721, "httpStatusCode": 200}	b4493d5d-92ae-4f8a-a906-8d072bb37315	\N	{}
ddeb86a9-06bf-493b-b856-c1e700738fd1	payment-proofs	payment-proofs/6a132d46-ca78-480b-bfd9-ed39c852dbbe	\N	2026-01-27 12:33:36.456353+00	2026-01-27 12:33:36.456353+00	2026-01-27 12:33:36.456353+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T12:33:37.000Z", "contentLength": 181721, "httpStatusCode": 200}	502506ba-544a-4111-b5d8-cd9266c919d8	\N	{}
41b0b784-733f-4c4e-a1ae-3d515b5c001d	payment-proofs	payment-proofs/8c8a81e0-7a7b-4be6-ac8d-13500f74bc9f	\N	2026-01-27 12:55:08.148127+00	2026-01-27 12:55:08.148127+00	2026-01-27 12:55:08.148127+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T12:55:09.000Z", "contentLength": 181721, "httpStatusCode": 200}	535342c0-a34c-4c3a-80a3-4ef9b0a0055e	\N	{}
96ece96f-6361-4ec5-aa88-b12a82f23dde	payment-proofs	payment-proofs/cdad89e9-bbbc-4c76-a5c5-3c6beab3ee4e	\N	2026-01-27 12:59:57.849441+00	2026-01-27 12:59:57.849441+00	2026-01-27 12:59:57.849441+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T12:59:58.000Z", "contentLength": 181721, "httpStatusCode": 200}	38489ca5-ce8d-492c-92a7-d5bdff5b2190	\N	{}
813ba9d3-bd67-4f16-a95f-7444a0439cad	payment-proofs	payment-proofs/06d50eac-6f2c-4eb1-b91c-949f00277d91	\N	2026-01-27 13:57:02.46072+00	2026-01-27 13:57:02.46072+00	2026-01-27 13:57:02.46072+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T13:57:03.000Z", "contentLength": 181721, "httpStatusCode": 200}	56dd35bf-70d9-4646-b5f9-c4bcba8eca7f	\N	{}
ff9c3ee0-69f6-4e48-8116-df4267f16259	payment-proofs	payment-proofs/4051cebe-3ecb-4899-9ba2-77f69f8b27ca	\N	2026-01-27 14:17:14.3152+00	2026-01-27 14:17:14.3152+00	2026-01-27 14:17:14.3152+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T14:17:15.000Z", "contentLength": 181721, "httpStatusCode": 200}	2927b9a2-ae1a-4192-82ca-fe7de07bc2e6	\N	{}
138ac304-1b18-4fc1-a0a0-d9a19df05eee	payment-proofs	payment-proofs/b2b83fcd-1804-4e66-850f-82d22270bd3f	\N	2026-01-27 14:52:52.19479+00	2026-01-27 14:52:52.19479+00	2026-01-27 14:52:52.19479+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T14:52:53.000Z", "contentLength": 181721, "httpStatusCode": 200}	f22cab56-32ba-4527-aed6-b73ab60aa088	\N	{}
b2a50131-1dd5-4967-8a1a-fa16fe0102ff	payment-proofs	payment-proofs/d270db61-2cc5-4f47-9b97-c375ca73ee87	\N	2026-02-07 09:10:59.763269+00	2026-02-07 09:10:59.763269+00	2026-02-07 09:10:59.763269+00	{"eTag": "\\"82660af9fd021a4df705ab272147be8d\\"", "size": 701865, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T09:11:00.000Z", "contentLength": 701865, "httpStatusCode": 200}	8c874788-0274-4dfe-adbc-f2462eba2f27	\N	{}
a6790558-48cf-4d7b-9f0a-0adc47865e01	payment-proofs	payment-proofs/fc45f093-d754-404e-8a07-c2134739a6cf	\N	2026-01-30 16:16:54.801895+00	2026-01-30 16:16:54.801895+00	2026-01-30 16:16:54.801895+00	{"eTag": "\\"bcf3d2c1300debf05ba713f066e0be63\\"", "size": 649715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T16:16:55.000Z", "contentLength": 649715, "httpStatusCode": 200}	c08788f3-ce1f-4a7f-ac6f-87dcce6f32ae	\N	{}
d2696b9f-0f68-4c69-bac9-76b647f13398	portfolio	portfolio/0276c6ee-c44b-4b94-9198-e921c94f9963.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:36:45.143924+00	2026-02-08 15:36:45.143924+00	2026-02-08 15:36:45.143924+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:36:46.000Z", "contentLength": 205216, "httpStatusCode": 200}	2c27d31a-7b0d-4c77-8a4c-4207c17df3dd	6771d55f-7660-47df-8058-b79f66a5b277	{}
5a2d97ab-bb41-4b47-815a-966977fdc29a	payment-proofs	payment-proofs/e702b939-50ec-44db-aa68-35fc1daf6ba8	\N	2026-01-31 05:28:19.073243+00	2026-01-31 05:28:19.073243+00	2026-01-31 05:28:19.073243+00	{"eTag": "\\"bcf3d2c1300debf05ba713f066e0be63\\"", "size": 649715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-31T05:28:20.000Z", "contentLength": 649715, "httpStatusCode": 200}	b36067b8-8fb3-49a3-8ebd-7b918aa6c17a	\N	{}
82821aa8-7c54-499c-b0b2-7950a8492204	payment-proofs	payment-proofs/cb599945-d98a-4eaf-9c4a-fac4b1c7409a	\N	2026-02-01 08:02:56.096515+00	2026-02-01 08:02:56.096515+00	2026-02-01 08:02:56.096515+00	{"eTag": "\\"a4e89dc043680748564dbaf1ff670d2d\\"", "size": 53808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T08:02:57.000Z", "contentLength": 53808, "httpStatusCode": 200}	a589fa31-8719-4031-8c6a-e52fe22827fb	\N	{}
d6f51921-f992-445b-b308-2f0f89e1e73f	portfolio	portfolio/4ea29c61-ded6-4b80-b410-3d7abba39fb1.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:38:25.265147+00	2026-02-08 15:38:25.265147+00	2026-02-08 15:38:25.265147+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:38:26.000Z", "contentLength": 331367, "httpStatusCode": 200}	23da74df-748a-4464-9ad5-453a16ed78e5	6771d55f-7660-47df-8058-b79f66a5b277	{}
69865887-f397-4514-8ccf-8ed241c2ee64	services-images	services/1769933164082-ARTCARD FANBASE(SEAN) (23).jpg	\N	2026-02-01 08:06:03.793146+00	2026-02-01 08:06:03.793146+00	2026-02-01 08:06:03.793146+00	{"eTag": "\\"5b8e0ec18f4dd4a28f178bd2a7e5e835\\"", "size": 542771, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T08:06:04.000Z", "contentLength": 542771, "httpStatusCode": 200}	78ce19d9-9c66-478a-b296-3de488f66368	\N	{}
8f149de5-7659-46d8-bdaa-5bcd04f65805	payment-proofs	payment-proofs/ab9d8d87-649a-4a7e-9a8c-20c7ffa44ab6	\N	2026-02-01 08:36:40.805972+00	2026-02-01 08:36:40.805972+00	2026-02-01 08:36:40.805972+00	{"eTag": "\\"01d04d73e2bdd1d2dcc53bba567a3b73\\"", "size": 538210, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T08:36:41.000Z", "contentLength": 538210, "httpStatusCode": 200}	93dfd86e-2f3e-419b-bf06-0ee57ac6f166	\N	{}
30ae54f2-8f0c-404e-85fd-24058bd40ed6	payment-proofs	payment-proofs/4cce9c6f-5dd1-4c6e-a8db-f6dfa2ba4dc4	\N	2026-02-01 08:50:37.417038+00	2026-02-01 08:50:37.417038+00	2026-02-01 08:50:37.417038+00	{"eTag": "\\"a4e89dc043680748564dbaf1ff670d2d\\"", "size": 53808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T08:50:38.000Z", "contentLength": 53808, "httpStatusCode": 200}	d4f65ea8-3753-46d8-9d47-89689a6fa571	\N	{}
f3aaeffe-ccc5-4090-9a5b-7887d0cd4c83	payment-proofs	payment-proofs/e5b30ad9-0fb6-44bc-a93f-353418263e27	\N	2026-02-01 09:04:08.004039+00	2026-02-01 09:04:08.004039+00	2026-02-01 09:04:08.004039+00	{"eTag": "\\"bcf3d2c1300debf05ba713f066e0be63\\"", "size": 649715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T09:04:08.000Z", "contentLength": 649715, "httpStatusCode": 200}	cee2d27f-b109-4fe4-8e26-c10b83114973	\N	{}
da919f52-b4a5-4a5d-9f76-51c677e72aa8	payment-proofs	payment-proofs/547e07c8-bddb-4c06-aea2-9746d7ee7360	\N	2026-02-01 09:30:30.831346+00	2026-02-01 09:30:30.831346+00	2026-02-01 09:30:30.831346+00	{"eTag": "\\"a4e89dc043680748564dbaf1ff670d2d\\"", "size": 53808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T09:30:31.000Z", "contentLength": 53808, "httpStatusCode": 200}	9bc156df-f139-4f28-a005-4342fb3d8aee	\N	{}
e1660436-efef-431d-b0a2-412bd5d54dc2	payment-proofs	payment-proofs/27839fd8-4e64-4c83-9590-adc5648aa5b8	\N	2026-02-01 09:39:44.034414+00	2026-02-01 09:39:44.034414+00	2026-02-01 09:39:44.034414+00	{"eTag": "\\"a4e89dc043680748564dbaf1ff670d2d\\"", "size": 53808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T09:39:45.000Z", "contentLength": 53808, "httpStatusCode": 200}	365ab8b6-77a6-4427-acfa-b58ee16edc44	\N	{}
861a0c9e-0a00-406e-9f05-6487bd6a41e8	payment-proofs	payment-proofs/a3c0ce40-4f9b-432a-8db8-e2f0020a3197	\N	2026-02-01 09:43:01.305968+00	2026-02-01 09:43:01.305968+00	2026-02-01 09:43:01.305968+00	{"eTag": "\\"bcf3d2c1300debf05ba713f066e0be63\\"", "size": 649715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T09:43:02.000Z", "contentLength": 649715, "httpStatusCode": 200}	1fe11c2b-6009-409a-88a3-dd071c677407	\N	{}
9ed86d6a-2232-47db-a174-ccc569201640	payment-proofs	payment-proofs/d4d0da24-085e-431f-93e1-b33460f402bf	\N	2026-02-01 09:53:12.551869+00	2026-02-01 09:53:12.551869+00	2026-02-01 09:53:12.551869+00	{"eTag": "\\"a4e89dc043680748564dbaf1ff670d2d\\"", "size": 53808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T09:53:13.000Z", "contentLength": 53808, "httpStatusCode": 200}	73c4fbea-8321-444f-bb78-68556dc9a2fc	\N	{}
25d75353-5dac-4dd3-95de-0a4803bea295	payment-proofs	payment-proofs/7f2c7b9c-0e12-48b7-867b-1f7d6ab2a178	\N	2026-02-08 10:14:55.499957+00	2026-02-08 10:14:55.499957+00	2026-02-08 10:14:55.499957+00	{"eTag": "\\"82660af9fd021a4df705ab272147be8d\\"", "size": 701865, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T10:14:56.000Z", "contentLength": 701865, "httpStatusCode": 200}	2194a1ff-a30a-47cf-a0ca-b0183ec6eef9	\N	{}
172b7432-c486-4b54-8234-cc3e6129faea	payment-proofs	payment-proofs/bac82162-3059-4d6a-bf45-acfb1921f153	\N	2026-02-01 09:59:23.201425+00	2026-02-01 09:59:23.201425+00	2026-02-01 09:59:23.201425+00	{"eTag": "\\"a4e89dc043680748564dbaf1ff670d2d\\"", "size": 53808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T09:59:24.000Z", "contentLength": 53808, "httpStatusCode": 200}	e53aa8bd-3c47-4a9a-abb2-60c2e86887c3	\N	{}
8551c0e3-58cf-4026-a5b8-8c3106c4323d	payment-proofs	payment-proofs/33cbea53-3259-42bb-921a-cd7fcd80e261	\N	2026-02-02 01:44:37.171166+00	2026-02-02 01:44:37.171166+00	2026-02-02 01:44:37.171166+00	{"eTag": "\\"bcf3d2c1300debf05ba713f066e0be63\\"", "size": 649715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T01:44:38.000Z", "contentLength": 649715, "httpStatusCode": 200}	90bdf45a-e776-4cd5-b34f-4c04c60776bc	\N	{}
9526195f-2262-49a9-b3c8-4dea33f81295	payment-proofs	payment-proofs/095f125a-685b-48e4-9417-9f685b74e7e7	\N	2026-02-08 10:22:31.532573+00	2026-02-08 10:22:31.532573+00	2026-02-08 10:22:31.532573+00	{"eTag": "\\"82660af9fd021a4df705ab272147be8d\\"", "size": 701865, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T10:22:32.000Z", "contentLength": 701865, "httpStatusCode": 200}	05ba6a3a-f9da-4c0f-8ba7-cd5fbb8c1c71	\N	{}
ad87845b-c619-490f-8049-c296e5828217	payment-proofs	payment-proofs/4c5d4860-7269-44f0-9278-2c9ebdef3312	\N	2026-02-05 05:33:34.340376+00	2026-02-05 05:33:34.340376+00	2026-02-05 05:33:34.340376+00	{"eTag": "\\"497a20b60264b9192a8f024dade07678\\"", "size": 181721, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-05T05:33:35.000Z", "contentLength": 181721, "httpStatusCode": 200}	036e2a2e-752e-40f8-b333-04428614b537	\N	{}
a517263c-3451-4258-aa08-1c73afeb844a	portfolio	portfolio/03b46f38-14c3-4bc5-b63b-b69303a47d4c.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:38:25.864947+00	2026-02-08 15:38:25.864947+00	2026-02-08 15:38:25.864947+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:38:26.000Z", "contentLength": 205216, "httpStatusCode": 200}	82089d35-bd81-4f8c-b60f-4df1b1b27dae	6771d55f-7660-47df-8058-b79f66a5b277	{}
4ccc7412-8404-4dd1-b459-ff2c5dcfbd8d	payment-proofs	payment-proofs/0e291025-79d2-4b1a-8de0-877d1768ee75	\N	2026-02-06 18:31:51.975512+00	2026-02-06 18:31:51.975512+00	2026-02-06 18:31:51.975512+00	{"eTag": "\\"d57b9c37a17f0350ee4b065452c7390b\\"", "size": 782858, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T18:31:52.000Z", "contentLength": 782858, "httpStatusCode": 200}	9568b673-937c-4077-8186-d2fdc52fdf7e	\N	{}
581b1269-ed55-4217-8440-f765482492dc	payment-proofs	payment-proofs/4c5e9c68-b614-4151-a75e-71b2aeb0229d	\N	2026-02-06 23:44:11.958351+00	2026-02-06 23:44:11.958351+00	2026-02-06 23:44:11.958351+00	{"eTag": "\\"d57b9c37a17f0350ee4b065452c7390b\\"", "size": 782858, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T23:44:12.000Z", "contentLength": 782858, "httpStatusCode": 200}	61070c23-cf98-4335-8b1d-32411e74a0d9	\N	{}
0f0a877f-0999-460d-8c3f-3272ca59187c	portfolio	portfolio/6b7bca79-7dcc-49ff-bca2-c24e845ef8e5.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:39:41.651694+00	2026-02-08 15:39:41.651694+00	2026-02-08 15:39:41.651694+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:39:42.000Z", "contentLength": 331367, "httpStatusCode": 200}	79a91299-1f1b-4554-9b9f-8ff7daefc4de	6771d55f-7660-47df-8058-b79f66a5b277	{}
2437f0e6-9a4a-4bcc-862c-4781f0cb4c37	payment-proofs	payment-proofs/4b79655f-1729-4886-9d29-902bd6ab4f26	\N	2026-02-07 01:07:20.262375+00	2026-02-07 01:07:20.262375+00	2026-02-07 01:07:20.262375+00	{"eTag": "\\"6157eac24d19a32b7eff0be06ac5c364\\"", "size": 548247, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T01:07:21.000Z", "contentLength": 548247, "httpStatusCode": 200}	abcb9bc0-d494-457e-be4f-7427e9f61c99	\N	{}
19e31ce6-c4c7-4d1e-9f7c-785b215c55a8	payment-proofs	payment-proofs/81d278b3-c02b-44b1-84d8-8a6455417414	\N	2026-02-07 01:26:27.883431+00	2026-02-07 01:26:27.883431+00	2026-02-07 01:26:27.883431+00	{"eTag": "\\"82660af9fd021a4df705ab272147be8d\\"", "size": 701865, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T01:26:28.000Z", "contentLength": 701865, "httpStatusCode": 200}	11f6fb3a-be8e-4af0-bb65-2e439b347a3f	\N	{}
da2f403d-f856-4921-9aba-14ce3c755c26	portfolio	portfolio/d039269a-3a01-43db-ae18-bbdee04bdcce.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:40:44.215044+00	2026-02-08 15:40:44.215044+00	2026-02-08 15:40:44.215044+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:40:45.000Z", "contentLength": 205216, "httpStatusCode": 200}	2296be9b-5db7-4f02-b92e-3c79769f63dd	6771d55f-7660-47df-8058-b79f66a5b277	{}
073829eb-e3aa-4343-966f-185d99c9db90	portfolio	portfolio/5e2a5b23-3fe2-4018-aeb2-3c37f2a4d906.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:43:20.812846+00	2026-02-08 15:43:20.812846+00	2026-02-08 15:43:20.812846+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:43:21.000Z", "contentLength": 331367, "httpStatusCode": 200}	f3946132-7a7b-4e82-be9e-7dc372aa5d8f	6771d55f-7660-47df-8058-b79f66a5b277	{}
1c6ff73f-227d-4fa5-a9b3-1efae7de9ec2	portfolio	portfolio/79261cc0-9bc6-4763-a02c-90a722893f30.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 15:43:21.227953+00	2026-02-08 15:43:21.227953+00	2026-02-08 15:43:21.227953+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:43:22.000Z", "contentLength": 205216, "httpStatusCode": 200}	eca94af3-1ffa-431b-aaa6-91b813750491	6771d55f-7660-47df-8058-b79f66a5b277	{}
2f5c4302-3184-44f3-80f5-c31e7fff92d7	portfolio	portfolio/fee8e58c-bc29-4ba5-9507-f671e70fa2a0.jpg	\N	2026-02-08 15:44:17.204948+00	2026-02-08 15:44:17.204948+00	2026-02-08 15:44:17.204948+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:44:18.000Z", "contentLength": 331367, "httpStatusCode": 200}	f8002c66-ec59-428a-a7c4-4a33357f3a04	\N	{}
5f04195c-6e57-400a-b21e-6e617bb9f888	portfolio	portfolio/87dd41a1-9924-4f27-9ff9-2fa4668b909a.jpg	\N	2026-02-08 15:44:17.683766+00	2026-02-08 15:44:17.683766+00	2026-02-08 15:44:17.683766+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:44:18.000Z", "contentLength": 205216, "httpStatusCode": 200}	ec1f45a2-dd23-4a24-b570-bb3baf95e48a	\N	{}
e72ad9f9-6a87-4c18-8005-4663dbb908fd	portfolio	portfolio/f6881a3c-f666-4c83-8a76-c6e09226f337.jpg	\N	2026-02-08 15:45:38.895041+00	2026-02-08 15:45:38.895041+00	2026-02-08 15:45:38.895041+00	{"eTag": "\\"8000894b84a808c6922836062f44680d\\"", "size": 115450, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:45:39.000Z", "contentLength": 115450, "httpStatusCode": 200}	5d489858-c95d-44d6-9587-7e3e25d80b68	\N	{}
feadd6c9-cee4-4c7c-a1b1-9c5858380c18	portfolio	portfolio/7ad5f6ae-79b2-411d-8b78-d27eabb1dcc6.jpg	\N	2026-02-08 15:45:39.374492+00	2026-02-08 15:45:39.374492+00	2026-02-08 15:45:39.374492+00	{"eTag": "\\"32f17622dca741d68294530fe1332943\\"", "size": 258301, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T15:45:40.000Z", "contentLength": 258301, "httpStatusCode": 200}	97fb0e66-7f42-4355-9fe4-d928326249b3	\N	{}
b3cce670-8e5c-4835-8535-8f6f735cb030	portfolio	portfolio/b8a2a631-f478-47e9-af29-5845f1b50d1a.jpg	\N	2026-02-08 16:11:31.387186+00	2026-02-08 16:11:31.387186+00	2026-02-08 16:11:31.387186+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T16:11:32.000Z", "contentLength": 205216, "httpStatusCode": 200}	96a0728d-3466-4683-a6b0-c41ccd6a92ca	\N	{}
5ee4d9dc-0c49-4578-a7e5-dcc81998e678	services-images	services/1770568092372-img3.jpg	\N	2026-02-08 16:28:12.866027+00	2026-02-08 16:28:12.866027+00	2026-02-08 16:28:12.866027+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T16:28:13.000Z", "contentLength": 331367, "httpStatusCode": 200}	b7a068ef-4785-4c27-8c20-9860d6547ca0	\N	{}
9b1b6499-5d8e-4e41-b1ee-413fa4190343	payment-proofs	payment-proofs/41a1cb17-de5d-4bb1-9d62-91d25eda4d8a	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 16:33:13.98588+00	2026-02-08 16:33:13.98588+00	2026-02-08 16:33:13.98588+00	{"eTag": "\\"8000894b84a808c6922836062f44680d\\"", "size": 115450, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T16:33:14.000Z", "contentLength": 115450, "httpStatusCode": 200}	3d55b0b0-c930-4752-97a3-ace72727db49	6771d55f-7660-47df-8058-b79f66a5b277	{}
19b258d7-f7de-4fcb-9510-d64b7871fcc4	payment-proofs	payment-proofs/2bd98a93-1cfa-4efa-91bd-599a35774fae	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-08 16:34:29.502105+00	2026-02-08 16:34:29.502105+00	2026-02-08 16:34:29.502105+00	{"eTag": "\\"8000894b84a808c6922836062f44680d\\"", "size": 115450, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T16:34:30.000Z", "contentLength": 115450, "httpStatusCode": 200}	683c8daf-12ce-4d01-9cf8-513dd504bf91	6771d55f-7660-47df-8058-b79f66a5b277	{}
06ed811c-978e-4092-a1ea-2c986a2cb629	payment-proofs	payment-proofs/3c9c0488-30af-4581-be7b-080e914d4189	\N	2026-02-08 16:35:14.32039+00	2026-02-08 16:35:14.32039+00	2026-02-08 16:35:14.32039+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T16:35:15.000Z", "contentLength": 205216, "httpStatusCode": 200}	43fb56b1-8450-4260-961a-2b93f2506682	\N	{}
8f0d59c9-bdcd-4da4-b64f-f8599bb2c6c7	review-images	reviews/3f17d250-4f90-4d74-8f51-8490728a1da0.jpg	\N	2026-02-08 16:37:49.945261+00	2026-02-08 16:37:49.945261+00	2026-02-08 16:37:49.945261+00	{"eTag": "\\"8000894b84a808c6922836062f44680d\\"", "size": 115450, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T16:37:50.000Z", "contentLength": 115450, "httpStatusCode": 200}	996afb24-9b03-4f2f-a172-c168b3ce104a	\N	{}
259c074b-eb5b-4873-9cc8-dff6caa780d8	announcement-images	ca1f511a-7e0a-4926-8aa6-5100b2d60c7c.jpg	\N	2026-02-13 05:08:01.001697+00	2026-02-13 05:08:01.001697+00	2026-02-13 05:08:01.001697+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T05:08:01.000Z", "contentLength": 205216, "httpStatusCode": 200}	c15b26ab-01ef-4339-8d27-60cb0acb4256	\N	{}
d46c8246-d23f-40c4-81e3-c10c75387ead	announcement-images	34a020bc-d228-43a9-8bbd-bf5d41fe5349.jpg	\N	2026-02-13 05:08:24.884483+00	2026-02-13 05:08:24.884483+00	2026-02-13 05:08:24.884483+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T05:08:25.000Z", "contentLength": 205216, "httpStatusCode": 200}	63c754dd-db53-4dd0-9ea0-1a3d4067969f	\N	{}
d7d1f499-ea20-47a0-bd02-df9775a49002	services-images	services/1771145010136-img4.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:43:31.157266+00	2026-02-15 08:43:31.157266+00	2026-02-15 08:43:31.157266+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-15T08:43:32.000Z", "contentLength": 205216, "httpStatusCode": 200}	d685a31e-4ea0-4425-a844-feb198921ac6	6771d55f-7660-47df-8058-b79f66a5b277	{}
28205fad-056b-4720-869f-eaf00e3fc664	services-images	services/1771145011562-img4.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:43:32.155507+00	2026-02-15 08:43:32.155507+00	2026-02-15 08:43:32.155507+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-15T08:43:33.000Z", "contentLength": 205216, "httpStatusCode": 200}	da4d28dc-450e-4e45-978f-48d86f7833cf	6771d55f-7660-47df-8058-b79f66a5b277	{}
0fc82d94-308a-42ff-afe8-e1083f3b187f	payment-proofs	payment-proofs/0ee2d013-b364-47ba-993c-5a27dda7ecb2	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:53:36.621836+00	2026-02-15 08:53:36.621836+00	2026-02-15 08:53:36.621836+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-15T08:53:37.000Z", "contentLength": 205216, "httpStatusCode": 200}	1bf28c21-145d-406e-ad79-d611de592236	6771d55f-7660-47df-8058-b79f66a5b277	{}
47e86088-bbd9-4686-ab77-661852a7699c	payment-proofs	payment-proofs/197504aa-abc6-4926-9123-cb975103ac6c	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-15 08:53:42.243836+00	2026-02-15 08:53:42.243836+00	2026-02-15 08:53:42.243836+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-15T08:53:43.000Z", "contentLength": 205216, "httpStatusCode": 200}	e3bae322-ccb1-43bd-a56e-a391c3a9b083	6771d55f-7660-47df-8058-b79f66a5b277	{}
b36b2ec6-85c1-4144-89b3-2a9be35cbaae	payment-proofs	payment-proofs/0367ae81-f0e9-4aa9-8fd0-c3080b3f3f05	\N	2026-02-15 08:54:24.045501+00	2026-02-15 08:54:24.045501+00	2026-02-15 08:54:24.045501+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-15T08:54:24.000Z", "contentLength": 205216, "httpStatusCode": 200}	ac8c3210-25da-4549-95cf-1cab8393cd27	\N	{}
f86f5d68-d587-4825-87b5-d6b562ec58e3	payment-proofs	payment-proofs/6726b913-cd56-40d9-a457-aba391d4b807	\N	2026-02-15 16:43:42.380211+00	2026-02-15 16:43:42.380211+00	2026-02-15 16:43:42.380211+00	{"eTag": "\\"925219d9c76db6894df80dcc4ea3f41e\\"", "size": 205216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-15T16:43:43.000Z", "contentLength": 205216, "httpStatusCode": 200}	bba64951-dc05-477b-9e1f-4d44a07d985f	\N	{}
b2caefba-f6b4-47c7-84a5-811879e44cf5	announcement-images	f23c08b6-aea5-48de-a9e8-12c64680f6ef.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:25:43.068057+00	2026-02-26 02:25:43.068057+00	2026-02-26 02:25:43.068057+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-26T02:25:44.000Z", "contentLength": 331367, "httpStatusCode": 200}	febde3ed-882a-4585-9602-d62ec2d60b59	6771d55f-7660-47df-8058-b79f66a5b277	{}
eac6080c-9075-437b-9877-0354c7e2ed46	announcement-images	42d4c0e1-5950-44a1-8ec5-f4bb61076355.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:25:54.91487+00	2026-02-26 02:25:54.91487+00	2026-02-26 02:25:54.91487+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-26T02:25:55.000Z", "contentLength": 331367, "httpStatusCode": 200}	e48d72b8-2a9c-440c-8f04-163fa9e20029	6771d55f-7660-47df-8058-b79f66a5b277	{}
2cf80e60-8bec-460a-b4ab-4044bb5626fc	announcement-images	244b3c68-95ca-420c-a397-c019f021801d.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:26:04.236949+00	2026-02-26 02:26:04.236949+00	2026-02-26 02:26:04.236949+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-26T02:26:05.000Z", "contentLength": 331367, "httpStatusCode": 200}	dfa52bd9-76f5-4462-8806-429cf5c2612b	6771d55f-7660-47df-8058-b79f66a5b277	{}
a7bb7916-b973-481b-949b-c238a62d6375	announcement-images	1ae16b6a-b2a2-4c72-93da-d3f7a6a75cc4.jpg	6771d55f-7660-47df-8058-b79f66a5b277	2026-02-26 02:27:13.141414+00	2026-02-26 02:27:13.141414+00	2026-02-26 02:27:13.141414+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-26T02:27:14.000Z", "contentLength": 331367, "httpStatusCode": 200}	1ca0dc67-726c-4a25-9f79-ed48a9b55772	6771d55f-7660-47df-8058-b79f66a5b277	{}
04eee79e-5451-4650-966d-e32aac9492a0	announcement-images	2e305237-c73c-438e-92ce-c0902e8b7008.jpg	\N	2026-02-26 02:27:32.221616+00	2026-02-26 02:27:32.221616+00	2026-02-26 02:27:32.221616+00	{"eTag": "\\"9f787cd1c9927bb20f5beaadb1ffb637\\"", "size": 331367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-26T02:27:33.000Z", "contentLength": 331367, "httpStatusCode": 200}	5d120421-c4cc-427e-9d68-b9cceb99237e	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 93, true);


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, false);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 5, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 52, true);


--
-- Name: calendar_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calendar_slots_id_seq', 1376, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 3, true);


--
-- Name: policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.policies_id_seq', 8, true);


--
-- Name: portfolio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_id_seq', 15, true);


--
-- Name: revenue_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revenue_logs_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 4, true);


--
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 5, true);


--
-- Name: service_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_variants_id_seq', 11, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 15, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_review_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_review_token_key UNIQUE (review_token);


--
-- Name: calendar_slots calendar_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_slots
    ADD CONSTRAINT calendar_slots_pkey PRIMARY KEY (id);


--
-- Name: calendar_slots calendar_slots_service_id_date_time_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_slots
    ADD CONSTRAINT calendar_slots_service_id_date_time_key UNIQUE (service_id, date, "time");


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: payment_intents payment_intents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_pkey PRIMARY KEY (id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: portfolio portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT portfolio_pkey PRIMARY KEY (id);


--
-- Name: revenue_logs revenue_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_logs
    ADD CONSTRAINT revenue_logs_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_booking_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_service_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_service_id_name_key UNIQUE (service_id, name);


--
-- Name: service_variants service_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_variants
    ADD CONSTRAINT service_variants_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: calendar_slots unique_service_date_time; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_slots
    ADD CONSTRAINT unique_service_date_time UNIQUE (service_id, date, "time");


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: calendar_slots_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX calendar_slots_unique ON public.calendar_slots USING btree (service_id, date, "time");


--
-- Name: idx_bookings_date_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_date_time ON public.bookings USING btree (booking_date, booking_time);


--
-- Name: idx_bookings_status_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status_expires_at ON public.bookings USING btree (status, expires_at);


--
-- Name: uniq_pending_payment_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_pending_payment_booking ON public.bookings USING btree (customer_id, service_id, booking_date, booking_time) WHERE (status = 'pending_payment'::text);


--
-- Name: unique_active_booking_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_booking_slot ON public.bookings USING btree (booking_date, booking_time) WHERE (status = ANY (ARRAY['pending'::text, 'approved'::text]));


--
-- Name: unique_service_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_service_slot ON public.calendar_slots USING btree (service_id, date, "time");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: announcements set_updated_at_announcements; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_announcements BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: bookings bookings_service_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_variant_id_fkey FOREIGN KEY (service_variant_id) REFERENCES public.service_variants(id);


--
-- Name: calendar_slots calendar_slots_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_slots
    ADD CONSTRAINT calendar_slots_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: payment_intents payment_intents_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: revenue_logs revenue_logs_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_logs
    ADD CONSTRAINT revenue_logs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: service_categories service_categories_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_variants service_variants_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_variants
    ADD CONSTRAINT service_variants_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: policies Admin can create policies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can create policies" ON public.policies FOR INSERT WITH CHECK ((auth.email() IN ( SELECT admins.email
   FROM public.admins)));


--
-- Name: policies Admin can delete policies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can delete policies" ON public.policies FOR DELETE USING ((auth.email() IN ( SELECT admins.email
   FROM public.admins)));


--
-- Name: policies Admin can read all policies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can read all policies" ON public.policies FOR SELECT USING ((auth.email() IN ( SELECT admins.email
   FROM public.admins)));


--
-- Name: policies Admin can update policies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update policies" ON public.policies FOR UPDATE USING ((auth.email() IN ( SELECT admins.email
   FROM public.admins))) WITH CHECK ((auth.email() IN ( SELECT admins.email
   FROM public.admins)));


--
-- Name: calendar_slots CALENDAR_UPDATE_PUBLIC; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "CALENDAR_UPDATE_PUBLIC" ON public.calendar_slots FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: payment_intents INSERT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "INSERT" ON public.payment_intents FOR INSERT WITH CHECK (true);


--
-- Name: policies Public can read active policies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active policies" ON public.policies FOR SELECT USING ((is_active = true));


--
-- Name: portfolio allow insert portfolio; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "allow insert portfolio" ON public.portfolio FOR INSERT WITH CHECK (true);


--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_intents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

--
-- Name: policies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolio; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings public can create booking; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can create booking" ON public.bookings FOR INSERT WITH CHECK (true);


--
-- Name: bookings public can upload proof; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can upload proof" ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: service_categories public read categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read categories" ON public.service_categories FOR SELECT USING (true);


--
-- Name: services public read services; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read services" ON public.services FOR SELECT USING (true);


--
-- Name: service_variants public read variants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read variants" ON public.service_variants FOR SELECT USING (true);


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Give anon users access to JPG images in folder 1qk4ih9_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give anon users access to JPG images in folder 1qk4ih9_0" ON storage.objects FOR DELETE USING (true);


--
-- Name: objects Give anon users access to JPG images in folder 1qk4ih9_1; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give anon users access to JPG images in folder 1qk4ih9_1" ON storage.objects FOR SELECT USING (true);


--
-- Name: objects Give anon users access to JPG images in folder ijvnt4_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give anon users access to JPG images in folder ijvnt4_0" ON storage.objects FOR SELECT TO authenticated USING (true);


--
-- Name: objects allow insert 1qk4ih9_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "allow insert 1qk4ih9_0" ON storage.objects FOR INSERT WITH CHECK (true);


--
-- Name: objects allow select review images 1qk4ih9_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "allow select review images 1qk4ih9_0" ON storage.objects FOR SELECT USING (true);


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE admins; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admins TO anon;
GRANT ALL ON TABLE public.admins TO authenticated;
GRANT ALL ON TABLE public.admins TO service_role;


--
-- Name: SEQUENCE admins_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.admins_id_seq TO anon;
GRANT ALL ON SEQUENCE public.admins_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.admins_id_seq TO service_role;


--
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.announcements TO anon;
GRANT ALL ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;


--
-- Name: SEQUENCE announcements_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.announcements_id_seq TO anon;
GRANT ALL ON SEQUENCE public.announcements_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.announcements_id_seq TO service_role;


--
-- Name: TABLE bookings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bookings TO anon;
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO service_role;


--
-- Name: SEQUENCE bookings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bookings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.bookings_id_seq TO service_role;


--
-- Name: TABLE calendar_slots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.calendar_slots TO anon;
GRANT ALL ON TABLE public.calendar_slots TO authenticated;
GRANT ALL ON TABLE public.calendar_slots TO service_role;


--
-- Name: SEQUENCE calendar_slots_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.calendar_slots_id_seq TO anon;
GRANT ALL ON SEQUENCE public.calendar_slots_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.calendar_slots_id_seq TO service_role;


--
-- Name: TABLE customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


--
-- Name: SEQUENCE customers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.customers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.customers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.customers_id_seq TO service_role;


--
-- Name: TABLE payment_intents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_intents TO anon;
GRANT ALL ON TABLE public.payment_intents TO authenticated;
GRANT ALL ON TABLE public.payment_intents TO service_role;


--
-- Name: TABLE policies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.policies TO anon;
GRANT ALL ON TABLE public.policies TO authenticated;
GRANT ALL ON TABLE public.policies TO service_role;


--
-- Name: SEQUENCE policies_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.policies_id_seq TO anon;
GRANT ALL ON SEQUENCE public.policies_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.policies_id_seq TO service_role;


--
-- Name: TABLE portfolio; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.portfolio TO anon;
GRANT ALL ON TABLE public.portfolio TO authenticated;
GRANT ALL ON TABLE public.portfolio TO service_role;


--
-- Name: SEQUENCE portfolio_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.portfolio_id_seq TO anon;
GRANT ALL ON SEQUENCE public.portfolio_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.portfolio_id_seq TO service_role;


--
-- Name: TABLE revenue_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.revenue_logs TO anon;
GRANT ALL ON TABLE public.revenue_logs TO authenticated;
GRANT ALL ON TABLE public.revenue_logs TO service_role;


--
-- Name: SEQUENCE revenue_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.revenue_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.revenue_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.revenue_logs_id_seq TO service_role;


--
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- Name: SEQUENCE reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO service_role;


--
-- Name: TABLE service_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.service_categories TO anon;
GRANT ALL ON TABLE public.service_categories TO authenticated;
GRANT ALL ON TABLE public.service_categories TO service_role;


--
-- Name: SEQUENCE service_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.service_categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.service_categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.service_categories_id_seq TO service_role;


--
-- Name: TABLE service_variants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.service_variants TO anon;
GRANT ALL ON TABLE public.service_variants TO authenticated;
GRANT ALL ON TABLE public.service_variants TO service_role;


--
-- Name: SEQUENCE service_variants_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.service_variants_id_seq TO anon;
GRANT ALL ON SEQUENCE public.service_variants_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.service_variants_id_seq TO service_role;


--
-- Name: TABLE services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- Name: SEQUENCE services_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.services_id_seq TO anon;
GRANT ALL ON SEQUENCE public.services_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.services_id_seq TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


ALTER EVENT TRIGGER ensure_rls OWNER TO postgres;

--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

