import { useEffect, useRef, useCallback } from 'react';
import { useSearchStore } from '@/stores/search';
import { Loader2, Bot, User, ExternalLink, ShoppingCart, Eye, Lightbulb, ArrowRight, GitBranch, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cart';
import type { SearchResult } from '@/types';

export function AIChat() {
  const currentConversation = useSearchStore(state => state.currentConversation);
  const isSearching = useSearchStore(state => state.isSearching);
  const searchError = useSearchStore(state => state.searchError);
  const currentQuery = useSearchStore(state => state.currentQuery);
  
  const executeAISearch = useCallback((query: string) => {
    return useSearchStore.getState().executeAISearch(query);
  }, []);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isSearching]);

  const handleSuggestionClick = (suggestion: string) => {
    executeAISearch(suggestion);
  };

  const handleCardAction = (card: SearchResult, actionType: string) => {
    switch (actionType) {
      case 'navigate':
        if (card.type === 'domain') {
          navigate(`/domain/${card.id}`);
        } else if (card.type === 'contract') {
          navigate(`/contract/${card.id}`);
        } else if (card.type === 'product') {
          navigate(`/product/${card.id}`);
        }
        break;
      
      case 'cart':
        if (card.type === 'product') {
          const mockProduct = {
            id: card.id,
            name: card.title,
            dataContractId: card.id,
            configJson: {},
            github: { repoName: '', repoUrl: '', pagesUrl: '' },
            technology: card.metadata.technology,
            description: card.description
          };
          addToCart(mockProduct);
          console.log(`${card.title} has been added to your cart.`);
        }
        break;
    }
  };

  if (!currentQuery && !currentConversation?.messages.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground max-w-md">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="font-medium text-lg mb-2">AI Assistant</p>
          <p className="text-sm mb-6">
            Ask me anything about your data catalog. I can help you discover data assets, 
            explain schemas, and recommend relevant datasets.
          </p>
          
          {/* Sample questions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Try asking:
            </p>
            <div className="space-y-2">
              {[
                "Show me fraud detection models",
                "What customer data is available?",
                "Find credit card transaction contracts",
                "Recommend data for risk analysis"
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(question)}
                  className="w-full text-xs h-8 justify-start"
                >
                  <Lightbulb className="h-3 w-3 mr-2" />
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {currentConversation?.messages.map(message => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {message.type === 'user' ? (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
              
              {/* AI Response Cards */}
              {message.response?.cards && message.response.cards.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Found {message.response.cards.length} relevant data assets:
                  </p>
                  <div className="grid gap-3">
                    {message.response.cards.map(card => (
                      <div key={card.id} className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {card.type === 'domain' && <GitBranch className="h-3 w-3 mr-1" />}
                              {card.type === 'contract' && <Star className="h-3 w-3 mr-1" />}
                              {card.type === 'product' && <ExternalLink className="h-3 w-3 mr-1" />}
                              {card.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(card.relevanceScore * 100)}% match
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1">{card.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {card.description}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {card.metadata.domain && (
                            <Badge variant="secondary" className="text-xs">
                              {card.metadata.domain}
                            </Badge>
                          )}
                          {card.metadata.technology && (
                            <Badge variant="secondary" className="text-xs">
                              {card.metadata.technology}
                            </Badge>
                          )}
                          {card.metadata.layer && (
                            <Badge variant="secondary" className="text-xs">
                              {card.metadata.layer}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {card.actions.map(action => (
                            <Button
                              key={action.id}
                              variant={action.primary ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleCardAction(card, action.type)}
                              className="text-xs h-6"
                            >
                              {action.type === 'navigate' && <Eye className="h-3 w-3 mr-1" />}
                              {action.type === 'cart' && <ShoppingCart className="h-3 w-3 mr-1" />}
                              {action.type === 'preview' && <ExternalLink className="h-3 w-3 mr-1" />}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Follow-up Questions */}
              {message.response?.followUpQuestions && message.response.followUpQuestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Follow-up questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.response.followUpQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(question)}
                        className="text-xs h-7 px-2 border border-border hover:bg-accent"
                      >
                        {question}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Searches */}
              {message.response?.relatedSearches && message.response.relatedSearches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Related searches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.response.relatedSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(search)}
                        className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading State */}
        {isSearching && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Analyzing your request and searching the data catalog...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {searchError && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">
                  Sorry, I encountered an error while processing your request: {searchError}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try rephrasing your question or try again later.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}