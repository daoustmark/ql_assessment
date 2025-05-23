# Assessment Scoring System

## Overview

Our assessment system now supports comprehensive scoring and correct answer tracking across all question types. This enables automatic grading, performance analytics, and detailed feedback for test takers.

## Supported Question Types & Scoring

### 1. Multiple Choice Questions
- **Correct Answer**: Mark one option as the correct answer using radio buttons
- **Scoring**: Automatic - full points if correct option selected, 0 if incorrect
- **UI**: Radio button next to each option marked "Correct"

### 2. Essay Questions
- **Correct Answer**: Expected answer or key points for grading reference
- **Scoring**: Manual grading required (points awarded by reviewer)
- **UI**: Textarea for entering expected answer/grading criteria

### 3. Email Response Questions
- **Correct Answer**: Expected response elements or key points
- **Scoring**: Manual grading required
- **UI**: Textarea for entering expected response criteria

### 4. Likert Scale Questions (1-5)
- **Correct Answer**: Expected/preferred rating (optional)
- **Scoring**: Can be automatic if expected answer set, or subjective
- **UI**: Text field for expected rating or "no preferred answer"

### 5. Video Response Questions
- **Correct Answer**: Not applicable (subjective assessment)
- **Scoring**: Manual review required
- **UI**: No correct answer field (points only)

### 6. Scenario-Based Questions
- **Correct Answer**: Mark preferred scenario options
- **Scoring**: Automatic based on selected options
- **UI**: Checkbox/radio for each scenario option

## Database Schema

### New Columns Added

**mcq_options table:**
```sql
is_correct BOOLEAN DEFAULT FALSE  -- Marks the correct option
```

**questions table:**
```sql
correct_answer TEXT              -- Expected answer for text-based questions
points DECIMAL(5,2) DEFAULT 1.0  -- Points awarded for correct answer
```

**scenario_options table:**
```sql
is_correct BOOLEAN DEFAULT FALSE  -- Marks preferred options
points DECIMAL(5,2) DEFAULT 1.0  -- Points for selecting this option
```

**assessments table:**
```sql
total_points DECIMAL(7,2)         -- Total possible points (calculated)
passing_score DECIMAL(5,2)       -- Minimum percentage to pass (0-100)
```

**assessment_attempts table:**
```sql
score DECIMAL(7,2)               -- Total points earned
percentage DECIMAL(5,2)          -- Percentage score
passed BOOLEAN                   -- Whether attempt passed
```

**user_answers table:**
```sql
points_awarded DECIMAL(5,2) DEFAULT 0  -- Points earned for this answer
is_correct BOOLEAN                      -- Whether answer was correct
```

## Admin Interface Features

### Question Creation/Editing
1. **Points Field**: Set point value for each question (default 1.0)
2. **Multiple Choice**: Radio buttons to mark correct answer
3. **Text Questions**: Textarea for expected answer/grading criteria
4. **Visual Feedback**: Correct answers clearly marked in question previews

### Assessment Management
1. **Total Points Calculation**: Automatically calculated from question points
2. **Passing Score**: Set minimum percentage required to pass
3. **Question Preview**: Shows correct answers for reference

## Automatic Scoring Logic

### Multiple Choice
```typescript
if (selected_option.is_correct) {
  points_awarded = question.points
  is_correct = true
} else {
  points_awarded = 0
  is_correct = false
}
```

### Text-Based Questions
```typescript
// Manual grading required
points_awarded = manual_review_score
is_correct = (points_awarded > 0)
```

### Assessment Score Calculation
```typescript
total_score = sum(user_answers.points_awarded)
percentage = (total_score / assessment.total_points) * 100
passed = (percentage >= assessment.passing_score)
```

## Implementation Status

✅ **Database Schema**: All tables updated with scoring columns
✅ **API Endpoints**: POST/PATCH support for scoring fields
✅ **Admin UI**: Question editing with correct answer marking
✅ **TypeScript Types**: Updated interfaces for all scoring fields
⏳ **Automatic Scoring**: Needs implementation in assessment taking flow
⏳ **Manual Grading**: Interface for reviewing subjective questions
⏳ **Analytics Dashboard**: Score reporting and statistics

## Usage Examples

### Creating a Multiple Choice Question
1. Add question text
2. Add answer options (A, B, C, D)
3. Mark one option as correct using radio button
4. Set point value (e.g., 2.0 points)

### Creating an Essay Question
1. Add question text
2. Enter expected answer key points in "Expected Answer" field
3. Set point value
4. Manual grading will be required during assessment review

### Setting Up Assessment Scoring
1. Questions automatically contribute to total points
2. Set passing score percentage (e.g., 70%)
3. Assessment attempts will be automatically marked as pass/fail

## Future Enhancements

1. **Partial Credit**: Support for partial points on multiple choice
2. **Weighted Scoring**: Different point values for different question types
3. **Rubric-Based Grading**: Structured grading criteria for subjective questions
4. **AI-Assisted Grading**: Automated scoring for text responses
5. **Batch Grading**: Efficient interface for grading multiple attempts

## Migration

To add scoring to existing assessments:

1. Run the `migration_add_correct_answers.sql` script
2. Review existing questions and set correct answers
3. Set point values for questions (defaults to 1.0)
4. Configure passing scores for assessments

The migration script safely updates existing data with sensible defaults. 