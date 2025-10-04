import type { 
  SearchResult, 
  SearchFilters, 
  AIResponse, 
  SearchIndex, 
  SearchSuggestion
} from '../types';
import { mockDataService } from './mockDataService';

class SearchService {
  private searchIndex: SearchIndex | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastIndexUpdate = 0;

  /**
   * Initialize search service and build initial index
   */
  async initialize(): Promise<void> {
    try {
      await this.buildSearchIndex();
      console.log('Search service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search service:', error);
      throw error;
    }
  }

  /**
   * Build search index from all available data
   */
  async buildSearchIndex(): Promise<SearchIndex> {
    try {
      // Get real data from mockDataService first
      const realProducts = await mockDataService.getAllProducts();
      const realContracts = await mockDataService.getAllContracts();
      
      // Expanded mock data with more comprehensive content
      const domains = [
        {
          id: 'cartoes',
          name: 'Cartões',
          description: 'Domínio responsável por dados de cartões de crédito e débito',
          collections: ['Cartões de Crédito', 'Cartões de Débito']
        },
        {
          id: 'seguros',
          name: 'Seguros',
          description: 'Domínio de produtos de seguros diversos',
          collections: ['Seguros de Vida', 'Seguros Auto', 'Seguros Residencial']
        },
        {
          id: 'consorcio',
          name: 'Consórcio',
          description: 'Domínio de produtos de consórcio imobiliário e veicular',
          collections: ['Consórcio Imóveis', 'Consórcio Veículos']
        },
        {
          id: 'investimentos',
          name: 'Investimentos',
          description: 'Domínio de produtos de investimento e renda fixa',
          collections: ['Renda Fixa', 'Fundos', 'Ações']
        }
      ];

      // Transform real contracts to search index format
      const allContracts = realContracts.map(contract => ({
        id: contract.id,
        name: contract.fundamentals.name,
        description: contract.fundamentals.description || '',
        domain: contract.fundamentals.domain,
        collection: contract.fundamentals.collection,
        schema: contract.schema?.columns || [],
        qualityRules: contract.qualityRules?.map(rule => rule.name) || [],
        tags: [`layer:${contract.tags.layer}`, `status:${contract.tags.status}`],
        layer: contract.tags.layer,
        status: contract.tags.status,
        owner: contract.fundamentals.owner,
        keywords: this.extractKeywords(contract.fundamentals.name + ' ' + contract.fundamentals.description)
      }));

      // Transform real products to search index format
      const allProducts = realProducts.map(product => {
        // Find the contract for this product to get domain info
        const contract = realContracts.find(c => c.id === product.dataContractId);
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          technology: product.technology || 'Unknown',
          contractId: product.dataContractId,
          contractName: contract?.fundamentals?.name || 'Unknown Contract',
          domain: contract?.fundamentals?.domain || 'Unknown',
          purpose: product.pipelineType === 'model_inference' ? 'model' : 'pipeline',
          keywords: this.extractKeywords(product.name + ' ' + (product.description || '')),
          qualityScore: 0.8, // Default quality score since it's not in DataProduct type
          lastExecution: typeof product.lastExecution === 'string' ? product.lastExecution : new Date().toISOString()
        };
      });

      const searchIndex: SearchIndex = {
        domains: domains.map(domain => ({
          id: domain.id,
          name: domain.name,
          description: domain.description,
          keywords: this.extractKeywords(domain.name + ' ' + domain.description),
          collections: domain.collections,
          contractCount: allContracts.filter(c => c.domain === domain.name).length,
          productCount: allProducts.filter(p => p.domain === domain.name).length
        })),
        contracts: allContracts.map(contract => ({
          id: contract.id,
          name: contract.name,
          description: contract.description,
          domain: contract.domain,
          collection: contract.collection,
          schema: contract.schema,
          qualityRules: contract.qualityRules,
          tags: contract.tags,
          layer: contract.layer,
          status: contract.status,
          owner: contract.owner,
          keywords: contract.keywords
        })),
        products: allProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          technology: product.technology,
          contractId: product.contractId,
          contractName: product.contractName,
          domain: product.domain,
          purpose: product.purpose,
          keywords: product.keywords,
          qualityScore: product.qualityScore,
          lastExecution: product.lastExecution
        })),
        lastUpdated: new Date().toISOString()
      };
      
      this.searchIndex = searchIndex;
      return searchIndex;
    } catch (error) {
      console.error('Failed to build search index:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from text for search indexing
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);
  }

  /**
   * Get or refresh search index
   */
  private async getSearchIndex(): Promise<SearchIndex> {
    const now = Date.now();
    if (!this.searchIndex || (now - this.lastIndexUpdate) > this.CACHE_DURATION) {
      await this.buildSearchIndex();
      this.lastIndexUpdate = now;
    }
    return this.searchIndex!;
  }

  /**
   * Perform semantic search across all data types
   */
  async search(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    try {
      const searchIndex = await this.getSearchIndex();
      const results: SearchResult[] = [];
      const processedQuery = query.toLowerCase().trim();
      const semanticTerms = this.extractSemanticTerms(processedQuery);

      // Search domains
      for (const domain of searchIndex.domains) {
        const relevanceScore = this.calculateSemanticRelevance(domain, processedQuery, semanticTerms);
        if (relevanceScore > 0.3 && this.matchesFilters(domain, filters)) {
          results.push({
            id: domain.id,
            type: 'domain',
            title: domain.name,
            description: domain.description,
            relevanceScore,
            metadata: {
              domain: domain.name
            },
            highlightedFields: this.getSemanticHighlights(domain, processedQuery, semanticTerms),
            actions: [
              { id: 'explore', label: 'Explore Collections', type: 'navigate', primary: true }
            ]
          });
        }
      }

      // Search contracts
      for (const contract of searchIndex.contracts) {
        const relevanceScore = this.calculateSemanticRelevance(contract, processedQuery, semanticTerms);
        if (relevanceScore > 0.3 && this.matchesFilters(contract, filters)) {
          results.push({
            id: contract.id,
            type: 'contract',
            title: contract.name,
            description: contract.description,
            relevanceScore,
            metadata: {
              domain: contract.domain,
              layer: contract.layer,
              status: contract.status,
              owner: contract.owner,
              tags: contract.tags
            },
            highlightedFields: this.getSemanticHighlights(contract, processedQuery, semanticTerms),
            actions: [
              { id: 'view', label: 'View Contract', type: 'navigate', primary: true },
              { id: 'schema', label: 'Preview Schema', type: 'preview' }
            ]
          });
        }
      }
      
      // Search products
      for (const product of searchIndex.products) {
        const relevanceScore = this.calculateSemanticRelevance(product, processedQuery, semanticTerms);
        if (relevanceScore > 0.3 && this.matchesFilters(product, filters)) {
          results.push({
            id: product.id,
            type: 'product',
            title: product.name,
            description: product.description,
            relevanceScore,
            metadata: {
              domain: product.domain,
              technology: product.technology,
              qualityScore: product.qualityScore,
              lastUpdated: product.lastExecution
            },
            highlightedFields: this.getSemanticHighlights(product, processedQuery, semanticTerms),
            actions: [
              { id: 'view', label: 'View Product', type: 'navigate', primary: true },
              { id: 'cart', label: 'Add to Cart', type: 'cart' }
            ]
          });
        }
      }
      
      // Sort by relevance score and apply ranking boost
      return this.applyRankingBoosts(results).sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Extract semantic terms for enhanced search
   */
  private extractSemanticTerms(query: string): string[] {
    const terms = query.toLowerCase().split(/\s+/);
    const semanticTerms: string[] = [];
    
    // Add synonyms and related terms
    for (const term of terms) {
      semanticTerms.push(term);
      
      // Add domain-specific synonyms
      if (term.includes('card') || term.includes('cartao')) {
        semanticTerms.push('credit', 'payment', 'transaction', 'credito', 'pagamento');
      }
      if (term.includes('insurance') || term.includes('seguro')) {
        semanticTerms.push('policy', 'coverage', 'premium', 'apolice', 'cobertura');
      }
      if (term.includes('consortium') || term.includes('consorcio')) {
        semanticTerms.push('financing', 'group', 'member', 'financiamento', 'grupo');
      }
    }
    
    return [...new Set(semanticTerms)];
  }

  /**
   * Calculate semantic relevance score
   */
  private calculateSemanticRelevance(item: any, query: string, semanticTerms: string[]): number {
    const searchableText = (
      item.name + ' ' + 
      item.description + ' ' + 
      (item.keywords || []).join(' ')
    ).toLowerCase();

    let score = 0;
    const queryTerms = query.split(/\s+/);

    // Exact phrase match (highest weight)
    if (searchableText.includes(query)) {
      score += 1.0;
    }

    // Individual term matches
    for (const term of queryTerms) {
      if (searchableText.includes(term)) {
        score += 0.5;
      }
    }

    // Semantic term matches
    for (const term of semanticTerms) {
      if (searchableText.includes(term)) {
        score += 0.3;
      }
    }

    // Normalize score
    return Math.min(score / (queryTerms.length + semanticTerms.length * 0.3), 1.0);
  }

  /**
   * Check if item matches filters
   */
  private matchesFilters(item: any, filters: SearchFilters): boolean {
    if (filters.domains && !filters.domains.includes(item.domain)) return false;
    if (filters.layers && !filters.layers.includes(item.layer)) return false;
    if (filters.statuses && !filters.statuses.includes(item.status)) return false;
    if (filters.technologies && !filters.technologies.includes(item.technology)) return false;
    
    return true;
  }

  /**
   * Get highlighted fields for search results
   */
  private getSemanticHighlights(item: any, query: string, _semanticTerms: string[]): any {
    const highlights: any = {};
    
    // Highlight name
    if (item.name && item.name.toLowerCase().includes(query.toLowerCase())) {
      highlights.name = this.highlightText(item.name, query);
    }
    
    // Highlight description
    if (item.description && item.description.toLowerCase().includes(query.toLowerCase())) {
      highlights.description = this.highlightText(item.description, query);
    }
    
    return highlights;
  }

  /**
   * Highlight matching text
   */
  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Apply ranking boosts based on item type and quality
   */
  private applyRankingBoosts(results: SearchResult[]): SearchResult[] {
    return results.map(result => {
      let boost = 1.0;
      
      // Boost by type priority
      if (result.type === 'domain') boost *= 1.2;
      else if (result.type === 'contract') boost *= 1.1;
      else if (result.type === 'product') boost *= 1.0;
      
      // Boost by quality score
      if (result.metadata.qualityScore) {
        boost *= (0.8 + result.metadata.qualityScore * 0.2);
      }
      
      // Boost by status
      if (result.metadata.status === 'published') boost *= 1.1;
      
      return {
        ...result,
        relevanceScore: result.relevanceScore * boost
      };
    });
  }

  /**
   * Generate AI response for natural language queries
   */
  async generateAIResponse(query: string): Promise<AIResponse> {
    // This is a simplified AI response generator
    // In a real implementation, this would use an LLM
    
    const searchResults = await this.search(query);
    const topResults = searchResults.slice(0, 5);
    
    let response = `I found ${searchResults.length} results for "${query}". `;
    
    if (topResults.length > 0) {
      response += "Here are the most relevant items:\n\n";
      
      topResults.forEach((result, index) => {
        response += `${index + 1}. **${result.title}** (${result.type})\n`;
        response += `   ${result.description}\n`;
        if (result.metadata.domain) {
          response += `   Domain: ${result.metadata.domain}\n`;
        }
        response += "\n";
      });
    } else {
      response += "No relevant results found. Try using different keywords or check your spelling.";
    }
    
    return {
      id: `ai-${Date.now()}`,
      query,
      type: 'discovery' as const,
      message: response,
      cards: topResults,
      actions: [],
      followUpQuestions: [],
      relatedSearches: [],
      timestamp: new Date().toISOString(),
      confidence: topResults.length > 0 ? 0.8 : 0.2
    };
  }



  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(partialQuery: string): Promise<SearchSuggestion[]> {
    if (partialQuery.length < 2) return [];
    
    try {
      const searchIndex = await this.getSearchIndex();
      const suggestions: SearchSuggestion[] = [];
      const query = partialQuery.toLowerCase();
      
      // Suggest domains
      searchIndex.domains.forEach((domain, index) => {
        if (domain.name.toLowerCase().includes(query)) {
          suggestions.push({
            id: `domain-${index}`,
            text: domain.name,
            type: 'autocomplete',
            category: 'domain'
          });
        }
      });
      
      // Suggest contracts
      searchIndex.contracts.forEach((contract, index) => {
        if (contract.name.toLowerCase().includes(query)) {
          suggestions.push({
            id: `contract-${index}`,
            text: contract.name,
            type: 'autocomplete',
            category: 'contract'
          });
        }
      });
      
      // Suggest products
      searchIndex.products.forEach((product, index) => {
        if (product.name.toLowerCase().includes(query)) {
          suggestions.push({
            id: `product-${index}`,
            text: product.name,
            type: 'autocomplete',
            category: 'product'
          });
        }
      });
      
      return suggestions.slice(0, 10);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();