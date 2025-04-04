# Implementation Plan

## Project Setup and Configuration

- [x] Step 1: Initialize project with React and TypeScript
  - **Task**: Set up a new React project with TypeScript using create-react-app or Next.js. Configure ESLint with Airbnb TypeScript preset and Prettier with standardized config (2-space indentation, single quotes).
  - **Files**:
    - `package.json`: Project dependencies
    - `tsconfig.json`: TypeScript configuration
    - `.eslintrc.js`: ESLint configuration
    - `.prettierrc`: Prettier configuration
    - `README.md`: Project documentation
  - **Step Dependencies**: None
  - **User Instructions**: Run `npx create-react-app quiet-light-aptitude-test --template typescript` or `npx create-next-app quiet-light-aptitude-test --typescript` to initialize the project.

- [x] Step 2: Configure Tailwind CSS and Shadcn UI
  - **Task**: Install and configure Tailwind CSS with the Quiet Light brand colors. Set up Shadcn UI component library.
  - **Files**:
    - `tailwind.config.js`: Tailwind configuration with brand colors
    - `postcss.config.js`: PostCSS configuration
    - `src/styles/globals.css`: Global styles
    - `package.json`: Update dependencies
  - **Step Dependencies**: Step 1
  - **User Instructions**: Run `npm install tailwindcss postcss autoprefixer @shadcn/ui` to install dependencies.

- [x] Step 3: Set up project folder structure
  - **Task**: Create the folder structure following the specified organization pattern.
  - **Files**:
    - `src/frontend/components/ui/`: For Shadcn components
    - `src/frontend/components/layout/`: For structural components
    - `src/frontend/components/pages/`: For page-specific components
    - `src/frontend/components/test/`: For test-specific components
    - `src/backend/`: For backend API routes
    - `src/utils/`: For utility functions
    - `src/hooks/`: For custom React hooks
    - `src/types/`: For TypeScript types and interfaces
    - `src/contexts/`: For React contexts
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

## Database and Backend Setup

- [x] Step 4: Backup existing MongoDB schema and data
  - **Task**: Create a script to download the current schema structure and data content from the existing MongoDB database (MONGODB_URI=mongodb+srv://daoustmark:qH2LkzTTeEdhXWjs@cluster0.qerbghs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0). This backup is crucial before proceeding with schema modifications.
  - **Files**:
    - `scripts/backup_mongo.ts`: Script to perform the database backup.
    - `.env`: Ensure MONGODB_URI is present.
  - **Step Dependencies**: Step 1
  - **User Instructions**: Ensure the MongoDB connection string is correctly configured in the `.env` file. Run the backup script before making schema changes in subsequent steps.

- [x] Step 5: Define user schema and models
  - **Task**: Create schemas for users, including candidates and administrators. Define proper field validation and indexes.
  - **Files**:
    - `src/backend/models/User.ts`: User model and schema
    - `src/backend/models/UserRole.ts`: User role enums and types
    - `src/types/user.types.ts`: TypeScript types for users
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- [x] Step 6: Define test session schema and models
  - **Task**: Create schemas for test sessions, which will track a candidate's progress across multiple days.
  - **Files**:
    - `src/backend/models/TestSession.ts`: Test session model and schema
    - `src/types/session.types.ts`: TypeScript types for test sessions
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

- [x] Step 7: Define question and response schemas
  - **Task**: Create schemas for different question types and corresponding responses.
  - **Files**:
    - `src/backend/models/Question.ts`: Question model with discriminators for different types
    - `src/backend/models/Response.ts`: Response model with discriminators for different types
    - `src/types/question.types.ts`: TypeScript types for questions
    - `src/types/response.types.ts`: TypeScript types for responses
  - **Step Dependencies**: Step 6
  - **User Instructions**: None

- [x] Step 8: Create authentication endpoints
  - **Task**: Implement JWT authentication with secure login/logout functionality.
  - **Files**:
    - `src/backend/controllers/auth.controller.ts`: Authentication controller
    - `src/backend/routes/auth.routes.ts`: Authentication routes
    - `src/backend/middleware/auth.middleware.ts`: Authentication middleware
    - `src/utils/jwt.utils.ts`: JWT utility functions
  - **Step Dependencies**: Step 5
  - **User Instructions**: Generate a secure JWT secret key and add it to the `.env` file.

- [x] Step 9: Create user management endpoints
  - **Task**: Implement CRUD operations for user management.
  - **Files**:
    - `src/backend/controllers/user.controller.ts`: User controller
    - `src/backend/routes/user.routes.ts`: User routes
    - `src/backend/middleware/role.middleware.ts`: Role-based authorization middleware
  - **Step Dependencies**: Step 8
  - **User Instructions**: None

- [x] Step 10: Create test session endpoints
  - **Task**: Implement endpoints for creating, retrieving, and updating test sessions.
  - **Files**:
    - `src/backend/controllers/session.controller.ts`: Session controller
    - `src/backend/routes/session.routes.ts`: Session routes
  - **Step Dependencies**: Step 6, Step 8
  - **User Instructions**: None

- [x] Step 11: Create question management endpoints
  - **Task**: Implement endpoints for managing questions and their categories.
  - **Files**:
    - `src/backend/controllers/question.controller.ts`: Question controller
    - `src/backend/routes/question.routes.ts`: Question routes
  - **Step Dependencies**: Step 7, Step 8
  - **User Instructions**: None

- [x] Step 12: Create response submission endpoints
  - **Task**: Implement endpoints for submitting and retrieving responses.
  - **Files**:
    - `src/backend/controllers/response.controller.ts`: Response controller
    - `src/backend/routes/response.routes.ts`: Response routes
  - **Step Dependencies**: Step 7, Step 8
  - **User Instructions**: None

- [x] Step 13: Configure video storage
  - **Task**: Set up secure video storage and retrieval using a suitable storage solution.
  - **Files**:
    - `src/backend/services/storage.service.ts`: Storage service
    - `src/backend/controllers/video.controller.ts`: Video controller
    - `src/backend/routes/video.routes.ts`: Video routes
  - **Step Dependencies**: Step 12
  - **User Instructions**: Set up an appropriate cloud storage service (e.g., AWS S3, Google Cloud Storage) for video files. Add access credentials to the `.env` file.

- [x] Step 14: Implement scoring algorithms
  - **Task**: Create scoring logic for automatically graded question types.
  - **Files**:
    - `src/backend/services/scoring.service.ts`: Scoring service
    - `src/utils/scoring.utils.ts`: Scoring utility functions
  - **Step Dependencies**: Step 7, Step 12
  - **User Instructions**: None

## Frontend Core Components

- [x] Step 15: Create authentication context and hooks
  - **Task**: Implement React context for authentication state management and related hooks.
  - **Files**:
    - `src/contexts/AuthContext.tsx`: Authentication context
    - `src/hooks/useAuth.ts`: Authentication hook
    - `src/frontend/components/ui/LoginForm.tsx`: Login form component
    - `src/frontend/components/ui/LoginForm.types.ts`: Login form types
  - **Step Dependencies**: Step 8
  - **User Instructions**: None

- [x] Step 16: Create base layout components
  - **Task**: Implement layout components following the Quiet Light brand guidelines.
  - **Files**:
    - `src/frontend/components/layout/Header.tsx`: Header component
    - `src/frontend/components/layout/Footer.tsx`: Footer component
    - `src/frontend/components/layout/MainLayout.tsx`: Main layout component
    - `src/frontend/components/layout/AuthLayout.tsx`: Auth layout component
    - `src/frontend/components/ui/Logo.tsx`: Logo component
  - **Step Dependencies**: Step 2, Step 3
  - **User Instructions**: None

- [x] Step 17: Create form UI components
  - **Task**: Implement reusable form components using Shadcn.
  - **Files**:
    - `src/frontend/components/ui/Input.tsx`: Input component
    - `src/frontend/components/ui/Button.tsx`: Button component
    - `src/frontend/components/ui/Select.tsx`: Select component
    - `src/frontend/components/ui/Checkbox.tsx`: Checkbox component
    - `src/frontend/components/ui/RadioGroup.tsx`: Radio group component
    - `src/frontend/components/ui/Textarea.tsx`: Textarea component
  - **Step Dependencies**: Step 2, Step 3
  - **User Instructions**: None

- [x] Step 18: Create test-specific UI components
  - **Task**: Implement components specific to the test-taking experience.
  - **Files**:
    - `src/frontend/components/test/Timer.tsx`: Countdown timer component
    - `src/frontend/components/test/ProgressIndicator.tsx`: Progress indicator component
    - `src/frontend/components/test/Instructions.tsx`: Instructions component
    - `src/frontend/components/test/QuestionContainer.tsx`: Question container component
  - **Step Dependencies**: Step 17
  - **User Instructions**: None

- [x] Step 19: Create question type components
  - **Task**: Implement components for different question types.
  - **Files**:
    - [x] `src/frontend/components/test/MultipleChoiceQuestion.tsx`: Multiple-choice question component
    - [x] `src/frontend/components/test/TextResponseQuestion.tsx`: Text response question component
    - [x] `src/frontend/components/test/ForcedChoiceQuestion.tsx`: Forced-choice question component
    - [x] `src/frontend/components/test/LikertScaleQuestion.tsx`: Likert scale question component
  - **Step Dependencies**: Step 18
  - **User Instructions**: None

- [x] Step 20: Implement video recording component
  - **Task**: Create a component for recording, reviewing, and submitting video responses.
  - **Files**:
    - `src/frontend/components/test/VideoRecorder.tsx`: Video recorder component
    - `src/frontend/components/test/VideoPlayer.tsx`: Video player component
    - `src/hooks/useMediaRecorder.ts`: Media recorder hook
  - **Step Dependencies**: Step 19
  - **User Instructions**: None

## Test Session Implementation

- [x] Step 21: Create test session context and provider
  - **Task**: Implement context for managing test session state.
  - **Files**:
    - `src/contexts/TestSessionContext.tsx`: Test session context
    - `src/hooks/useTestSession.ts`: Test session hook
  - **Step Dependencies**: Step 10, Step 15
  - **User Instructions**: None

- [x] Step 22: Implement test session routing and page structure
  - **Task**: Create routing logic for test sessions, including access control for different days.
  - **Files**:
    - `src/frontend/components/pages/TestSession.tsx`: Test session page
    - `src/frontend/components/pages/TestWelcome.tsx`: Test welcome page
    - `src/frontend/components/pages/TestComplete.tsx`: Test complete page
    - `src/utils/routing.utils.ts`: Routing utilities
  - **Step Dependencies**: Step 21
  - **User Instructions**: None

- [x] Step 23: Implement Day 1 test sections
  - **Task**: Create components and logic for Day 1 test sections. (Placeholder components created)
  - **Files**:
    - `src/frontend/components/pages/day1/FoundationalKnowledge.tsx`: Foundational knowledge section
  - **Step Dependencies**: Step 22
  - **User Instructions**: None

- [x] Step 24: Implement Day 2 test sections
  - **Task**: Create components and logic for Day 2 test sections. (Placeholder components created)
  - **Files**:
    - `src/frontend/components/pages/day2/ScenarioBasedCases.tsx`: Scenario-based cases section
    - `src/frontend/components/pages/day2/VideoResponses.tsx`: Video responses section
    - `src/frontend/components/pages/day2/EthicalDilemmasWritten.tsx`: Ethical dilemmas with written section
    - `src/frontend/components/pages/day2/BehavioralHonestyCheck.tsx`: Behavioral and honesty check section
    - `src/frontend/components/pages/day2/Day2Complete.tsx`: Day 2 complete page
  - **Step Dependencies**: Step 23
  - **User Instructions**: None

- [ ] Step 25: Implement transitions and animations
  - **Task**: Add smooth transitions between test sections using Framer Motion.
  - **Files**:
    - [x] `src/frontend/components/ui/PageTransition.tsx`: Page transition component
    - [x] `src/frontend/components/ui/FadeIn.tsx`: Fade-in animation component
    - [ ] `src/hooks/useAnimations.ts`: Animations hook (Deferred)
    - [x] Update various page components to include animations (RootLayout updated)
  - **Step Dependencies**: Step 23, Step 24
  - **User Instructions**: Run `npm install framer-motion` to install Framer Motion.

## Admin Dashboard Implementation

- [ ] Step 26: Create admin dashboard layout and navigation
  - [x] Create main dashboard layout with sidebar navigation (Initial Structure)
  - [x] Implement overview page with statistics and recent activity (Initial Structure)
  - [ ] Create candidates page with table and actions (Placeholder page created)
  - [ ] Create test sessions page with table and actions (Placeholder page created)
  - [ ] Create questions page with table and actions (Placeholder page created)
  - [ ] Create settings page with configuration options (Placeholder page created)
  - [ ] Add responsive design for mobile devices
  - [ ] Implement navigation state management
  - [ ] Add loading states and error handling
  - [ ] Style with consistent design system
  - **Files**:
    - `src/frontend/components/pages/admin/Dashboard.tsx`: Admin dashboard page

## Backend Integration and Test Readiness

- [ ] Step 27: Implement Backend API Endpoints
  - **Task**: Implement the necessary backend API endpoints as defined in `general.mdc` and required by the frontend context/components. This includes Auth, Test Sessions (current, section details, completion), Answers/Responses (submission, retrieval), and Video Upload (S3 integration).
  - **Files**: `src/backend/controllers/*`, `src/backend/routes/*`, `src/backend/services/*`, `src/backend/models/*`.
  - **Dependencies**: Steps 5-7 (Schemas), Step 13 (Storage Config).

- [ ] Step 28: Integrate Backend APIs into Frontend Contexts
  - **Task**: Replace placeholder `fetch` calls and dummy data in `TestSessionContext.tsx` and `AuthContext.tsx` with actual API calls. Handle loading, errors, auth tokens, and data mapping.
  - **Files**: `src/contexts/TestSessionContext.tsx`, `src/contexts/AuthContext.tsx`.
  - **Dependencies**: Step 27 (Backend Endpoints), Step 15 (Auth Context).

- [ ] Step 29: Implement Test Feature Components
  - **Task**: Create and integrate the `Timer` and `ProgressIndicator` components (Step 18). Implement timer logic interaction with the context.
  - **Files**: `src/frontend/components/test/Timer.tsx`, `src/frontend/components/test/ProgressIndicator.tsx`, `src/frontend/components/pages/TestSession.tsx`, `src/contexts/TestSessionContext.tsx`.
  - **Dependencies**: Step 18 (Component definitions), Step 21 (Test Session Context).

- [ ] Step 30: Refine Section Component Logic & Rendering
  - **Task**: Update Day 1 & Day 2 section components (`FoundationalKnowledge`, `ScenarioBasedCases`, etc.) to use data from the integrated context and render the appropriate question components (`MultipleChoiceQuestion`, `VideoRecorder`, etc.). Add section-specific layout/instructions.
  - **Files**: `src/frontend/components/pages/day1/*`, `src/frontend/components/pages/day2/*`.
  - **Dependencies**: Step 19 (Question Components), Step 23 & 24 (Placeholders), Step 28 (Integrated Context).

- [ ] Step 31: Populate Database with Test Content
  - **Task**: Add realistic test sections and questions (covering all implemented types) for Day 1 and Day 2 into MongoDB, matching the schemas.
  - **Files**: N/A (Database operation, potentially `scripts/seed_db.ts`).
  - **Dependencies**: Steps 5-7 (Schemas).

- [ ] Step 32: End-to-End Candidate Flow Testing
  - **Task**: Manually test the complete candidate workflow: Login -> Start Test -> Navigate Sections/Questions -> Answer all types -> Timer -> Complete Days -> Completion Page. Verify data persistence and submission.
  - **Files**: N/A (Testing).
  - **Dependencies**: All preceding steps.