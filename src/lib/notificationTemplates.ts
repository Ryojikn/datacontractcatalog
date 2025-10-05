/**
 * Notification templates for access management
 * These templates provide consistent messaging for access-related notifications
 */

export interface NotificationTemplate {
  id: string;
  type: 'access_expiring_soon' | 'access_revocation_scheduled' | 'access_revocation_imminent' | 'access_renewed' | 'access_force_revoked';
  title: string;
  messageTemplate: string;
  variables: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  category: 'expiration' | 'revocation' | 'renewal' | 'administrative';
}

export const notificationTemplates: NotificationTemplate[] = [
  // Expiration notifications
  {
    id: 'expiring-30-days',
    type: 'access_expiring_soon',
    title: 'Access Expiring in 30 Days',
    messageTemplate: 'Your access to {productName} will expire in 30 days on {expirationDate}. Please request renewal if you need continued access to avoid interruption.',
    variables: ['productName', 'expirationDate'],
    urgencyLevel: 'low',
    category: 'expiration'
  },
  {
    id: 'expiring-7-days',
    type: 'access_expiring_soon',
    title: 'Access Expiring in 7 Days',
    messageTemplate: 'Your access to {productName} will expire in 7 days on {expirationDate}. Please request renewal immediately if you need continued access.',
    variables: ['productName', 'expirationDate'],
    urgencyLevel: 'medium',
    category: 'expiration'
  },
  {
    id: 'expiring-1-day',
    type: 'access_expiring_soon',
    title: 'Access Expiring Tomorrow',
    messageTemplate: '⚠️ URGENT: Your access to {productName} will expire tomorrow on {expirationDate}. This is your final reminder. Contact your administrator immediately if you need to extend access.',
    variables: ['productName', 'expirationDate'],
    urgencyLevel: 'critical',
    category: 'expiration'
  },

  // Revocation notifications
  {
    id: 'revocation-scheduled',
    type: 'access_revocation_scheduled',
    title: 'Access Revocation Scheduled',
    messageTemplate: 'Your access to {productName} is scheduled for revocation on {revocationDate}. You have 30 days to complete your work or request renewal. Contact your administrator if you need to extend access.',
    variables: ['productName', 'revocationDate'],
    urgencyLevel: 'medium',
    category: 'revocation'
  },
  {
    id: 'revocation-7-days',
    type: 'access_revocation_imminent',
    title: 'Access Revocation in 7 Days',
    messageTemplate: '⚠️ Your access to {productName} will be revoked in 7 days on {revocationDate}. Please complete your work or contact your administrator to request an extension.',
    variables: ['productName', 'revocationDate'],
    urgencyLevel: 'high',
    category: 'revocation'
  },
  {
    id: 'revocation-1-day',
    type: 'access_revocation_imminent',
    title: 'Access Revocation Imminent',
    messageTemplate: '🚫 URGENT: Your access to {productName} will be revoked tomorrow on {revocationDate}. This is your final notice. Contact your administrator immediately if you need to extend access.',
    variables: ['productName', 'revocationDate'],
    urgencyLevel: 'critical',
    category: 'revocation'
  },

  // Renewal notifications
  {
    id: 'access-renewed',
    type: 'access_renewed',
    title: 'Access Renewed Successfully',
    messageTemplate: '✅ Your access to {productName} has been renewed and will now expire on {newExpirationDate}. You can continue using this data product.',
    variables: ['productName', 'newExpirationDate'],
    urgencyLevel: 'low',
    category: 'renewal'
  },

  // Administrative notifications
  {
    id: 'force-revoked-security',
    type: 'access_force_revoked',
    title: 'Access Revoked - Security Violation',
    messageTemplate: '🚫 Your access to {productName} has been immediately revoked due to a security violation. Reason: {reason}. Contact your system administrator immediately if you believe this is an error.',
    variables: ['productName', 'reason'],
    urgencyLevel: 'critical',
    category: 'administrative'
  },
  {
    id: 'force-revoked-policy',
    type: 'access_force_revoked',
    title: 'Access Revoked - Policy Violation',
    messageTemplate: '🚫 Your access to {productName} has been immediately revoked due to a policy violation. Reason: {reason}. Please review the data governance policies and contact your administrator for clarification.',
    variables: ['productName', 'reason'],
    urgencyLevel: 'critical',
    category: 'administrative'
  },
  {
    id: 'force-revoked-administrative',
    type: 'access_force_revoked',
    title: 'Access Immediately Revoked',
    messageTemplate: '🚫 Your access to {productName} has been immediately revoked by an administrator.{reason} If you believe this is an error, please contact your system administrator immediately.',
    variables: ['productName', 'reason'],
    urgencyLevel: 'critical',
    category: 'administrative'
  }
];

/**
 * Get notification template by ID
 */
export function getNotificationTemplate(templateId: string): NotificationTemplate | undefined {
  return notificationTemplates.find(template => template.id === templateId);
}

/**
 * Get notification templates by type
 */
export function getNotificationTemplatesByType(type: NotificationTemplate['type']): NotificationTemplate[] {
  return notificationTemplates.filter(template => template.type === type);
}

/**
 * Get notification templates by category
 */
export function getNotificationTemplatesByCategory(category: NotificationTemplate['category']): NotificationTemplate[] {
  return notificationTemplates.filter(template => template.category === category);
}

/**
 * Get notification templates by urgency level
 */
export function getNotificationTemplatesByUrgency(urgencyLevel: NotificationTemplate['urgencyLevel']): NotificationTemplate[] {
  return notificationTemplates.filter(template => template.urgencyLevel === urgencyLevel);
}

/**
 * Populate notification template with variables
 */
export function populateNotificationTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>
): { title: string; message: string } {
  let populatedMessage = template.messageTemplate;
  
  // Replace all variables in the template
  template.variables.forEach(variable => {
    const value = variables[variable] || `{${variable}}`;
    const regex = new RegExp(`\\{${variable}\\}`, 'g');
    populatedMessage = populatedMessage.replace(regex, value);
  });
  
  return {
    title: template.title,
    message: populatedMessage
  };
}

/**
 * Get appropriate template based on days until expiration/revocation
 */
export function getExpirationTemplate(daysUntilExpiration: number): NotificationTemplate | undefined {
  if (daysUntilExpiration >= 30) {
    return getNotificationTemplate('expiring-30-days');
  } else if (daysUntilExpiration >= 7) {
    return getNotificationTemplate('expiring-7-days');
  } else if (daysUntilExpiration >= 1) {
    return getNotificationTemplate('expiring-1-day');
  }
  return undefined;
}

/**
 * Get appropriate revocation template based on days until revocation
 */
export function getRevocationTemplate(daysUntilRevocation: number): NotificationTemplate | undefined {
  if (daysUntilRevocation >= 30) {
    return getNotificationTemplate('revocation-scheduled');
  } else if (daysUntilRevocation >= 7) {
    return getNotificationTemplate('revocation-7-days');
  } else if (daysUntilRevocation >= 1) {
    return getNotificationTemplate('revocation-1-day');
  }
  return undefined;
}

/**
 * Format date for notification messages
 */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate days between two dates
 */
export function calculateDaysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Batch notification processing utilities
 */
export interface BatchNotificationRequest {
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  targetDate: string; // expiration or revocation date
  notificationType: 'expiration' | 'revocation';
  daysUntilTarget: number;
}

/**
 * Process batch notifications and return formatted notifications
 */
export function processBatchNotifications(requests: BatchNotificationRequest[]): Array<{
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  title: string;
  message: string;
  urgencyLevel: NotificationTemplate['urgencyLevel'];
  type: NotificationTemplate['type'];
}> {
  return requests.map(request => {
    const template = request.notificationType === 'expiration' 
      ? getExpirationTemplate(request.daysUntilTarget)
      : getRevocationTemplate(request.daysUntilTarget);
    
    if (!template) {
      throw new Error(`No template found for ${request.notificationType} with ${request.daysUntilTarget} days`);
    }
    
    const { title, message } = populateNotificationTemplate(template, {
      productName: request.productName,
      expirationDate: formatNotificationDate(request.targetDate),
      revocationDate: formatNotificationDate(request.targetDate),
      newExpirationDate: formatNotificationDate(request.targetDate)
    });
    
    return {
      userId: request.userId,
      userName: request.userName,
      userEmail: request.userEmail,
      productId: request.productId,
      productName: request.productName,
      title,
      message,
      urgencyLevel: template.urgencyLevel,
      type: template.type
    };
  });
}