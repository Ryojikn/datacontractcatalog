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
import { ProductDetailSkeleton } from '@/components/loading'
import { ErrorMessage, NetworkError, NotFoundError } from '@/components/error'
import { OfflineBanner } from '@/components/offline'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { Tabs, TabsContent, TabsList, TabsTrigger, Button } from '@/components/ui'
import { ShoppingCart, Check } from 'lucide-react'
import type { BreadcrumbItem } from '@/types'

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const { 
    selectedProduct, 
    productLoading, 
    productError, 
    selectProduct,
    clearProductError 
  } = useProductStore()
  const { selectedContract, selectContract } = useContractStore()
  const { domains, fetchDomains } = useDomainStore()
  const { addToCart, isInCart, openCart } = useCartStore()
  const isOnline = useOnlineStatus()

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

  const handleRetry = () => {
    clearProductError()
    if (productId) {
      selectProduct(productId)
    }
  }

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-muted animate-pulse rounded mb-6 w-96" />
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (productError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OfflineBanner />
        <div className="min-h-[400px]">
          {!isOnline ? (
            <NetworkError onRetry={handleRetry} />
          ) : productError.includes('not found') ? (
            <NotFoundError 
              message="O produto solicitado não foi encontrado."
              onRetry={() => window.history.back()}
            />
          ) : (
            <ErrorMessage
              title="Erro ao carregar produto"
              message={productError}
              onRetry={handleRetry}
            />
          )}
        </div>
      </div>
    )
  }

  if (!selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OfflineBanner />
        <div className="min-h-[400px]">
          <NotFoundError 
            message="Produto não encontrado."
            onRetry={() => window.history.back()}
          />
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
      
      <OfflineBanner />
      
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