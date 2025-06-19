# Supabase PoC

A Next.js application demonstrating Supabase integration for authentication, user profiles, project management, and invitations.

## Features

- Email authentication via Supabase Auth
- User profile creation and editing
- Create, list, and join projects
- Invite collaborators with secure tokens
- Serverless API routes with Next.js

## Prerequisites

- **Node.js** (v14 or higher)
- **npm**, **Yarn**, or **pnpm**
- A **Supabase** account (https://app.supabase.com)

## Supabase Setup

1. **Create a new Supabase project**
   - Go to https://app.supabase.com and click **New Project**.
   - Enter a project name, organization, and database password.

2. **Configure the database schema**
   - In the Supabase Dashboard, navigate to **SQL Editor → Editor**.
   - Copy the contents of `sql/migration.sql` from this repo and run it.
   - This script will:
      - Enable the `uuid-ossp` extension
      - Create `projects`, `invites`, `memberships` tables

3. **Enable Email Authentication**
   - In **Authentication → Sign In / Providers**, ensure **Email**, or any other Auth Provider are enabled.\
   *(Due to limitations of the free plan, you should either enable Google, GitHub, Twitter or Azure, or manually add the user from the Supabase  to get pass the Sing In/Up pages)*

4. **Obtain your API credentials**
   - In **Project Settings**, copy the **URL** and the **anon key** under **API Keys**.


## Project Configuration

1. **Clone this repository**

   ```bash
   git clone https://github.com/your-org/supabase-poc.git
   cd supabase-poc
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   - In your project root, copy the example env file:

     ```bash
     cp .env.local.example .env.local
     ```

   - Open .env.local and replace the placeholders:

     ```ini
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     NEXT_PUBLIC_APP_URL=http://localhost:3000 <- Default port
     ```

## Running Locally

Start the development server:

```bash
npm run dev
# or yarn dev
# or pnpm dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).


## Folder Structure

```
/                     # Root of the project
├─ components/        # React components
├─ hooks/             # Custom React hooks
├─ lib/               # Supabase client setup
├─ pages/             # Next.js pages & API routes
├─ public/            # Static assets
├─ sql/               # Database migration scripts
├─ styles/            # Global CSS & styles
└─ README.md          # This file
```