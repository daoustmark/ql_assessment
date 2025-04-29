import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

console.log('Script started');

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Supabase Admin Client Setup ---
// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase URL or Service Role Key is missing. Please ensure environment variables are set.');
  console.error('Fallback to hardcoded keys for development only. DO NOT USE THIS IN PRODUCTION.');
  
  // Fallback for development only - remove in production
  const devSupabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
  const devServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';
  
  const supabase = createClient(devSupabaseUrl, devServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  console.warn('Using development fallback credentials. This is NOT secure for production.');
  seedDatabase(supabase);
} else {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  console.log('Supabase client created with environment variables');
  seedDatabase(supabase);
}

// --- Helper Function for Inserts ---
// Simplifies inserting data and retrieving the ID, includes error handling
async function insertAndGetId(supabase, tableName, data) {
  const { data: insertedData, error } = await supabase
    .from(tableName)
    .insert(data)
    .select('id')
    .single(); // Expecting a single row back

  if (error) {
    console.error(`Error inserting into ${tableName}:`, error.message);
    console.error('Data attempted:', JSON.stringify(data, null, 2));
    throw error; // Stop execution on error
  }
  if (!insertedData) {
     throw new Error(`No data returned after inserting into ${tableName}. Data: ${JSON.stringify(data)}`);
  }
  console.log(`  -> Inserted into ${tableName}, ID: ${insertedData.id}`);
  return insertedData.id;
}

// Function to parse Block 5 combined MCQ options into separate options
function parseBlock5Options(combinedText) {
    // The option text contains patterns like "a. text b. text c. text"
    const options = [];
    
    // Define the option markers we're looking for
    const optionLetters = ['a', 'b', 'c', 'd', 'e'];
    
    let startPositions = [];
    
    // Find the start position of each option
    for (const letter of optionLetters) {
        // Look for patterns like "a. " at the beginning or " b. " in the middle
        const searchPattern = letter === 'a' ? `${letter}. ` : ` ${letter}. `;
        const position = combinedText.indexOf(searchPattern);
        
        if (position !== -1) {
            startPositions.push({
                letter: letter,
                position: position,
                length: searchPattern.length
            });
        }
    }
    
    // Special case: first option may be missing "a. " prefix if it's at the beginning of the string
    if (startPositions.length > 0 && !startPositions.some(pos => pos.letter === 'a')) {
        // If we have other markers but no 'a', assume text before first marker is option 'a'
        // Check if 'b' exists as a marker
        const posB = startPositions.find(pos => pos.letter === 'b');
        if (posB) {
            // Add 'a' as the first option (everything before 'b')
            startPositions.push({
                letter: 'a',
                position: 0,
                length: 0
            });
        }
    }
    
    // Sort start positions by their position in the text
    startPositions.sort((a, b) => a.position - b.position);
    
    // Extract each option text
    for (let i = 0; i < startPositions.length; i++) {
        const current = startPositions[i];
        const next = i < startPositions.length - 1 ? startPositions[i + 1] : null;
        
        const startPos = current.position + current.length;
        const endPos = next ? next.position : combinedText.length;
        
        const optionText = combinedText.substring(startPos, endPos).trim();
        
        // Only add non-empty options
        if (optionText) {
            options.push(optionText);
        }
    }
    
    // If we couldn't parse any options, return the original text
    if (options.length === 0) {
        console.log('      Warning: Could not parse Block 5 options correctly - using original text');
        return [combinedText];
    }
    
    // Add letter prefixes to log for better debugging
    options.forEach((opt, idx) => {
        const letter = String.fromCharCode(97 + idx); // 97 is ASCII for 'a'
        console.log(`      Successfully parsed option ${letter}: ${opt.substring(0, 30)}${opt.length > 30 ? '...' : ''}`);
    });
    
    console.log(`      Total: Successfully parsed ${options.length} options`);
    return options;
}

// --- Seeding Logic ---
async function seedDatabase(supabase) {
  try {
    // 1. Load questions.json
    const questionsFilePath = path.resolve(__dirname, './backup/questions.json'); // Adjust path if needed
    console.log('Reading questions file:', questionsFilePath);
    
    if (!fs.existsSync(questionsFilePath)) {
      throw new Error(`Questions file not found at: ${questionsFilePath}`);
    }
    
    const questionsData = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));
    console.log('Questions file parsed successfully');

    // --- Optional: Clean up existing data before seeding ---
    console.log('Deleting existing data (order matters due to FK constraints)...');
    await supabase.from('likert_statements').delete().gt('id', 0);
    await supabase.from('scenario_options').delete().gt('id', 0);
    await supabase.from('mcq_options').delete().gt('id', 0);
    await supabase.from('user_answers').delete().gt('id', 0);
    await supabase.from('questions').delete().gt('id', 0);
    await supabase.from('scenarios').delete().gt('id', 0);
    await supabase.from('blocks').delete().gt('id', 0);
    await supabase.from('parts').delete().gt('id', 0);
    await supabase.from('assessment_attempts').delete().gt('id', 0);
    await supabase.from('assessments').delete().gt('id', 0);
    console.log('Existing data deleted.');
    // --- End Optional Cleanup ---

    // 2. Insert Main Assessment
    console.log('\nCreating assessment...');
    const assessmentId = await insertAndGetId(supabase, 'assessments', {
      title: 'Business Valuation Assessment',
      description: 'Multi-part assessment based on questions.json',
    });

    // 3. Iterate through Parts
    for (const [partIndex, part] of questionsData.parts.entries()) {
        const currentPartNumber = part.partNumber;
        console.log(`\nProcessing Part ${currentPartNumber}: ${part.partTitle}`);

        const partId = await insertAndGetId(supabase, 'parts', {
            assessment_id: assessmentId,
            title: part.partTitle,
            description: part.description || `Part ${currentPartNumber}`,
            sequence_order: part.sequence_order ?? currentPartNumber,
        });

        // --- Process Content Based on Part Number ---

        // Part 1: Foundational Knowledge (Blocks of Questions)
        if (currentPartNumber === 1 && Array.isArray(part.content)) {
             for (const [blockIndex, blockData] of part.content.entries()) {
                console.log(`  Processing Block ${blockIndex + 1}: ${blockData.blockTitle}`);
                const blockId = await insertAndGetId(supabase, 'blocks', {
                    part_id: partId,
                    title: blockData.blockTitle,
                    description: blockData.description || '',
                    block_type: blockData.block_type || 'question_group',
                    sequence_order: blockData.sequence_order ?? blockIndex + 1,
                });

                if (blockData.questions && Array.isArray(blockData.questions)) {
                    for (const [qIndex, questionData] of blockData.questions.entries()) {
                        console.log(`    Processing Question ${questionData.questionNumber || qIndex + 1}`);
                        const questionId = await insertAndGetId(supabase, 'questions', {
                            block_id: blockId,
                            question_text: questionData.questionText,
                            question_type: questionData.questionType,
                            sequence_order: questionData.questionNumber ?? qIndex + 1,
                            is_required: questionData.is_required ?? true,
                        });

                        if (questionData.questionType === 'multiple-choice' && questionData.options) {
                            // Special handling for Block 5 (Technical Assessment)
                            if (blockData.blockTitle === "Block 5: Technical Assessment" && questionData.options.length === 1) {
                                console.log(`      Processing Block 5 special case - parsing combined options`);
                                const combinedText = questionData.options[0].text;
                                
                                // Parse the combined text into separate options
                                const parsedOptions = parseBlock5Options(combinedText);
                                
                                for (const [optIndex, optionText] of parsedOptions.entries()) {
                                    const optionLetter = String.fromCharCode(97 + optIndex); // 97 is ASCII for 'a'
                                    console.log(`      Processing Parsed Option ${optionLetter}. ${optionText.substring(0, 30)}...`);
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
                    }
                }
            }
        }
        // Part 2: Timed Scenario Response
        else if (currentPartNumber === 2 && part.scenario) {
            console.log(`  Processing Timed Scenario Block: ${part.scenario.title}`);
            const scenarioBlockId = await insertAndGetId(supabase, 'blocks', {
                part_id: partId,
                title: part.scenario.title,
                description: part.assessmentType || 'Timed scenario response',
                block_type: 'scenario',
                sequence_order: 1,
            });

            // Combine scenario details into scenario_text including title
            const scenarioTextCombined = `Title: ${part.scenario.title}\n\nBackground: ${part.scenario.background}\n\nEvent: ${part.scenario.eventDescription}\n\nBuyer Email:\nSubject: ${part.scenario.buyerEmail.subject}\n${part.scenario.buyerEmail.body}\n\nSeller Reaction: ${part.scenario.sellerReaction}`;
            console.log(`    Processing Scenario: ${part.scenario.title}`);
            
            const scenarioId = await insertAndGetId(supabase, 'scenarios', {
                block_id: scenarioBlockId,
                scenario_text: scenarioTextCombined,
                sequence_order: 1,
            });
            
            console.log(`    Creating associated question for timed scenario response`);
            await insertAndGetId(supabase, 'questions',{
                 block_id: scenarioBlockId,
                 question_text: part.task?.description || `Respond to the scenario: ${part.scenario.title}`,
                 question_type: 'textarea',
                 sequence_order: 1,
                 is_required: true,
             });
        }
        // Part 3 & 5: Ethical Dilemmas (Scenario Groups)
        else if ((currentPartNumber === 3 || currentPartNumber === 5) && part.content?.scenarios) {
            console.log(`  Processing Scenario Group Block: ${part.partTitle}`);
            const scenarioBlockId = await insertAndGetId(supabase, 'blocks', {
                part_id: partId,
                title: part.partTitle,
                description: part.assessmentType || 'Ethical scenario responses',
                block_type: 'scenario_group',
                sequence_order: 1,
            });

            for (const [scenIndex, scenarioData] of part.content.scenarios.entries()) {
                 console.log(`    Processing Scenario ${scenarioData.scenarioNumber || scenIndex + 1}: ${scenarioData.title}`);
                 // Combine title, description, and questionText for scenario_text
                 const scenarioTextDb = `Title: ${scenarioData.title}\n\n${scenarioData.description || ''}\n\n${scenarioData.questionText || ''}`.trim();
                 const scenarioId = await insertAndGetId(supabase, 'scenarios', {
                    block_id: scenarioBlockId,
                    scenario_text: scenarioTextDb,
                    sequence_order: scenarioData.scenarioNumber ?? scenIndex + 1,
                });

                if (scenarioData.options && Array.isArray(scenarioData.options)) {
                    for (const [optIndex, optionData] of scenarioData.options.entries()) {
                        console.log(`      Processing Scenario Option ${optIndex + 1}`);
                        await insertAndGetId(supabase, 'scenario_options', {
                           scenario_id: scenarioId,
                           option_text: optionData.text,
                           sequence_order: optionData.sequence_order ?? optIndex + 1,
                        });
                    }
                }
            }
            // Handle written moral choice specifically in Part 5
            if (currentPartNumber === 5 && part.content.written_moral_choice) {
                 const writtenChoice = part.content.written_moral_choice;
                 console.log(`    Processing Written Moral Choice: ${writtenChoice.title}`);
                 await insertAndGetId(supabase, 'questions',{
                     block_id: scenarioBlockId,
                     question_text: writtenChoice.prompt,
                     question_type: 'written',
                     sequence_order: (part.content.scenarios?.length || 0) + 1,
                     is_required: true,
                 });
            }
        }
         // Part 4: Email and Video Scenarios
        else if (currentPartNumber === 4 && part.content) {
            let blockSequence = 1;
            // Email Scenarios Block
            if (part.content.email_scenarios && Array.isArray(part.content.email_scenarios) && part.content.email_scenarios.length > 0) {
                console.log(`  Processing Email Scenario Block`);
                const emailBlockId = await insertAndGetId(supabase, 'blocks', {
                    part_id: partId,
                    title: 'Email Scenarios',
                    description: 'Email response scenarios',
                    block_type: 'email_scenario',
                    sequence_order: blockSequence++,
                });

                for (const [emailIndex, emailScenario] of part.content.email_scenarios.entries()) {
                     console.log(`    Processing Email Scenario ${emailIndex + 1}: ${emailScenario.title}`);
                     // Treat each scenario setup as a question prompt
                     await insertAndGetId(supabase, 'questions', {
                        block_id: emailBlockId,
                        question_text: emailScenario.scenarioSetup || emailScenario.title,
                        question_type: 'email',
                        sequence_order: emailIndex + 1,
                        is_required: true,
                     });
                }
            } else {
                 console.log("  No email scenarios found in Part 4 content.");
            }

             // Video Scenarios Block
            if (part.content.video_scenarios && Array.isArray(part.content.video_scenarios) && part.content.video_scenarios.length > 0) {
                console.log(`  Processing Video Scenario Block`);
                const videoBlockId = await insertAndGetId(supabase, 'blocks', {
                    part_id: partId,
                    title: 'Video Scenarios',
                    description: 'Video response scenarios',
                    block_type: 'video_scenario',
                    sequence_order: blockSequence++,
                });
                 for (const [videoIndex, videoScenario] of part.content.video_scenarios.entries()) {
                     console.log(`    Processing Video Scenario ${videoIndex + 1}: ${videoScenario.title}`);
                     // Combine setup and prompt if available
                     const videoQuestionText = `${videoScenario.scenarioSetup || ''}\n\n${videoScenario.promptText || ''}\n\n${videoScenario.task || ''}`.trim();
                     await insertAndGetId(supabase, 'questions', {
                        block_id: videoBlockId,
                        question_text: videoQuestionText || videoScenario.title,
                        question_type: 'video',
                        sequence_order: videoIndex + 1,
                        is_required: true,
                     });
                }
            } else {
                console.log("  No video scenarios found in Part 4 content.");
            }
        }
        // Part 6: Behavioral Likert Scale
        else if (currentPartNumber === 6 && part.content?.statements) {
            console.log(`  Processing Likert Group Block: ${part.partTitle}`);
            const likertBlockId = await insertAndGetId(supabase, 'blocks', {
                part_id: partId,
                title: part.partTitle,
                description: part.content.instructions || 'Behavioral Assessment',
                block_type: 'likert_group',
                sequence_order: 1,
            });
            // Create one parent question for all Likert statements in this part
            console.log(`    Creating parent Likert question`);
            const likertParentQuestionId = await insertAndGetId(supabase, 'questions', {
                block_id: likertBlockId,
                question_text: 'Please rate your agreement with the following statements:',
                question_type: 'likert',
                sequence_order: 1,
                is_required: true,
            });

            for (const [stmtIndex, statementData] of part.content.statements.entries()) {
                // Filter out non-statement objects if necessary
                if (typeof statementData.statementNumber !== 'number' && !statementData.statementText) {
                    console.log(`      Skipping non-statement item at index ${stmtIndex}`);
                    continue;
                }

                console.log(`      Processing Likert Statement ${statementData.statementNumber || stmtIndex + 1}`);
                await insertAndGetId(supabase, 'likert_statements', {
                   question_id: likertParentQuestionId,
                   statement_text: statementData.statementText,
                   sequence_order: statementData.statementNumber ?? stmtIndex + 1,
                });
            }
        }
        // Fallback for unexpected structures
        else {
            // Check if content is empty before warning
            let isEmptyContent = false;
            if (Array.isArray(part.content) && part.content.length === 0) {
                isEmptyContent = true;
            } else if (typeof part.content === 'object' && part.content !== null && Object.keys(part.content).length === 0) {
                 isEmptyContent = true;
            }

            if (!isEmptyContent) {
                console.warn(`  -> Unhandled structure or non-empty content for Part ${currentPartNumber}. AssessmentType: ${part.assessmentType || 'N/A'}`);
            } else {
                 console.log(`  -> Part ${currentPartNumber} has empty content array/object, skipping.`);
            }
        }
    }

    console.log('\nDatabase seeding completed successfully!');

  } catch (error) {
    console.error('\nDatabase seeding failed:', error);
    process.exit(1); // Exit with error code
  }
} 