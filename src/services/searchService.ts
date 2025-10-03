import type { 
  SearchResult, 
  SearchFilters, 
  AIResponse, 
  SearchIndex, 
  SearchSuggestion
} from '../types';

class SearchService {
  private searchIndex: SearchIndex | null = null;
  private semanticWeights = {
    exactMatch: 1.0,
    partialMatch: 0.8,
    synonymMatch: 0.6,
    contextMatch: 0.4,
    keywordMatch: 0.3
  };
  
  // Semantic keyword mappings for better search understanding (conservative approach)
  private semanticMappings: Record<string, string[]> = {
    'credit': ['card', 'score'],
    'fraud': ['detection', 'security'],
    'customer': ['client', 'user'],
    'transaction': ['payment', 'purchase'],
    'model': ['ml', 'algorithm'],
    'data': ['dataset', 'information'],
    'quality': ['score', 'validation'],
    'pipeline': ['etl', 'workflow'],
    'analytics': ['analysis', 'dashboard']
  };
  
  /**
   * Build search index from all available data
   */
  async buildSearchIndex(): Promise<SearchIndex> {
    try {
      // Expanded mock data with more comprehensive content
      const domains = [
        { 
          id: 'cartoes', 
          name: 'Cartões', 
          description: 'Credit card data domain with transaction processing, fraud detection, and customer analytics',
          collections: ['Transactions', 'Customers', 'Fraud Detection']
        },
        { 
          id: 'seguros', 
          name: 'Seguros', 
          description: 'Insurance data domain covering policies, claims, and risk assessment',
          collections: ['Policies', 'Claims', 'Risk Assessment']
        },
        { 
          id: 'consorcio', 
          name: 'Consórcio', 
          description: 'Consortium data domain for group financing and credit management',
          collections: ['Groups', 'Financing', 'Credit Analysis']
        },
        { 
          id: 'investimentos', 
          name: 'Investimentos', 
          description: 'Investment data domain with portfolio management and market analysis',
          collections: ['Portfolios', 'Market Data', 'Performance']
        }
      ];
      
      const allContracts = [
        {
          id: 'dc-cartoes-transacoes',
          name: 'Transações de Cartão de Crédito',
          description: 'Contrato de dados para transações realizadas com cartões de crédito',
          domain: 'Cartões',
          collection: 'Cartões de Crédito',
          schema: [
            { name: 'transaction_id', type: 'string', nullable: false, primaryKey: true, description: 'Identificador único da transação' },
            { name: 'card_number_hash', type: 'string', nullable: false, primaryKey: false, description: 'Hash do número do cartão para segurança' },
            { name: 'transaction_amount', type: 'decimal', nullable: false, primaryKey: false, description: 'Valor da transação em reais' },
            { name: 'merchant_name', type: 'string', nullable: true, primaryKey: false, description: 'Nome do estabelecimento comercial' },
            { name: 'transaction_date', type: 'timestamp', nullable: false, primaryKey: false, description: 'Data e hora da transação' }
          ],
          qualityRules: ['CPF Validation', 'Transaction Amount Range', 'Transaction ID Uniqueness'],
          tags: ['layer:Silver', 'status:published', 'pii:true'],
          layer: 'Silver' as const,
          status: 'published' as const,
          owner: 'time-cartoes@banco.com',
          keywords: ['credit', 'card', 'transaction', 'payment', 'purchase', 'merchant', 'financial', 'cartao', 'transacao']
        },
        {
          id: 'dc-cartoes-clientes',
          name: 'Clientes Cartão de Crédito',
          description: 'Dados dos clientes portadores de cartões de crédito',
          domain: 'Cartões',
          collection: 'Cartões de Crédito',
          schema: [
            { name: 'customer_id', type: 'string', nullable: false, primaryKey: true, description: 'UUID do cliente' },
            { name: 'cpf', type: 'string', nullable: false, primaryKey: false, description: 'CPF do cliente' },
            { name: 'credit_score', type: 'integer', nullable: true, primaryKey: false, description: 'Score de crédito (0-1000)' },
            { name: 'credit_limit', type: 'decimal', nullable: true, primaryKey: false, description: 'Limite de crédito aprovado' }
          ],
          qualityRules: ['CPF Validation', 'Email Format Check'],
          tags: ['layer:Gold', 'status:published', 'pii:true'],
          layer: 'Gold' as const,
          status: 'published' as const,
          owner: 'time-cartoes@banco.com',
          keywords: ['customer', 'credit', 'score', 'risk', 'profile', 'lending', 'assessment', 'cliente', 'cartao']
        },
        {
          id: 'dc-seguros-vida-apolices',
          name: 'Apólices Seguro de Vida',
          description: 'Dados das apólices de seguro de vida e beneficiários',
          domain: 'Seguros',
          collection: 'Seguros de Vida',
          schema: [
            { name: 'policy_id', type: 'string', nullable: false, primaryKey: true, description: 'UUID da apólice' },
            { name: 'customer_cpf', type: 'string', nullable: false, primaryKey: false, description: 'CPF do segurado' },
            { name: 'coverage_amount', type: 'decimal', nullable: false, primaryKey: false, description: 'Valor da cobertura em reais' },
            { name: 'premium_amount', type: 'decimal', nullable: false, primaryKey: false, description: 'Valor do prêmio mensal' }
          ],
          qualityRules: ['Policy Amount Validation', 'Beneficiary CPF Validation'],
          tags: ['layer:Silver', 'status:published'],
          layer: 'Silver' as const,
          status: 'published' as const,
          owner: 'time-seguros@banco.com',
          keywords: ['insurance', 'policy', 'coverage', 'premium', 'holder', 'protection', 'seguro', 'vida', 'apolice']
        },
        {
          id: 'dc-consorcio-credito-analise',
          name: 'Análise de Crédito Consórcio',
          description: 'Dados de análise de crédito para financiamento em grupo de consórcio',
          domain: 'Consórcio',
          collection: 'Consórcio Imóveis',
          schema: [
            { name: 'member_id', type: 'string', nullable: false, primaryKey: true, description: 'ID do membro do consórcio' },
            { name: 'credit_evaluation', type: 'string', nullable: false, primaryKey: false, description: 'Resultado da avaliação de crédito' },
            { name: 'financing_capacity', type: 'decimal', nullable: true, primaryKey: false, description: 'Capacidade máxima de financiamento' }
          ],
          qualityRules: ['Group Participant Count', 'Payment Amount Consistency'],
          tags: ['layer:Gold', 'status:published'],
          layer: 'Gold' as const,
          status: 'published' as const,
          owner: 'time-consorcio@banco.com',
          keywords: ['consortium', 'credit', 'analysis', 'financing', 'member', 'evaluation', 'group', 'consorcio', 'credito']
        }
      ];
      
      const allProducts = [
        {
          id: 'dp-fraud-detection-model',
          name: 'Modelo Detecção de Fraude',
          description: 'Modelo ML avançado para detecção de fraude em tempo real em transações de cartão de crédito usando análise comportamental',
          technology: 'MLflow',
          contractId: 'dc-cartoes-transacoes',
          contractName: 'Transações de Cartão de Crédito',
          domain: 'Cartões',
          purpose: 'model',
          keywords: ['fraud', 'detection', 'ml', 'credit', 'card', 'security', 'behavioral', 'real-time', 'fraude', 'deteccao', 'modelo'],
          qualityScore: 0.95,
          lastExecution: new Date().toISOString()
        },
        {
          id: 'dp-credit-scoring-model',
          name: 'Modelo Credit Scoring',
          description: 'Dashboard interativo para monitoramento de métricas de risco de crédito e perfis de clientes',
          technology: 'MLflow',
          contractId: 'dc-cartoes-clientes',
          contractName: 'Clientes Cartão de Crédito',
          domain: 'Cartões',
          purpose: 'model',
          keywords: ['credit', 'risk', 'scoring', 'monitoring', 'metrics', 'customer', 'assessment', 'modelo', 'credito'],
          qualityScore: 0.88,
          lastExecution: new Date().toISOString()
        },
        {
          id: 'dp-cartoes-ingestion-realtime',
          name: 'Ingestão Transações Tempo Real',
          description: 'Pipeline de dados para processamento e transformação de dados de transações de cartão de crédito de múltiplas fontes',
          technology: 'Databricks',
          contractId: 'dc-cartoes-transacoes',
          contractName: 'Transações de Cartão de Crédito',
          domain: 'Cartões',
          purpose: 'pipeline',
          keywords: ['etl', 'pipeline', 'credit', 'card', 'transaction', 'processing', 'transformation', 'ingestao', 'tempo-real'],
          qualityScore: 0.92,
          lastExecution: new Date().toISOString()
        },
        {
          id: 'dp-seguros-claims-processing',
          name: 'Sistema Processamento Sinistros',
          description: 'Sistema automatizado para processamento de sinistros de seguro e validação de apólices',
          technology: 'Python',
          contractId: 'dc-seguros-vida-apolices',
          contractName: 'Apólices Seguro de Vida',
          domain: 'Seguros',
          purpose: 'pipeline',
          keywords: ['insurance', 'claims', 'processing', 'automation', 'policy', 'validation', 'seguro', 'sinistro', 'processamento'],
          qualityScore: 0.87,
          lastExecution: new Date().toISOString()
        },
        {
          id: 'dp-consorcio-credit-scoring',
          name: 'Modelo Scoring Consórcio',
          description: 'Modelo de machine learning para scoring de crédito e avaliação de risco em financiamento de consórcio',
          technology: 'MLflow',
          contractId: 'dc-consorcio-credito-analise',
          contractName: 'Análise de Crédito Consórcio',
          domain: 'Consórcio',
          purpose: 'model',
          keywords: ['consortium', 'credit', 'scoring', 'ml', 'risk', 'assessment', 'financing', 'consorcio', 'modelo'],
          qualityScore: 0.91,
          lastExecution: new Date().toISOString()
        }
      ];

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
   * Execute traditional search with filters
   */
  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    if (!this.searchIndex) {
      await this.buildSearchIndex();
    }
    
    if (!this.searchIndex) {
      throw new Error('Search index not available');
    }
    
    const results: SearchResult[] = [];
    const processedQuery = this.preprocessQuery(query);
    const semanticTerms = this.expandQueryWithSemantics(processedQuery);
    
    // Search domains
    for (const domain of this.searchIndex.domains) {
      const relevanceScore = this.calculateSemanticRelevance(domain, processedQuery, semanticTerms);
      if (relevanceScore > 0.3 && this.matchesFilters(domain, filters, 'domain')) {
        results.push({
          id: domain.id,
          type: 'domain',
          title: domain.name,
          description: domain.description,
          relevanceScore,
          metadata: {
            domain: domain.name,
            tags: [`${domain.contractCount} contracts`, `${domain.productCount} products`]
          },
          highlightedFields: this.getSemanticHighlights(domain, processedQuery, semanticTerms),
          actions: [
            { id: 'view', label: 'View Domain', type: 'navigate', primary: true },
            { id: 'explore', label: 'Explore Collections', type: 'navigate' }
          ]
        });
      }
    }
    
    // Search contracts
    for (const contract of this.searchIndex.contracts) {
      const relevanceScore = this.calculateSemanticRelevance(contract, processedQuery, semanticTerms);
      if (relevanceScore > 0.3 && this.matchesFilters(contract, filters, 'contract')) {
        results.push({
          id: contract.id,
          type: 'contract',
          title: contract.name,
          description: contract.description,
          relevanceScore,
          metadata: {
            domain: contract.domain,
            collection: contract.collection,
            layer: contract.layer,
            status: contract.status,
            owner: contract.owner,
            tags: contract.tags
          },
          highlightedFields: this.getSemanticHighlights(contract, processedQuery, semanticTerms),
          actions: [
            { id: 'view', label: 'View Contract', type: 'navigate', primary: true },
            { id: 'schema', label: 'Preview Schema', type: 'preview' },
            { id: 'products', label: 'View Products', type: 'navigate' }
          ]
        });
      }
    }
    
    // Search products
    for (const product of this.searchIndex.products) {
      const relevanceScore = this.calculateSemanticRelevance(product, processedQuery, semanticTerms);
      if (relevanceScore > 0.3 && this.matchesFilters(product, filters, 'product')) {
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
            { id: 'cart', label: 'Add to Cart', type: 'cart' },
            { id: 'access', label: 'Request Access', type: 'access' }
          ]
        });
      }
    }
    
    // Sort by relevance score and apply ranking boost
    return this.applyRankingBoosts(results).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  /**
   * Generate AI response for natural language queries with advanced intent analysis
   */
  async generateAIResponse(query: string): Promise<AIResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const searchResults = await this.search(query);
    const intent = this.analyzeAdvancedIntent(query);
    const contextualResults = this.rankResultsByIntent(searchResults, intent);
    
    return {
      id: `ai_response_${Date.now()}`,
      query,
      type: intent.type,
      message: this.generateContextualMessage(query, intent, contextualResults),
      cards: contextualResults.slice(0, 6), // Top 6 results with better variety
      actions: this.generateSmartActions(intent, contextualResults),
      followUpQuestions: this.generateSmartFollowUps(query, intent, contextualResults),
      relatedSearches: this.generateSmartRelatedSearches(query, intent),
      timestamp: new Date().toISOString(),
      confidence: intent.confidence
    };
  }
  
  /**
   * Get search suggestions based on query
   */
  getSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    if (!query) {
      return suggestions;
    }
    
    const queryLower = query.toLowerCase();
    
    // Common search patterns
    const patterns = [
      'fraud detection models',
      'customer data contracts',
      'credit card transactions',
      'risk assessment products',
      'databricks pipelines',
      'mlflow models',
      'quality rules',
      'bronze layer data',
      'silver layer data',
      'gold layer data',
      'published contracts',
      'draft contracts'
    ];
    
    patterns.forEach((pattern, index) => {
      if (pattern.toLowerCase().includes(queryLower)) {
        suggestions.push({
          id: `pattern_${index}`,
          text: pattern,
          type: 'autocomplete',
          category: 'common'
        });
      }
    });
    
    // Add domain-specific suggestions if search index is available
    if (this.searchIndex) {
      this.searchIndex.domains.forEach(domain => {
        if (domain.name.toLowerCase().includes(queryLower)) {
          suggestions.push({
            id: `domain_${domain.id}`,
            text: `${domain.name} domain`,
            type: 'autocomplete',
            category: 'domain'
          });
        }
      });
      
      this.searchIndex.contracts.forEach(contract => {
        if (contract.name.toLowerCase().includes(queryLower)) {
          suggestions.push({
            id: `contract_${contract.id}`,
            text: contract.name,
            type: 'autocomplete',
            category: 'contract'
          });
        }
      });
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }
  
  // Semantic search methods
  
  private preprocessQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word));
  }
  
  private expandQueryWithSemantics(queryTerms: string[]): string[] {
    const expandedTerms = [...queryTerms];
    
    for (const term of queryTerms) {
      if (this.semanticMappings[term]) {
        expandedTerms.push(...this.semanticMappings[term]);
      }
    }
    
    return [...new Set(expandedTerms)]; // Remove duplicates
  }
  
  private calculateSemanticRelevance(item: any, queryTerms: string[], semanticTerms: string[]): number {
    let score = 0;
    
    // Primary search fields (most important)
    const primaryText = [
      item.name || '',
      item.description || ''
    ].join(' ').toLowerCase();
    
    // Secondary search fields (less important)
    const secondaryText = [
      ...(item.keywords || []),
      ...(item.collections || []),
      item.technology || '',
      item.domain || ''
    ].join(' ').toLowerCase();
    
    // Direct matches in query terms (most important)
    for (const term of queryTerms) {
      const termLower = term.toLowerCase();
      
      // Exact name match gets highest score
      if (item.name && item.name.toLowerCase() === termLower) {
        score += this.semanticWeights.exactMatch;
      }
      // Word match in name
      else if (item.name && item.name.toLowerCase().includes(termLower)) {
        score += this.semanticWeights.partialMatch;
      }
      // Match in description
      else if (item.description && item.description.toLowerCase().includes(termLower)) {
        score += this.semanticWeights.partialMatch * 0.7;
      }
      // Match in keywords (high relevance)
      else if (item.keywords && item.keywords.some((keyword: string) => keyword.toLowerCase().includes(termLower))) {
        score += this.semanticWeights.partialMatch * 0.8;
      }
      // Match in secondary fields
      else if (secondaryText.includes(termLower)) {
        score += this.semanticWeights.keywordMatch;
      }
    }
    
    // Only add semantic matches if we already have a direct match
    if (score > 0) {
      for (const term of semanticTerms) {
        if (primaryText.includes(term.toLowerCase()) && !queryTerms.includes(term)) {
          score += this.semanticWeights.synonymMatch * 0.5; // Reduced weight
        }
      }
      
      // Add context score only if we have a base match
      score += this.calculateContextScore(item, queryTerms) * 0.3; // Reduced weight
    }
    
    // Normalize score to 0-1 range
    return Math.min(score, 1.0);
  }
  
  private calculateContextScore(item: any, queryTerms: string[]): number {
    let contextScore = 0;
    
    for (const term of queryTerms) {
      const termLower = term.toLowerCase();
      
      // Only add context score for exact matches in these fields
      if (item.technology && item.technology.toLowerCase() === termLower) {
        contextScore += this.semanticWeights.contextMatch;
      }
      
      if (item.domain && item.domain.toLowerCase().includes(termLower)) {
        contextScore += this.semanticWeights.contextMatch;
      }
      
      // Schema field names (exact matches only)
      if (item.schema) {
        const fieldNames = item.schema.map((field: any) => field.name.toLowerCase());
        if (fieldNames.includes(termLower)) {
          contextScore += this.semanticWeights.keywordMatch;
        }
      }
    }
    
    return contextScore;
  }
  
  private getSemanticHighlights(item: any, queryTerms: string[], semanticTerms: string[]): Record<string, string> {
    const highlighted: Record<string, string> = {};
    const allTerms = [...queryTerms, ...semanticTerms];
    
    if (item.name) {
      highlighted.name = this.highlightTerms(item.name, allTerms);
    }
    
    if (item.description) {
      highlighted.description = this.highlightTerms(item.description, allTerms);
    }
    
    return highlighted;
  }
  
  private highlightTerms(text: string, terms: string[]): string {
    let highlightedText = text;
    
    for (const term of terms) {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
    
    return highlightedText;
  }
  
  private applyRankingBoosts(results: SearchResult[]): SearchResult[] {
    return results.map(result => {
      let boostedScore = result.relevanceScore;
      
      // Boost published contracts
      if (result.type === 'contract' && result.metadata.status === 'published') {
        boostedScore *= 1.2;
      }
      
      // Boost high-quality products
      if (result.type === 'product' && result.metadata.qualityScore && result.metadata.qualityScore > 0.8) {
        boostedScore *= 1.15;
      }
      
      // Boost recently updated items
      if (result.metadata.lastUpdated) {
        const lastUpdate = new Date(result.metadata.lastUpdated);
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30) {
          boostedScore *= 1.1;
        }
      }
      
      return {
        ...result,
        relevanceScore: Math.min(boostedScore, 1.0)
      };
    });
  }

  // Private helper methods
  
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  }
  

  

  
  private matchesFilters(item: any, filters?: SearchFilters, type?: string): boolean {
    if (!filters) return true;
    
    // Domain filter
    if (filters.domains && filters.domains.length > 0) {
      if (!filters.domains.includes(item.domain)) return false;
    }
    
    // Technology filter
    if (filters.technologies && filters.technologies.length > 0 && type === 'product') {
      if (!filters.technologies.includes(item.technology)) return false;
    }
    
    // Layer filter
    if (filters.layers && filters.layers.length > 0 && type === 'contract') {
      if (!filters.layers.includes(item.layer)) return false;
    }
    
    // Status filter
    if (filters.statuses && filters.statuses.length > 0 && type === 'contract') {
      if (!filters.statuses.includes(item.status)) return false;
    }
    
    return true;
  }
  

  

  

  
  private analyzeAdvancedIntent(query: string): { type: AIResponse['type'], confidence: number, context: string[] } {
    const queryLower = query.toLowerCase();
    const context: string[] = [];
    
    // Discovery patterns
    if (queryLower.match(/(show me|find|search|list|get|fetch)/)) {
      context.push('discovery');
      return { type: 'discovery', confidence: 0.9, context };
    }
    
    // Explanation patterns
    if (queryLower.match(/(what is|explain|how|why|describe|tell me about)/)) {
      context.push('explanation');
      return { type: 'explanation', confidence: 0.85, context };
    }
    
    // Recommendation patterns
    if (queryLower.match(/(recommend|suggest|best|top|good|suitable|appropriate)/)) {
      context.push('recommendation');
      return { type: 'recommendation', confidence: 0.8, context };
    }
    
    // Comparison patterns
    if (queryLower.match(/(compare|difference|vs|versus|between|similar|different)/)) {
      context.push('comparison');
      return { type: 'comparison', confidence: 0.85, context };
    }
    
    // Domain-specific context detection
    if (queryLower.match(/(fraud|risk|anomaly)/)) context.push('fraud-detection');
    if (queryLower.match(/(customer|client|user)/)) context.push('customer-data');
    if (queryLower.match(/(transaction|payment|transfer)/)) context.push('transaction-data');
    if (queryLower.match(/(model|ml|ai|algorithm)/)) context.push('ml-models');
    if (queryLower.match(/(quality|accuracy|completeness)/)) context.push('data-quality');
    
    return { type: 'discovery', confidence: 0.7, context };
  }
  
  private rankResultsByIntent(results: SearchResult[], intent: any): SearchResult[] {
    return results.map(result => {
      let intentScore = result.relevanceScore;
      
      // Boost results based on intent context
      if (intent.context.includes('fraud-detection') && 
          (result.title.toLowerCase().includes('fraud') || result.description.toLowerCase().includes('fraud'))) {
        intentScore *= 1.3;
      }
      
      if (intent.context.includes('ml-models') && result.type === 'product' && 
          result.metadata.technology?.toLowerCase().includes('mlflow')) {
        intentScore *= 1.25;
      }
      
      if (intent.context.includes('customer-data') && 
          (result.title.toLowerCase().includes('customer') || result.description.toLowerCase().includes('customer'))) {
        intentScore *= 1.2;
      }
      
      return {
        ...result,
        relevanceScore: Math.min(intentScore, 1.0)
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  private generateContextualMessage(query: string, intent: any, results: SearchResult[]): string {
    const resultCount = results.length;
    const hasContext = intent.context.length > 1;
    
    switch (intent.type) {
      case 'discovery':
        if (hasContext && intent.context.includes('fraud-detection')) {
          return `I found ${resultCount} fraud detection and risk management assets for "${query}". Here are the most relevant ones:`;
        }
        if (hasContext && intent.context.includes('customer-data')) {
          return `I discovered ${resultCount} customer data assets related to "${query}". These should help with your customer analytics:`;
        }
        return `I found ${resultCount} data assets related to "${query}". Here are the most relevant ones:`;
        
      case 'explanation':
        return `Let me explain what I found about "${query}". Here are the relevant data assets with detailed information:`;
        
      case 'recommendation':
        if (hasContext && intent.context.includes('ml-models')) {
          return `Based on your query "${query}", I recommend these ML models and data products:`;
        }
        return `Based on your requirements for "${query}", I recommend these data assets:`;
        
      case 'comparison':
        return `Here are the data assets I found for comparison regarding "${query}". I've highlighted the key differences:`;
        
      default:
        return `Here are ${resultCount} results for "${query}":`;
    }
  }
  
  private generateSmartActions(intent: any, results: SearchResult[]): AIResponse['actions'] {
    const actions: AIResponse['actions'] = [
      { id: 'refine', label: 'Refine Search', type: 'search' }
    ];
    
    if (intent.type === 'discovery' || intent.type === 'recommendation') {
      actions.push({ id: 'filter', label: 'Add Filters', type: 'filter' });
    }
    
    if (results.some(r => r.type === 'product')) {
      actions.push({ id: 'bulk-cart', label: 'Add All to Cart', type: 'navigate' });
    }
    
    actions.push({ id: 'export', label: 'Export Results', type: 'export' });
    
    return actions;
  }
  
  private generateSmartFollowUps(_query: string, intent: any, _results: SearchResult[]): string[] {
    const questions: string[] = [];
    
    if (intent.type === 'discovery') {
      if (intent.context.includes('fraud-detection')) {
        questions.push(
          'Show me the data lineage for these fraud models',
          'What are the performance metrics for fraud detection?',
          'Find related risk assessment datasets'
        );
      } else if (intent.context.includes('customer-data')) {
        questions.push(
          'Show me customer segmentation models',
          'What are the data quality scores for customer data?',
          'Find customer behavior analytics products'
        );
      } else {
        questions.push(
          'Show me only the published contracts',
          'Filter by specific technology stack',
          'What are the quality scores for these assets?'
        );
      }
    } else if (intent.type === 'explanation') {
      questions.push(
        'How do I request access to these assets?',
        'What are the data lineage relationships?',
        'Show me the detailed schema information'
      );
    } else if (intent.type === 'recommendation') {
      questions.push(
        'Why are these assets recommended?',
        'Show me similar alternatives',
        'What are the usage patterns for these assets?'
      );
    }
    
    return questions.slice(0, 3);
  }
  
  private generateSmartRelatedSearches(query: string, intent: any): string[] {
    const related: string[] = [];
    
    if (intent.context.includes('fraud-detection')) {
      related.push(
        'anomaly detection algorithms',
        'transaction monitoring systems',
        'risk scoring models',
        'suspicious activity detection'
      );
    } else if (intent.context.includes('customer-data')) {
      related.push(
        'customer segmentation models',
        'customer lifetime value',
        'customer behavior analytics',
        'customer satisfaction metrics'
      );
    } else if (intent.context.includes('ml-models')) {
      related.push(
        'model performance metrics',
        'feature engineering pipelines',
        'model deployment workflows',
        'model monitoring dashboards'
      );
    } else {
      // Generic related searches based on query terms
      const queryLower = query.toLowerCase();
      if (queryLower.includes('credit')) {
        related.push('credit risk models', 'credit scoring algorithms', 'loan default prediction');
      } else if (queryLower.includes('transaction')) {
        related.push('payment processing data', 'transaction analytics', 'financial reporting');
      } else {
        related.push('data quality monitoring', 'pipeline execution status', 'data lineage tracking');
      }
    }
    
    return related.slice(0, 4);
  }
  

}

export const searchService = new SearchService();