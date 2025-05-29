# Correct Answers Update Script

This script parses the `backup/questions.md` file and updates the database with correct answers for multiple choice questions.

## Prerequisites

1. Ensure you have the following environment variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key for admin operations)

2. Run the database migration to add the correct answer fields:
   ```sql
   -- Run this in your Supabase SQL editor or using your preferred method
   ALTER TABLE mcq_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;
   ALTER TABLE scenario_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;  
   ALTER TABLE questions ADD COLUMN correct_answer TEXT;
   
   CREATE INDEX idx_mcq_options_is_correct ON mcq_options(is_correct) WHERE is_correct = TRUE;
   CREATE INDEX idx_scenario_options_is_correct ON scenario_options(is_correct) WHERE is_correct = TRUE;
   ```

## Usage

### Step 1: Dry Run (Recommended)
First, run a dry run to see what would be updated without making any changes:

```bash
npm run update-answers:dry-run
```

This will:
- Parse the questions.md file
- Match questions to database records
- Show you what would be updated
- Generate a report of matches and errors

### Step 2: Execute Updates
If the dry run looks good, execute the actual updates:

```bash
npm run update-answers:execute
```

## How It Works

1. **Parsing**: The script reads `backup/questions.md` and extracts:
   - Question text
   - Multiple choice options (a, b, c, d, e)
   - Correct answer from the answer section

2. **Matching**: Uses text similarity to match questions from the markdown file to database questions
   - Uses a 70% similarity threshold
   - Compares word overlap between question texts

3. **Updating**: Sets the `is_correct` flag to `true` for the correct option in each matched question

## Output

The script will generate a report showing:
- Total questions parsed from markdown
- Successfully matched questions
- Any errors or unmatched questions
- Sample of successful matches with similarity scores

## Troubleshooting

### Common Issues

1. **Low similarity matches**: If questions aren't matching, check:
   - Question text in markdown vs database might have formatting differences
   - Consider lowering the similarity threshold (currently 70%)

2. **Missing correct answers**: If correct answers aren't being extracted:
   - Check the markdown formatting in the answer sections
   - Ensure answers follow the expected pattern (`**a.** text` or similar)

3. **Environment variables**: Ensure you have the service role key, not just the anon key

### Manual Review

After running the script, you can verify the results in your database:

```sql
-- Check which options are marked as correct
SELECT q.question_text, o.option_text, o.is_correct 
FROM questions q 
JOIN mcq_options o ON q.id = o.question_id 
WHERE o.is_correct = true
ORDER BY q.id, o.sequence_order;

-- Count correct answers per question
SELECT question_id, COUNT(*) as correct_count
FROM mcq_options 
WHERE is_correct = true 
GROUP BY question_id 
HAVING COUNT(*) != 1;  -- Should be empty (each question should have exactly 1 correct answer)
```

## Safety Features

- **Dry run by default**: Script runs in dry-run mode unless `--execute` is specified
- **Batch updates**: Database updates happen in batches to avoid overwhelming the database
- **Detailed logging**: Comprehensive output shows exactly what's happening
- **Error handling**: Script continues processing even if individual questions fail 