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
#
## Requirement 10

**User Story:** Como um usuário da plataforma, eu quero ter acesso a um sistema de busca inteligente e semântico, para que eu possa descobrir dados e produtos de forma natural usando linguagem cotidiana.

#### Acceptance Criteria

1. WHEN o usuário acessa qualquer página da aplicação THEN o sistema SHALL exibir um ícone de busca no header
2. WHEN o usuário clica no ícone de busca OU pressiona Cmd/Ctrl+K THEN o sistema SHALL abrir uma interface de busca modal
3. WHEN a interface de busca é aberta THEN o sistema SHALL oferecer dois modos: "Resultados Tradicionais" e "Assistente IA"
4. WHEN o usuário digita uma consulta THEN o sistema SHALL processar tanto busca estruturada quanto linguagem natural
5. WHEN resultados são encontrados THEN o sistema SHALL exibir cards organizados por categoria (Domínios, Contratos, Produtos)

### Requirement 11

**User Story:** Como um usuário, eu quero usar linguagem natural para descobrir dados, para que eu possa encontrar informações sem conhecer a estrutura técnica exata.

#### Acceptance Criteria

1. WHEN o usuário faz uma pergunta como "mostre modelos de detecção de fraude" THEN o sistema SHALL entender a intenção e retornar produtos relevantes
2. WHEN o usuário pergunta sobre dados de clientes THEN o sistema SHALL identificar contratos e produtos relacionados a dados de clientes
3. WHEN uma consulta é processada THEN o sistema SHALL gerar respostas contextuais explicando os resultados encontrados
4. WHEN respostas são geradas THEN o sistema SHALL incluir sugestões de perguntas de acompanhamento
5. WHEN o usuário interage com o assistente THEN o sistema SHALL manter histórico da conversa para refinamento

### Requirement 12

**User Story:** Como um usuário, eu quero visualizar resultados de busca de forma organizada e interativa, para que eu possa rapidamente identificar e acessar os dados que preciso.

#### Acceptance Criteria

1. WHEN resultados são exibidos no modo tradicional THEN o sistema SHALL mostrar cards com informações resumidas
2. WHEN um card é exibido THEN o sistema SHALL incluir ações rápidas (Ver Detalhes, Adicionar ao Carrinho, Solicitar Acesso)
3. WHEN resultados são muitos THEN o sistema SHALL implementar paginação ou scroll infinito
4. WHEN nenhum resultado é encontrado THEN o sistema SHALL sugerir consultas alternativas
5. WHEN o usuário passa o mouse sobre um resultado THEN o sistema SHALL mostrar preview com informações adicionais

### Requirement 13

**User Story:** Como um usuário, eu quero filtrar e refinar minha busca, para que eu possa encontrar exatamente o que preciso de forma eficiente.

#### Acceptance Criteria

1. WHEN a interface de busca é aberta THEN o sistema SHALL oferecer filtros por domínio, tecnologia e tipo de dados
2. WHEN filtros são aplicados THEN o sistema SHALL atualizar os resultados em tempo real
3. WHEN o usuário busca frequentemente THEN o sistema SHALL salvar buscas favoritas e histórico
4. WHEN o usuário tem um papel específico THEN o sistema SHALL personalizar sugestões baseadas no contexto
5. WHEN novos dados correspondem a buscas salvas THEN o sistema SHALL notificar o usuário

### Requirement 14

**User Story:** Como um usuário, eu quero que a busca seja integrada com os fluxos de trabalho existentes, para que eu possa descobrir e acessar dados de forma fluida.

#### Acceptance Criteria

1. WHEN encontro um produto na busca THEN o sistema SHALL permitir adicionar diretamente ao carrinho
2. WHEN encontro um contrato na busca THEN o sistema SHALL permitir navegar diretamente para os detalhes
3. WHEN uso a busca THEN o sistema SHALL preservar o contexto da página atual
4. WHEN compartilho resultados THEN o sistema SHALL gerar URLs compartilháveis para buscas
5. WHEN acesso a busca de páginas diferentes THEN o sistema SHALL adaptar sugestões ao contexto atual

### Requirement 15

**User Story:** Como um administrador, eu quero insights sobre como os usuários descobrem e acessam dados, para que eu possa otimizar a organização e disponibilidade dos dados.

#### Acceptance Criteria

1. WHEN usuários fazem buscas THEN o sistema SHALL registrar padrões de consulta e interações
2. WHEN dados são acessados via busca THEN o sistema SHALL rastrear popularidade e uso
3. WHEN consultas não retornam resultados THEN o sistema SHALL identificar lacunas no catálogo
4. WHEN usuários interagem com resultados THEN o sistema SHALL medir eficácia da busca
5. WHEN relatórios são gerados THEN o sistema SHALL mostrar métricas de descoberta e acesso aos dados