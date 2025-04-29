# Block 5 Multiple Choice Questions Fix - Instructions

## Context and Project Overview

You are working on an assessment application built with Next.js, TypeScript, and Supabase. The application allows users to take an assessment with multiple parts, blocks, and various types of questions including multiple-choice, written responses, and video responses.

### Project Structure

- **Root Directory**: `/assessment`
  - **Assessment App**: `/assessment/assessment-app` - Next.js application
  - **Database Scripts**: `/assessment` - Contains seeding scripts
  - **Supabase Migrations**: `/assessment/supabase/migrations` - SQL migrations for schema and policies

### Database Schema

The database uses the following key tables:
- `assessments` - Top-level assessment information
- `parts` - Sections of an assessment
- `blocks` - Logical groupings of questions within parts
- `questions` - Individual questions of various types
- `mcq_options` - Options for multiple-choice questions

### Current Issue

Block 5 (Technical Assessment) contains multiple-choice questions that are not being properly formatted in the database. The current implementation in the seeding script is not correctly separating the options for these questions.

Based on the screenshot provided, it appears that each question in Block 5 only has one option when it should have multiple options (labeled a, b, c, d, e). The issue is that all the options are being combined into a single text string and inserted as one option, instead of being split into separate options.

For example, this block has questions like:
```
Question: "When evaluating a SaaS business that uses a microservices architecture, which factor most significantly increases the transferability risk compared to a monolithic architecture?"
```

And instead of having 5 separate options in the database, there's just one option containing all of them as a single string:
```
"Microservices create inherently higher hosting costs that a buyer might not anticipate b. The distributed nature of the codebase makes documentation and knowledge transfer more critical c. Microservices typically have poorer performance metrics that might affect customer satisfaction d. The modern architecture attracts developers demanding higher salaries e. Microservices make it impossible to accurately measure technical debt"
```

## Identified Issue in the Data

After examining the raw questions.json file, the issue appears to be in how the options are formatted for Block 5. The format is different from other blocks:

In other blocks, each option is a separate object in an array. But in Block 5, all options are combined into a single string with prefixes like "a.", "b.", etc. This is why they're being inserted as a single option.

Here's what the problematic structure looks like in questions.json:
```json
{
  "questionNumber": 41,
  "questionText": "When evaluating a SaaS business...",
  "questionType": "multiple-choice",
  "options": [
    {
      "choice": "a",
      "text": "Microservices create inherently higher hosting costs that a buyer might not anticipate b. The distributed nature of the codebase makes documentation and knowledge transfer more critical c. Microservices typically have poorer performance metrics that might affect customer satisfaction d. The modern architecture attracts developers demanding higher salaries e. Microservices make it impossible to accurately measure technical debt"
    }
  ]
}
```

What we need is something like:
```json
{
  "questionNumber": 41,
  "questionText": "When evaluating a SaaS business...",
  "questionType": "multiple-choice",
  "options": [
    {
      "choice": "a",
      "text": "Microservices create inherently higher hosting costs that a buyer might not anticipate"
    },
    {
      "choice": "b",
      "text": "The distributed nature of the codebase makes documentation and knowledge transfer more critical"
    },
    ...
  ]
}
```

## Task Details

1. Modify the seedDatabase.js script to handle the special case of Block 5's multiple-choice questions.

2. Create a function to parse the combined options string into separate options. The function should:
   - Split the text at "a.", "b.", "c.", etc.
   - Create separate option objects for each option
   - Ensure each option has the correct text and sequence_order

3. Integrate this function into the processing of Block 5 questions.

## Implementation Approach

The seeding script processes blocks in Part 1, which includes Block 5 (Technical Assessment). When processing Block 5, you need to add special handling for the options. Here's a suggested approach:

1. In the seedDatabase.js script, locate the section that processes multiple-choice questions:
   ```javascript
   if (questionData.questionType === 'multiple-choice' && questionData.options) {
       for (const [optIndex, optionData] of questionData.options.entries()) {
           console.log(`      Processing Option ${optIndex + 1}`);
           await insertAndGetId(supabase, 'mcq_options', {
               question_id: questionId,
               option_text: optionData.text,
               sequence_order: optionData.sequence_order ?? optIndex + 1,
           });
       }
   }
   ```

2. Add special handling for Block 5:
   ```javascript
   if (questionData.questionType === 'multiple-choice' && questionData.options) {
       // Special handling for Block 5 (Technical Assessment)
       if (blockData.blockTitle === "Block 5: Technical Assessment" && questionData.options.length === 1) {
           const combinedText = questionData.options[0].text;
           // Parse the combined text into separate options
           const parsedOptions = parseBlock5Options(combinedText);
           
           for (const [optIndex, optionText] of parsedOptions.entries()) {
               console.log(`      Processing Parsed Option ${optIndex + 1}`);
               await insertAndGetId(supabase, 'mcq_options', {
                   question_id: questionId,
                   option_text: optionText,
                   sequence_order: optIndex + 1,
               });
           }
       } else {
           // Standard processing for other blocks
           for (const [optIndex, optionData] of questionData.options.entries()) {
               console.log(`      Processing Option ${optIndex + 1}`);
               await insertAndGetId(supabase, 'mcq_options', {
                   question_id: questionId,
                   option_text: optionData.text,
                   sequence_order: optionData.sequence_order ?? optIndex + 1,
               });
           }
       }
   }
   ```

3. Implement the parsing function:
   ```javascript
   function parseBlock5Options(combinedText) {
       // This is a simplified approach - you may need to adjust for exact text patterns
       const optionMarkers = [' a. ', ' b. ', ' c. ', ' d. ', ' e. '];
       let options = [];
       
       // Handle the first option (which doesn't have a preceding marker)
       const firstOptionEnd = combinedText.indexOf(' b. ');
       if (firstOptionEnd > -1) {
           options.push(combinedText.substring(0, firstOptionEnd).trim());
           
           // Process the rest of the options
           for (let i = 1; i < optionMarkers.length; i++) {
               const currentMarker = optionMarkers[i];
               const nextMarker = optionMarkers[i + 1];
               
               const startIdx = combinedText.indexOf(currentMarker);
               if (startIdx === -1) continue;
               
               const endIdx = nextMarker ? combinedText.indexOf(nextMarker) : undefined;
               const optionText = combinedText.substring(
                   startIdx + currentMarker.length, 
                   endIdx > -1 ? endIdx : undefined
               ).trim();
               
               options.push(optionText);
           }
       } else {
           // Fallback - if parsing fails, return the original text
           options.push(combinedText);
       }
       
       return options;
   }
   ```

## Testing

After implementing the changes:

1. Run the seeding script:
   ```bash
   cd /assessment
   npm run seed
   ```

2. Check the database to ensure Block 5 questions now have multiple separate options.

3. Test the UI to confirm the questions display correctly with all options.

## Precise Issue Example

Here's a specific example from Block 5 showing the current issue:

**Current Database Structure (Problem):**
```
Question ID: 191
Question Text: "When evaluating a SaaS business that uses a microservices architecture..."
Options:
  - Option ID: 667, Text: "Microservices create inherently higher hosting costs... [all options combined]"
```

**Desired Database Structure:**
```
Question ID: 191
Question Text: "When evaluating a SaaS business that uses a microservices architecture..."
Options:
  - Option ID: 667, Text: "Microservices create inherently higher hosting costs that a buyer might not anticipate"
  - Option ID: 668, Text: "The distributed nature of the codebase makes documentation and knowledge transfer more critical"
  - Option ID: 669, Text: "Microservices typically have poorer performance metrics that might affect customer satisfaction"
  - Option ID: 670, Text: "The modern architecture attracts developers demanding higher salaries"
  - Option ID: 671, Text: "Microservices make it impossible to accurately measure technical debt"
```

## Additional Notes

- The seeding script is designed to run multiple times without duplicating data.
- Be careful to only modify the processing for Block 5 and not disrupt other blocks.
- The issue only affects multiple-choice questions in Block 5 (Technical Assessment).
- Other blocks have correctly structured options in the questions.json file.

## Success Criteria

1. All questions in Block 5 display all their multiple-choice options as separate, selectable options in the UI.
2. The database correctly stores all options for each question as separate entries.
3. The seeding script runs without errors.
4. No disruption to other parts of the application functionality. 