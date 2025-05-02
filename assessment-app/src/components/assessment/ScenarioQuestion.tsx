export function ScenarioQuestion({ block, scenario, answer, onAnswer }: ScenarioQuestionProps) {
  console.log("[DEBUG] ScenarioQuestion props:", { block, scenario, answer });
  console.log("[DEBUG] Block questions:", block.questions);
  
  // Handle different scenario types
  const isTimedResponse = block.block_type === 'scenario' && block.description?.includes('Timed');
  console.log("[DEBUG] Is timed response:", isTimedResponse);
  const hasOptions = scenario.scenario_options && scenario.scenario_options.length > 0;
  
  // For multiple-choice scenarios
  const initialOption = answer?.selected_option_id || answer?.scenario_option_id;
  const [selectedOption, setSelectedOption] = useState<number | undefined>(initialOption);
  
  // For text response scenarios
  const initialText = answer?.text_answer || '';
  const [textAnswer, setTextAnswer] = useState<string>(initialText);
  
  // When answer changes externally, update local state
  useEffect(() => {
    if (hasOptions) {
      const newOptionId = answer?.selected_option_id || answer?.scenario_option_id;
      if (newOptionId !== selectedOption) {
        setSelectedOption(newOptionId);
      }
    } else {
      const newText = answer?.text_answer || '';
      if (newText !== textAnswer) {
        setTextAnswer(newText);
      }
    }
  }, [answer, selectedOption, textAnswer, hasOptions]);
  
  // Get related questions for this scenario
  const relatedQuestions = block.questions || [];
  console.log("[DEBUG] Related questions:", relatedQuestions);
  
  // Find the first question related to this scenario - could be multiple-choice or textarea
  // For timed scenarios, we need a textarea question
  let question;
  if (isTimedResponse) {
    question = relatedQuestions.find(q => q.question_type === 'textarea');
    console.log("[DEBUG] Looking for textarea question:", question);
    // If no textarea found, look for any question
    if (!question) {
      question = relatedQuestions[0];
      console.log("[DEBUG] Falling back to first question:", question);
    }
  } else {
    question = relatedQuestions.find(q => q.question_type === 'multiple-choice');
    console.log("[DEBUG] Looking for multiple-choice question:", question);
  }
  
} 