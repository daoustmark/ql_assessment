# Assessment Application Styling Guidelines

## Project Overview

This is a Next.js application that allows users to take multi-part assessments. The app has been built with:

- **Framework:** Next.js (App Router) with TypeScript
- **Backend/DB:** Supabase (Postgres, Auth, Storage)
- **Current Styling:** Tailwind CSS + daisyUI
- **File Structure:** Uses `src/` directory pattern

The application lets users log in, take multi-part assessments with various question types (multiple-choice, written responses, video recording), and saves all answers to Supabase.

## ⚠️ CRITICAL WARNING ⚠️

**DO NOT replace live data with mock data under any circumstances.** The application is connected to a production database with real assessment data. Any changes should only affect styling and not interfere with:

- Database connections
- Data fetching logic
- Authentication flows
- Question rendering logic
- Answer submission functionality

## File Structure

```
assessment-app/
├── src/
│   ├── app/                   # Routes & Pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── assessment/        # Assessment flow pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable UI components
│   │   ├── auth/              # Authentication components
│   │   ├── assessment/        # Assessment components
│   │   └── ui/                # General UI components
│   ├── lib/                   # Utilities
│   │   ├── supabase/          # Supabase clients
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
├── supabase/                  # Supabase migrations
└── tailwind.config.ts         # Tailwind configuration
```

## Styling Requirements

### Color Palette

#### Primary Colors

1. **Bespoke Navy**
   - Hex: `#0a1a3d`
   - RGB: 10, 26, 61
   - CMYK: 100, 89, 43, 54
   - Tertiary Colors:
     - 75%: `#364259`
     - 50%: `#737d94`
     - 25%: `#c2c9d9`

2. **Renew Mint**
   - Hex: `#b8f7b8`
   - RGB: 184, 247, 184
   - CMYK: 27, 0, 38, 0
   - Tertiary Colors:
     - 75%: `#c7fac7`
     - 50%: `#d9f7d9`
     - 25%: `#edfaed`

3. **Nomad Blue**
   - Hex: `#297dde`
   - RGB: 41, 125, 222
   - CMYK: 77, 49, 0, 0
   - Tertiary Colors:
     - 75%: `#61a1e3`
     - 50%: `#8abded`
     - 25%: `#c9e3fa`

4. **Constant Green**
   - Hex: `#36a157`
   - RGB: 54, 161, 87
   - CMYK: 78, 12, 89, 1
   - Tertiary Colors:
     - 75%: `#6bc47a`
     - 50%: `#99d4a3`
     - 25%: `#ccedd4`

### Style Guidelines

1. Create a clean, professional interface using the provided color palette
2. Use **Bespoke Navy** as the primary color for headers, navigation, and primary backgrounds
3. Use **Renew Mint** for success states, confirmations, and accent elements
4. Use **Nomad Blue** for interactive elements, buttons, and links
5. Use **Constant Green** for progress indicators and positive actions
6. Implement responsive design for mobile and desktop views
7. Ensure all UI components follow accessibility best practices

## Implementation Approach

1. Update the Tailwind configuration to include the custom color palette
2. Create a consistent component styling system that applies across the application
3. Style the main layout, navigation, and common UI elements first
4. Then style assessment-specific components like question cards, option selectors, etc.
5. Update form elements and interactive components
6. Ensure responsive behavior across all device sizes

## Pages to Style

1. Authentication pages (login, signup)
2. Dashboard/Home page
3. Assessment selection page
4. Individual assessment pages with different question types:
   - Multiple choice questions
   - Text response questions
   - Video recording interface

## Components to Focus On

1. Question cards
2. Navigation elements
3. Progress indicators
4. Buttons and call-to-action elements
5. Form inputs
6. Modal dialogs

Remember to maintain the existing functionality while improving the visual design and user experience. 