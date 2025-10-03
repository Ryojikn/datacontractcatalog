import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  SearchQuery, 
  SearchResult, 
  SearchFilters, 
  AIResponse, 
  SearchConversation, 
  ConversationMessage,
  SearchAnalytics,
  SearchSuggestion,
  SearchIndex,
  SavedSearch,
  SearchAlert,
  SearchBookmark,
  UserSearchPreferences
} from '../../types';
import { searchService } from '../../services/searchService';

// Helper function for calculating next trigger time
function calculateNextTrigger(frequency: 'daily' | 'weekly' | 'monthly'): string {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  
  return now.toISOString();
}

interface SearchState {
  // Search state
  currentQuery: string;
  searchMode: 'traditional' | 'ai';
  isSearchOpen: boolean;
  
  // Results
  results: SearchResult[];
  aiResponse: AIResponse | null;
  isSearching: boolean;
  searchError: string | null;
  
  // Filters
  activeFilters: SearchFilters;
  
  // History and suggestions
  searchHistory: SearchQuery[];
  recentSearches: SearchQuery[];
  suggestions: SearchSuggestion[];
  
  // Conversations (AI mode)
  currentConversation: SearchConversation | null;
  conversations: SearchConversation[];
  
  // Analytics
  analytics: SearchAnalytics[];
  
  // Search index for fast retrieval
  searchIndex: SearchIndex | null;
  indexLastUpdated: string | null;
  
  // Advanced features
  savedSearches: SavedSearch[];
  searchAlerts: SearchAlert[];
  bookmarks: SearchBookmark[];
  userPreferences: UserSearchPreferences | null;
  
  // Actions
  openSearch: () => void;
  closeSearch: () => void;
  setSearchMode: (mode: 'traditional' | 'ai') => void;
  setQuery: (query: string) => void;
  executeSearch: (query: string, filters?: SearchFilters) => Promise<void>;
  executeAISearch: (query: string, conversationId?: string) => Promise<void>;
  clearResults: () => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  
  // History management
  addToHistory: (query: SearchQuery) => void;
  clearHistory: () => void;
  getRecentSearches: () => SearchQuery[];
  
  // Conversation management
  startNewConversation: () => void;
  addMessageToConversation: (message: ConversationMessage) => void;
  selectConversation: (id: string) => void;
  clearConversations: () => void;
  
  // Suggestions
  updateSuggestions: (query: string) => void;
  getSuggestions: (query: string) => SearchSuggestion[];
  
  // Analytics
  trackSearch: (analytics: Omit<SearchAnalytics, 'timestamp'>) => void;
  trackResultClick: (queryId: string, resultId: string) => void;
  
  // Index management
  updateSearchIndex: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
  
  // Advanced features
  saveSearch: (name: string, tags?: string[]) => void;
  deleteSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => void;
  createSearchAlert: (savedSearchId: string, frequency: 'daily' | 'weekly' | 'monthly', threshold: number) => void;
  toggleSearchAlert: (alertId: string) => void;
  deleteSearchAlert: (alertId: string) => void;
  
  // Bookmarks
  addBookmark: (result: SearchResult, notes?: string, tags?: string[]) => void;
  removeBookmark: (bookmarkId: string) => void;
  updateBookmark: (bookmarkId: string, updates: Partial<SearchBookmark>) => void;
  
  // Personalization
  updateUserPreferences: (preferences: Partial<UserSearchPreferences>) => void;
  getPersonalizedSuggestions: () => SearchSuggestion[];
  trackUserInteraction: (interaction: { type: string; data: any }) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentQuery: '',
      searchMode: 'traditional',
      isSearchOpen: false,
      
      results: [],
      aiResponse: null,
      isSearching: false,
      searchError: null,
      
      activeFilters: {},
      
      searchHistory: [],
      recentSearches: [],
      suggestions: [],
      
      currentConversation: null,
      conversations: [],
      
      analytics: [],
      
      searchIndex: null,
      indexLastUpdated: null,
      
      // Advanced features
      savedSearches: [],
      searchAlerts: [],
      bookmarks: [],
      userPreferences: null,
      
      // Search modal management
      openSearch: () => {
        set({ isSearchOpen: true });
      },
      
      closeSearch: () => {
        set({ 
          isSearchOpen: false,
          currentQuery: '',
          results: [],
          aiResponse: null,
          searchError: null
        });
      },
      
      setSearchMode: (mode: 'traditional' | 'ai') => {
        set({ 
          searchMode: mode,
          results: [],
          aiResponse: null,
          searchError: null
        });
      },
      
      setQuery: (query: string) => {
        set({ currentQuery: query });
      },
      
      // Traditional search execution
      executeSearch: async (query: string, filters?: SearchFilters) => {
        set({ 
          isSearching: true, 
          searchError: null,
          currentQuery: query,
          activeFilters: filters || {}
        });
        
        try {
          // Create search query object
          const searchQuery: SearchQuery = {
            id: `search_${Date.now()}`,
            query,
            mode: 'traditional',
            filters: filters || {},
            timestamp: new Date().toISOString()
          };
          
          // Execute search using search service
          const results = await searchService.search(query, filters);
          
          set({ 
            results,
            isSearching: false,
            searchError: null
          });
          
          // Add to history
          get().addToHistory({
            ...searchQuery,
            resultCount: results.length
          });
          
          // Track analytics
          get().trackSearch({
            queryId: searchQuery.id,
            query,
            mode: 'traditional',
            resultCount: results.length,
            clickedResults: [],
            timeSpent: 0,
            refinements: 0,
            successful: results.length > 0
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Search failed';
          set({ 
            isSearching: false,
            searchError: errorMessage,
            results: []
          });
        }
      },
      
      // AI search execution
      executeAISearch: async (query: string, _conversationId?: string) => {
        set({ 
          isSearching: true, 
          searchError: null,
          currentQuery: query
        });
        
        try {
          // Create search query object
          const searchQuery: SearchQuery = {
            id: `ai_search_${Date.now()}`,
            query,
            mode: 'ai',
            timestamp: new Date().toISOString()
          };
          
          // Add user message to conversation
          const userMessage: ConversationMessage = {
            id: `msg_${Date.now()}`,
            type: 'user',
            content: query,
            timestamp: new Date().toISOString(),
            query: searchQuery
          };
          
          get().addMessageToConversation(userMessage);
          
          // Generate AI response using search service
          const aiResponse = await searchService.generateAIResponse(query);
          
          // Add AI response to conversation
          const aiMessage: ConversationMessage = {
            id: `msg_${Date.now() + 1}`,
            type: 'ai',
            content: aiResponse.message,
            timestamp: new Date().toISOString(),
            response: aiResponse
          };
          
          get().addMessageToConversation(aiMessage);
          
          set({ 
            aiResponse,
            isSearching: false,
            searchError: null
          });
          
          // Add to history
          get().addToHistory({
            ...searchQuery,
            resultCount: aiResponse.cards.length
          });
          
          // Track analytics
          get().trackSearch({
            queryId: searchQuery.id,
            query,
            mode: 'ai',
            resultCount: aiResponse.cards.length,
            clickedResults: [],
            timeSpent: 0,
            refinements: 0,
            successful: aiResponse.cards.length > 0
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'AI search failed';
          set({ 
            isSearching: false,
            searchError: errorMessage,
            aiResponse: null
          });
        }
      },
      
      clearResults: () => {
        set({ 
          results: [], 
          aiResponse: null, 
          searchError: null 
        });
      },
      
      setFilters: (filters: SearchFilters) => {
        set({ activeFilters: filters });
        
        // Re-execute search with new filters if there's a current query
        const { currentQuery } = get();
        if (currentQuery) {
          get().executeSearch(currentQuery, filters);
        }
      },
      
      clearFilters: () => {
        set({ activeFilters: {} });
        
        // Re-execute search without filters if there's a current query
        const { currentQuery } = get();
        if (currentQuery) {
          get().executeSearch(currentQuery, {});
        }
      },
      
      // History management
      addToHistory: (query: SearchQuery) => {
        const { searchHistory } = get();
        const updatedHistory = [query, ...searchHistory.slice(0, 99)]; // Keep last 100 searches
        
        set({ 
          searchHistory: updatedHistory,
          recentSearches: updatedHistory.slice(0, 10) // Keep last 10 for quick access
        });
      },
      
      clearHistory: () => {
        set({ 
          searchHistory: [],
          recentSearches: []
        });
      },
      
      getRecentSearches: () => {
        return get().recentSearches;
      },
      
      // Conversation management
      startNewConversation: () => {
        const newConversation: SearchConversation = {
          id: `conv_${Date.now()}`,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const { conversations } = get();
        set({ 
          currentConversation: newConversation,
          conversations: [newConversation, ...conversations]
        });
      },
      
      addMessageToConversation: (message: ConversationMessage) => {
        const { currentConversation, conversations } = get();
        
        if (!currentConversation) {
          get().startNewConversation();
          return get().addMessageToConversation(message);
        }
        
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, message],
          updatedAt: new Date().toISOString(),
          title: currentConversation.title || (message.type === 'user' ? message.content.slice(0, 50) : currentConversation.title)
        };
        
        const updatedConversations = conversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        );
        
        set({ 
          currentConversation: updatedConversation,
          conversations: updatedConversations
        });
      },
      
      selectConversation: (id: string) => {
        const { conversations } = get();
        const conversation = conversations.find(conv => conv.id === id);
        
        if (conversation) {
          set({ currentConversation: conversation });
        }
      },
      
      clearConversations: () => {
        set({ 
          conversations: [],
          currentConversation: null
        });
      },
      
      // Suggestions
      updateSuggestions: (query: string) => {
        const suggestions = searchService.getSuggestions(query);
        set({ suggestions });
      },
      
      getSuggestions: (query: string) => {
        const { suggestions, recentSearches } = get();
        
        if (!query) {
          // Return recent searches when no query
          return recentSearches.map(search => ({
            id: search.id,
            text: search.query,
            type: 'recent' as const,
            category: search.mode
          }));
        }
        
        return suggestions.filter(suggestion => 
          suggestion.text.toLowerCase().includes(query.toLowerCase())
        );
      },
      
      // Analytics
      trackSearch: (analytics: Omit<SearchAnalytics, 'timestamp'>) => {
        const { analytics: currentAnalytics } = get();
        const newAnalytics: SearchAnalytics = {
          ...analytics,
          timestamp: new Date().toISOString()
        };
        
        set({ 
          analytics: [newAnalytics, ...currentAnalytics.slice(0, 999)] // Keep last 1000 analytics
        });
      },
      
      trackResultClick: (queryId: string, resultId: string) => {
        const { analytics } = get();
        const updatedAnalytics = analytics.map(analytic => 
          analytic.queryId === queryId 
            ? { ...analytic, clickedResults: [...analytic.clickedResults, resultId] }
            : analytic
        );
        
        set({ analytics: updatedAnalytics });
      },
      
      // Index management
      updateSearchIndex: async () => {
        try {
          const searchIndex = await searchService.buildSearchIndex();
          
          set({ 
            searchIndex,
            indexLastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to update search index:', error);
        }
      },
      
      clearError: () => {
        set({ searchError: null });
      },
      
      // Advanced features implementation
      saveSearch: (name: string, tags: string[] = []) => {
        const { currentQuery, searchMode, activeFilters } = get();
        
        if (!currentQuery) return;
        
        const savedSearch: SavedSearch = {
          id: `saved_${Date.now()}`,
          name,
          query: currentQuery,
          filters: activeFilters,
          mode: searchMode,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          useCount: 1,
          alertEnabled: false,
          tags
        };
        
        set(state => ({
          savedSearches: [...state.savedSearches, savedSearch]
        }));
      },
      
      deleteSavedSearch: (id: string) => {
        set(state => ({
          savedSearches: state.savedSearches.filter(search => search.id !== id),
          searchAlerts: state.searchAlerts.filter(alert => alert.savedSearchId !== id)
        }));
      },
      
      loadSavedSearch: (id: string) => {
        const { savedSearches } = get();
        const savedSearch = savedSearches.find(search => search.id === id);
        
        if (savedSearch) {
          set({
            currentQuery: savedSearch.query,
            searchMode: savedSearch.mode,
            activeFilters: savedSearch.filters
          });
          
          // Update usage stats
          const updatedSearches = savedSearches.map(search =>
            search.id === id
              ? {
                  ...search,
                  lastUsed: new Date().toISOString(),
                  useCount: search.useCount + 1
                }
              : search
          );
          
          set({ savedSearches: updatedSearches });
          
          // Execute the search
          if (savedSearch.mode === 'traditional') {
            get().executeSearch(savedSearch.query, savedSearch.filters);
          } else {
            get().executeAISearch(savedSearch.query);
          }
        }
      },
      
      createSearchAlert: (savedSearchId: string, frequency: 'daily' | 'weekly' | 'monthly', threshold: number) => {
        const { savedSearches } = get();
        const savedSearch = savedSearches.find(search => search.id === savedSearchId);
        
        if (savedSearch) {
          const alert: SearchAlert = {
            id: `alert_${Date.now()}`,
            savedSearchId,
            name: `Alert for "${savedSearch.name}"`,
            query: savedSearch.query,
            filters: savedSearch.filters,
            frequency,
            nextTrigger: calculateNextTrigger(frequency),
            enabled: true,
            resultThreshold: threshold,
            notificationMethod: 'in-app',
            createdAt: new Date().toISOString()
          };
          
          set(state => ({
            searchAlerts: [...state.searchAlerts, alert],
            savedSearches: state.savedSearches.map(search =>
              search.id === savedSearchId
                ? { ...search, alertEnabled: true, alertFrequency: frequency }
                : search
            )
          }));
        }
      },
      
      toggleSearchAlert: (alertId: string) => {
        set(state => ({
          searchAlerts: state.searchAlerts.map(alert =>
            alert.id === alertId
              ? { ...alert, enabled: !alert.enabled }
              : alert
          )
        }));
      },
      
      deleteSearchAlert: (alertId: string) => {
        const { searchAlerts } = get();
        const alert = searchAlerts.find(a => a.id === alertId);
        
        set(state => ({
          searchAlerts: state.searchAlerts.filter(a => a.id !== alertId),
          savedSearches: alert
            ? state.savedSearches.map(search =>
                search.id === alert.savedSearchId
                  ? { ...search, alertEnabled: false, alertFrequency: undefined }
                  : search
              )
            : state.savedSearches
        }));
      },
      
      // Bookmarks
      addBookmark: (result: SearchResult, notes?: string, tags: string[] = []) => {
        const bookmark: SearchBookmark = {
          id: `bookmark_${Date.now()}`,
          resultId: result.id,
          resultType: result.type,
          title: result.title,
          description: result.description,
          tags,
          notes,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        };
        
        set(state => ({
          bookmarks: [...state.bookmarks, bookmark]
        }));
      },
      
      removeBookmark: (bookmarkId: string) => {
        set(state => ({
          bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== bookmarkId)
        }));
      },
      
      updateBookmark: (bookmarkId: string, updates: Partial<SearchBookmark>) => {
        set(state => ({
          bookmarks: state.bookmarks.map(bookmark =>
            bookmark.id === bookmarkId
              ? { ...bookmark, ...updates, lastAccessed: new Date().toISOString() }
              : bookmark
          )
        }));
      },
      
      // Personalization
      updateUserPreferences: (preferences: Partial<UserSearchPreferences>) => {
        const currentState = get();
        set({
          userPreferences: currentState.userPreferences
            ? { ...currentState.userPreferences, ...preferences, lastUpdated: new Date().toISOString() }
            : {
                userId: 'default',
                defaultMode: 'traditional' as const,
                defaultFilters: {},
                favoriteCategories: [],
                recentDomains: [],
                searchHistory: [],
                savedSearches: [],
                searchAlerts: [],
                personalizedSuggestions: true,
                analyticsEnabled: true,
                lastUpdated: new Date().toISOString(),
                ...preferences
              }
        });
      },
      
      getPersonalizedSuggestions: () => {
        const currentState = get();
        
        if (!currentState.userPreferences?.personalizedSuggestions) {
          return [];
        }
        
        const suggestions: SearchSuggestion[] = [];
        
        // Add suggestions based on search history (limit to prevent loops)
        const recentQueries = currentState.searchHistory.slice(0, 3);
        recentQueries.forEach((query, index) => {
          suggestions.push({
            id: `history_${index}`,
            text: query.query,
            type: 'recent' as const,
            category: 'personal'
          });
        });
        
        return suggestions;
      },
      
      trackUserInteraction: (interaction: { type: string; data: any }) => {
        const currentState = get();
        
        if (!currentState.userPreferences?.analyticsEnabled) return;
        
        // Simple tracking without triggering updates that could cause loops
        console.log('User interaction tracked:', interaction);
      }
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
        searchMode: state.searchMode
      })
    }
  )
);



// Selector hooks for better performance and convenience
export const useSearchQuery = () => useSearchStore(state => state.currentQuery);
export const useSearchMode = () => useSearchStore(state => state.searchMode);
export const useIsSearchOpen = () => useSearchStore(state => state.isSearchOpen);
export const useSearchResults = () => useSearchStore(state => state.results);
export const useAIResponse = () => useSearchStore(state => state.aiResponse);
export const useIsSearching = () => useSearchStore(state => state.isSearching);
export const useSearchError = () => useSearchStore(state => state.searchError);
export const useActiveFilters = () => useSearchStore(state => state.activeFilters);
export const useSearchHistory = () => useSearchStore(state => state.searchHistory);
export const useRecentSearches = () => useSearchStore(state => state.recentSearches);
export const useCurrentConversation = () => useSearchStore(state => state.currentConversation);
export const useConversations = () => useSearchStore(state => state.conversations);
export const useSuggestions = () => useSearchStore(state => state.suggestions);
export const useSavedSearches = () => useSearchStore(state => state.savedSearches);
export const useSearchAlerts = () => useSearchStore(state => state.searchAlerts);
export const useSearchBookmarks = () => useSearchStore(state => state.bookmarks);
export const useUserPreferences = () => useSearchStore(state => state.userPreferences);

// Action hooks
export const useSearchActions = () => useSearchStore(state => ({
  openSearch: state.openSearch,
  closeSearch: state.closeSearch,
  setSearchMode: state.setSearchMode,
  setQuery: state.setQuery,
  executeSearch: state.executeSearch,
  executeAISearch: state.executeAISearch,
  clearResults: state.clearResults,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  clearError: state.clearError,
  updateSearchIndex: state.updateSearchIndex,
  updateSuggestions: state.updateSuggestions,
  trackResultClick: state.trackResultClick
}));

export const useSearchHistoryActions = () => useSearchStore(state => ({
  addToHistory: state.addToHistory,
  clearHistory: state.clearHistory,
  getRecentSearches: state.getRecentSearches
}));

export const useConversationActions = () => useSearchStore(state => ({
  startNewConversation: state.startNewConversation,
  addMessageToConversation: state.addMessageToConversation,
  selectConversation: state.selectConversation,
  clearConversations: state.clearConversations
}));

export const useSearchAnalytics = () => useSearchStore(state => ({
  analytics: state.analytics,
  trackSearch: state.trackSearch,
  trackResultClick: state.trackResultClick
}));

// Advanced features hooks
export const useSavedSearchActions = () => useSearchStore(state => ({
  saveSearch: state.saveSearch,
  deleteSavedSearch: state.deleteSavedSearch,
  loadSavedSearch: state.loadSavedSearch
}));

export const useSearchAlertActions = () => useSearchStore(state => ({
  createSearchAlert: state.createSearchAlert,
  toggleSearchAlert: state.toggleSearchAlert,
  deleteSearchAlert: state.deleteSearchAlert
}));

export const useBookmarkActions = () => useSearchStore(state => ({
  addBookmark: state.addBookmark,
  removeBookmark: state.removeBookmark,
  updateBookmark: state.updateBookmark
}));

export const usePersonalizationActions = () => useSearchStore(state => ({
  updateUserPreferences: state.updateUserPreferences,
  getPersonalizedSuggestions: state.getPersonalizedSuggestions,
  trackUserInteraction: state.trackUserInteraction
}));