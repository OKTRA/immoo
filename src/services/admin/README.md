# Admin Services

This directory contains services for the admin functionality of the Immoo application.

## Services Overview

### ActivityTrackingService

Tracks user activities throughout the system for admin monitoring and analytics.

**Key Features:**
- Track user registrations, property creations, agency verifications
- Track payment events and user reports
- Retrieve activity history for users and admin dashboard

**Usage Example:**
```typescript
import { ActivityTrackingService } from '@/services/admin/activityTrackingService';

// Track a new user registration
await ActivityTrackingService.trackUserRegistration(
  userId, 
  'user@example.com'
);

// Track property creation
await ActivityTrackingService.trackPropertyCreation(
  userId, 
  'Beautiful Apartment', 
  'apartment'
);

// Get recent activities for admin dashboard
const activities = await ActivityTrackingService.getRecentActivities(10);
```

### SupportTicketService

Manages support tickets and user reports for admin review and resolution.

**Key Features:**
- Create and manage support tickets
- Update ticket status and assign to admins
- Get ticket statistics and filtered views
- Handle ticket resolution with notes

**Usage Example:**
```typescript
import { SupportTicketService } from '@/services/admin/supportTicketService';

// Create a new support ticket
const ticket = await SupportTicketService.createTicket({
  user_id: userId,
  subject: 'Payment Issue',
  description: 'Unable to complete payment',
  status: 'open',
  priority: 'high',
  category: 'payment'
});

// Get open tickets count for dashboard
const openCount = await SupportTicketService.getOpenTicketsCount();

// Update ticket status
await SupportTicketService.updateTicketStatus(
  ticketId, 
  'resolved', 
  'Issue resolved by updating payment method'
);
```

## Database Tables

### user_activities
Stores user activity logs for admin monitoring.

**Columns:**
- `id`: Unique identifier
- `user_id`: Reference to profiles table
- `activity_type`: Type of activity (e.g., 'user_registration', 'property_created')
- `description`: Human-readable description
- `metadata`: JSON data with additional context
- `created_at`: Timestamp of activity

### support_tickets
Stores user support requests and reports.

**Columns:**
- `id`: Unique identifier
- `user_id`: Reference to profiles table
- `subject`: Ticket subject/title
- `description`: Detailed description
- `status`: Current status (open, in_progress, resolved, closed)
- `priority`: Priority level (low, medium, high, urgent)
- `category`: Ticket category
- `assigned_to`: Admin user assigned to ticket
- `resolution_notes`: Notes when resolving ticket
- `created_at`, `updated_at`, `resolved_at`: Timestamps

## Security

Both tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only view their own activities and tickets
- Admins can view all activities and tickets
- Admins can update ticket statuses and assignments

## Integration

These services are designed to be:
- **Independent**: Can be used without affecting other functionality
- **Error-resistant**: Gracefully handle database errors and missing data
- **Type-safe**: Full TypeScript support with proper interfaces
- **Performance-optimized**: Efficient queries with proper indexing
