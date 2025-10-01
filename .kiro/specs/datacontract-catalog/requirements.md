# Requirements Document

## Introduction

O DataContract Catalog é uma plataforma web que implementa os conceitos do DataMeshManager para gerenciar contratos de dados e produtos de dados. A plataforma permite navegar hierarquicamente através de domínios de dados, coleções de dados, contratos de dados e produtos de dados, fornecendo uma interface visual para visualizar schemas, regras de qualidade, documentação e status de execução. A solução será construída usando Vite, ShadCN UI e Tailwind CSS com suporte a temas claro e escuro.

## Requirements

### Requirement 1

**User Story:** Como um usuário da plataforma, eu quero visualizar todos os domínios de dados disponíveis em uma página inicial, para que eu possa navegar facilmente pelos diferentes domínios organizacionais.

#### Acceptance Criteria

1. WHEN o usuário acessa a página inicial THEN o sistema SHALL exibir todos os domínios de dados em formato de cards
2. WHEN o usuário visualiza um card de domínio THEN o sistema SHALL mostrar o nome do domínio e informações básicas
3. WHEN o usuário clica em um card de domínio THEN o sistema SHALL navegar para a página de coleções daquele domínio
4. IF existem domínios como cartões, seguros, consórcio THEN o sistema SHALL exibi-los como exemplos de domínios bancários

### Requirement 2

**User Story:** Como um usuário, eu quero navegar pelas coleções de dados dentro de um domínio, para que eu possa encontrar os contratos de dados específicos que preciso.

#### Acceptance Criteria

1. WHEN o usuário seleciona um domínio THEN o sistema SHALL exibir todas as coleções de dados daquele domínio
2. WHEN o usuário visualiza as coleções THEN o sistema SHALL mostrar exemplos como "cartões de crédito" para o domínio de cartões
3. WHEN o usuário clica em uma coleção THEN o sistema SHALL navegar para a lista de contratos de dados daquela coleção

### Requirement 3

**User Story:** Como um usuário, eu quero visualizar os detalhes de um contrato de dados, para que eu possa entender sua estrutura, regras e produtos associados.

#### Acceptance Criteria

1. WHEN o usuário seleciona um contrato de dados THEN o sistema SHALL exibir uma página detalhada do contrato
2. WHEN a página do contrato é carregada THEN o sistema SHALL mostrar um schema visual da tabela no topo (row 1, col 1)
3. WHEN a página do contrato é exibida THEN o sistema SHALL dividir o conteúdo em duas colunas principais
4. WHEN o conteúdo é exibido THEN a coluna esquerda SHALL mostrar informações do contrato (info, termos, owner, domínio)
5. WHEN o conteúdo é exibido THEN a coluna direita SHALL mostrar módulos com produtos de dados associados e regras de qualidade

### Requirement 4

**User Story:** Como um usuário, eu quero gerenciar contratos de dados com metainformações estruturadas, para que eu possa manter informações consistentes sobre cada contrato.

#### Acceptance Criteria

1. WHEN um contrato de dados é criado THEN o sistema SHALL armazenar fundamentals (nome, versão, owner, domínio, coleção)
2. WHEN um contrato é definido THEN o sistema SHALL incluir schema da tabela alvo com dicionarização
3. WHEN regras são definidas THEN o sistema SHALL armazenar quality rules específicas do contrato
4. WHEN tags são adicionadas THEN o sistema SHALL suportar tags como Layer (Bronze, Silver, Gold, Model) e Status (published, draft, archived)

### Requirement 5

**User Story:** Como um usuário, eu quero visualizar produtos de dados associados a um contrato, para que eu possa acompanhar implementações e execuções.

#### Acceptance Criteria

1. WHEN produtos de dados existem THEN o sistema SHALL mostrar N produtos associados ao contrato
2. WHEN um produto é exibido THEN o sistema SHALL mostrar ID, nome, contrato associado, repositório GitHub
3. WHEN informações do produto são mostradas THEN o sistema SHALL incluir última execução e tecnologia implementada
4. WHEN o usuário clica em um produto THEN o sistema SHALL navegar para a página detalhada do produto

### Requirement 6

**User Story:** Como um usuário, eu quero visualizar detalhes completos de um produto de dados, para que eu possa acessar documentação, configurações e status de execução.

#### Acceptance Criteria

1. WHEN a página do produto é carregada THEN o sistema SHALL dividir o conteúdo em duas colunas
2. WHEN a coluna principal é exibida THEN o sistema SHALL mostrar duas abas
3. WHEN a primeira aba é selecionada THEN o sistema SHALL renderizar a documentação do GitHub Pages
4. WHEN a segunda aba é selecionada THEN o sistema SHALL mostrar o arquivo YAML do produto
5. WHEN a coluna direita é exibida THEN o sistema SHALL mostrar módulos laterais com informações de status

### Requirement 7

**User Story:** Como um usuário, eu quero acompanhar deployments e execuções de produtos de dados, para que eu possa monitorar a saúde dos meus produtos.

#### Acceptance Criteria

1. WHEN módulos laterais são exibidos THEN o sistema SHALL mostrar últimos deployments do GitHub Actions
2. WHEN deployments são mostrados THEN o sistema SHALL incluir status (sucesso/falha) e data
3. WHEN execuções são exibidas THEN o sistema SHALL mostrar status de jobs (ex: Databricks) com data e resultado
4. WHEN monitoramento existe THEN o sistema SHALL mostrar alertas de qualidade associados ao produto

### Requirement 8

**User Story:** Como um usuário, eu quero alternar entre temas claro e escuro, para que eu possa usar a plataforma conforme minha preferência visual.

#### Acceptance Criteria

1. WHEN a aplicação é carregada THEN o sistema SHALL suportar tema claro e escuro
2. WHEN o usuário alterna o tema THEN o sistema SHALL aplicar as cores do ShadCN UI correspondentes
3. WHEN o tema é alterado THEN o sistema SHALL persistir a preferência do usuário
4. WHEN componentes são renderizados THEN o sistema SHALL usar consistentemente o tema selecionado

### Requirement 9

**User Story:** Como um desenvolvedor, eu quero uma aplicação construída com tecnologias modernas, para que eu possa manter e expandir facilmente a plataforma.

#### Acceptance Criteria

1. WHEN a aplicação é desenvolvida THEN o sistema SHALL usar Vite como build tool
2. WHEN componentes são criados THEN o sistema SHALL usar ShadCN UI como biblioteca de componentes
3. WHEN estilos são aplicados THEN o sistema SHALL usar Tailwind CSS para estilização
4. WHEN a interface é construída THEN o sistema SHALL priorizar o estilo do ShadCN UI