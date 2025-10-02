# Implementation Plan

- [x] 1. Setup project structure and core dependencies
  - Initialize Vite React TypeScript project
  - Install and configure ShadCN UI, Tailwind CSS, React Router, and Zustand
  - Set up project folder structure for components, stores, types, and pages
  - Configure TypeScript strict mode and ESLint rules
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Implement core data models and types
  - Create TypeScript interfaces for DataContract, DataProduct, Domain, and Collection
  - Define schema-related types (Column, QualityRule, ExecutionInfo)
  - Create utility types for API responses and component props
  - Set up constants for tag values (Layer, Status)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Set up theme system and layout foundation
  - Configure ShadCN UI theme provider with light/dark mode support
  - Create ThemeToggle component with localStorage persistence
  - Implement AppLayout component with header and main content area
  - Add system preference detection for initial theme
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4. Create mock data service and initial stores
  - Create mock data service with sample domains, collections, contracts, and products
  - Implement Domain store with Zustand for state management
  - Add DataContract store for contract-related state
  - Create DataProduct store for product management
  - Include loading and error states in all stores
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 5. Implement routing and navigation structure
  - Set up React Router with hierarchical route structure
  - Create route definitions for domains, collections, contracts, and products
  - Implement Breadcrumb component for navigation context
  - Add 404 error page and route protection
  - _Requirements: 1.3, 2.3, 5.4, 6.1_

- [x] 6. Build domain listing and navigation
  - Create DomainCard component with banking domain examples
  - Implement DomainListPage with grid layout of domain cards
  - Add click handlers to navigate to domain collections
  - Include loading states and error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 7. Implement collection listing functionality
  - Create CollectionList component for displaying collections within a domain
  - Build CollectionListPage with collection cards (e.g., "cartões de crédito")
  - Add navigation from collections to contract listings
  - Include domain context and breadcrumb navigation
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 8. Create schema visualization component
  - Build SchemaVisualizer component to display table schema visually
  - Implement table representation with column names, types, and constraints
  - Add tooltip functionality for schema dictionary descriptions
  - Include visual indicators for primary keys and relationships
  - _Requirements: 3.2, 4.2_

- [x] 9. Build DataContract detail page layout
  - Create DataContractDetailPage with two-column layout
  - Implement left column for contract information display
  - Build right column container for modules (products and quality rules)
  - Add schema visualizer in the top row as specified
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Implement contract information panel
  - Create ContractInfoPanel component for left column content
  - Display contract fundamentals (name, version, owner, domain, collection)
  - Show contract terms and additional metadata
  - Include tag display for Layer and Status information
  - _Requirements: 3.4, 4.1, 4.4_

- [x] 11. Build DataProducts module for contract page
  - Create DataProductsModule component for right column
  - Display associated products with last execution info and technology
  - Add click handlers to navigate to individual product pages
  - Include product status indicators and basic information
  - _Requirements: 3.5, 5.1, 5.2, 5.3, 5.4_

- [x] 12. Implement Quality Rules module
  - Create QualityRulesModule component for contract page
  - Display all quality rules associated with the contract
  - Format rules in a readable, organized manner
  - Add visual indicators for rule types and severity
  - _Requirements: 3.5, 4.3_

- [x] 13. Create DataProduct detail page structure
  - Build DataProductDetailPage with two-column layout
  - Implement main content area with tab navigation
  - Create sidebar area for status modules
  - Set up tab switching functionality between documentation and YAML
  - _Requirements: 6.1, 6.2_

- [x] 14. Implement documentation tab with GitHub Pages integration
  - Create DocumentationTab component with iframe embedding
  - Integrate GitHub Pages URL rendering with proper sandbox settings
  - Fetch https://ryojikn.github.io/mlflow-proxy/ as github pages url mockup
  - Add loading states and error handling for external content
  - Include fallback content when GitHub Pages is unavailable
  - _Requirements: 6.3_

- [x] 15. Build YAML configuration tab
  - Create YamlConfigTab component for displaying product configuration
  - Implement syntax highlighting for YAML content
  - Add copy-to-clipboard functionality
  - Format JSON/YAML data from DataProduct configJson field
  - _Requirements: 6.4_

- [x] 16. Implement deployments monitoring module
  - Create DeploymentsModule component for sidebar
  - Display recent deployments from GitHub Actions with status and dates
  - Add visual indicators for success/failure states
  - Include links to GitHub Actions runs when available
  - _Requirements: 7.1, 7.2_

- [x] 17. Build executions status module
  - Create ExecutionsModule component showing job execution history
  - Display Databricks job executions with dates and success/failure status
  - Add status badges and execution duration information
  - Include filtering and sorting capabilities for execution history
  - _Requirements: 7.3_

- [x] 18. Implement quality monitoring module
  - Create QualityMonitorModule component for data quality alerts
  - Display quality monitoring status and recent alerts
  - Add severity indicators and alert descriptions
  - Include links to detailed quality reports when available
  - _Requirements: 7.4_

- [ ] 19. Implement error handling and loading states
  - Add React Error Boundaries for component error catching
  - Implement skeleton loaders for all data-fetching components
  - Create user-friendly error messages and retry mechanisms
  - Add offline detection and appropriate user feedback
  - _Requirements: All requirements - cross-cutting concern_

