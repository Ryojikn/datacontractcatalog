import { AccessHistoryTab } from '../access-history-tab';
import { useAdminStore } from '@/stores/admin';
import { useProductStore } from '@/stores/product';

// Mock data for demonstration
const mockProducts = [
  {
    id: 'product-1',
    name: 'Customer Analytics Dataset',
    dataContractId: 'contract-1',
    technology: 'Python',
    description: 'Customer behavior analytics and segmentation data',
    configJson: {},
    github: {
      repoName: 'customer-analytics',
      repoUrl: 'https://github.com/company/customer-analytics',
      pagesUrl: 'https://company.github.io/customer-analytics'
    }
  },
  {
    id: 'product-2',
    name: 'Sales Performance Data',
    dataContractId: 'contract-2',
    technology: 'SQL',
    description: 'Sales metrics, performance indicators, and revenue data',
    configJson: {},
    github: {
      repoName: 'sales-data',
      repoUrl: 'https://github.com/company/sales-data',
      pagesUrl: 'https://company.github.io/sales-data'
    }
  },
  {
    id: 'product-3',
    name: 'Marketing Campaign Data',
    dataContractId: 'contract-3',
    technology: 'R',
    description: 'Marketing campaign effectiveness and ROI analysis',
    configJson: {},
    github: {
      repoName: 'marketing-campaigns',
      repoUrl: 'https://github.com/company/marketing-campaigns',
      pagesUrl: 'https://company.github.io/marketing-campaigns'
    }
  }
];

const mockAccessHistory = [
  {
    id: 'hist-1',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    userId: 'user-1',
    userName: 'John Smith',
    userEmail: 'john.smith@company.com',
    action: 'granted' as const,
    grantedAt: '2024-01-15T10:30:00Z',
    expiresAt: '2024-04-15T10:30:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'read' as const,
    duration: 90
  },
  {
    id: 'hist-2',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    action: 'granted' as const,
    grantedAt: '2024-01-20T14:15:00Z',
    expiresAt: '2024-03-20T14:15:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'write' as const,
    duration: 60
  },
  {
    id: 'hist-3',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    action: 'renewed' as const,
    grantedAt: '2024-03-18T09:00:00Z',
    expiresAt: '2024-06-18T09:00:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'write' as const,
    duration: 92
  },
  {
    id: 'hist-4',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    userId: 'user-3',
    userName: 'Mike Wilson',
    userEmail: 'mike.wilson@company.com',
    action: 'revoked' as const,
    grantedAt: '2024-02-01T11:45:00Z',
    expiresAt: '2024-03-01T11:45:00Z',
    revokedAt: '2024-02-25T16:30:00Z',
    grantedBy: 'admin@company.com',
    revokedBy: 'admin@company.com',
    accessLevel: 'read' as const,
    duration: 24,
    reason: 'Policy violation - unauthorized data sharing'
  },
  {
    id: 'hist-5',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    userId: 'user-4',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@company.com',
    action: 'expired' as const,
    grantedAt: '2024-01-10T08:00:00Z',
    expiresAt: '2024-02-10T08:00:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'admin' as const,
    duration: 31
  }
];

// Override the stores with mock data for demo
const originalUseProductStore = useProductStore;
const originalUseAdminStore = useAdminStore;

// Mock the stores for demo purposes
(useProductStore as any) = () => ({
  products: mockProducts,
  fetchProducts: () => Promise.resolve(),
  loading: false,
  error: null
});

(useAdminStore as any) = () => ({
  accessHistory: mockAccessHistory,
  fetchAccessHistory: (productId: string) => {
    console.log('Demo: Fetching access history for product:', productId);
    return Promise.resolve();
  },
  loading: false,
  error: null
});

export function AccessHistoryTabDemo() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Access History Tab Demo</h1>
        <p className="text-muted-foreground">
          This demo shows the Access History tab functionality with mock data. 
          Select a data product to view its complete access grant history.
        </p>
      </div>
      
      <div className="border rounded-lg p-4 bg-card">
        <AccessHistoryTab />
      </div>
      
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Features Demonstrated:</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Product selection dropdown with technology badges</li>
          <li>Access history timeline with different action types (granted, renewed, revoked, expired)</li>
          <li>Color-coded action badges and icons</li>
          <li>User search functionality</li>
          <li>Detailed access information including dates, administrators, and reasons</li>
          <li>CSV export functionality</li>
          <li>Responsive design for mobile and desktop</li>
          <li>Loading states and empty states</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6">Mock Data Includes:</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li><strong>John Smith</strong> - Granted read access (90 days)</li>
          <li><strong>Sarah Johnson</strong> - Granted write access, then renewed</li>
          <li><strong>Mike Wilson</strong> - Access revoked due to policy violation</li>
          <li><strong>Emily Davis</strong> - Admin access that expired naturally</li>
        </ul>
      </div>
    </div>
  );
}

// Restore original stores after demo
export const restoreStores = () => {
  (useProductStore as any) = originalUseProductStore;
  (useAdminStore as any) = originalUseAdminStore;
};

export default AccessHistoryTabDemo;