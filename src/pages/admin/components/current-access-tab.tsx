import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/admin';
import { useProductStore } from '@/stores/product';
import { CurrentAccessList } from './current-access-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Shield, Activity } from 'lucide-react';

interface CurrentAccessTabProps {
  className?: string;
}

const CurrentAccessTab: React.FC<CurrentAccessTabProps> = ({ className }) => {
  const { 
    currentAccess, 
    loading, 
    error, 
    fetchCurrentAccess,
    fetchCurrentAccessByProduct,
    renewAccess,
    bulkRenewAccess,
    scheduleRevocation,
    forceRevocation
  } = useAdminStore();
  
  const { products, fetchProducts } = useProductStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('all');

  // Load products on component mount
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Fetch current access data when component mounts or when product selection changes
  useEffect(() => {
    if (selectedProductId && selectedProductId !== 'all') {
      fetchCurrentAccessByProduct(selectedProductId);
    } else {
      fetchCurrentAccess();
    }
  }, [selectedProductId, fetchCurrentAccess, fetchCurrentAccessByProduct]);

  // Handle action callbacks
  const handleRenewAccess = async (accessId: string) => {
    try {
      await renewAccess(accessId);
    } catch (error) {
      console.error('Failed to renew access:', error);
    }
  };

  const handleBulkRenewAccess = async (accessIds: string[]) => {
    try {
      await bulkRenewAccess(accessIds);
    } catch (error) {
      console.error('Failed to bulk renew access:', error);
    }
  };

  const handleScheduleRevocation = async (accessId: string) => {
    try {
      await scheduleRevocation(accessId);
    } catch (error) {
      console.error('Failed to schedule revocation:', error);
    }
  };

  const handleForceRevocation = async (accessId: string) => {
    try {
      await forceRevocation(accessId);
    } catch (error) {
      console.error('Failed to force revocation:', error);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const filteredCurrentAccess = selectedProductId && selectedProductId !== 'all'
    ? currentAccess.filter(access => access.productId === selectedProductId)
    : currentAccess;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Current Access Management</h2>
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter by Data Product</CardTitle>
          <CardDescription>
            Select a specific data product to view only its current access, or leave unselected to view all access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-filter">Data Product (Optional)</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product-filter">
                <SelectValue placeholder="All products (no filter)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="text-muted-foreground">All products (no filter)</span>
                </SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <span>{product.name}</span>
                      {product.technology && (
                        <Badge variant="secondary" className="text-xs">
                          {product.technology}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && selectedProductId !== 'all' && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedProduct.name}</span>
                {selectedProduct.technology && (
                  <Badge variant="outline" className="text-xs">
                    {selectedProduct.technology}
                  </Badge>
                )}
              </div>
              {selectedProduct.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Showing {filteredCurrentAccess.length} current access {filteredCurrentAccess.length === 1 ? 'entry' : 'entries'} for this product
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Access List */}
      <CurrentAccessList
        currentAccess={filteredCurrentAccess}
        loading={loading}
        error={error}
        onRenewAccess={handleRenewAccess}
        onBulkRenewAccess={handleBulkRenewAccess}
        onScheduleRevocation={handleScheduleRevocation}
        onForceRevocation={handleForceRevocation}
      />
    </div>
  );
};

export default CurrentAccessTab;
export { CurrentAccessTab };