# Demo Data Fix for Current Access Tab

## Issue
When selecting any data product in the Current Access tab, no access permissions were being shown because the `fetchCurrentAccessByProduct` function was filtering existing mock data that didn't have matching product IDs with the actual products from the product store.

## Root Cause
The original implementation filtered static mock data by `productId`:
```typescript
const filteredAccess = mockCurrentAccess.filter(access => access.productId === productId)
```

Since the mock data had hardcoded product IDs that didn't match the dynamic product IDs from the product store, this always returned an empty array.

## Solution
Updated the `fetchCurrentAccessByProduct` function to generate dynamic demo data for any selected product, ensuring 3-8 access entries are always shown for demonstration purposes.

## Implementation Details

### **Dynamic Data Generation**
```typescript
// Generate demo current access data for the selected product
const demoUsers = [
  { id: 'user-001', name: 'Ana Costa', email: 'ana.costa@company.com' },
  { id: 'user-002', name: 'Pedro Almeida', email: 'pedro.almeida@company.com' },
  // ... 8 total users
];

const accessLevels: ('read' | 'write' | 'admin')[] = ['read', 'write', 'admin'];
const statuses: ('active' | 'expiring_soon' | 'scheduled_for_revocation')[] = ['active', 'expiring_soon', 'scheduled_for_revocation'];

// Generate 3-8 random access entries for the selected product
const numEntries = Math.floor(Math.random() * 6) + 3; // 3 to 8 entries
```

### **Realistic Data Patterns**
- **Random User Selection**: Picks 3-8 users from a pool of 8 demo users
- **Varied Access Levels**: Random distribution of read, write, and admin permissions
- **Different Statuses**: Mix of active, expiring soon, and scheduled for revocation
- **Realistic Dates**: 
  - Grant dates: 0-90 days ago
  - Expiration dates: 30-210 days from grant date
  - Revocation scheduling: 1-14 days from now (when applicable)

### **Product Name Mapping**
Updated the Current Access tab to use the actual product name from the selected product:
```typescript
const filteredCurrentAccess = selectedProductId && selectedProductId !== 'all'
  ? currentAccess.filter(access => access.productId === selectedProductId).map(access => ({
      ...access,
      productName: selectedProduct?.name || access.productName
    }))
  : currentAccess;
```

## Features of Generated Demo Data

### **User Variety**
- 8 different demo users with realistic Portuguese names
- Varied email addresses following company domain pattern
- Different combinations for each product selection

### **Access Patterns**
- **Read Access**: Most common, suitable for analysts and viewers
- **Write Access**: Moderate frequency, for data contributors
- **Admin Access**: Least common, for data stewards and administrators

### **Status Distribution**
- **Active**: Majority of access permissions (normal state)
- **Expiring Soon**: Some permissions nearing expiration (requires attention)
- **Scheduled for Revocation**: Few permissions marked for removal (action needed)

### **Temporal Realism**
- **Grant Dates**: Spread over the last 90 days
- **Expiration Dates**: Future dates with realistic durations (30-210 days)
- **Revocation Scheduling**: Near-future dates (1-14 days) for urgent attention

## Benefits

### **For Demonstration**
- **Always Shows Data**: Every product selection displays 3-8 access entries
- **Varied Scenarios**: Different combinations of users, levels, and statuses
- **Realistic Patterns**: Mimics real-world access management scenarios

### **For Testing**
- **Consistent Experience**: Reliable demo data for testing workflows
- **Edge Cases**: Includes expiring and scheduled-for-revocation scenarios
- **Bulk Operations**: Enough entries to test bulk renewal and revocation

### **For Development**
- **Dynamic Generation**: No need to maintain static mock data
- **Scalable Approach**: Works with any number of products
- **Easy Maintenance**: Single function generates all demo scenarios

## Files Modified
- `src/stores/admin/adminStore.ts` - Updated `fetchCurrentAccessByProduct` function
- `src/pages/admin/components/current-access-tab.tsx` - Added product name mapping

## Verification
- ✅ **Build Success**: All TypeScript compilation passes
- ✅ **Data Generation**: 3-8 entries generated for any selected product
- ✅ **Realistic Patterns**: Varied users, access levels, and statuses
- ✅ **Product Names**: Correct product names displayed in access list
- ✅ **All Features Work**: Renewal, revocation, and bulk operations functional

## Demo Data Examples

### **Sample Generated Access**
```typescript
{
  id: 'access-product-1-1',
  userId: 'user-001',
  userName: 'Ana Costa',
  userEmail: 'ana.costa@company.com',
  productId: 'product-1',
  productName: 'Customer Analytics Dataset', // Updated from actual product
  grantedAt: '2024-01-15T10:30:00Z',
  expiresAt: '2024-04-15T10:30:00Z',
  grantedBy: 'admin@company.com',
  accessLevel: 'read',
  status: 'active'
}
```

The fix ensures that administrators always see meaningful demo data when selecting any product, providing a complete and realistic experience for testing and demonstration purposes.