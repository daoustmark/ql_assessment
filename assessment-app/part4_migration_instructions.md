# Part 4 Migration Instructions

This document provides step-by-step instructions for adding the missing Part 4 to the database and reassociating questions 33-41 with it.

## Overview

The problem: In our database, we currently have parts numbered 1, 2, 3, 5, and 6, but Part 4 is missing. Questions 33-41 should be associated with Part 4, but they're currently assigned to a different part. This migration will:

1. Create a new Part 4 record with the appropriate sequence_order
2. Create a block for Part 4
3. Associate questions 33-41 with this new block
4. Update the sequence_order for Parts 5 and 6

## Prerequisites

Before proceeding, ensure you have:

1. Access to the Supabase database through the dashboard or SQL editor
2. A recent backup of the database (if possible)
3. Reviewed the SQL scripts to ensure they match your database structure

## Migration Steps

### Step 1: Manual Verification

First, verify the current state of the database:

1. Log in to the Supabase dashboard
2. Go to the SQL Editor
3. Run the following queries to understand the current state:

```sql
-- Check existing parts and their ordering
SELECT id, title, sequence_order FROM parts ORDER BY sequence_order;

-- Check where questions 33-41 are currently assigned
SELECT q.id, q.question_text, b.title as block_title, p.title as part_title, p.sequence_order
FROM questions q
JOIN blocks b ON q.block_id = b.id
JOIN parts p ON b.part_id = p.id
WHERE q.id BETWEEN 33 AND 41
ORDER BY q.id;
```

Take note of the block_id where these questions are currently assigned, in case you need to rollback.

### Step 2: Execute the Migration

1. Open the SQL Editor in Supabase
2. Copy the contents of `fix_part4_migration.sql` into the editor
3. Review the script once more, especially:
   - The title and description for Part 4
   - The block_type for the new block
   - The question ID range (33-41) to ensure it's correct
4. Execute the script up to (but not including) the COMMIT line
5. Verify the results in the Supabase interface
6. If everything looks correct, run `COMMIT;`
7. If something looks wrong, run `ROLLBACK;` to cancel the changes

### Step 3: Verify the Migration

After committing the changes, verify that everything was done correctly:

1. In the SQL Editor, copy and paste the contents of `verify_part4_migration.sql`
2. Run the script and check that:
   - Part 4 exists with sequence_order = 4
   - A block exists for Part 4
   - Questions 33-41 are now associated with this block
   - Parts 5 and 6 have their sequence_order increased by 1

### If Something Goes Wrong

If you discover problems after committing:

1. In the SQL Editor, copy and paste the contents of `rollback_part4_migration.sql`
2. Execute the script up to (but not including) the COMMIT line
3. Verify that everything has been restored to its original state
4. If correct, run `COMMIT;` to finalize the rollback
5. If something still looks wrong, you may need to restore from a backup

## After Migration

After successfully completing the migration:

1. Test the application to ensure it displays Part 4 correctly
2. Verify that users can navigate through the assessment properly
3. Check that the progress tracking works with the new part ordering

## Contact

If you encounter any issues, please contact the database administrator or development team. 