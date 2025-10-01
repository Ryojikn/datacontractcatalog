import { create } from 'zustand';
import type { Domain, Collection } from '../../types';
import { mockDataService } from '../../services/mockDataService';

interface DomainState {
  // Data
  domains: Domain[];
  selectedDomain: Domain | null;
  collections: Collection[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  collectionsLoading: boolean;
  collectionsError: string | null;
  
  // Actions
  fetchDomains: () => Promise<void>;
  selectDomain: (id: string) => Promise<void>;
  fetchCollectionsByDomain: (domainId: string) => Promise<void>;
  clearSelectedDomain: () => void;
  clearError: () => void;
  clearCollectionsError: () => void;
}

export const useDomainStore = create<DomainState>((set, get) => ({
  // Initial state
  domains: [],
  selectedDomain: null,
  collections: [],
  loading: false,
  error: null,
  collectionsLoading: false,
  collectionsError: null,

  // Fetch all domains
  fetchDomains: async () => {
    set({ loading: true, error: null });
    
    try {
      const domains = await mockDataService.getDomains();
      set({ 
        domains, 
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch domains';
      set({ 
        loading: false, 
        error: errorMessage,
        domains: [] 
      });
    }
  },

  // Select a domain by ID and fetch its details
  selectDomain: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const domain = await mockDataService.getDomainById(id);
      
      if (!domain) {
        throw new Error(`Domain with id ${id} not found`);
      }
      
      set({ 
        selectedDomain: domain,
        loading: false,
        error: null 
      });
      
      // Automatically fetch collections for the selected domain
      await get().fetchCollectionsByDomain(id);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select domain';
      set({ 
        loading: false, 
        error: errorMessage,
        selectedDomain: null 
      });
    }
  },

  // Fetch collections for a specific domain
  fetchCollectionsByDomain: async (domainId: string) => {
    set({ collectionsLoading: true, collectionsError: null });
    
    try {
      const collections = await mockDataService.getCollectionsByDomain(domainId);
      set({ 
        collections,
        collectionsLoading: false,
        collectionsError: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch collections';
      set({ 
        collectionsLoading: false, 
        collectionsError: errorMessage,
        collections: [] 
      });
    }
  },

  // Clear selected domain and related data
  clearSelectedDomain: () => {
    set({ 
      selectedDomain: null,
      collections: [],
      collectionsError: null 
    });
  },

  // Clear main error state
  clearError: () => {
    set({ error: null });
  },

  // Clear collections error state
  clearCollectionsError: () => {
    set({ collectionsError: null });
  }
}));

// Selector hooks for better performance and convenience
export const useDomains = () => useDomainStore(state => state.domains);
export const useSelectedDomain = () => useDomainStore(state => state.selectedDomain);
export const useDomainCollections = () => useDomainStore(state => state.collections);
export const useDomainLoading = () => useDomainStore(state => state.loading);
export const useDomainError = () => useDomainStore(state => state.error);
export const useCollectionsLoading = () => useDomainStore(state => state.collectionsLoading);
export const useCollectionsError = () => useDomainStore(state => state.collectionsError);

// Action hooks
export const useDomainActions = () => useDomainStore(state => ({
  fetchDomains: state.fetchDomains,
  selectDomain: state.selectDomain,
  fetchCollectionsByDomain: state.fetchCollectionsByDomain,
  clearSelectedDomain: state.clearSelectedDomain,
  clearError: state.clearError,
  clearCollectionsError: state.clearCollectionsError
}));