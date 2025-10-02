import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useProductStore } from '@/stores/product'
import { useContractStore } from '@/stores/contract'
import { useDomainStore } from '@/stores/domain'
import { useCartStore } from '@/stores/cart'
import { DocumentationTab } from '@/components/product'
import { YamlConfigTab } from '@/components/product'
import { DeploymentsModule } from '@/components/product'
import { ExecutionsModule } from '@/components/product'
import { QualityMonitorModule } from '@/components/product'
import { AccessRequestStatus } from '@/components/product'
import { Breadcrumb } from '@/components/layout'
import { Tabs, TabsContent, TabsList, TabsTrigger, Button } from '@/components/ui'
import { ShoppingCart, Check } from 'lucide-react'
import type { BreadcrumbItem } from '@/types'

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const { selectedProduct, loading, error, selectProduct } = useProductStore()
  const { selectedContract, selectContract } = useContractStore()
  const { domains, fetchDomains } = useDomainStore()
  const { addToCart, isInCart, openCart } = useCartStore()

  useEffect(() => {
    if (domains.length === 0) {
      fetchDomains()
    }
  }, [domains.length, fetchDomains])

  useEffect(() => {
    if (productId) {
      selectProduct(productId)
    }
  }, [productId, selectProduct])

  useEffect(() => {
    if (selectedProduct && selectedProduct.dataContractId) {
      selectContract(selectedProduct.dataContractId)
    }
  }, [selectedProduct, selectContract])

  if (!productId) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Error loading product: {error}</p>
        </div>
      </div>
    )
  }

  if (!selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    )
  }

  const domain = domains.find(d => 
    selectedContract && d.id === selectedContract.fundamentals.domain
  )
  const collection = domain?.collections.find(c => 
    selectedContract && c.id === selectedContract.fundamentals.collection
  )

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Domains', path: '/' },
    ...(domain ? [{ label: domain.name, path: `/domain/${domain.id}` }] : []),
    ...(collection ? [{ label: collection.name, path: `/domain/${domain?.id}/collection/${collection.id}` }] : []),
    ...(selectedContract ? [{ label: selectedContract.fundamentals.name, path: `/contract/${selectedContract.id}` }] : []),
    { label: selectedProduct.name, active: true }
  ]

  const productInCart = isInCart(selectedProduct.id)

  const handleAddToCart = () => {
    if (!productInCart) {
      addToCart(selectedProduct)
      // Show a brief success message and open cart
      setTimeout(() => {
        openCart()
      }, 500)
    } else {
      // If already in cart, just open the cart
      openCart()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{selectedProduct.name}</h1>
        <p className="text-muted-foreground mt-2">
          {selectedProduct.technology && `Technology: ${selectedProduct.technology}`}
          {selectedProduct.description && ` • ${selectedProduct.description}`}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="documentation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="yaml">YAML Config</TabsTrigger>
            </TabsList>
            <TabsContent value="documentation" className="mt-6">
              <DocumentationTab product={selectedProduct} />
            </TabsContent>
            <TabsContent value="yaml" className="mt-6">
              <YamlConfigTab product={selectedProduct} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Add to Cart Button */}
          <div className="border rounded-lg p-4 bg-card">
            <Button 
              onClick={handleAddToCart}
              className="w-full"
              size="sm"
              variant={productInCart ? "secondary" : "default"}
            >
              {productInCart ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {productInCart 
                ? "This product is in your cart. Click to view cart." 
                : "Add to cart for bulk access request"
              }
            </p>
          </div>

          <DeploymentsModule product={selectedProduct} />
          <ExecutionsModule product={selectedProduct} />
          <QualityMonitorModule product={selectedProduct} />
          <AccessRequestStatus product={selectedProduct} />
        </div>
      </div>


    </div>
  )
}