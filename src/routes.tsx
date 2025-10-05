import { Routes, Route } from 'react-router-dom'
import { RoleGuard } from '@/components/auth'
import { 
  DomainListPage, 
  CollectionListPage, 
  ContractListPage, 
  ContractDetailPage, 
  ProductDetailPage,
  DashboardPage,
  AdminPage,
  NotFoundPage 
} from '@/pages'

export function AppRoutes() {
  return (
    <Routes>
      {/* Domain routes */}
      <Route path="/" element={<DomainListPage />} />
      <Route path="/domain/:domainId" element={<CollectionListPage />} />
      
      {/* Collection routes */}
      <Route path="/domain/:domainId/collection/:collectionId" element={<ContractListPage />} />
      
      {/* Contract routes */}
      <Route path="/contract/:contractId" element={<ContractDetailPage />} />
      
      {/* Product routes */}
      <Route path="/product/:productId" element={<ProductDetailPage />} />
      
      {/* Dashboard route */}
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Admin route - Protected by role guard */}
      <Route 
        path="/admin" 
        element={
          <RoleGuard requiredRole="admin">
            <AdminPage />
          </RoleGuard>
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}