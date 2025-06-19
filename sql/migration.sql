-- ====================================================================
-- Full Reset Migration: Projects-Only Schema with Invites & Memberships
-- ====================================================================

-- 0. Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create projects table
CREATE TABLE public.projects (
  id            uuid           PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text           NOT NULL,
  details       text,
  invite_token  text           UNIQUE,
  created_at    timestamptz    NOT NULL DEFAULT now()
);

-- 2. Create project_members table (links users to projects)
CREATE TABLE public.project_members (
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- 3. Create invites table (optional multiple invite tokens)
CREATE TABLE public.invites (
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  token       text        NOT NULL UNIQUE,
  created_by  uuid        NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,
  PRIMARY KEY (project_id, token)
);

-- ====================================================================
-- End of Migration
-- ====================================================================
