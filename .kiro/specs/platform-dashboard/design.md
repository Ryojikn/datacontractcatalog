# Design Document - Platform Dashboard

## Overview

O Platform Dashboard será uma página dedicada que fornece uma visão executiva das métricas principais da plataforma DataContract Catalog. A implementação seguirá os padrões de design já estabelecidos na aplicação, utilizando os componentes UI existentes e criando novos componentes específicos para métricas.

## Architecture

### Component Structure
```
src/pages/dashboard/
├── dashboard-page.tsx          # Página principal do dashboard
├── components/
│   ├── metrics-card.tsx        # Componente reutilizável para cards de métricas
│   ├── contracts-metrics.tsx   # Métricas específicas de data contracts
│   ├── products-metrics.tsx    # Métricas específicas de data products
│   ├── users-metrics.tsx       # Métricas de usuários e grupos
│   └── dashboard-header.tsx    # Header do dashboard com título e ações
├── hooks/
│   └── use-dashboard-data.tsx  # Hook customizado para gerenciar dados do dashboard
└── types/
    └── dashboard.types.ts      # Tipos específicos do dashboard
```

### Data Flow
1. **Dashboard Page** carrega e orquestra todos os componentes
2. **Custom Hook** (`use-dashboard-data`) gerencia estado e chamadas de API
3. **Service Layer** (`dashboardService`) abstrai chamadas para APIs/mock data
4. **Store** (opcional) para cache de dados se necessário

## Components and Interfaces

### 1. Dashboard Page Component
```typescript
interface DashboardPageProps {
  // Página principal - sem props específicas
}

// Responsabilidades:
// - Layout geral da página
// - Coordenação entre componentes de métricas
// - Gerenciamento de estados de loading/error globais
```

### 2. Metrics Card Component
```typescript
interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  subtitle?: string;
  loading?: boolean;
  error?: string;
}

// Componente reutilizável para exibir métricas individuais
```

### 3. Contracts Metrics Component
```typescript
interface ContractsMetricsProps {
  data: ContractMetrics;
  loading: boolean;
  error?: string;
}

interface ContractMetrics {
  total: number;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
  trend?: MetricTrend;
}
```

### 4. Products Metrics Component
```typescript
interface ProductsMetricsProps {
  data: ProductMetrics;
  loading: boolean;
  error?: string;
}

interface ProductMetrics {
  total: number;
  byEnvironment: {
    dev: number;
    pre: number;
    pro: number;
    undefined: number;
  };
  trend?: MetricTrend;
}
```

### 5. Users Metrics Component
```typescript
interface UsersMetricsProps {
  data: UserMetrics;
  loading: boolean;
  error?: string;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  trend?: MetricTrend;
}
```

## Data Models

### Core Dashboard Types
```typescript
interface DashboardData {
  contracts: ContractMetrics;
  products: ProductMetrics;
  users: UserMetrics;
  lastUpdated: string;
}

interface MetricTrend {
  value: number;
  direction: 'up' | 'down' | 'stable';
  period: string;
  percentage: number;
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastRefresh: string | null;
}
```

### API Response Types
```typescript
interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}
```

## Error Handling

### Error States
1. **Network Errors**: Retry automático com fallback para dados em cache
2. **Data Parsing Errors**: Logs detalhados + valores padrão
3. **Partial Data Errors**: Exibir dados disponíveis + indicar componentes com erro
4. **Complete Failure**: Página de erro com opção de retry

### Error Recovery
- Retry automático para falhas de rede (3 tentativas)
- Cache local para dados críticos
- Graceful degradation com dados mock quando necessário

## Testing Strategy

### Unit Tests
- Componentes individuais de métricas
- Hook customizado de dados
- Utilitários de formatação e cálculo
- Service layer

### Integration Tests
- Fluxo completo de carregamento de dados
- Interação entre componentes
- Estados de loading e error

### E2E Tests
- Navegação para dashboard via header
- Carregamento completo da página
- Responsividade em diferentes dispositivos
- Atualização automática de dados

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Componentes de métricas carregados sob demanda
2. **Memoization**: React.memo para componentes de métricas
3. **Data Caching**: Cache de 5 minutos para dados do dashboard
4. **Skeleton Loading**: Estados de loading visuais durante carregamento

### Bundle Size
- Componentes específicos do dashboard em chunk separado
- Lazy import da página de dashboard
- Otimização de ícones (tree shaking)

## Accessibility

### WCAG Compliance
- Contraste adequado para todos os elementos visuais
- Labels apropriados para screen readers
- Navegação por teclado funcional
- Indicadores de loading acessíveis

### Semantic HTML
- Uso correto de headings (h1, h2, h3)
- Landmarks apropriados (main, section, article)
- ARIA labels para métricas e gráficos

## Mobile Responsiveness

### Breakpoints
- **Mobile**: < 640px - Stack vertical de cards
- **Tablet**: 640px - 1024px - Grid 2x2
- **Desktop**: > 1024px - Grid 3x2 ou 4x2

### Touch Interactions
- Botões com tamanho mínimo de 44px
- Espaçamento adequado entre elementos interativos
- Gestos de refresh (pull-to-refresh) se aplicável

## Integration Points

### Existing Services
- Utilizar `mockDataService` existente como base
- Estender com novos métodos para métricas de dashboard
- Manter consistência com padrões de API existentes

### Navigation
- Integração com roteamento existente (React Router)
- Breadcrumbs apropriados
- Link no header já implementado

### Styling
- Utilizar sistema de design existente (Tailwind + shadcn/ui)
- Manter consistência visual com resto da aplicação
- Reutilizar componentes UI existentes quando possível