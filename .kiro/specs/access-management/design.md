# Design Document

## Overview

The Access Management feature introduces a comprehensive administration interface for managing data access requests and permissions within the data contract catalog platform. The design leverages existing UI components, store patterns, and notification systems while introducing new data models and workflows for access lifecycle management.

The administration page will be implemented as a new route with a tabbed interface, following the established patterns in the codebase. It will integrate with the existing access request store and notification system while extending them with new administrative capabilities.

## Architecture

### Component Architecture

```
AdminPage
├── AdminHeader (page header with refresh controls)
├── Tabs (Radix UI tabs component)
│   ├── PendingApprovalsTab
│   │   ├── PendingApprovalsList
│   │   ├── ApprovalActionDialog
│   │   └── DeclineCommentDialog
│   └── CurrentAccessTab
│       ├── CurrentAccessList
│       ├── AccessActionDialog
│       └── RevocationNoticeDialog
└── AdminFooter (optional)
```

### Store Architecture

The design extends the existing store pattern with a new `adminStore` that manages:
- Administrative access data
- Pending approvals workflow
- Current access management
- Notification scheduling for access revocations

### Route Integration

- New route: `/admin` or `/administration`
- Protected route requiring admin privileges
- Integrated with existing navigation structure

## Components and Interfaces

### Core Components

#### AdminPage
Main container component that orchestrates the tabbed interface and manages overall state.

**Props:**
```typescript
interface AdminPageProps {
  className?: string;
}
```

#### PendingApprovalsTab
Displays and manages pending access requests with approval/decline functionality.

**Key Features:**
- Sortable list of pending requests
- Inline approval actions
- Bulk operations support
- Real-time updates

#### CurrentAccessTab
Manages active access permissions with renewal and revocation capabilities.

**Key Features:**
- Access expiration tracking
- Renewal workflow
- Scheduled revocation with notifications
- Immediate revocation option

#### ApprovalActionDialog
Modal dialog for confirming approval/decline actions with comment support.

**Props:**
```typescript
interface ApprovalActionDialogProps {
  request: PendingAccessRequest;
  action: 'approve' | 'decline';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
  commentTemplates?: CommentTemplate[];
}
```

#### DeclineCommentDialog
Specialized dialog for decline actions with predefined comment templates.

**Features:**
- Dropdown/selection of predefined templates
- Editable comment field
- Template categories (security, policy, justification)

### Data Models

#### PendingAccessRequest
Extends the existing `AccessRequest` interface with administrative metadata:

```typescript
interface PendingAccessRequest extends AccessRequest {
  priority: 'low' | 'medium' | 'high';
  daysWaiting: number;
  adminNotes?: string;
  escalated?: boolean;
}
```

#### CurrentAccess
New interface for tracking active access permissions:

```typescript
interface CurrentAccess {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  grantedAt: string;
  expiresAt: string;
  grantedBy: string;
  accessLevel: 'read' | 'write' | 'admin';
  status: 'active' | 'expiring_soon' | 'scheduled_for_revocation';
  revocationScheduledAt?: string;
  revocationNotificationSent?: boolean;
}
```

#### CommentTemplate
Template system for standardized decline comments:

```typescript
interface CommentTemplate {
  id: string;
  category: 'security' | 'policy' | 'justification' | 'technical';
  title: string;
  content: string;
  variables?: string[]; // For dynamic content like {productName}
}
```

#### AccessRevocationNotice
Notification scheduling for access revocations:

```typescript
interface AccessRevocationNotice {
  id: string;
  accessId: string;
  userId: string;
  scheduledRevocationDate: string;
  notificationDate: string;
  notificationSent: boolean;
  remindersSent: number;
  createdAt: string;
}
```

## Data Models

### Store Extensions

#### AdminStore
New Zustand store for administrative operations:

```typescript
interface AdminStore {
  // State
  pendingRequests: PendingAccessRequest[];
  currentAccess: CurrentAccess[];
  commentTemplates: CommentTemplate[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPendingRequests: () => Promise<void>;
  fetchCurrentAccess: () => Promise<void>;
  approveRequest: (requestId: string, comment?: string) => Promise<void>;
  declineRequest: (requestId: string, comment: string) => Promise<void>;
  renewAccess: (accessId: string) => Promise<void>;
  scheduleRevocation: (accessId: string) => Promise<void>;
  forceRevocation: (accessId: string) => Promise<void>;
  loadCommentTemplates: () => Promise<void>;
}
```

### Database Schema Extensions

#### access_permissions table
```sql
CREATE TABLE access_permissions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  granted_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  granted_by VARCHAR(255) NOT NULL,
  access_level ENUM('read', 'write', 'admin') DEFAULT 'read',
  status ENUM('active', 'expiring_soon', 'scheduled_for_revocation') DEFAULT 'active',
  revocation_scheduled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### comment_templates table
```sql
CREATE TABLE comment_templates (
  id VARCHAR(255) PRIMARY KEY,
  category ENUM('security', 'policy', 'justification', 'technical'),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### revocation_notices table
```sql
CREATE TABLE revocation_notices (
  id VARCHAR(255) PRIMARY KEY,
  access_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  scheduled_revocation_date TIMESTAMP NOT NULL,
  notification_date TIMESTAMP NOT NULL,
  notification_sent BOOLEAN DEFAULT FALSE,
  reminders_sent INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (access_id) REFERENCES access_permissions(id)
);
```

## Error Handling

### Error Boundaries
- Wrap admin components in error boundaries
- Graceful degradation for failed operations
- User-friendly error messages

### Validation
- Client-side validation for comment requirements
- Server-side validation for access operations
- Optimistic updates with rollback capability

### Network Resilience
- Retry mechanisms for failed operations
- Offline state handling
- Loading states for all async operations

## Testing Strategy

### Unit Tests
- Component rendering and interaction tests
- Store action and state management tests
- Utility function tests for date calculations and formatting

### Integration Tests
- End-to-end approval/decline workflows
- Access renewal and revocation processes
- Notification scheduling and delivery

### Component Tests
- Dialog interactions and form submissions
- Tab navigation and state persistence
- List sorting and filtering functionality

### Mock Data Strategy
- Comprehensive mock data for all access states
- Edge case scenarios (expired access, failed notifications)
- Performance testing with large datasets

### Accessibility Testing
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Focus management in dialogs and modals

## Security Considerations

### Authorization
- Role-based access control for admin features
- API endpoint protection for administrative operations
- Audit logging for all administrative actions

### Data Protection
- Sensitive data handling in comments and justifications
- Secure storage of access permissions
- Data retention policies for revoked access

### Input Validation
- Sanitization of comment inputs
- Validation of date ranges and expiration periods
- Protection against injection attacks

## Performance Considerations

### Data Loading
- Pagination for large access lists
- Lazy loading of detailed access information
- Caching strategies for frequently accessed data

### Real-time Updates
- WebSocket integration for live updates
- Optimistic UI updates for better responsiveness
- Efficient re-rendering strategies

### Memory Management
- Proper cleanup of subscriptions and timers
- Efficient list virtualization for large datasets
- Memoization of expensive calculations

## Notification Integration

### Existing System Extension
The design leverages the existing notification store and extends it with:

#### New Notification Types
```typescript
type AdminNotificationType = 
  | 'access_expiring_soon'
  | 'access_revocation_scheduled'
  | 'access_revocation_imminent'
  | 'access_renewed'
  | 'access_force_revoked';
```

#### Notification Scheduling
- Integration with existing notification system
- Scheduled notifications for 30-day, 7-day, and 1-day warnings
- Batch processing for multiple expiring access permissions

#### Email Integration
- Template-based email notifications
- Configurable notification preferences
- Delivery tracking and retry mechanisms

## UI/UX Design Patterns

### Consistent Design Language
- Follows existing component library patterns
- Consistent spacing, typography, and color schemes
- Responsive design for mobile and desktop

### Interaction Patterns
- Confirmation dialogs for destructive actions
- Progressive disclosure for complex operations
- Contextual help and tooltips

### Accessibility
- ARIA labels and roles for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus indicators and skip links

## Migration and Deployment

### Data Migration
- Scripts to populate initial access permissions from existing requests
- Comment template seeding
- Historical data preservation

### Feature Flags
- Gradual rollout capability
- A/B testing for UI variations
- Rollback mechanisms

### Monitoring
- Performance metrics for admin operations
- Error tracking and alerting
- Usage analytics for feature adoption