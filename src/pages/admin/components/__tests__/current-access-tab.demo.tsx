import { CurrentAccessTab } from '../current-access-tab';
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

const mockCurrentAccess = [
  {
    id: 'access-1',
    userId: 'user-1',
    userName: 'John Smith',
    userEmail: 'john.smith@company.com',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    grantedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'read' as const,
    status: 'active' as const
  },
  {
    id: 'access-2',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    productId: 'product-1',
    productName: 'Customer Analytics Dataset',
    grantedAt: '2024-01-20T14:30:00Z',
    expiresAt: '2024-03-20T14:30:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'write' as const,
    status: 'expiring_soon' as const
  },
  {
    id: 'access-3',
    userId: 'user-3',
    userName: 'Mike Wilson',
    userEmail: 'mike.wilson@company.com',
    productId: 'product-2',
    productName: 'Sales Performance Data',
    grantedAt: '2024-02-01T11:45:00Z',
    expiresAt: '2024-04-01T11:45:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'admin' as const,
    status: 'active' as const
  },
  {
    id: 'access-4',
    userId: 'user-4',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@company.com',
    productId: 'product-2',
    productName: 'Sales Performance Data',
    grantedAt: '2024-01-10T08:00:00Z',
    expiresAt: '2024-02-15T08:00:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'read' as const,
    status: 'scheduled_for_revocation' as const,
    revocationScheduledAt: '2024-02-10T08:00:00Z'
  },
  {
    id: 'access-5',
    userId: 'user-5',
    userName: 'Alex Rodriguez',
    userEmail: 'alex.rodriguez@company.com',
    productId: 'product-3',
    productName: 'Marketing Campaign Data',
    grantedAt: '2024-01-25T16:20:00Z',
    expiresAt: '2024-04-25T16:20:00Z',
    grantedBy: 'admin@company.com',
    accessLevel: 'write' as const,
    status: 'active' as const
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
  currentAccess: mockCurrentAccess,
  fetchCurrentAccess: () => {
    console.log('Demo: Fetching all current access');
    return Promise.resolve();
  },
  fetchCurrentAccessByProduct: (productId: string) => {
    console.log('Demo: Fetching current access for product:', productId);
    return Promise.resolve();
  },
  renewAccess: (accessId: string) => {
    console.log('Demo: Renewing access for:', accessId);
    return Promise.resolve();
  },
  bulkRenewAccess: (accessIds: string[]) => {
    console.log('Demo: Bulk renewing access for:', accessIds);
    return Promise.resolve();
  },
  scheduleRevocation: (accessId: string) => {
    console.log('Demo: Scheduling revocation for:', accessId);
    return Promise.resolve();
  },
  forceRevocation: (accessId: string) => {
    console.log('Demo: Force revoking access for:', accessId);
    return Promise.resolve();
  },
  loading: false,
  error: null
});

export function CurrentAccessTabDemo() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Enhanced Current Access Tab Demo</h1>
        <p className="text-muted-foreground">
          This demo shows the enhanced Current Access tab with product filtering functionality. 
          You can now filter current access by specific data products or view all access across products.
        </p>
      </div>
      
      <div className="border rounded-lg p-4 bg-card">
        <CurrentAccessTab />
      </div>
      
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">New Features Added:</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li><strong>Product Selection Required:</strong> Must select a specific data product to view current access</li>
          <li><strong>Product Information:</strong> Display selected product details with technology badges</li>
          <li><strong>Access Count:</strong> Shows number of current access entries for selected product</li>
          <li><strong>Empty State:</strong> Clear guidance when no product is selected</li>
          <li><strong>Consistent UI:</strong> Matches the design pattern from Access History tab</li>
          <li><strong>Responsive Design:</strong> Works well on mobile and desktop devices</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6">Mock Data Distribution:</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li><strong>Customer Analytics Dataset:</strong> 2 users (John Smith - read, Sarah Johnson - write expiring soon)</li>
          <li><strong>Sales Performance Data:</strong> 2 users (Mike Wilson - admin, Emily Davis - read scheduled for revocation)</li>
          <li><strong>Marketing Campaign Data:</strong> 1 user (Alex Rodriguez - write active)</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6">How to Use:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Start by selecting a specific data product from the dropdown</li>
          <li>View the product information card and access count</li>
          <li>See the current access permissions list for that product</li>
          <li>Use existing functionality like renewal, revocation, and bulk operations</li>
          <li>Apply additional filters and sorting as available in the current access list</li>
        </ol>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Integration Benefits:</h3>
          <p className="text-sm text-blue-800">
            This enhancement provides administrators with focused access management by requiring them to 
            select a specific data product before viewing current access permissions. This approach 
            reduces cognitive load, improves performance, and ensures administrators are always working 
            within the context of a specific product, leading to more accurate and intentional access management decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

// Restore original stores after demo
export const restoreStores = () => {
  (useProductStore as any) = originalUseProductStore;
  (useAdminStore as any) = originalUseAdminStore;
};

export default CurrentAccessTabDemo;