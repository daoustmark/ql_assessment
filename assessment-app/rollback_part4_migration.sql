-- Rollback script for Part 4 migration
BEGIN;

-- 1. Restore original sequence_order for parts 5 and 6
UPDATE parts
SET sequence_order = sequence_order - 1
WHERE sequence_order > 4;

-- 2. Find the block_id for the new Part 4 block
DO $$
DECLARE
    part4_id integer;
    block4_id integer;
    original_block_id integer;
BEGIN
    -- Get Part 4 ID
    SELECT id INTO part4_id FROM parts WHERE sequence_order = 4;
    
    -- Get Block 4 ID
    SELECT id INTO block4_id FROM blocks WHERE part_id = part4_id;
    
    -- Find the original block_id for questions 33-41
    -- This assumes they were all in the same block before
    -- You might need to adjust if they were in different blocks
    SELECT block_id INTO original_block_id 
    FROM questions_backup 
    WHERE id = 33 
    LIMIT 1;
    
    -- 3. Restore the original block_id for questions 33-41
    UPDATE questions
    SET block_id = original_block_id
    WHERE id BETWEEN 33 AND 41;
    
    -- 4. Delete the block for Part 4
    DELETE FROM blocks WHERE part_id = part4_id;
    
    -- 5. Delete Part 4
    DELETE FROM parts WHERE id = part4_id;
END $$;

-- 6. If needed (optional), restore from backups instead of the above updates
-- TRUNCATE questions;
-- INSERT INTO questions SELECT * FROM questions_backup;
-- TRUNCATE blocks;
-- INSERT INTO blocks SELECT * FROM blocks_backup;
-- TRUNCATE parts;
-- INSERT INTO parts SELECT * FROM parts_backup;

-- Check results before committing
-- COMMIT;

-- For safety, end with transaction still open
-- Run COMMIT; separately after reviewing changes
-- or ROLLBACK; if you want to cancel these changes too 