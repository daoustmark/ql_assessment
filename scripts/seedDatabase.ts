import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config'; // Make sure to install dotenv: npm install dotenv

// Define types based on your JSON structure and database schema
// These might need adjustments based on the exact JSON structure nuances
interface McqOption {
  choice?: string; // JSON has 'choice', DB has 'option_text' and 'sequence_order'
  text: string;
  sequence_order?: number; // Add sequence if needed
}

interface ScenarioOption {
    choice?: string;
    text: string;
    sequence_order?: number;
}

interface Question {
  questionNumber?: number;
  questionText: string;
  questionType: 'multiple-choice' | 'scenario' | 'likert' | 'email' | 'video' | 'written' | string; // Add other types as needed
  options?: McqOption[];
  explanation?: string | null;
  sequence_order?: number; // Add if present in JSON, otherwise generate
  is_required?: boolean; // Add if present in JSON
  points?: number; // Add if present in JSON
}

interface Block {
  blockTitle: string;
  description?: string; // Added description field
  block_type?: string; // Added block_type field
  questions?: Question[];
  sequence_order?: number; // Add if present in JSON, otherwise generate
}

interface Scenario {
    scenarioNumber?: number;
    title: string;
    description?: string;
    scenario_text?: string; // Derived from multiple fields potentially
    questionText?: string; // For ethical choices
    options?: ScenarioOption[];
    sequence_order?: number; // Add if present in JSON, otherwise generate
}

interface TimedScenario {
    title: string;
    background: string;
    eventDescription: string;
    buyerEmail: { subject: string; body: string };
    sellerReaction: string;
    scenario_text?: string; // Combine background/event/email/reaction?
    sequence_order?: number;
}

interface WrittenMoralChoice {
    title: string;
    prompt: string;
    question_text?: string; // Derived
    question_type?: string;
}

interface LikertStatement {
    statementNumber: number;
    statementText: string;
    sequence_order?: number;
}

interface Part {
  partNumber: number;
  partTitle: string;
  description?: string; // Added description field
  content: any; // Could be Block[], Scenario[], { scenarios: Scenario[] }, etc.
  assessmentType?: string; // Helps determine content structure
  scenario?: TimedScenario; // For Part 2
  sequence_order?: number; // Add if present in JSON, otherwise generate
}

interface AssessmentData {
  parts: Part[];
}

// --- Supabase Admin Client Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
}

// Use the admin client defined in 01_Project_Setup
// Assuming the path is correct relative to the script execution context
// If running from project root:
// import { supabaseAdmin } from '../src/lib/supabase/admin';
// If not, recreate client here for simplicity:
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- Helper Function for Inserts ---
async function insertAndGetId(tableName: string, data: any): Promise<number> {
  const { data: insertedData, error } = await supabaseAdmin
    .from(tableName)
    .insert(data)
    .select('id')
    .single();

  if (error) {
    console.error(`Error inserting into ${tableName}:`, error.message);
    console.error('Data:', data);
    throw error;
  }
  if (!insertedData) {
     throw new Error(`No data returned after inserting into ${tableName}`);
  }
  console.log(`Inserted into ${tableName}, ID: ${insertedData.id}`);
  return insertedData.id;
}

// --- Seeding Logic ---
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // 1. Load questions.json
    const jsonPath = path.resolve(__dirname, '../backup/questions.json'); // Adjust path if needed
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const assessmentData: AssessmentData = JSON.parse(jsonData);

    // 2. Insert Main Assessment
    const assessmentId = await insertAndGetId('assessments', {
      title: 'Business Valuation Assessment', // Assuming a fixed title
      description: 'Multi-part assessment based on questions.json',
    });

    // 3. Iterate through Parts
    for (const [partIndex, part] of assessmentData.parts.entries()) {
        console.log(`\nProcessing Part ${part.partNumber}: ${part.partTitle}`);
        const partId = await insertAndGetId('parts', {
            assessment_id: assessmentId,
            title: part.partTitle,
            description: part.description || `Part ${part.partNumber}`, // Use description if available
            sequence_order: part.sequence_order ?? partIndex + 1,
        });

        // --- Process Content Based on Part Type ---

        // Part 1: Foundational Knowledge (Blocks of Questions)
        if (part.partNumber === 1 && Array.isArray(part.content)) {
             for (const [blockIndex, blockData] of (part.content as Block[]).entries()) {
                const blockId = await insertAndGetId('blocks', {
                    part_id: partId,
                    title: blockData.blockTitle,
                    description: blockData.description || '',
                    block_type: blockData.block_type || 'question_group', // Default or specify in JSON
                    sequence_order: blockData.sequence_order ?? blockIndex + 1,
                });

                if (blockData.questions && Array.isArray(blockData.questions)) {
                    for (const [qIndex, questionData] of blockData.questions.entries()) {
                        const questionId = await insertAndGetId('questions', {
                            block_id: blockId,
                            question_text: questionData.questionText,
                            question_type: questionData.questionType,
                            sequence_order: questionData.sequence_order ?? qIndex + 1,
                            is_required: questionData.is_required ?? true, // Default assumption
                            points: questionData.points ?? 1, // Default points
                            // explanation: questionData.explanation, // Add if schema supports it
                        });

                        if (questionData.questionType === 'multiple-choice' && questionData.options) {
                            for (const [optIndex, optionData] of questionData.options.entries()) {
                                await insertAndGetId('mcq_options', {
                                    question_id: questionId,
                                    option_text: optionData.text,
                                    sequence_order: optionData.sequence_order ?? optIndex + 1,
                                    // is_correct: optionData.is_correct ?? false, // Add if schema supports it
                                });
                            }
                        }
                        // Add handling for other question types within Part 1 if needed
                    }
                }
            }
        }
        // Part 2: Timed Scenario Response
        else if (part.partNumber === 2 && part.scenario) {
            const scenarioBlockId = await insertAndGetId('blocks', {
                part_id: partId,
                title: part.scenario.title,
                description: 'Timed scenario response',
                block_type: 'scenario',
                sequence_order: 1,
            });
            // Combine scenario details into scenario_text for the database
            const scenarioTextCombined = `Background: ${part.scenario.background}\n\nEvent: ${part.scenario.eventDescription}\n\nBuyer Email:\nSubject: ${part.scenario.buyerEmail.subject}\n${part.scenario.buyerEmail.body}\n\nSeller Reaction: ${part.scenario.sellerReaction}`;
            await insertAndGetId('scenarios', {
                block_id: scenarioBlockId,
                scenario_text: scenarioTextCombined,
                sequence_order: 1,
            });
        }
        // Part 3 & 5: Ethical Dilemmas (Scenario Groups)
        else if ((part.partNumber === 3 || part.partNumber === 5) && part.content?.scenarios) {
            const scenarioBlockId = await insertAndGetId('blocks', {
                part_id: partId,
                title: part.partTitle, // Use part title for the block
                description: 'Ethical scenario responses',
                block_type: 'scenario_group',
                sequence_order: 1,
            });

            for (const [scenIndex, scenarioData] of (part.content.scenarios as Scenario[]).entries()) {
                 // Combine description and questionText if needed for scenario_text
                 const scenarioTextDb = `${scenarioData.description || ''}\n\n${scenarioData.questionText || ''}`.trim();
                 const scenarioId = await insertAndGetId('scenarios', {
                    block_id: scenarioBlockId,
                    scenario_text: scenarioTextDb || scenarioData.title, // Fallback to title
                    title: scenarioData.title, // Add title if schema has it
                    sequence_order: scenarioData.sequence_order ?? scenIndex + 1,
                });

                if (scenarioData.options && Array.isArray(scenarioData.options)) {
                    for (const [optIndex, optionData] of scenarioData.options.entries()) {
                        await insertAndGetId('scenario_options', {
                           scenario_id: scenarioId,
                           option_text: optionData.text,
                           sequence_order: optionData.sequence_order ?? optIndex + 1,
                        });
                    }
                }
            }
            // Handle written moral choice in Part 5
            if (part.partNumber === 5 && part.content.written_moral_choice) {
                 const writtenChoice = part.content.written_moral_choice as WrittenMoralChoice;
                 await insertAndGetId('questions',{
                     block_id: scenarioBlockId, // Add to the same block as scenarios? Or new block?
                     question_text: writtenChoice.prompt,
                     question_type: 'written',
                     sequence_order: (part.content.scenarios.length || 0) + 1, // Place after scenarios
                     is_required: true,
                     title: writtenChoice.title, // Add title if schema supports it
                 });
            }
        }
         // Part 4: Email and Video Scenarios
        else if (part.partNumber === 4 && part.content) {
            let blockSequence = 1;
            // Email Scenarios Block
            if (part.content.email_scenarios && Array.isArray(part.content.email_scenarios) && part.content.email_scenarios.length > 0) {
                const emailBlockId = await insertAndGetId('blocks', {
                    part_id: partId,
                    title: 'Email Scenarios',
                    description: 'Email response scenarios',
                    block_type: 'email_scenario',
                    sequence_order: blockSequence++,
                });
                // Assuming email scenarios are structured like questions
                for (const [emailIndex, emailScenario] of part.content.email_scenarios.entries()) {
                     await insertAndGetId('questions', {
                        block_id: emailBlockId,
                        question_text: emailScenario.scenarioSetup || emailScenario.title, // Adjust based on actual structure
                        question_type: 'email',
                        sequence_order: emailIndex + 1,
                        is_required: true,
                        title: emailScenario.title, // Add if schema supports it
                    });
                }
            }
             // Video Scenarios Block
            if (part.content.video_scenarios && Array.isArray(part.content.video_scenarios) && part.content.video_scenarios.length > 0) {
                const videoBlockId = await insertAndGetId('blocks', {
                    part_id: partId,
                    title: 'Video Scenarios',
                    description: 'Video response scenarios',
                    block_type: 'video_scenario',
                    sequence_order: blockSequence++,
                });
                 // Assuming video scenarios are structured like questions
                 for (const [videoIndex, videoScenario] of part.content.video_scenarios.entries()) {
                     await insertAndGetId('questions', {
                        block_id: videoBlockId,
                        question_text: videoScenario.scenarioSetup || videoScenario.title, // Adjust based on actual structure
                        question_type: 'video',
                        sequence_order: videoIndex + 1,
                        is_required: true,
                        title: videoScenario.title, // Add if schema supports it
                        // Add promptText or task to description if needed and schema allows
                    });
                }
            }
            // Note: Part 4 in JSON also mentions Likert, but Part 6 seems to be the Likert part.
            // If Part 4 needs Likert, adjust logic here.
        }
        // Part 6: Behavioral Likert Scale
        else if (part.partNumber === 6 && part.content?.statements) {
             const likertBlockId = await insertAndGetId('blocks', {
                part_id: partId,
                title: part.partTitle,
                description: part.content.instructions || 'Behavioral Assessment',
                block_type: 'likert_group',
                sequence_order: 1,
            });
            // Create one parent question for all Likert statements in this part
            const likertParentQuestionId = await insertAndGetId('questions', {
                block_id: likertBlockId,
                question_text: 'Please rate your agreement with the following statements:',
                question_type: 'likert',
                sequence_order: 1,
                is_required: true,
            });

            for (const [stmtIndex, statementData] of (part.content.statements as LikertStatement[]).entries()) {
                // Skip the non-statement entries at the end if they exist
                if (typeof statementData.statementNumber !== 'number') continue;

                await insertAndGetId('likert_statements', {
                   question_id: likertParentQuestionId,
                   statement_text: statementData.statementText,
                   sequence_order: statementData.sequence_order ?? stmtIndex + 1,
                });
            }
        }
        else {
            console.warn(`Unhandled structure for Part ${part.partNumber}. AssessmentType: ${part.assessmentType || 'N/A'}`);
        }
    }

    console.log('\nDatabase seeding completed successfully!');

  } catch (error) {
    console.error('\nDatabase seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();