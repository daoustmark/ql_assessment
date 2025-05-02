-- START TRANSACTION to ensure all operations succeed or fail together
BEGIN;

-- 1. Create a backup of the relevant tables (this will store the data in backup tables)
CREATE TABLE parts_backup AS SELECT * FROM parts;
CREATE TABLE blocks_backup AS SELECT * FROM blocks;
CREATE TABLE questions_backup AS SELECT * FROM questions;

-- 2. Insert the missing Part 4 (adjust the assessment_id as needed)
-- Note: Get sequence_order and other details right
INSERT INTO parts (assessment_id, title, description, sequence_order)
SELECT 
    assessment_id, 
    'Email and Video Scenario Responses', -- Update title as needed
    'Respond to email and video scenarios', -- Update description as needed
    4 -- Sequence order for Part 4
FROM parts 
WHERE sequence_order = 3 -- Using Part 3 as reference for assessment_id
LIMIT 1;

-- Store the new part_id for later use
DO $$
DECLARE
    new_part_id integer;
BEGIN
    SELECT id INTO new_part_id FROM parts WHERE sequence_order = 4 LIMIT 1;
    
    -- 3. Create block for Part 4
    INSERT INTO blocks (part_id, title, description, block_type, sequence_order)
    VALUES (
        new_part_id, 
        'Block 4: Email and Video Responses',  -- Update as needed
        'Respond to email and video scenarios', -- Update as needed
        'question_group', -- Adjust block type if needed
        1 -- First block in Part 4
    );
    
    -- Store the new block_id
    DECLARE
        new_block_id integer;
    BEGIN
        SELECT id INTO new_block_id FROM blocks WHERE part_id = new_part_id LIMIT 1;
        
        -- 4. Reassociate questions 33-41 to the new block
        UPDATE questions
        SET block_id = new_block_id
        WHERE id BETWEEN 33 AND 41;
        
        -- 5. Increment sequence_order for parts 5 and 6 (assuming they exist)
        UPDATE parts
        SET sequence_order = sequence_order + 1
        WHERE sequence_order > 4;
    END;
END $$;

-- Check for any issues before committing
-- If something looks wrong, you can run ROLLBACK instead of COMMIT
-- COMMIT;

-- For safety, this script ends with the transaction still open.
-- Review the changes manually in the DB UI, then run COMMIT; separately if everything looks good
-- or ROLLBACK; if you need to cancel the changes. 