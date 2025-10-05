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

  // Fetch current access data when a specific product is selected
  useEffect(() => {
    if (selectedProductId && selectedProductId !== 'all') {
      fetchCurrentAccessByProduct(selectedProductId);
    }
    // Don't fetch anything when "all" is selected since we won't show the list
  }, [selectedProductId, fetchCurrentAccessByProduct]);

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
    ? currentAccess.filter(access => access.productId === selectedProductId).map(access => ({
        ...access,
        productName: selectedProduct?.name || access.productName
      }))
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
          <CardTitle className="text-base">Select Data Product</CardTitle>
          <CardDescription>
            Choose a specific data product to view and manage its current access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-filter">Data Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product-filter">
                <SelectValue placeholder="Select a data product..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="text-muted-foreground">-- Select a product --</span>
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

      {/* Current Access List - Only show when a specific product is selected */}
      {selectedProductId && selectedProductId !== 'all' ? (
        <CurrentAccessList
          currentAccess={filteredCurrentAccess}
          loading={loading}
          error={error}
          onRenewAccess={handleRenewAccess}
          onBulkRenewAccess={handleBulkRenewAccess}
          onScheduleRevocation={handleScheduleRevocation}
          onForceRevocation={handleForceRevocation}
        />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Data Product</h3>
              <p className="text-muted-foreground">
                Choose a data product from the dropdown above to view and manage its current access permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CurrentAccessTab;
export { CurrentAccessTab };