'use client';

import { useEffect } from 'react';

/**
 * EmergencyRadioFix - Fixes radio button styling issues
 * 
 * This component directly manipulates DOM elements to fix styling issues
 * with radio buttons and question options when CSS alone isn't working.
 */
export const EmergencyRadioFix: React.FC = () => {
  useEffect(() => {
    // Fix function for radio buttons
    const fixRadioButtons = () => {
      // Target all radio inputs
      const radioInputs = document.querySelectorAll('input[type="radio"]');
      
      if (radioInputs.length === 0) {
        return; // No radio inputs found, exit early
      }
      
      radioInputs.forEach((input) => {
        // Get parent label if it exists
        const label = input.closest('label');
        if (!label) return;
        
        // Add ARIA attributes for accessibility
        label.setAttribute('role', 'radio');
        label.setAttribute('aria-checked', (input as HTMLInputElement).checked ? 'true' : 'false');
        
        // Add proper classes
        label.classList.add('radio-button');
        
        // Hide the original input for consistent styling
        if (input instanceof HTMLElement) {
          input.style.cssText = 'position: absolute; opacity: 0;';
        }
        
        // Find or create the custom radio button element
        let customRadio = label.querySelector('.radio-button__checkmark');
        if (!customRadio) {
          customRadio = document.createElement('span');
          customRadio.className = 'radio-button__checkmark';
          // Insert the custom radio after the input
          input.insertAdjacentElement('afterend', customRadio);
        }
        
        // Update ARIA state when radio is clicked
        input.addEventListener('change', () => {
          if ((input as HTMLInputElement).checked) {
            // Update all related radio buttons in the same group
            const name = input.getAttribute('name');
            if (name) {
              document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((relatedInput) => {
                const relatedLabel = relatedInput.closest('label');
                if (relatedLabel) {
                  relatedLabel.setAttribute('aria-checked', (relatedInput as HTMLInputElement).checked ? 'true' : 'false');
                }
              });
            }
          }
        });
      });
    };
    
    // Fix function for question options
    const fixQuestionOptions = () => {
      const options = document.querySelectorAll('.question-option');
      
      options.forEach((option) => {
        if (!(option instanceof HTMLElement)) return;
        
        const input = option.querySelector('input[type="radio"]');
        if (!input) return;
        
        // Update the selected state based on the input
        if ((input as HTMLInputElement).checked) {
          option.classList.add('selected');
        } else {
          option.classList.remove('selected');
        }
        
        // Add click handler to update state
        option.addEventListener('click', () => {
          if (input instanceof HTMLInputElement) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Update the selected state
            const name = input.getAttribute('name');
            if (name) {
              document.querySelectorAll(`.question-option input[type="radio"][name="${name}"]`).forEach((relatedInput) => {
                const relatedOption = relatedInput.closest('.question-option');
                if (relatedOption) {
                  if (relatedInput === input) {
                    relatedOption.classList.add('selected');
                  } else {
                    relatedOption.classList.remove('selected');
                  }
                }
              });
            }
          }
        });
      });
    };
    
    // Apply fixes
    const applyFixes = () => {
      fixRadioButtons();
      fixQuestionOptions();
    };
    
    // Call immediately
    applyFixes();
    
    // Set up MutationObserver to detect new elements
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.querySelector('input[type="radio"]') || 
                  node.classList.contains('question-option') ||
                  node.tagName === 'INPUT' && node.getAttribute('type') === 'radio') {
                shouldReapply = true;
              }
            }
          });
        }
      });
      
      if (shouldReapply) {
        applyFixes();
      }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null;
};

export default EmergencyRadioFix; 