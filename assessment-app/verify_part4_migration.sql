-- Verification queries to check the migration was successful

-- Check that Part 4 exists and has the right order
SELECT id, title, sequence_order 
FROM parts 
ORDER BY sequence_order;

-- Check that the block for Part 4 exists
SELECT b.id, b.title, b.block_type, p.sequence_order as part_order
FROM blocks b
JOIN parts p ON b.part_id = p.id
WHERE p.sequence_order = 4;

-- Verify questions 33-41 are now associated with Part 4's block
SELECT q.id, q.question_text, b.title as block_title, p.title as part_title, p.sequence_order
FROM questions q
JOIN blocks b ON q.block_id = b.id
JOIN parts p ON b.part_id = p.id
WHERE q.id BETWEEN 33 AND 41
ORDER BY q.id;

-- Make sure Parts 5 and 6 have their sequence numbers increased
SELECT id, title, sequence_order
FROM parts
WHERE sequence_order IN (5, 6)
ORDER BY sequence_order; 