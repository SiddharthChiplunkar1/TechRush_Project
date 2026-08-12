-- Provision one Auth administrator through an approved database change.
-- Run with:
--   psql --set=ON_ERROR_STOP=1 --set=ADMIN_EMAIL=admin@example.com authdb < provision_admin.sql
--
-- This project is passwordless. The provisioned account signs in through OTP;
-- no password is created or stored by this migration.

\set ON_ERROR_STOP on

\if :{?ADMIN_EMAIL}
\else
    \echo 'ADMIN_EMAIL is required; refusing to provision an administrator.'
    \quit 2
\endif

BEGIN;

INSERT INTO users (
    user_id,
    email,
    first_name,
    last_name,
    role,
    email_verified,
    face_enrolled,
    account_non_locked,
    locked_until,
    failed_login_attempts,
    token_version,
    google_id,
    created_at,
    updated_at,
    last_login_at
)
VALUES (
    gen_random_uuid()::text,
    lower(:'ADMIN_EMAIL'),
    'Admin',
    'Operator',
    'ADMIN',
    true,
    false,
    true,
    NULL,
    0,
    0,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    NULL
)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    email_verified = true,
    account_non_locked = true,
    locked_until = NULL,
    failed_login_attempts = 0;

COMMIT;

\echo 'Admin provisioned. Authenticate with the existing OTP flow.'
