# Assessment Application Design System Documentation

## Overview

This design system provides a comprehensive set of UI components, design tokens, and guidelines for building consistent, accessible, and visually appealing user interfaces for the assessment application. It follows the UX improvement suggestions to create a more polished, professional experience.

## Color Palette

### Primary Colors
- **Primary:** `#3B6E8F` - Soft teal-blue, used for primary actions and key UI elements
- **Secondary:** `#47B39D` - Mint green, used for success states and complementary UI elements
- **Accent:** `#EC6B56` - Coral accent, used for highlights and important notifications

### Background Colors
- **Main Background:** `#F2F7F9` - Light blue-gray for the application background
- **Card Background:** `#FFFFFF` - White for card backgrounds
- **Subtle Background:** `#E0E7EC` - Subtle gray for secondary containers

### Interactive States
- **Unselected:** `#D8E1E8` - Light gray border for unselected elements
- **Selected:** `#47B39D` - Mint green for selected elements
- **Hover:** `#EBF5F2` - Light mint for hover states

### Text Colors
- **Heading:** `#202A37` - Dark blue-gray for headings
- **Body:** `#3E4D5C` - Medium blue-gray for body text
- **Light:** `#6E7A89` - Light blue-gray for secondary text

### Status Colors
- **Success:** `#36A157` - Green for success states
- **Warning:** `#FFAB00` - Amber for warning states
- **Error:** `#DC2626` - Red for error states
- **Info:** `#8ABDED` - Blue for information states

## Typography

### Font Family
- **Primary Font:** `Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Font Sizes
- **Heading:** `24px`
- **Question:** `18px`
- **Option:** `16px`
- **Caption:** `14px`
- **Small:** `12px`

### Font Weights
- **Regular:** `400`
- **Medium:** `500`
- **Semibold:** `600`
- **Bold:** `700`

### Line Heights
- **Heading:** `1.3`
- **Question:** `1.5`
- **Option:** `1.4`

### Letter Spacing
- **Heading:** `-0.2px`
- **Body:** `-0.1px`
- **Button:** `0.5px`

## Spacing System

Based on an 8px grid system, with all spacing values as multiples or fractions of 8px:

- `0`: `0px`
- `1`: `4px` (0.5 × 8px)
- `2`: `8px` (1 × 8px)
- `3`: `12px` (1.5 × 8px)
- `4`: `16px` (2 × 8px)
- `5`: `20px` (2.5 × 8px)
- `6`: `24px` (3 × 8px)
- `7`: `28px` (3.5 × 8px)
- `8`: `32px` (4 × 8px)
- `9`: `36px` (4.5 × 8px)
- `10`: `40px` (5 × 8px)
- `12`: `48px` (6 × 8px)
- `14`: `56px` (7 × 8px)
- `16`: `64px` (8 × 8px)
- `20`: `80px` (10 × 8px)
- `24`: `96px` (12 × 8px)

### Specific Spacing Guidelines
- **Card Padding:** `28px`
- **Question-Option Gap:** `32px`
- **Option Gap:** `20px`
- **Question Group Gap:** `48px`

## Elevation System

### Shadows
- **Card Shadow:** `box-shadow: 0 2px 8px rgba(71, 179, 157, 0.08)`
- **Floating Shadow:** `box-shadow: 0 4px 12px rgba(59, 110, 143, 0.12)`
- **Focus Shadow:** `box-shadow: 0 0 0 2px rgba(236, 107, 86, 0.2)`

## Borders and Radiuses

### Border Radiuses
- **Small:** `3px`
- **Medium:** `4px`
- **Large:** `8px`
- **Extra Large:** `12px`
- **2XL:** `16px`
- **Full:** `9999px` (fully rounded)

### Border Widths
- **Thin:** `1px`
- **Regular:** `2px`
- **Thick:** `3px`

## Animation and Transitions

### Transition Durations
- **Fast:** `100ms ease-in-out`
- **Base:** `200ms ease-in-out`
- **Slow:** `300ms ease-in-out`
- **Emphasis:** `400ms cubic-bezier(0.4, 0, 0.2, 1)`

### Animation Keyframes
- **fadeIn:** Fade in animation
- **slideInUp:** Slide up animation
- **slideInRight:** Slide right animation
- **pulse:** Pulse effect
- **celebrate:** Celebration animation for milestones

## Texture Patterns

### Background Textures
- **Grain:** Subtle noise texture (4% opacity)
- **Diagonal Lines:** Diagonal pattern for section headers (8% opacity)
- **Topographic:** Subtle pattern for card backgrounds (2% opacity)

## Component Guidelines

### Cards
- Use the `Card` component for all container elements
- Apply appropriate elevation based on hierarchy:
  - `base` for standard cards
  - `floating` for elements that need to stand out
  - `focus` for elements in focus state
- Use `withTexture` for subtle background patterns

```tsx
<Card 
  variant="default"
  padding="large"
  elevation="base"
  withTexture={true}
>
  Content goes here
</Card>
```

### Buttons
- Use the `Button` component with the appropriate variant:
  - `primary` for primary actions
  - `secondary` for secondary actions
  - `next` for navigation actions
  - `text` for subtle actions
- Apply appropriate spacing and sizes

```tsx
<Button variant="next" onClick={handleNext}>
  Next
</Button>
```

### Form Elements
- Use consistent styling for all form elements
- Implement proper focus states using the focus ring
- Provide error states and helper text

#### RadioButton
```tsx
<RadioButton
  id="option-1"
  name="question"
  value="1"
  checked={selectedValue === "1"}
  onChange={handleChange}
  label="Option 1"
/>
```

#### TextField
```tsx
<TextField
  id="response"
  name="response"
  label="Your answer"
  value={value}
  onChange={handleChange}
  error={error}
/>
```

### Progress Indicators
- Use the `ProgressBar` component to show progress
- Show both numeric and percentage indicators
- Implement milestone celebrations at key points (25%, 50%, 75%, 100%)

```tsx
<ProgressBar
  value={currentStep}
  max={totalSteps}
  showLabels={true}
  showPercentage={true}
  animated={true}
/>
```

### Loading States
- Use branded loading spinners with the primary color palette
- Provide meaningful loading text
- Consider skeleton loaders for content

```tsx
<LoadingSpinner size="medium" label="Loading your assessment..." />
```

### Empty States
- Use consistent empty state messaging
- Provide helpful guidance and next steps
- Include subtle brand illustrations

```tsx
<EmptyState
  title="No assessments available"
  description="You don't have any active assessments at the moment."
  action={<Button variant="primary">Create Assessment</Button>}
/>
```

## Accessibility Guidelines

- Ensure text contrast meets WCAG 2.1 AA standards (4.5:1 minimum)
- Support keyboard navigation with visible focus indicators
- Respect user preferences for reduced motion
- Provide alternative text for all images and icons
- Use semantic HTML elements appropriately

## Export Formats

This design system is available in the following formats:
- **Code:** React components with TypeScript
- **Figma:** Component library and design tokens
- **Storybook:** Interactive component documentation
- **CSS Variables:** For custom implementations

## Usage Example

```tsx
import { Card, ProgressBar, RadioButton, Button } from '@/components/ui';

function QuestionComponent() {
  return (
    <Card 
      variant="default" 
      padding="large"
      elevation="base"
      withTexture={true}
    >
      <ProgressBar value={3} max={10} showLabels={true} />
      
      <h3 className="text-question font-semibold text-heading leading-question tracking-heading mt-8">
        What is your preferred communication style?
      </h3>
      
      <div className="mt-8 space-y-5">
        <RadioButton
          id="option-1"
          name="question"
          value="1"
          checked={selectedValue === "1"}
          onChange={handleChange}
          label="Direct and concise"
        />
        
        <RadioButton
          id="option-2"
          name="question"
          value="2"
          checked={selectedValue === "2"}
          onChange={handleChange}
          label="Detailed and comprehensive"
        />
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button variant="next" onClick={handleNext}>
          Next
        </Button>
      </div>
    </Card>
  );
}
``` 