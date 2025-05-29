# Assessment Invitation System

## Overview

The Assessment Invitation System allows admins to invite specific people to take assessments via email-based unique links. This system provides security, tracking, and a seamless user experience without requiring account creation.

## Key Features

### ✅ **Email-Based Invitations**
- Send personalized invitations to specific email addresses
- Each invitation generates a unique, secure token
- Optional custom messages and invitee names for personalization

### ✅ **Magic Link Access**
- Recipients click a unique URL to access the assessment
- No login or account creation required
- Automatic identity verification via email

### ✅ **Security & Control**
- Tokens expire after configurable time (1-30 days, default 7)
- One-time use tokens prevent unauthorized sharing
- Prevents duplicate invitations to same email for same assessment

### ✅ **Complete Tracking**
- Track invitation status: pending, accepted, expired, cancelled
- View who was invited vs. who actually took the assessment
- Link assessment attempts back to specific invitations

### ✅ **Admin Management**
- Send invitations directly from assessment pages
- View all invitations with filtering and search
- Resend, cancel, or copy invitation links
- Comprehensive statistics and analytics

## Implementation Architecture

### Database Schema

**New Tables:**
```sql
-- Main invitations table
assessment_invitations (
  id, assessment_id, invited_email, invitation_token,
  invited_at, expires_at, used_at, status,
  invitation_name, custom_message, invited_by_user_id
)

-- Enhanced assessment_attempts table
assessment_attempts (
  -- Existing fields...
  invitation_id,      -- Links attempt to invitation
  invitee_email,      -- Email from invitation  
  invitee_name        -- Name from invitation
)
```

**Database Functions:**
- `generate_invitation_token()` - Creates unique, secure tokens
- `cleanup_expired_invitations()` - Automatically marks expired invitations

### API Layer

**Key Functions** (`src/lib/supabase/invitation-queries.ts`):
- `createAssessmentInvitation()` - Create new invitation
- `getInvitationByToken()` - Validate invitation from URL
- `useInvitation()` - Convert invitation to assessment attempt
- `getAllInvitations()` - Admin view of all invitations
- `getInvitationStats()` - System-wide statistics

### User Interface

**Invitation Flow:**
1. **Admin sends invitation** → Generates unique URL
2. **User receives email** → Contains magic link
3. **User clicks link** → Validates invitation, shows preview
4. **User starts assessment** → Creates attempt, marks invitation used

**Admin Interface:**
- Dashboard with invitation statistics
- Assessment-specific invitation management
- Global invitation management page
- Invitation form with validation

## Setup Instructions

### 1. Database Migration

Run the migration in your Supabase SQL editor:

```sql
-- See: invitation_system_migration.sql
-- This creates all necessary tables, indexes, and functions
```

### 2. Verify Implementation

The following files implement the invitation system:

**Database Layer:**
- `invitation_system_migration.sql` - Database schema
- `src/lib/supabase/invitation-queries.ts` - API functions
- `src/types/index.ts` - Updated with invitation types

**User Interface:**
- `src/app/assessment/invite/[token]/page.tsx` - Magic link landing page
- `src/components/admin/InviteForm.tsx` - Invitation creation form
- `src/app/admin/invitations/page.tsx` - Invitation management
- `src/components/ui/table.tsx` - Table component for admin views

**Enhanced Pages:**
- `src/app/admin/page.tsx` - Dashboard with invitation stats
- `src/app/admin/assessments/[id]/page.tsx` - Assessment-specific invitations

## Usage Guide

### For Admins

#### Sending Invitations

1. **From Assessment Page:**
   - Go to Admin → Assessments → [Assessment] → Invitations tab
   - Fill in email address and optional details
   - Click "Send Invitation"

2. **From Global Management:**
   - Go to Admin → Manage Invitations
   - Use global invitation management interface

#### Managing Invitations

**View All Invitations:**
- Filter by status (pending, accepted, expired)
- Search by email, name, or assessment
- View detailed statistics

**Invitation Actions:**
- **Resend:** Generate new token with extended expiry
- **Cancel:** Mark invitation as cancelled
- **Copy Link:** Get invitation URL for manual sharing

#### Tracking Results

**Dashboard Metrics:**
- Total invitations sent
- Acceptance rate
- Pending vs. completed invitations

**Assessment-Specific:**
- Invitation stats per assessment
- Link attempts back to invitations
- View responses from invited users

### For Invitees

#### Receiving Invitations

1. **Email contains:**
   - Assessment title and description
   - Personalized greeting (if name provided)
   - Custom message from admin (if included)
   - Unique magic link

2. **Clicking the link:**
   - Validates invitation automatically
   - Shows assessment details
   - Displays expiration date
   - One-click start button

#### Taking Assessment

1. **Identity verification:**
   - No login required
   - Identified by invitation email
   - Name displayed if provided

2. **Assessment experience:**
   - Standard assessment flow
   - Responses linked to invitation
   - One-time use (link becomes invalid)

## Security Features

### Token Security
- Cryptographically secure random tokens
- URL-safe encoding
- Unique constraint prevents duplicates

### Access Control
- Tokens expire automatically
- One-time use prevents sharing
- Email-specific invitation binding

### Data Protection
- No sensitive data in URLs
- Invitation details stored securely
- Automatic cleanup of expired invitations

## Configuration Options

### Expiration Settings
```typescript
// Default: 7 days, range: 1-30 days
expires_in_days: 7
```

### Invitation URLs
```
Format: /assessment/invite/[unique-token]
Example: /assessment/invite/Kj2mN8pQ7rX3wL9vB4cF6hY
```

### Status Management
- `pending` - Invitation sent, not yet used
- `accepted` - User started assessment
- `expired` - Past expiration date
- `cancelled` - Manually cancelled by admin

## Statistics & Analytics

### System-Wide Metrics
- Total invitations sent
- Acceptance rate percentage
- Pending vs. expired invitations
- Invitation-to-completion ratio

### Assessment-Specific
- Invitations per assessment
- Response rates by assessment
- Time from invitation to completion

### User Tracking
- Which invitations led to completions
- User identification via email
- Response quality tracking

## Troubleshooting

### Common Issues

**Invitation not found:**
- Check token validity
- Verify expiration date
- Ensure invitation hasn't been used

**Duplicate invitation error:**
- Check for existing pending invitation
- Cancel old invitation before resending
- Use different email address

**Token generation fails:**
- Verify database functions are installed
- Check database permissions
- Review Supabase logs

### Database Maintenance

**Clean up expired invitations:**
```sql
SELECT cleanup_expired_invitations();
```

**View invitation statistics:**
```sql
SELECT status, COUNT(*) 
FROM assessment_invitations 
GROUP BY status;
```

## Integration Points

### Email Integration (Future)
The system is designed to support email sending:
- Invitation creation generates all necessary data
- Custom message and personalization support
- Unsubscribe and tracking capabilities

### Authentication Integration
- Works alongside existing auth systems
- Can upgrade invitees to full accounts
- Preserves invitation history

### Reporting Integration
- Invitation data available for analytics
- Links invitations to assessment performance
- Supports A/B testing of invitation approaches

## Best Practices

### For Admins
1. **Use descriptive names** when inviting users
2. **Set reasonable expiration dates** (7-14 days recommended)
3. **Include custom messages** for important assessments
4. **Monitor acceptance rates** to improve invitation quality
5. **Clean up expired invitations** regularly

### For System Administrators
1. **Set up monitoring** for invitation usage patterns
2. **Regular database cleanup** of old invitations
3. **Monitor token generation** for security issues
4. **Track invitation-to-completion** funnel metrics

## Future Enhancements

### Planned Features
- **Email sending integration** - Automatic email delivery
- **Invitation templates** - Reusable invitation formats
- **Bulk invitations** - CSV upload for multiple invitees
- **Reminder system** - Follow-up for pending invitations
- **Advanced analytics** - Detailed invitation performance metrics

### API Extensions
- REST endpoints for invitation management
- Webhook support for invitation events
- Integration with external user management systems

---

## Quick Reference

### Magic Link URL Format
```
https://yourapp.com/assessment/invite/[unique-token]
```

### Key Database Tables
- `assessment_invitations` - Main invitation data
- `assessment_attempts` - Enhanced with invitation linking

### Admin Access Points
- `/admin/invitations` - Global invitation management
- `/admin/assessments/[id]` - Assessment-specific invitations
- `/admin` - Dashboard with invitation stats

### User Experience Flow
1. Receive email → 2. Click link → 3. View invitation → 4. Start assessment → 5. Complete normally 