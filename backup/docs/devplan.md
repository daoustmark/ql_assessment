Enhanced Quiet Light Advisor Aptitude Test - Development Plan
This plan outlines the steps to build the full application, incorporating existing database analysis, adhering strictly to the application_overview specifications, and aiming for a production-ready state suitable for agentic development.

*(Modifications/Additions are marked with )

Phase 1: Setup & Foundation
[ ] 1.1. Project Setup:

[ ] Build project in /src

[ ] Finalize monorepo or separate directory structure (e.g., frontend/, backend/).

[ ] Backend: Initialize Node.js/TypeScript project. Install core backend dependencies: express, mongoose, bcrypt, jsonwebtoken, zod, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, dotenv, cors, helmet, express-rate-limit, xss-clean, hpp, winston, migrate-mongo, supertest, jest, @types/jest, ts-jest, mongodb-memory-server. Configure TS (tsconfig.json), linters (ESLint), formatters (Prettier).

[ ] Frontend: Initialize React/TypeScript project using Vite. Install core frontend dependencies: react-router-dom, axios, @tanstack/react-query, react-hook-form, @hookform/resolvers/zod, tailwindcss, shadcn-ui (and its dependencies like clsx, tailwind-merge), framer-motion, d3, @types/d3, zustand (for complex client state if needed beyond Context/RQ), jest, @testing-library/react, @testing-library/jest-dom. Configure TS, linters, formatters. Set up testing environment.

[ ] 1.2. Existing Database Analysis & Backup:

[ ] Create a script (e.g., scripts/dump_db.sh or Node.js) using mongodump to connect to the existing MongoDB instance (mongodb+srv://daoustmark:qH2LkzTTeEdhXWjs@cluster0.qerbghs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0) and dump its structure/data to backup/db_dump/.

[ ] Analyze the dump (bson files restored locally or inspected via bsondump) to understand the current schema (User, TestSession, Section, Question, Answer) and data. Document necessary schema modifications/additions based on application_overview.

[ ] 1.3. Migration Setup & Initial Schema:

[ ] Install and configure migrate-mongo per Database Migrations Rules. Create migrate-mongo-config.js pointing to the target database URI (use env var).

[ ] Define/update all Mongoose models (User, TestSession, Section, Question, Answer in src/models/) based on application_overview requirements and analysis from 1.2. Ensure all fields, types, relationships (refs), validation, indexes (UserSchema.index(...)), and methods (comparePassword) are implemented exactly as specified.

[ ] Create initial migration scripts using npm run migrate:create -- YYYYMMDDHHMMSS-initial-schema. Implement the up function in these scripts to create collections (with validation specified in Database Migrations Rules), create indexes, and potentially perform initial data transformations needed from the existing structure. Implement corresponding down functions.

[ ] 1.4. Configuration Management: Set up dotenv. Create .env.example listing all required variables (MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, PORT, CORS_ORIGIN, API_PREFIX, API_VERSION, etc.). Load configuration securely (src/config/...).

[ ] 1.5. Basic Server Setup: Initialize Express application (src/app.ts). Add essential middleware: express.json(), express.urlencoded(), cors (configured via env var), security middleware (helmet, rateLimit, xss, hpp as defined in src/middleware/security.ts). Set up API versioning/routing (/api/v1). Add health check endpoint (/health as defined in overview).

[ ] 1.6. Logging Setup: Implement winston logger (src/utils/logger.ts) as defined. Add request logging middleware (src/middleware/requestLogger.ts) to the Express app.

[ ] 1.7. Integrate Swagger: Implement Swagger setup (src/config/swagger.ts) and add setupSwagger(app) in app.ts as defined in the overview. Add initial Swagger annotations (@openapi, etc.) to the health check route using JSDoc comments or decorators if preferred.

[ ] 1.8. Initial Framer Motion Setup: If global animation variants or providers (e.g., LazyMotion) are needed, set them up. Otherwise, note that Framer Motion will be used for component-level transitions/animations in Phase 5.

[ ] 1.9. Development Seed Script: Ensure the scripts/seedDevelopmentData.js (defined in Database Migrations Rules) is functional for populating local development environments after migrations. Add npm run seed:dev to package.json. (Execution referenced in Phase 7)

Phase 2: Backend Core Features
[ ] 2.1. Authentication:

[ ] Implement JWT utilities (src/utils/jwt.ts - generateTokens, verifyToken) per overview.

[ ] Implement login endpoint (POST /api/v1/auth/login) using authController.ts pattern, validating credentials, using generateTokens. Add Swagger docs.

[ ] Implement refresh token endpoint (POST /api/v1/auth/refresh-token) per overview. Add Swagger docs.

[ ] Implement authentication middleware (src/middleware/auth.ts - authenticate) per overview.

[ ] 2.2. User Model & Registration: Decision: Implement admin/invite-only registration initially.

[ ] Ensure User model pre-save hook for password hashing is functional.

[ ] Implement endpoint for admin to create users (covered in Phase 3.1) and an invite-based registration (Phase 3.7). Do not implement a public POST /api/v1/users for self-registration.

[ ] 2.3. Authorization Middleware: Implement role-based authorization middleware (authorize function in src/middleware/auth.ts) per overview.

[ ] 2.4. Error Handling:

[ ] Implement global error handler middleware (src/middleware/errorHandler.ts) per overview, handling Mongoose, JWT, and custom ApiError types.

[ ] Implement catchAsync utility (src/utils/catchAsync.ts) per overview.

[ ] Implement custom ApiError class (src/utils/ApiError.ts or within errorHandler.ts) per overview.

[ ] Apply catchAsync to all async route handlers.

[ ] 2.5. Basic Test Session Logic:

[ ] Implement endpoint (POST /api/v1/test-sessions) for a candidate to create/start a new test session (associates user, finds sections for the day, sets status/progress). Add Swagger docs. Apply authenticate middleware.

[ ] Implement endpoint (GET /api/v1/test-sessions/current) for a candidate to fetch their active session details (populate currentSection). Add Swagger docs. Apply authenticate middleware.

Phase 3: Admin Backend Features
Apply authenticate and authorize(['admin']) middleware to all endpoints in this phase.

[ ] 3.1. User Management API (Admin): Implement admin endpoints for User CRUD using userController.ts:

[ ] GET /api/v1/users (with pagination per overview). Add Swagger docs.

[ ] GET /api/v1/users/:id. Add Swagger docs.

[ ] POST /api/v1/users (for admin creation). Add Swagger docs.

[ ] PUT /api/v1/users/:id. Add Swagger docs.

[ ] DELETE /api/v1/users/:id. Add Swagger docs.

[ ] 3.2. Section Management API (Admin): Implement admin endpoints for Section CRUD:

[ ] GET /api/v1/sections. Add Swagger docs.

[ ] POST /api/v1/sections. Add Swagger docs.

[ ] GET /api/v1/sections/:id (populate questions?). Add Swagger docs.

[ ] PUT /api/v1/sections/:id (include updating questions array). Add Swagger docs.

[ ] DELETE /api/v1/sections/:id. Add Swagger docs.

[ ] 3.3. Question Management API (Admin): Implement admin endpoints for Question CRUD:

[ ] POST /api/v1/questions. Add Swagger docs.

[ ] GET /api/v1/questions/:id. Add Swagger docs.

[ ] PUT /api/v1/questions/:id. Add Swagger docs.

[ ] DELETE /api/v1/questions/:id. Add Swagger docs.

[ ] Ensure Section PUT endpoint (3.2) handles associating/disassociating question IDs.

[ ] 3.4. Test Session Overview API (Admin):

[ ] Implement admin endpoint (GET /api/v1/test-sessions) to list all sessions (filters, pagination, populate user). Add Swagger docs.

[ ] Implement admin endpoint (GET /api/v1/test-sessions/:id) to view specific session details (populate user, sections, answers?). Add Swagger docs.

[ ] 3.5. Answer Review API (Admin): Implement admin endpoint(s) to retrieve answers:

[ ] GET /api/v1/answers?sessionId=... (Populate user, question, section). Add Swagger docs.

[ ] Or integrate answer fetching into GET /api/v1/test-sessions/:id.

[ ] Add endpoint GET /api/v1/answers/:id/video-url to return a presigned S3 GET URL for a specific video answer. Add Swagger docs.

[ ] 3.6. Scoring API (Admin): Implement admin endpoint (PATCH /api/v1/answers/:id/score) to update score, scoringNotes, scoredBy for an Answer. Add Swagger docs.

[ ] 3.7. Invitation System (Admin): Decision: Use invite code on User model.

[ ] Add inviteCode (unique, indexed) and isInviteConsumed (Boolean) fields to User model (requires new migration). Create and run the migration.

[ ] Implement admin endpoint (POST /api/v1/invites or POST /api/v1/users/invite) to create a new user with role: 'candidate' and a generated unique inviteCode. Return the code. Add Swagger docs.

[ ] Implement public endpoint (POST /api/v1/auth/register) that accepts email, password, firstName, lastName, and inviteCode. Validate the code exists and is not consumed, update the user record (set password, names, isInviteConsumed=true), and return auth tokens. Add Swagger docs.

[ ] 3.8. Analytics Backend Logic (Admin):

[ ] Design data storage: Determine if aggregation on existing models (TestSession, Answer) is sufficient or if a new AnalyticsEvent collection is needed. Plan metrics: completion rate, time per section/overall, answer distribution per question.

[ ] Implement data collection: Ensure relevant data points (timestamps, answers) are saved correctly during the test flow.

[ ] Implement aggregation logic: Create service functions to calculate required metrics.

[ ] Implement analytics endpoints: Create admin-protected endpoints (e.g., GET /api/v1/analytics/summary, GET /api/v1/analytics/question/:id) to serve aggregated data. Add Swagger docs.

Phase 4: Candidate Backend Features
Apply authenticate middleware to all endpoints. Add specific authorization checks where needed (e.g., user can only access their own session).

[ ] 4.1. Fetching Session Details:

[ ] Implement endpoint (GET /api/v1/sections/:id) accessible by candidates only if it's part of their active session. Add Swagger docs.

[ ] Implement endpoint (GET /api/v1/sections/:id/questions) accessible by candidates only for the currentSection in their active session. Return questions in order. Add Swagger docs.

[ ] 4.2. Answering Questions:

[ ] Implement endpoint (POST /api/v1/sections/:id/answers) for candidates to submit answers for their current section (:id) of their active session.

[ ] Validate inputs (ensure section is current, time limit not exceeded - see 4.4). Create/update Answer documents (handle different value types).

[ ] Update TestSession progress (sectionsCompleted), advance currentSection, update status to completed if last section. Add Swagger docs.

[ ] 4.3. Video Upload Integration:

[ ] 4.3.1. Setup S3 Service: Ensure src/services/s3Service.ts implements functions for generating presigned PUT URLs and presigned GET URLs (for viewing). Use AWS SDK v3 per overview.

[ ] 4.3.2. Presigned URL Endpoint: Create endpoint (POST /api/v1/questions/:id/video-upload-url) accessible by candidates for video questions in their current section. Generate presigned S3 PUT URL. Return URL and S3 key. Add Swagger docs.

[ ] 4.3.3. Video Answer Saving: Ensure POST /api/v1/sections/:id/answers correctly receives and saves the S3 key into Answer.videoUrl for video questions.

[ ] 4.4. Time Limit Handling:

[ ] Add currentSectionStartTime field to TestSession model (requires migration). Create and run the migration. Update this field when currentSection changes (e.g., in the POST /sections/:id/answers logic before advancing).

[ ] In GET /test-sessions/current and GET /sections/:id, calculate and return remaining time based on Section.timeLimit and currentSectionStartTime.

[ ] Add validation in POST /sections/:id/answers to reject submissions if Date.now() > currentSectionStartTime + Section.timeLimit (plus a small grace period, e.g., 5 seconds).

[ ] 4.5. Video Compression Consideration: Note: Deferring client/server-side compression. Initial implementation uploads raw Blob.

Phase 5: Frontend Development
[ ] 5.1. Framework Setup: Initialize React/TS project using Vite. Set up react-router-dom, axios, @tanstack/react-query, and zustand (optional, for complex non-server state). Configure Axios instance with base URL and interceptors for auth tokens (request) and error handling/token refresh (response). Set up QueryClientProvider.

[ ] 5.2. Styling & Component Library: Integrate Tailwind CSS and initialize Shadcn UI. Configure tailwind.config.js with Quiet Light brand colors per overview. Establish global styles. Create core reusable layout components (PageLayout) and UI components (Button, Input, Textarea, Card, Dialog, Spinner, Toast/Notification etc.) using Shadcn/Tailwind, following overview principles (types, cn utility).

[ ] 5.3. Authentication UI:

[ ] Create Login page/form (src/pages/LoginPage.tsx, src/components/forms/LoginForm.tsx). Use React Hook Form & Zod per overview. Connect to POST /api/v1/auth/login using useMutation.

[ ] On success, store tokens in localStorage. Configure Axios interceptor to add Authorization: Bearer <token> header. Implement token refresh logic using POST /api/v1/auth/refresh-token (e.g., in response interceptor on 401 errors).

[ ] Implement protected route mechanism (src/components/auth/ProtectedRoute.tsx) checking token existence/validity. Redirect unauthenticated users.

[ ] Implement Logout functionality (clear localStorage, clear React Query cache, redirect).

[ ] Implement Registration page/form (src/pages/RegisterPage.tsx) accepting invite code, connecting to POST /api/v1/auth/register.

[ ] 5.4. Candidate UI - Dashboard: Create dashboard (src/pages/CandidateDashboard.tsx). Use React Query (useQuery) to fetch current test session (GET /test-sessions/current). Display status, Start/Resume button navigating to /test/:sessionId/:sectionId, or completion message.

[ ] 5.5. Candidate UI - Test Taking:

[ ] 5.5.1. Section/Question Display: Create main test interface (src/pages/TestSessionPage.tsx). Use useParams for sectionId. Fetch section details (GET /sections/:id) and questions (GET /sections/:id/questions) using useQuery. Display section info (TestHeader) and questions (QuestionContainer). Handle loading/error states gracefully.

[ ] 5.5.2. Timer Display: Display countdown timer in TestHeader based on remaining time fetched from backend. Handle expiration visually (e.g., disable inputs).

[ ] 5.5.3. Input Handling: Implement specific input components for all question types: Multiple Choice (RadioGroup), Text (Textarea), Video (VideoRecorder), Forced-Choice (RadioGroup), Likert Scale (RadioGroup), Open-Ended (Textarea). Use React Hook Form to manage answers for the section.

[ ] 5.5.4. Video Recording: Implement VideoRecorder component (src/components/test/VideoRecorder.tsx) using the useVideoRecorder hook pattern (src/hooks/useVideoRecorder.ts) per overview. Use MediaRecorder API. On completion, request presigned URL (POST /questions/:id/video-upload-url), upload Blob to S3, store the S3 key in the form state. Add basic Framer Motion transitions for recording states (e.g., pulsing indicator).

[ ] 5.5.5. Answer Submission: Implement form submission logic using React Hook Form's handleSubmit. Gather answers (including video S3 keys), submit via React Query useMutation to POST /sections/:id/answers. Handle loading/success/error (show toasts). Navigate to next section or completion page on success.

[ ] 5.6. Admin UI - Dashboard: Create admin dashboard (src/pages/AdminDashboard.tsx) behind protected route (authorize(['admin'])). Provide navigation using layout components.

[ ] 5.7. Admin UI - User Management: Create views (src/pages/admin/UsersListPage.tsx, src/pages/admin/UserEditPage.tsx): List users (GET /users), View/Edit (GET /users/:id, PUT /users/:id), Create/Invite (POST /users/invite), Delete (DELETE /users/:id). Use reusable table/form components.

[ ] 5.8. Admin UI - Content Management: Create views (src/pages/admin/ContentListPage.tsx, src/pages/admin/SectionEditPage.tsx, src/pages/admin/QuestionEditPage.tsx): List/Create/Edit Sections (GET/POST/PUT /sections/:id), List/Create/Edit Questions (GET/POST/PUT /questions/:id). Implement associating questions to sections within the Section edit form.

[ ] 5.9. Admin UI - Session Review & Scoring: Create views (src/pages/admin/SessionsListPage.tsx, src/pages/admin/SessionReviewPage.tsx): List sessions (GET /test-sessions), View session details (GET /test-sessions/:id). Fetch and display answers (GET /answers?sessionId=...). For video answers, fetch signed GET URL (GET /answers/:id/video-url) and use HTML5 <video> tag. Provide scoring form (PATCH /answers/:id/score).

[ ] 5.10. Analytics UI (Admin):

[ ] Create Analytics page (src/pages/admin/AnalyticsPage.tsx).

[ ] Fetch data from backend analytics endpoints (Phase 3.8) using React Query.

[ ] Use D3.js (or a React wrapper like Nivo/Visx) to create visualizations (bar charts, line charts, tables) for completion rates, time analysis, question performance, etc., as designed in 3.8.

Phase 6: Testing & Refinement
[ ] 6.1. Backend Testing: Write unit/integration tests (Jest/Supertest) covering models, utils, middleware, controllers. Use mongodb-memory-server per overview. Aim for high coverage of logic and auth/authz rules.

[ ] 6.2. Frontend Testing: Write unit/integration tests (Jest/React Testing Library) for components, hooks, and critical UI interactions (form submissions, state changes). Consider E2E tests (Cypress/Playwright) for major user flows (candidate test taking, admin scoring).

[ ] 6.3. Manual Testing & QA: Perform thorough E2E testing across browsers (Chrome, Firefox, Safari). Test candidate and admin flows, edge cases, error handling, responsiveness, accessibility (use tools like Axe DevTools, keyboard navigation).

[ ] 6.4. Security Review: Verify endpoint protection, input validation (backend), check frontend rendering of user content for XSS risks (apply sanitization if needed), CSRF (JWT headers sufficient), rate limiting. Review secret management.

[ ] 6.5. Performance Optimization: Analyze DB queries (explain(), ensure indexes from Phase 1.3/migrations are effective). Optimize FE build (code splitting, check bundle size with vite-plugin-visualizer). Profile API response times. Apply React memoization (React.memo, useMemo, useCallback) judiciously.

Phase 7: Deployment & Documentation
[ ] 7.1. Environment Configuration: Set up .env.development, .env.production, etc. Ensure production secrets are managed securely via hosting provider environment variables or secrets manager.

[ ] 7.2. Build Process: Configure package.json scripts: build:backend (tsc), build:frontend (vite build).

[ ] 7.3. Deployment Strategy:

[ ] Choose hosting (e.g., Vercel/Netlify for FE, Heroku/AWS/GCP for BE, MongoDB Atlas).

[ ] Set up CI/CD (GitHub Actions) to lint, test, build, run database migrations (npm run migrate:up), and deploy FE/BE on pushes to main/production branch.

[ ] 7.4. Documentation Finalization:

[ ] Update README.md (project overview, tech stack, setup including env vars, running locally npm run dev:backend, npm run dev:frontend, npm run seed:dev, testing commands, deployment notes).

[ ] Finalize and ensure API documentation via Swagger (/api-docs) is accurate and complete by reviewing annotations.

[ ] Update backup/docs/adr.md with key decisions made during development.

[ ] Clarification: Add note in docs regarding the "Honesty" evaluation: "The 'Honesty' aspect mentioned in the initial overview is evaluated implicitly through ethical dilemma responses and behavioral consistency, rather than a distinct, separate mechanism."