# Assessment App Documentation

## MDC Context: 00 - Project Goal & Tech Stack

### Goal

Alright, the mission is clear: Build a web app to dish out this assessment test based on `questions.json`. Users need to log in, take the test (which has multiple crazy parts - MCQs, scenarios, video responses!), and we gotta save their answers. We'll use Supabase for the backend because it's awesome and plays nice with AI agents, and Next.js/Tailwind/daisyUI for the frontend because the user asked for it and it's a solid, modern stack.

### Core Tech Stack

-   **Frontend:** Next.js (App Router preferred) with TypeScript. Why? It's React, it's fast, server components are cool, and AI agents generally get it. TypeScript keeps things less chaotic.
-   **Backend & DB:** Supabase. This gives us Postgres, Auth, Storage (for videos!), and Edge Functions if we need 'em, all with a decent API. Killer combo.
-   **Styling:** Tailwind CSS + daisyUI plugin. Utility-first is the way, and daisyUI gives us components without writing tons of classes. User requested. Done.
-   **AI Agent:** Cursor.ai. We're building this *with* the AI, so the whole plan needs to be AI-friendly.

### Key Data Source

-   `questions.json`: This file dictates *everything* about the assessment content and structure. We need to parse this beast accurately.

### High-Level Plan

1.  Setup Project & Supabase CLI
2.  Define DB Schema via Migrations
3.  Seed the DB from `questions.json`
4.  Handle Authentication
5.  Build Core Assessment Flow & Navigation
6.  Create UI Components for Each Assessment Type (MCQ, Scenarios, Likert, Video)
7.  Integrate Video Upload/Storage
8.  Style it up & Deploy

**DO NOT BUILT STUBS OR USE MOCK DATA. WE ARE BUILDING THE LIVE APP**

Let's get building.

## MDC Context: 01 - Project Setup & Supabase CLI

### Goal

Get the basic Next.js project structure up and running. Install essential dependencies and configure Supabase CLI for managing our database schema like pros (no clicking around in the UI!).

### Steps

1.  **Create Next.js App:**
    ```bash
    npx create-next-app@latest assessment-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
    cd assessment-app
    ```
    * *Why App Router & src-dir?* It's the modern Next.js way. Keeps things organized.

2.  **Install Dependencies:**
    ```bash
    npm install @supabase/supabase-js
    npm install -D daisyui@latest
    ```
    * `@supabase/supabase-js`: The official client library. Essential.
    * `daisyui`: The component library requested by the user.

3.  **Configure Tailwind & daisyUI:**
    * Edit `tailwind.config.ts`:
        ```typescript
        // tailwind.config.ts
        import type { Config } from 'tailwindcss';

        const config: Config = {
          content: [
            './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
            './src/components/**/*.{js,ts,jsx,tsx,mdx}',
            './src/app/**/*.{js,ts,jsx,tsx,mdx}',
          ],
          theme: {
            extend: {
              // Add custom theme stuff later if needed
            },
          },
          plugins: [require("daisyui")], // Add this line
          daisyui: {
            themes: ["light", "dark", "cupcake"], // Add themes you want
          },
        };
        export default config;
        ```
    * Update `src/app/globals.css` if needed (Tailwind directives should already be there from `create-next-app`).

4.  **Setup Supabase Environment Variables:**
    * Create `.env.local` in the project root.
    * Get your Supabase Project URL and Anon Key from your Supabase dashboard.
    * Add them to `.env.local`:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    * *Gotcha:* Make sure `.env.local` is in your `.gitignore`. Don't commit secrets!

5.  **Install & Configure Supabase CLI:**
    * Install the CLI (follow official docs - depends on your OS): [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
        ```bash
        # Example for macOS/Linux with Homebrew
        brew install supabase/tap/supabase
        ```
    * Log in:
        ```bash
        supabase login
        ```
    * Link your project (replace `<your-project-id>`):
        ```bash
        supabase link --project-ref <your-project-id>
        ```
        * *Tip:* The project ID is in the URL of your Supabase dashboard (e.g., `https://app.supabase.com/project/YOUR_PROJECT_ID`).
    * Initialize Supabase config locally (creates `supabase` folder):
        ```bash
        supabase init
        ```
    * Pull any existing schema changes (if you accidentally clicked around in the UI):
        ```bash
        supabase db pull
        ```

6.  **Create Supabase Client Utility:**
    * Create `src/lib/supabase/client.ts`:
        ```typescript
        // src/lib/supabase/client.ts
        import { createBrowserClient } from '@supabase/ssr';

        export function createClient() {
          // Create a Supabase client for browser-based usage
          return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
        }
        ```
        * *Note:* We use `createBrowserClient` from `@supabase/ssr` for client-side fetching in Next.js App Router. You might need server-side clients later too.

### Outcome

Base Next.js project ready. Tailwind/daisyUI configured. Supabase keys are set up, and Supabase CLI is linked and initialized, ready for database migrations.

## MDC Context: 02 - Database Schema Migration

### Goal

Define the entire database structure using a Supabase migration file. This keeps our schema in code, version controlled, and deployable by the AI or anyone else. No more manual table creation!

### Steps

1.  **Create Migration File:**
    * Use the Supabase CLI to generate a new migration file. Give it a descriptive name.
        ```bash
        supabase migration new create_initial_schema
        ```
    * This creates `supabase/migrations/<timestamp>_create_initial_schema.sql`.

2.  **Define Schema in SQL:**
    * Open the generated `.sql` file.
    * Write the `CREATE TABLE` SQL statements for *all* required tables. Be meticulous about data types, `NOT NULL` constraints, primary keys (`id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY`), and foreign keys (`REFERENCES`).
    * **Tables Needed:**
        * `assessments`
        * `parts` (FK to `assessments`)
        * `blocks` (FK to `parts`)
        * `questions` (FK to `blocks` or `parts`, nullable block_id)
        * `mcq_options` (FK to `questions`)
        * `scenarios` (FK to `parts`)
        * `scenario_options` (FK to `scenarios`)
        * `likert_statements` (FK to `parts`)
        * `assessment_attempts` (FK to `assessments`, `auth.users`)
        * `user_answers` (FK to `assessment_attempts`, `questions`, `mcq_options`, `scenario_options`, `likert_statements` - make relevant FKs nullable)
        * `results` (FK to `assessment_attempts`)
    * **Example Snippets (Focus on `user_answers` with `video_response_path`):**
        ```sql
        -- supabase/migrations/<timestamp>_create_initial_schema.sql

        -- Assume other tables like assessments, parts, questions, etc., are created above

        CREATE TABLE assessment_attempts (
            id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            assessment_id bigint REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
            start_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            end_time timestamp with time zone,
            status text DEFAULT 'started'::text NOT NULL, -- e.g., 'started', 'completed'
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        CREATE TABLE user_answers (
            id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            attempt_id bigint REFERENCES assessment_attempts(id) ON DELETE CASCADE NOT NULL,
            -- Link to the specific item being answered (only one should be non-null per row)
            question_id bigint REFERENCES questions(id) ON DELETE CASCADE,
            scenario_option_id bigint REFERENCES scenario_options(id) ON DELETE CASCADE, -- For ethical choices
            likert_statement_id bigint REFERENCES likert_statements(id) ON DELETE CASCADE, -- For Likert scale items
            -- Store the actual answer value
            selected_mcq_option_id bigint REFERENCES mcq_options(id) ON DELETE CASCADE, -- For MCQs
            likert_score smallint, -- For Likert scale value (1-5)
            text_response text, -- For timed scenario text responses / written moral choice
            video_response_path text, -- Path in Supabase Storage for video responses
            response_time_ms integer, -- Optional: time spent on this item
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            -- Ensure only one type of answer FK is set per row (optional but good practice)
            CONSTRAINT check_answer_type CHECK (
                (question_id IS NOT NULL AND scenario_option_id IS NULL AND likert_statement_id IS NULL) OR
                (question_id IS NULL AND scenario_option_id IS NOT NULL AND likert_statement_id IS NULL) OR
                (question_id IS NULL AND scenario_option_id IS NULL AND likert_statement_id IS NOT NULL)
            )
        );

        -- Add Indexes for performance on FKs often queried
        CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
        -- ... other indexes as needed ...

        -- Enable Row Level Security (Good Practice!) - Policies defined later
        ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
        -- ... enable RLS for other tables as needed ...
        ```
    * *Gotcha:* Double-check foreign key relationships and `ON DELETE` behavior (e.g., `CASCADE` vs `SET NULL`). Define constraints carefully.

3.  **Apply Migration to Remote Supabase:**
    * This pushes your local SQL file changes to your actual Supabase project.
        ```bash
        supabase db push
        ```
    * *Gotcha:* If this fails, check the error message carefully. It often points to SQL syntax errors or constraint violations. Fix the `.sql` file and run `db push` again. You might need to reset the remote DB via the dashboard if things get really messy (use with caution!).

4.  **Set up Supabase Storage Bucket:**
    * Go to your Supabase Dashboard -> Storage -> Create Bucket.
    * Name it `video_responses`.
    * Set appropriate access policies (e.g., allow authenticated users to upload to a folder matching their user ID). We'll refine policies later if needed.

### Outcome

The database schema is now defined in code within the `supabase/migrations` folder. The tables exist in your remote Supabase project, ready to be populated. The storage bucket for videos is also ready.

## MDC Context: 03 - Seed Database

### Goal

Populate the database tables (created in the previous step) with the actual assessment structure and content from `questions.json`. This is a one-time setup task.

### Why a Script?

Manually entering all this data from `questions.json` would be insane. A script ensures accuracy and repeatability if we ever need to rebuild the DB.

### Steps

1.  **Create Seed Script:**
    * Create `scripts/seedDatabase.ts`.
    * Use a Supabase client *specifically for admin tasks* (using the `service_role` key for backend scripts is common, but for a simple seed script, the `anon` key might suffice if RLS isn't blocking yet. For safety, let's plan for service role).
    * *Get Service Role Key:* In Supabase Dashboard -> Project Settings -> API -> Project API keys -> `service_role` key (Keep this SECRET). Store it in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`. **DO NOT COMMIT THIS KEY.**
    * Create an admin client utility:
        ```typescript
        // src/lib/supabase/admin.ts
        import { createClient } from '@supabase/supabase-js';

        // Ensure env variables are loaded correctly (e.g., using dotenv if running outside Next.js context)
        // For simplicity, assuming process.env works here
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

        if (!supabaseUrl || !serviceKey) {
          throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
        }

        export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
          auth: {
            // Required to use service_role key
            autoRefreshToken: false,
            persistSession: false
          }
        });
        ```

2.  **Implement Seeding Logic in `scripts/seedDatabase.ts`:**
    * Import `supabaseAdmin`.
    * Import or read the `questions.json` file.
    * Parse the JSON data.
    * Use **nested loops or recursive functions** to iterate through `parts`, `content` (blocks/scenarios/etc.), and `questions`/`options`/`statements`.
    * Use `supabaseAdmin.from('tableName').insert([...data])` to insert data into each table.
    * **Crucially:** Insert data in the correct order to satisfy foreign key constraints (e.g., insert `assessments` first, then `parts` using the returned assessment ID, then `blocks`/`questions`, etc.). Handle the mapping between JSON structure and table columns carefully.
    * Log progress and potential errors.
    * Example Snippet (Conceptual):
        ```typescript
        // scripts/seedDatabase.ts
        import { supabaseAdmin } from '../src/lib/supabase/admin';
        import * as fs from 'fs';
        import * as path from 'path';

        // Define types for your questions.json structure (important!)
        interface QuestionJson { // Add actual types based on your JSON
            parts: any[];
        }

        async function seed() {
            console.log('Starting database seed...');

            const jsonPath = path.resolve(__dirname, '../questions.json'); // Adjust path if needed
            const jsonData: QuestionJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

            // 1. Create the main assessment record (if needed, maybe just one)
            const { data: assessment, error: assessmentError } = await supabaseAdmin
                .from('assessments')
                .insert({ title: 'Main Assessment' }) // Or get title from JSON
                .select()
                .single();

            if (assessmentError || !assessment) {
                console.error('Error creating assessment:', assessmentError);
                return;
            }
            console.log('Assessment created:', assessment.id);
            const assessmentId = assessment.id;

            // 2. Loop through parts
            for (const part of jsonData.parts) {
                const { data: dbPart, error: partError } = await supabaseAdmin
                    .from('parts')
                    .insert({
                        assessment_id: assessmentId,
                        part_number: part.partNumber,
                        part_title: part.partTitle,
                        assessment_type: part.assessmentType || 'mcq' // Default or derive type
                    })
                    .select()
                    .single();

                if (partError || !dbPart) {
                    console.error(`Error inserting part ${part.partNumber}:`, partError);
                    continue;
                }
                const partId = dbPart.id;
                console.log(`Part ${part.partNumber} created: ${partId}`);

                // 3. Handle different part types (MCQ blocks, Scenarios, Likert)
                if (part.content && Array.isArray(part.content)) {
                    // Handle MCQ Blocks (Part 1 style)
                    for (const block of part.content) {
                        if (block.blockTitle && block.questions) {
                            const { data: dbBlock, error: blockError } = await supabaseAdmin
                                .from('blocks')
                                .insert({ part_id: partId, block_title: block.blockTitle })
                                .select().single();

                            if (blockError || !dbBlock) continue;
                            const blockId = dbBlock.id;

                            for (const question of block.questions) {
                                // Insert question linked to blockId
                                // Insert mcq_options linked to questionId
                            }
                        }
                    }
                } else if (part.assessmentType === 'timed-scenario-response') {
                    // Handle Timed Scenario (Part 2 style) - Insert into scenarios table
                } else if (part.assessmentType === 'ethical-choice-scenarios-1' || part.assessmentType === 'ethical-choice-scenarios-2') {
                    // Handle Ethical Scenarios (Parts 3/5 style) - Insert into scenarios & scenario_options
                } else if (part.assessmentType === 'behavioral-likert-scale') {
                    // Handle Likert Statements (Part 6 style) - Insert into likert_statements
                }
                 // ... Add logic for other part types from questions.json ...

            } // End parts loop

            console.log('Database seed completed.');
        }

        seed().catch(console.error);
        ```
    * *Gotcha:* This script needs careful implementation. Handling the nested structure and inserting related data correctly (getting IDs back from inserts to use in subsequent inserts) is tricky. Test thoroughly.

3.  **Run the Seed Script:**
    * You'll likely need `ts-node` or similar to run the TypeScript script directly.
        ```bash
        npm install -D ts-node typescript @types/node
        npx ts-node ./scripts/seedDatabase.ts
        ```

### Outcome

Your Supabase database is now populated with the assessment structure and content defined in `questions.json`. The app can now fetch this data to display the test.

## MDC Context: 04 - Authentication

### Goal

Implement user authentication using Supabase Auth. Users must log in to take the assessment. We'll set up basic signup/login forms and protect the assessment routes.

### Why Supabase Auth?

It's built-in, handles JWTs, OAuth providers (optional), email confirmation, password resets, and integrates well with database policies (RLS). Less boilerplate for us.

### Steps

1.  **Configure Supabase Auth Settings:**
    * Go to your Supabase Dashboard -> Authentication -> Providers. Enable Email if it isn't already.
    * Go to Authentication -> Settings. Configure site URL, redirect URLs if using OAuth, and optionally disable email confirmations for easier local dev (but enable for production!).

2.  **Create Auth UI Components:**
    * You *could* use the pre-built `Auth` UI component from `@supabase/auth-ui-react` and `@supabase/auth-ui-shared`. It's fast but less customizable.
        ```bash
        npm install @supabase/auth-ui-react @supabase/auth-ui-shared
        ```
        * Then create a component using it (see Supabase docs).
    * **Alternatively (Recommended for daisyUI integration):** Build custom Login and Signup forms (`src/components/auth/LoginForm.tsx`, `src/components/auth/SignupForm.tsx`).
        * Use standard HTML forms styled with Tailwind/daisyUI (`input`, `btn`, `card`, etc.).
        * Use state (`useState`) to manage email/password inputs.
        * On submit, call Supabase client functions:
            * Signup: `supabase.auth.signUp({ email, password })`
            * Login: `supabase.auth.signInWithPassword({ email, password })`
        * Handle loading states and display errors returned from Supabase.

3.  **Create Auth Pages:**
    * Create pages like `src/app/login/page.tsx` and `src/app/signup/page.tsx`.
    * Import and render your auth form components.
    * Use `useRouter` from `next/navigation` to redirect users after successful login/signup (e.g., to a dashboard or the assessment listing page).

4.  **Handle User Session:**
    * Supabase client library automatically handles JWT refresh and storage (usually in localStorage).
    * Create a way to access the current user session globally, potentially using React Context or a state management library (like Zustand or Jotai) if the app grows complex. For simpler cases, checking on page load might suffice.
    * Add a "Logout" button somewhere (e.g., in the `Layout` component) that calls `supabase.auth.signOut()`.

5.  **Protect Routes (Middleware):**
    * The cleanest way to protect routes in Next.js App Router is using Middleware.
    * Create `src/middleware.ts`:
        ```typescript
        // src/middleware.ts
        import { createServerClient, type CookieOptions } from '@supabase/ssr'
        import { NextResponse, type NextRequest } from 'next/server'

        export async function middleware(request: NextRequest) {
          let response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get(name: string) {
                  return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                  request.cookies.set({ name, value, ...options })
                  response = NextResponse.next({
                    request: {
                      headers: request.headers,
                    },
                  })
                  response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                  request.cookies.set({ name, value: '', ...options })
                  response = NextResponse.next({
                    request: {
                      headers: request.headers,
                    },
                  })
                  response.cookies.set({ name, value: '', ...options })
                },
              },
            }
          )

          const { data: { session } } = await supabase.auth.getSession()

          // Define protected routes
          const protectedRoutes = ['/assessment', '/dashboard', '/results']; // Add paths that need auth

          const isProtectedRoute = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));

          // Redirect to login if user is not authenticated and trying to access a protected route
          if (!session && isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url))
          }

          // Optional: Redirect logged-in users away from login/signup pages
          // if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
          //   return NextResponse.redirect(new URL('/dashboard', request.url)) // Redirect to dashboard or home
          // }

          return response
        }

        // Configure which paths middleware runs on
        export const config = {
          matcher: [
            /*
            * Match all request paths except for the ones starting with:
            * - api (API routes)
            * - _next/static (static files)
            * - _next/image (image optimization files)
            * - favicon.ico (favicon file)
            */
            '/((?!api|_next/static|_next/image|favicon.ico).*)',
          ],
        }
        ```
        * *Note:* This uses `@supabase/ssr` helpers for server-side session handling in middleware. You'll need to install it: `npm install @supabase/ssr`.
        * *Gotcha:* Middleware setup with Supabase SSR can be tricky. Double-check the official Supabase Next.js docs for the latest patterns.

### Outcome

Users can sign up and log in. Assessment-related pages are protected, redirecting unauthenticated users to the login page. We have a basic session management flow. 