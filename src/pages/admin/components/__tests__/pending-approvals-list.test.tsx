import React from 'react';
import { PendingApprovalsList } from '../pending-approvals-list';
import type { PendingAccessRequest } from '@/types';

// Mock data for testing
const mockRequests: PendingAccessRequest[] = [
  {
    id: 'req-001',
    productId: 'product-001',
    productName: 'Credit Card Transactions ETL',
    requesterId: 'user-001',
    requesterName: 'João Silva',
    requesterEmail: 'joao.silva@company.com',
    bdac: 'ANALYTICS_TEAM',
    businessJustification: 'Need access to credit card transaction data for monthly risk analysis and fraud detection model training.',
    status: 'pending',
    createdAt: '2024-02-08T10:30:00Z',
    updatedAt: '2024-02-08T10:30:00Z',
    priority: 'high',
    daysWaiting: 3,
    adminNotes: 'High priority due to regulatory compliance requirements',
    escalated: false
  },
  {
    id: 'req-002',
    productId: 'product-002',
    productName: 'Customer Segmentation Data',
    requesterId: 'user-002',
    requesterName: 'Maria Santos',
    requesterEmail: 'maria.santos@company.com',
    bdac: 'MARKETING_TEAM',
    businessJustification: 'Required for customer segmentation analysis and targeted marketing campaigns.',
    status: 'pending',
    createdAt: '2024-02-07T14:15:00Z',
    updatedAt: '2024-02-07T14:15:00Z',
    priority: 'medium',
    daysWaiting: 4,
    escalated: false
  },
  {
    id: 'req-003',
    productId: 'product-003',
    productName: 'Financial Risk Metrics',
    requesterId: 'user-003',
    requesterName: 'Carlos Oliveira',
    requesterEmail: 'carlos.oliveira@company.com',
    bdac: 'RISK_MANAGEMENT',
    businessJustification: 'Access needed for quarterly risk assessment and regulatory reporting.',
    status: 'pending',
    createdAt: '2024-02-06T09:00:00Z',
    updatedAt: '2024-02-06T09:00:00Z',
    priority: 'low',
    daysWaiting: 5,
    escalated: false
  }
];

// Test component rendering and functionality
const TestComponent: React.FC = () => {
  const [approvedRequests, setApprovedRequests] = React.useState<string[]>([]);
  const [declinedRequests, setDeclinedRequests] = React.useState<string[]>([]);

  const handleApprove = (requestId: string) => {
    setApprovedRequests(prev => [...prev, requestId]);
    console.log('Approved request:', requestId);
  };

  const handleDecline = (requestId: string) => {
    setDeclinedRequests(prev => [...prev, requestId]);
    console.log('Declined request:', requestId);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Approvals List Test</h1>
      
      <PendingApprovalsList
        requests={mockRequests}
        loading={false}
        error={null}
        onApprove={handleApprove}
        onDecline={handleDecline}
      />
      
      {approvedRequests.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">Approved Requests:</h3>
          <ul className="list-disc list-inside text-green-700">
            {approvedRequests.map(id => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      )}
      
      {declinedRequests.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800">Declined Requests:</h3>
          <ul className="list-disc list-inside text-red-700">
            {declinedRequests.map(id => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestComponent;