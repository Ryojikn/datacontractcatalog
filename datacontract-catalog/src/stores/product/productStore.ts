import { create } from 'zustand';
import type { DataProduct, ExecutionInfo, QualityAlert, DeploymentInfo } from '../../types';
import { mockDataService } from '../../services/mockDataService';

interface ProductState {
  // Data
  products: DataProduct[];
  selectedProduct: DataProduct | null;
  executionHistory: ExecutionInfo[];
  qualityAlerts: QualityAlert[];
  deployments: DeploymentInfo[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  productLoading: boolean;
  productError: string | null;
  executionsLoading: boolean;
  executionsError: string | null;
  alertsLoading: boolean;
  alertsError: string | null;
  deploymentsLoading: boolean;
  deploymentsError: string | null;
  
  // Actions
  fetchProductsByContract: (contractId: string) => Promise<void>;
  selectProduct: (id: string) => Promise<void>;
  fetchExecutionHistory: (productId: string) => Promise<void>;
  fetchQualityAlerts: (productId: string) => Promise<void>;
  fetchDeployments: (productId: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  clearSelectedProduct: () => void;
  clearProducts: () => void;
  clearError: () => void;
  clearProductError: () => void;
  clearExecutionsError: () => void;
  clearAlertsError: () => void;
  clearDeploymentsError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  executionHistory: [],
  qualityAlerts: [],
  deployments: [],
  loading: false,
  error: null,
  productLoading: false,
  productError: null,
  executionsLoading: false,
  executionsError: null,
  alertsLoading: false,
  alertsError: null,
  deploymentsLoading: false,
  deploymentsError: null,

  // Fetch products by contract ID
  fetchProductsByContract: async (contractId: string) => {
    set({ loading: true, error: null });
    
    try {
      const products = await mockDataService.getProductsByContract(contractId);
      set({ 
        products,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      set({ 
        loading: false, 
        error: errorMessage,
        products: [] 
      });
    }
  },

  // Select a product by ID and fetch its details
  selectProduct: async (id: string) => {
    set({ productLoading: true, productError: null });
    
    try {
      const product = await mockDataService.getProductById(id);
      
      if (!product) {
        throw new Error(`Product with id ${id} not found`);
      }
      
      set({ 
        selectedProduct: product,
        productLoading: false,
        productError: null 
      });
      
      // Automatically fetch related data for the selected product
      const { fetchExecutionHistory, fetchQualityAlerts, fetchDeployments } = get();
      await Promise.all([
        fetchExecutionHistory(id),
        fetchQualityAlerts(id),
        fetchDeployments(id)
      ]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select product';
      set({ 
        productLoading: false, 
        productError: errorMessage,
        selectedProduct: null 
      });
    }
  },

  // Fetch execution history for a product
  fetchExecutionHistory: async (productId: string) => {
    set({ executionsLoading: true, executionsError: null });
    
    try {
      const executionHistory = await mockDataService.getExecutionHistory(productId);
      set({ 
        executionHistory,
        executionsLoading: false,
        executionsError: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch execution history';
      set({ 
        executionsLoading: false, 
        executionsError: errorMessage,
        executionHistory: [] 
      });
    }
  },

  // Fetch quality alerts for a product
  fetchQualityAlerts: async (productId: string) => {
    set({ alertsLoading: true, alertsError: null });
    
    try {
      const qualityAlerts = await mockDataService.getQualityAlerts(productId);
      set({ 
        qualityAlerts,
        alertsLoading: false,
        alertsError: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quality alerts';
      set({ 
        alertsLoading: false, 
        alertsError: errorMessage,
        qualityAlerts: [] 
      });
    }
  },

  // Fetch deployments for a product
  fetchDeployments: async (productId: string) => {
    set({ deploymentsLoading: true, deploymentsError: null });
    
    try {
      const deployments = await mockDataService.getDeployments(productId);
      set({ 
        deployments,
        deploymentsLoading: false,
        deploymentsError: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch deployments';
      set({ 
        deploymentsLoading: false, 
        deploymentsError: errorMessage,
        deployments: [] 
      });
    }
  },

  // Search products by query
  searchProducts: async (query: string) => {
    if (!query.trim()) {
      set({ products: [], error: null });
      return;
    }

    set({ loading: true, error: null });
    
    try {
      const products = await mockDataService.searchProducts(query);
      set({ 
        products,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search products';
      set({ 
        loading: false, 
        error: errorMessage,
        products: [] 
      });
    }
  },

  // Clear selected product and related data
  clearSelectedProduct: () => {
    set({ 
      selectedProduct: null,
      executionHistory: [],
      qualityAlerts: [],
      deployments: [],
      productError: null,
      executionsError: null,
      alertsError: null,
      deploymentsError: null
    });
  },

  // Clear products list
  clearProducts: () => {
    set({ 
      products: [],
      error: null 
    });
  },

  // Clear main error state
  clearError: () => {
    set({ error: null });
  },

  // Clear product-specific error state
  clearProductError: () => {
    set({ productError: null });
  },

  // Clear executions error state
  clearExecutionsError: () => {
    set({ executionsError: null });
  },

  // Clear alerts error state
  clearAlertsError: () => {
    set({ alertsError: null });
  },

  // Clear deployments error state
  clearDeploymentsError: () => {
    set({ deploymentsError: null });
  }
}));

// Selector hooks for better performance and convenience
export const useProducts = () => useProductStore(state => state.products);
export const useSelectedProduct = () => useProductStore(state => state.selectedProduct);
export const useExecutionHistory = () => useProductStore(state => state.executionHistory);
export const useQualityAlerts = () => useProductStore(state => state.qualityAlerts);
export const useDeployments = () => useProductStore(state => state.deployments);

// Loading state hooks
export const useProductLoading = () => useProductStore(state => state.loading);
export const useProductDetailLoading = () => useProductStore(state => state.productLoading);
export const useExecutionsLoading = () => useProductStore(state => state.executionsLoading);
export const useAlertsLoading = () => useProductStore(state => state.alertsLoading);
export const useDeploymentsLoading = () => useProductStore(state => state.deploymentsLoading);

// Error state hooks
export const useProductError = () => useProductStore(state => state.error);
export const useProductDetailError = () => useProductStore(state => state.productError);
export const useExecutionsError = () => useProductStore(state => state.executionsError);
export const useAlertsError = () => useProductStore(state => state.alertsError);
export const useDeploymentsError = () => useProductStore(state => state.deploymentsError);

// Action hooks
export const useProductActions = () => useProductStore(state => ({
  fetchProductsByContract: state.fetchProductsByContract,
  selectProduct: state.selectProduct,
  fetchExecutionHistory: state.fetchExecutionHistory,
  fetchQualityAlerts: state.fetchQualityAlerts,
  fetchDeployments: state.fetchDeployments,
  searchProducts: state.searchProducts,
  clearSelectedProduct: state.clearSelectedProduct,
  clearProducts: state.clearProducts,
  clearError: state.clearError,
  clearProductError: state.clearProductError,
  clearExecutionsError: state.clearExecutionsError,
  clearAlertsError: state.clearAlertsError,
  clearDeploymentsError: state.clearDeploymentsError
}));