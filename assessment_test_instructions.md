# Instructions for Building the Assessment Test-Taking Experience

## Project Context
You're building a test-taking experience for an assessment application. The application uses Next.js (App Router) with TypeScript, Supabase for backend/DB, and Tailwind CSS with daisyUI for styling. The database is already set up with appropriate schema and populated with assessment questions.

## Database Structure
The database follows a hierarchical structure:
- **assessments**: Top-level container
- **parts**: Sections within an assessment
- **blocks**: Groups of related questions within parts
- **questions**: Individual questions of various types
  - Connected to **mcq_options**, **scenarios**, and **likert_statements**
- **assessment_attempts**: Records users' attempts
- **user_answers**: Stores users' responses

Refer to `database_schema.md` for the complete schema details.

## Key Features to Implement

1. **Assessment Start Page**:
   - Display available assessments
   - Allow user to start a new attempt
   - Create a new `assessment_attempt` record when starting

2. **Assessment Navigation**:
   - Progress through parts and blocks in sequence_order
   - Allow back/forward navigation when appropriate
   - Display progress indicator

3. **Question Rendering**:
   - Create dynamic components for different question types:
     - Multiple-choice questions with options
     - Scenario-based questions with options
     - Text-based response questions
     - Video recording responses
     - Likert-scale questions
   - Save answers to `user_answers` table

4. **Video Response Component**:
   - Implement browser-based video recording
   - Upload videos to Supabase Storage bucket
   - Store path in `video_response_path` field

5. **Progress Saving**:
   - Auto-save answers as user progresses
   - Allow resuming in-progress attempts

6. **Completion Handling**:
   - Mark attempt as complete
   - Show completion confirmation
   - (Optional) Show score if applicable

## Technical Implementation Guidance

1. **Data Fetching**:
   - Use Supabase client to fetch data
   - Structure queries to follow the hierarchical organization
   - Example: Fetch parts → blocks → questions → options

2. **State Management**:
   - Use React state or context to manage the current test state
   - Track the current part, block, question
   - Store answers temporarily before saving to DB

3. **Routes Structure**:
   - `/assessment` - List available assessments
   - `/assessment/[attemptId]` - Main test-taking page
   - `/assessment/[attemptId]/[partId]` - For part-specific views

4. **Component Organization**:
   - Create in `src/components/assessment/` directory
   - Separate components by question type
   - Use composition for shared functionality

5. **Security Considerations**:
   - Use Supabase RLS policies to ensure users only access their own data
   - Verify permissions in both client and server components

## Implementation Process

1. Start by creating the basic assessment flow with navigation
2. Implement each question type renderer one by one
3. Add answer saving functionality
4. Implement video recording and upload
5. Add progress tracking and completion handling
6. Polish the UI and add transitions between questions

## Example Component Structure

```
src/
  components/
    assessment/
      AssessmentStart.tsx
      AssessmentNavigation.tsx
      ProgressTracker.tsx
      questions/
        MCQQuestion.tsx
        ScenarioQuestion.tsx
        TextQuestion.tsx
        VideoQuestion.tsx
        LikertQuestion.tsx
      VideoRecorder.tsx
  app/
    assessment/
      page.tsx
      [attemptId]/
        page.tsx
```

## Data Access Examples

The following queries will be needed:

1. Create assessment attempt:
```typescript
const { data, error } = await supabase
  .from('assessment_attempts')
  .insert({
    user_id: userId,
    assessment_id: assessmentId,
    start_time: new Date(),
    status: 'in_progress'
  })
  .select();
```

2. Fetch assessment structure:
```typescript
const { data, error } = await supabase
  .from('parts')
  .select(`
    id, title, description, sequence_order,
    blocks (
      id, title, description, block_type, sequence_order,
      questions (
        id, question_text, question_type, sequence_order, is_required
      )
    )
  `)
  .eq('assessment_id', assessmentId)
  .order('sequence_order');
```

3. Save user answer:
```typescript
const { data, error } = await supabase
  .from('user_answers')
  .upsert({
    attempt_id: attemptId,
    question_id: questionId,
    answer_text: textAnswer,
    selected_option_id: selectedOptionId,
    likert_value: likertValue
  });
``` 