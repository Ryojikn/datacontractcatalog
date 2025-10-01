import { create } from 'zustand';
import type { DataContract } from '../../types';
import { mockDataService } from '../../services/mockDataService';

interface ContractState {
  // Data
  contracts: DataContract[];
  selectedContract: DataContract | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  contractLoading: boolean;
  contractError: string | null;
  
  // Actions
  fetchContractsByCollection: (collectionId: string) => Promise<void>;
  selectContract: (id: string) => Promise<void>;
  searchContracts: (query: string) => Promise<void>;
  clearSelectedContract: () => void;
  clearContracts: () => void;
  clearError: () => void;
  clearContractError: () => void;
}

export const useContractStore = create<ContractState>((set) => ({
  // Initial state
  contracts: [],
  selectedContract: null,
  loading: false,
  error: null,
  contractLoading: false,
  contractError: null,

  // Fetch contracts by collection ID
  fetchContractsByCollection: async (collectionId: string) => {
    set({ loading: true, error: null });
    
    try {
      const contracts = await mockDataService.getContractsByCollection(collectionId);
      set({ 
        contracts,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contracts';
      set({ 
        loading: false, 
        error: errorMessage,
        contracts: [] 
      });
    }
  },

  // Select a contract by ID and fetch its details
  selectContract: async (id: string) => {
    set({ contractLoading: true, contractError: null });
    
    try {
      const contract = await mockDataService.getContractById(id);
      
      if (!contract) {
        throw new Error(`Contract with id ${id} not found`);
      }
      
      set({ 
        selectedContract: contract,
        contractLoading: false,
        contractError: null 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select contract';
      set({ 
        contractLoading: false, 
        contractError: errorMessage,
        selectedContract: null 
      });
    }
  },

  // Search contracts by query
  searchContracts: async (query: string) => {
    if (!query.trim()) {
      set({ contracts: [], error: null });
      return;
    }

    set({ loading: true, error: null });
    
    try {
      const contracts = await mockDataService.searchContracts(query);
      set({ 
        contracts,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search contracts';
      set({ 
        loading: false, 
        error: errorMessage,
        contracts: [] 
      });
    }
  },

  // Clear selected contract
  clearSelectedContract: () => {
    set({ 
      selectedContract: null,
      contractError: null 
    });
  },

  // Clear contracts list
  clearContracts: () => {
    set({ 
      contracts: [],
      error: null 
    });
  },

  // Clear main error state
  clearError: () => {
    set({ error: null });
  },

  // Clear contract-specific error state
  clearContractError: () => {
    set({ contractError: null });
  }
}));

// Selector hooks for better performance and convenience
export const useContracts = () => useContractStore(state => state.contracts);
export const useSelectedContract = () => useContractStore(state => state.selectedContract);
export const useContractLoading = () => useContractStore(state => state.loading);
export const useContractError = () => useContractStore(state => state.error);
export const useContractDetailLoading = () => useContractStore(state => state.contractLoading);
export const useContractDetailError = () => useContractStore(state => state.contractError);

// Action hooks
export const useContractActions = () => useContractStore(state => ({
  fetchContractsByCollection: state.fetchContractsByCollection,
  selectContract: state.selectContract,
  searchContracts: state.searchContracts,
  clearSelectedContract: state.clearSelectedContract,
  clearContracts: state.clearContracts,
  clearError: state.clearError,
  clearContractError: state.clearContractError
}));