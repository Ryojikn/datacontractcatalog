import { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/admin';
import { useProductStore } from '@/stores/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download
} from 'lucide-react';
import type { AccessHistoryEntry } from '@/types';

export function AccessHistoryTab() {
  const { products, fetchProducts } = useProductStore();
  const { fetchAccessHistory, accessHistory, loading } = useAdminStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<AccessHistoryEntry[]>([]);

  // Load products on component mount
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Load access history when product is selected
  useEffect(() => {
    if (selectedProductId) {
      fetchAccessHistory(selectedProductId);
    }
  }, [selectedProductId, fetchAccessHistory]);

  // Filter history based on search term
  useEffect(() => {
    if (!accessHistory) {
      setFilteredHistory([]);
      return;
    }

    const filtered = accessHistory.filter(entry =>
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.grantedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.revokedBy && entry.revokedBy.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredHistory(filtered);
  }, [accessHistory, searchTerm]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const getActionIcon = (action: AccessHistoryEntry['action']) => {
    switch (action) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'renewed':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'revoked':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: AccessHistoryEntry['action']) => {
    switch (action) {
      case 'granted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'renewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (grantedAt: string, endDate?: string) => {
    const start = new Date(grantedAt);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const exportHistory = () => {
    if (!filteredHistory.length || !selectedProduct) return;

    const csvContent = [
      ['User Name', 'User Email', 'Action', 'Granted At', 'Expires At', 'Revoked At', 'Granted By', 'Revoked By', 'Access Level', 'Duration (days)', 'Reason'].join(','),
      ...filteredHistory.map(entry => [
        entry.userName,
        entry.userEmail,
        entry.action,
        entry.grantedAt,
        entry.expiresAt || '',
        entry.revokedAt || '',
        entry.grantedBy,
        entry.revokedBy || '',
        entry.accessLevel,
        entry.duration || calculateDuration(entry.grantedAt, entry.revokedAt || entry.expiresAt),
        entry.reason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-history-${selectedProduct.name}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Access History</h2>
        </div>
        {selectedProductId && filteredHistory.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportHistory}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Data Product</CardTitle>
          <CardDescription>
            Choose a data product to view its complete access grant history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-select">Data Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product-select">
                <SelectValue placeholder="Select a data product..." />
              </SelectTrigger>
              <SelectContent>
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

          {selectedProduct && (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      {selectedProductId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user name, email, or administrator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access History List */}
      {selectedProductId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Access History</CardTitle>
                <CardDescription>
                  {filteredHistory.length} {filteredHistory.length === 1 ? 'entry' : 'entries'} found
                  {searchTerm && ` for "${searchTerm}"`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading access history...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Access History Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `No access history entries match "${searchTerm}"`
                    : selectedProductId 
                      ? 'This data product has no access history yet'
                      : 'Select a data product to view its access history'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((entry, index) => (
                  <div key={entry.id}>
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {entry.userEmail}
                            </Badge>
                            <Badge 
                              className={`text-xs border ${getActionColor(entry.action)}`}
                              variant="outline"
                            >
                              {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {entry.accessLevel}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Granted: {formatDate(entry.grantedAt)}</span>
                          </div>
                          
                          {entry.expiresAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Expires: {formatDate(entry.expiresAt)}</span>
                            </div>
                          )}
                          
                          {entry.revokedAt && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-3 w-3" />
                              <span>Revoked: {formatDate(entry.revokedAt)}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>By: {entry.grantedBy}</span>
                          </div>

                          {entry.revokedBy && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>Revoked by: {entry.revokedBy}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              Duration: {entry.duration || calculateDuration(entry.grantedAt, entry.revokedAt || entry.expiresAt)} days
                            </span>
                          </div>
                        </div>

                        {entry.reason && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            <span className="font-medium">Reason: </span>
                            {entry.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < filteredHistory.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AccessHistoryTab;