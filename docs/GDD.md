# AgroGestão
## Game Design Document — Completo
### Simulador de Gestão Agroindustrial · Jornada de Formação de um Empresário Rural

> "Você não começa sabendo administrar uma empresa. Você aprende administrando a empresa."

---

## Sumário

1. [Resumo Executivo](#1-resumo-executivo)
2. [Propósito do Projeto](#2-propósito-do-projeto)
3. [Pilares de Design](#3-pilares-de-design)
4. [Fantasia do Jogador e Core Fantasy](#4-fantasia-do-jogador-e-core-fantasy)
5. [Origem do Jogador e Herança](#5-origem-do-jogador-e-herança)
6. [Campanha Inicial / Prólogo](#6-campanha-inicial--prólogo)
7. [O Loop Central, Ciclo Narrativo e Sistema de Tempo](#7-o-loop-central-ciclo-narrativo-e-sistema-de-tempo)
8. [A Empresa: Objeto Central do Jogo](#8-a-empresa-objeto-central-do-jogo)
9. [Estado da Empresa e Modelo de Dados](#9-estado-da-empresa-e-modelo-de-dados)
10. [Vertical de Lançamento: Avicultura de Postura](#10-vertical-de-lançamento-avicultura-de-postura)
11. [Sistemas de Gestão](#11-sistemas-de-gestão)
12. [Mentores e Personagens-Chave](#12-mentores-e-personagens-chave)
13. [Conhecimento, Memória e Missões](#13-conhecimento-memória-e-missões)
14. [Clientes e Sistema de Relacionamentos](#14-clientes-e-sistema-de-relacionamentos)
15. [Mercado Dinâmico, Concorrentes e IA](#15-mercado-dinâmico-concorrentes-e-ia)
16. [Oportunidades Comerciais](#16-oportunidades-comerciais)
17. [Progressão Tripla: Empresa / Jogador / Relações](#17-progressão-tripla-empresa--jogador--relações)
18. [Memória, Histórico e Legado da Empresa](#18-memória-histórico-e-legado-da-empresa)
19. [Eventos](#19-eventos)
20. [Objetivos Progressivos](#20-objetivos-progressivos)
21. [Direção Visual, UI/UX e Interface](#21-direção-visual-uiux-e-interface)
22. [Realismo e Prioridades de Escopo](#22-realismo-e-prioridades-de-escopo)
23. [Domain Bible e Princípios de Modelagem](#23-domain-bible-e-princípios-de-modelagem)
24. [Arquitetura Conceitual](#24-arquitetura-conceitual)
25. [Roadmap de Desenvolvimento e Prioridades](#25-roadmap-de-desenvolvimento-e-prioridades)
26. [Impacto no MVP](#26-impacto-no-mvp)
27. [Arquitetura Técnica (Resumo)](#27-arquitetura-técnica-resumo)
28. [Exemplo de Progressão Empresarial e Visão de Longo Prazo](#28-exemplo-de-progressão-empresarial-e-visão-de-longo-prazo)
29. [Critérios de Sucesso e Identidade do Projeto](#29-critérios-de-sucesso-e-identidade-do-projeto)
30. [Próxima Etapa Recomendada](#30-próxima-etapa-recomendada)

---

## 1. Resumo Executivo

| Campo | Definição |
|---|---|
| **Gênero** | Simulação de gestão empresarial (business management sim) com camada narrativa de formação de personagem |
| **Ambientação** | Agronegócio, começando pela avicultura de postura |
| **Plataforma** | Web responsiva / PWA → Android → iOS → Desktop |
| **Público** | Fãs de tycoons e management sims (Two Point, Prison Architect, RollerCoaster Tycoon, Football Manager) e pessoas interessadas em negócios e agro |
| **Sessão** | Curtas (5–15 min) e longas (30–60 min, planejamento e expansão) |
| **Progressão** | Campanha persistente e contínua, sem "fim" fixo |

**Pitch:** o jogador herda uma pequena propriedade rural, inexperiente, e precisa aprender a administrá-la enquanto a administra. Através de decisões — não de tarefas manuais repetitivas — ele transforma essa herança incerta em um grupo agroindustrial completo, construindo ao longo do caminho conhecimento, relações e uma reputação que são só suas.

**O que o jogo NÃO é:** um Farming Simulator, um ERP gamificado, um tycoon de cliques repetitivos, nem um simulador social. É um simulador de decisões empresariais com contexto narrativo, que usa a operação agropecuária como pano de fundo.

---

## 2. Propósito do Projeto

O projeto possui dois objetivos simultâneos.

### 2.1 Objetivo como jogo

Criar um simulador divertido, estratégico, progressivo, viciante, acessível e realista sem ser excessivamente burocrático — baseado em decisões, com consequências claras e profundidade suficiente para campanhas de longo prazo.

### 2.2 Objetivo como ferramenta de aprendizado

O desenvolvimento também serve como mecanismo de aprendizado sobre agronegócio, processos produtivos, regras de negócio, gestão empresarial, financeiro, compras, estoque, contratos, crédito, logística, comercial, indicadores, relacionamento com fornecedores e clientes, e conceitos presentes em ERPs especializados. Cada nova mecânica implementada deve representar uma oportunidade de estudar e compreender uma regra de negócio real — o projeto não deve reproduzir conceitos que o próprio time não entende.

> Estudar → modelar → implementar → simular → observar → documentar.

---

## 3. Pilares de Design

### Pilar 1 — Decisão acima de execução
O jogador gasta seu tempo analisando, planejando, negociando, comprando, vendendo, contratando e reagindo — nunca executando tarefas manuais repetitivas.

### Pilar 2 — Consequência percebida
Toda decisão relevante deve ter uma consequência que o jogador consiga rastrear até sua origem.

### Pilar 3 — Complexidade progressiva
A profundidade do jogo é revelada em camadas. Ninguém aprende a estrutura inteira de uma empresa no primeiro dia.

### Pilar 4 — Realismo de decisão, não realismo burocrático
O objetivo é reproduzir relações, incentivos, riscos e trade-offs reais, sem descaracterizar a lógica do negócio.

### Pilar 5 — Aprendizado genuíno
Cada sistema novo corresponde a uma regra de negócio real, estudada e documentada (ver seção 23, Domain Bible).

### Pilar 6 — O mundo deve lembrar (novo)
As decisões do jogador alteram relações e oportunidades futuras. Clientes, funcionários e parceiros têm memória do comportamento da empresa.

### Pilar 7 — O jogador aprende por consequência, não por tutorial (novo)
> Você não começa sabendo administrar uma empresa. Você aprende administrando a empresa.

Sempre que possível, um conceito é experimentado antes de ser explicado — reforçando o Pilar 5 com uma fonte concreta: a própria herança recebida.

---

## 4. Fantasia do Jogador e Core Fantasy

A fantasia deixa de ser apenas "crescer uma empresa" e passa a ser uma jornada de formação:

```
Herdeiro inexperiente → Aprendiz de gestor → Empresário rural → Empresa regional → Grupo agroindustrial → Legado próprio
```

> Você herdou uma pequena propriedade rural. Agora precisa descobrir como ela funciona, aprender a administrar, conquistar clientes, enfrentar concorrentes e transformar uma herança em um negócio que seja realmente seu.

A identidade do jogo em uma frase: a operação agropecuária é o ambiente, a empresa é o objeto de gestão, as regras de negócio são o sistema, as decisões são o gameplay, as consequências são o desafio, o crescimento é a progressão, o conhecimento adquirido é parte do progresso — e as relações construídas ao longo do tempo dão vida ao mundo.

---

## 5. Origem do Jogador e Herança

O jogador começa como alguém inexperiente que herdou uma propriedade rural e uma pequena operação. Isso substitui o antigo início como "pequeno produtor já estabelecido" e cria motivação narrativa direta para a progressão.

> A empresa começa com alguma história. O jogador não.

### O que o jogador recebe

- Terreno, pequena granja e equipamentos; caixa limitado, possivelmente com dívidas.
- Contratos antigos, fornecedores conhecidos pela família, um ou dois clientes.
- Funcionários que já trabalhavam na propriedade e uma reputação herdada.
- Documentos e informações incompletas; pouco ou nenhum conhecimento administrativo.

### A herança é oportunidade e responsabilidade

Junto aos ativos (terreno, galpão, aves, equipamentos, veículo, estoque, clientes, contratos, reputação da família), o jogador herda problemas reais: financiamento em aberto, contas vencidas, equipamentos depreciados, um contrato antigo pouco vantajoso, um cliente insatisfeito, um fornecedor cobrando, um funcionário desmotivado, infraestrutura inadequada, baixa eficiência produtiva.

> Eu ganhei uma empresa... mas não sei se ela está saudável.

Essa incerteza inicial é o gatilho que leva o jogador a investigar, analisar e decidir desde a primeira sessão.

---

## 6. Campanha Inicial / Prólogo

Os primeiros momentos não apresentam todos os sistemas de uma vez. O jogador descobre conceitos por meio de situações concretas, guiado por personagens, não por telas de tutorial.

### Exemplo de descoberta orgânica

> Seu avô sempre comprava a ração da mesma empresa. Quer que eu faça o pedido?

Ao perguntar "quanto custa?", o jogador descobre que existe diferença entre pagamento à vista e faturado — e aprende, na prática, os conceitos de preço, prazo, fornecedor, caixa e capital de giro.

### Estrutura sugerida do prólogo

| Marco | O que acontece |
|---|---|
| Dia 1 — A propriedade | O jogador recebe a herança |
| Dia 2 — O funcionário | Conhece o funcionário veterano |
| Dia 3 — As contas | Descobre a situação financeira real |
| Dia 5 — Primeira compra | Aprende fornecedor, preço e prazo |
| Dia 7 — Primeira venda | Conhece o primeiro cliente |
| Dia 10 — Primeiro problema | Ocorre um evento operacional |
| Dia 15 — Primeira negociação | Escolhe uma condição comercial |
| Dia 20 — Primeiro investimento | Surge uma decisão de expansão ou manutenção |
| Dia 30 — Primeiro fechamento | Vê o resultado do primeiro ciclo |

Ao fim do prólogo, uma mensagem marca a transição para o jogo aberto:

> Agora a empresa é sua.

---

## 7. O Loop Central, Ciclo Narrativo e Sistema de Tempo

```
ANALISAR → PLANEJAR → DECIDIR → ACELERAR O TEMPO → OPERAÇÃO
   ↑                                                     ↓
REPETIR ← EXPANDIR ← ANALISAR RESULTADO ← REAGIR ← EVENTO/CONSEQUÊNCIA
```

### 7.1 Loops em diferentes escalas

| Escala | Fluxo |
|---|---|
| Diário | Evento → Decisão → Operação → Resultado |
| Semanal | Compras → Produção → Indicadores → Estoque → Ajustes |
| Mensal | Fechamento → DRE → Fluxo de caixa → Contratos → Planejamento |
| Por ciclo produtivo | Investimento → Recria → Produção → Comercialização → Resultado |
| Anual | Resultado anual → Expansão → Financiamento → Diversificação |

### 7.2 Sistema de tempo

O jogo possui passagem de tempo contínua, com velocidades Pausado, 1x, 2x, 4x e 8x. O jogador acelera principalmente quando não há decisões imediatas. Enquanto o tempo passa, o motor de simulação processa produção, consumo, estoque, contratos, pagamentos, recebimentos, mercado, funcionários, logística, clima, manutenção e eventos — continuamente, em segundo plano.

### 7.3 Ciclo narrativo (novo, complementar ao loop operacional)

```
Herança → Descoberta → Aprendizado → Sobrevivência → Primeiros relacionamentos
→ Confiança → Crescimento → Competição → Expansão → Verticalização
→ Grupo agroindustrial → Legado
```

O ciclo narrativo não substitui o loop operacional — ele dá significado à repetição desse loop ao longo de centenas de decisões.

---

## 8. A Empresa: Objeto Central do Jogo

Toda a experiência gira em torno da Empresa, que possui caixa, patrimônio, dívidas, crédito, reputação, conhecimento acumulado, funcionários, contratos, fornecedores, clientes, estoques, ativos, unidades produtivas e resultados financeiros.

```
Empresa
├── Unidades de Negócio (Matriz, Poedeira, Frango de Corte, Incubatório, Fábrica de Ração...)
├── Financeiro       ├── Compras       ├── Vendas
├── Estoque          ├── Contratos     ├── Pessoas
├── Logística        └── Mercado
```

Os módulos corporativos são compartilhados por todas as verticais — cada nova vertical de produção "pluga" nesses módulos em vez de reinventá-los.

---

## 9. Estado da Empresa e Modelo de Dados

O motor de simulação mantém uma visão consolidada do estado atual da empresa, usada pelo sistema de eventos para determinar possibilidades e probabilidades:

```
Estado da Empresa
Caixa · Dívida · Crédito · Reputação · Conhecimento
Ativos · Capacidade · Estoque · Contratos · Funcionários · Produção · Risco
```

### Entidades centrais do modelo de dados

```
Empresa · UnidadeNegocio · Ativo · Lote · Animal · Estoque · Produto
Fornecedor · Cliente · Contrato · PedidoCompra · ContaPagar · ContaReceber
Financiamento · Funcionario · Evento · Auditoria · HistoricoProducao · Mercado
Mentor · Relacionamento · Concorrente · Oportunidade · HistoricoEmpresa
```

O modelo será expandido conforme novas regras de negócio forem estudadas e novas verticais forem incorporadas.

---

## 10. Vertical de Lançamento: Avicultura de Postura

A primeira vertical cobre Matriz e Poedeira Comercial, construídas sobre um único motor parametrizado (MotorPostura): recria, ficha diária, ração, mortalidade, ambiência, produção, coleta, classificação e conversão alimentar.

```
Recria → Transição para produção (spiking / programa produtivo) → Produção contínua
       → Estoque de ovos (incubáveis / comerciais / descarte) → Comercialização
```

Verticais futuras (Frango de Corte, Incubatório, Fábrica de Ração, Grãos, Suinocultura, Piscicultura, Bovinocultura) reaproveitam os mesmos módulos corporativos — mas, conforme a seção 25, entram depois de consolidado o mundo econômico e humano.

---

## 11. Sistemas de Gestão

### 11.1 Financeiro
Caixa, contas a pagar, contas a receber, fluxo de caixa, DRE, capital de giro, crédito, financiamentos, juros, adiantamentos e inadimplência. Conceito central: uma empresa pode ser lucrativa e ainda assim ficar sem dinheiro, por causa do intervalo entre pagar insumos e receber pela venda.

### 11.2 Compras & Fornecedores
```
Necessidade → Cotação → Fornecedor → Negociação → Pedido → Recebimento → Estoque → Conta a pagar
```
Cada fornecedor combina preço, prazo de pagamento, prazo de entrega, confiabilidade e limite de crédito.

### 11.3 Contratos & Comercial
Contratos trocam segurança de receita por liberdade de mercado. Canais alternativos (spot, distribuidores, indústrias) têm perfis diferentes de preço, volume e risco.

### 11.4 Estoque & Ativos
Ativos (terrenos, galpões, silos, equipamentos, veículos) têm valor, capacidade, vida útil, manutenção e depreciação — investir em capacidade é sempre uma decisão anterior à produção.

### 11.5 Pessoas
Funcionários têm função, salário, produtividade, experiência e satisfação; podem pedir demissão ou ser promovidos.

### 11.6 Saúde da Operação & Auditoria Técnica
Uma visão consolidada (sanidade, manutenção, estoque, financeiro, conformidade) calcula uma nota de auditoria a partir do comportamento real da empresa, afetando risco de eventos, reputação, contratos e custos.

---

## 12. Mentores e Personagens-Chave

O jogador começa inexperiente e precisa de pessoas que funcionem como ponte entre ele e a operação. Cada mentor introduz um domínio de conhecimento de forma orgânica, não por meio de telas de tutorial.

| Mentor | Introduz |
|---|---|
| Funcionário veterano | Produção, fornecedores, clientes, rotina, histórico e problemas recorrentes da propriedade |
| Contador | Fluxo de caixa, contas, DRE, impostos, financiamentos, capital de giro, inadimplência |
| Técnico / Agrônomo / Zootecnista | Sanidade, produtividade, conversão alimentar, manejo, ambiência, protocolos produtivos |
| Gerente comercial | Clientes, negociação, contratos, preços, volumes, mercado, relacionamento comercial |

O funcionário veterano ajuda o jogador no começo, mas não é apenas um tutorial ambulante: pode discordar, cometer erros, ter preferências, desconfiar do jogador e desenvolver confiança com o tempo.

### Personagens evoluem com a relação

> Seu avô costumava fazer diferente. → Você está pegando o jeito. → Acho que você já pode decidir isso sozinho.

Essa evolução cria uma percepção de crescimento que não depende apenas de números.

---

## 13. Conhecimento, Memória e Missões

Reputação da empresa e Conhecimento do jogador evoluem em trilhas independentes — a empresa pode crescer sem que o jogador domine tudo, e o jogador pode aprender mesmo quando a empresa não cresce.

Um Codex de Conhecimento registra cada conceito descoberto (conversão alimentar, capital de giro, spiking, bonificação etc.), com definição, aplicação e impacto.

### Memória de experiência (novo)

Além de registrar o que foi desbloqueado, o jogo registra o que o jogador aprendeu por experiência própria. Exemplo: comprar ração barata à vista e, na sequência, ficar sem caixa para pagar salários gera uma lição registrada no Codex:

> Preço menor não significa custo menor.

Isso transforma o Codex de uma enciclopédia estática na história pessoal daquilo que o jogador aprendeu.

### Missões: aprender por necessidade

Missões ensinam conceitos através de problemas concretos, não de explicações abstratas. Exemplo — problema de capital de giro:

O jogador tem ração para 10 dias, um lote em produção, um contrato de venda com recebimento em 30 dias e caixa limitado. Ele precisa encontrar uma solução entre crédito, negociação com fornecedor, antecipação de recebíveis, compra menor ou venda no mercado spot.

> O objetivo é fazer o jogador aprender por necessidade, não por leitura.

---

## 14. Clientes e Sistema de Relacionamentos

Clientes deixam de ser linhas de uma tabela e passam a ser entidades persistentes, com características próprias.

| Atributo | Exemplo — Mercado São José |
|---|---|
| Relacionamento | 72/100 |
| Confiança | Alta |
| Volume comprado | Médio |
| Pontualidade | Boa |
| Sensibilidade a preço | Alta |
| Exigência de qualidade | Média |
| Prazo médio | 30 dias |
| Histórico | 18 meses |

### Quatro dimensões comerciais

- **Reputação** — como o mercado vê a empresa de maneira geral; afeta fornecedores, clientes, bancos, acesso a contratos e condições comerciais.
- **Relacionamento** — como uma contraparte específica vê a empresa.
- **Confiança** — quanto risco aquela contraparte aceita assumir com o jogador.
- **Poder de negociação** — quanto a empresa consegue influenciar preço, prazo, volume e condições contratuais.

### Clientes lembram do comportamento do jogador

Ações positivas (entregar no prazo, manter qualidade, cumprir contratos, atender emergências, comunicar problemas, manter regularidade) aumentam relacionamento, confiança e flexibilidade. Ações negativas (atrasar entregas ou pagamentos, quebrar contratos, entregar fora do padrão, prometer volumes que não cumpre) reduzem a confiança.

### Situações emergentes

Numa crise sanitária que impede a entrega de 100% do volume contratado, um cliente novo pode romper o contrato — enquanto um cliente antigo e confiável pode preferir reduzir o volume da semana e manter o contrato, porque o relacionamento construído tem consequência prática, não é só um número.

---

## 15. Mercado Dinâmico, Concorrentes e IA

O mercado não é apenas um preço que sobe e desce: é composto por agentes econômicos com interesses diferentes — produtores, distribuidores, supermercados, indústrias, restaurantes, atacadistas, fornecedores, transportadoras, bancos e concorrentes. Cada agente tem capacidade, necessidade, preço aceitável, prazo desejado, reputação, relacionamento e tolerância a risco.

### Concorrentes como empresas completas

O GDD já previa concorrentes controlados por IA; a evolução é dar a cada um nome, tamanho, capital, estrutura produtiva, eficiência, reputação, estratégia, relacionamentos, pontos fortes e fracos. Em fases avançadas, esses concorrentes disputam fornecedores, disputam contratos, alteram preços, expandem produção, entram em novos mercados e oferecem melhores condições — o mercado deixa de ser estático.

| Concorrente | Perfil |
|---|---|
| Granja Santa Clara | Grande produtora, baixo custo, grande volume, pouca flexibilidade, excelente acesso a crédito |
| Ovos do Vale | Produtora média, foco premium, relacionamento forte com supermercados, custo elevado, menor capacidade de expansão |
| Empresa do jogador | Pequena, flexível, baixo volume, pouca reputação, pouco capital — no início |

O jogador não precisa ser o mais barato: pode competir sendo mais rápido, mais confiável, mais premium, mais flexível, mais especializado, melhor negociador, mais eficiente ou mais próximo de determinados clientes — evitando que o jogo vire uma simples corrida por menor custo.

---

## 16. Oportunidades Comerciais

O mercado também gera oportunidades de negócio concretas. Exemplo:

> O Supermercado Horizonte perdeu seu fornecedor.

Oferta: 25.000 ovos/mês, contrato de 12 meses, pagamento em 30 dias, exigência alta, preço acima do mercado — mas a empresa do jogador produz apenas 18.000 ovos/mês.

- Expandir a produção
- Comprar de outro produtor e revender
- Recusar a oferta
- Negociar um volume menor
- Buscar financiamento
- Terceirizar parte da produção

Essa única oportunidade conecta produção, mercado, contratos, crédito, capital de giro, concorrência e expansão — e o crescimento deve ser consequência de decisões assim, não de um botão desbloqueado. Exemplo: quando a ração passa a representar uma parcela cada vez maior dos custos e um fornecedor aumenta os preços, o jogador começa a considerar comprar ou produzir, depois terceirizar ou internalizar, e mais tarde comprar uma fábrica ou construir uma.

---

## 17. Progressão Tripla: Empresa / Jogador / Relações

| Trilha | Progressão |
|---|---|
| Empresa | Dinheiro → ativos → produção → mercado → verticalização → grupo agroindustrial |
| Jogador | Ignorância → conhecimento → experiência → especialização → estratégia |
| Relacionamentos | Desconhecido → conhecido → confiança → parceria → influência |

Essas três trilhas não precisam avançar juntas: é possível ter uma empresa rica com um jogador inexperiente, uma empresa pequena com um jogador muito experiente, uma empresa pequena com excelente reputação em um nicho, uma empresa grande com relações ruins, ou um jogador experiente administrando uma empresa em crise — o que multiplica as situações interessantes que o jogo pode gerar.

---

## 18. Memória, Histórico e Legado da Empresa

Uma seção permanente de História da Empresa registra os eventos importantes de cada período, transformando o crescimento em narrativa.

| Período | Marcos registrados |
|---|---|
| Ano 1 | Propriedade herdada, primeiro lote, primeiro contrato, primeira crise, primeiro lucro |
| Ano 2 | Segundo galpão, primeiro financiamento, novo cliente |
| Ano 3 | Primeiro grande concorrente, expansão regional |

A origem familiar continua influenciando o jogo sem controlar a campanha: fornecedores que conheciam a família, clientes antigos, funcionários leais ao antigo proprietário, contratos herdados, equipamentos antigos, reputação inicial e decisões do passado que o jogador precisa corrigir. O jogador pode eventualmente superar a sombra do antigo proprietário:

> A propriedade era do seu avô. → A empresa é sua. → Agora existe um legado que você construiu.

O foco continua sendo gestão — os personagens têm personalidade e memória, mas o jogo não vira um simulador social. As relações aparecem quando têm impacto sobre produtividade, confiança, negociação, retenção, conhecimento, risco ou decisões.

---

## 19. Eventos

Eventos impedem que o jogador encontre uma estratégia ótima única e simplesmente acelere o tempo indefinidamente. A probabilidade de eventos é sempre condicionada ao estado da empresa — nunca puramente aleatória.

```
Temperatura elevada + densidade elevada + ambiência ruim + sanidade deficiente
        → maior risco de evento sanitário

Boa reputação + pagamentos em dia + caixa saudável
        → maior chance de fornecedor oferecer prazo melhor
```

A camada narrativa acrescenta eventos comerciais e sociais: rupturas ou renovações de contrato movidas por confiança acumulada, mudanças de comportamento de mentores, e chegada de novos concorrentes ao mercado regional. A aleatoriedade deve gerar incerteza, nunca injustiça.

---

## 20. Objetivos Progressivos

O jogo não começa com o objetivo abstrato de "ficar rico". Uma progressão concreta de objetivos mantém a campanha orientada mesmo sem um fim fixo:

1. Sobreviva ao primeiro ciclo
2. Torne a operação lucrativa
3. Conquiste seu primeiro grande cliente
4. Expanda a produção
5. Construa sua reputação regional
6. Enfrente concorrentes maiores
7. Verticalize a operação
8. Construa seu grupo agroindustrial

---

## 21. Direção Visual, UI/UX e Interface

Estética limpa, moderna, minimalista — inspirada em apps financeiros e de gestão modernos, não em ERPs tradicionais. O jogador recebe a informação necessária para a próxima decisão, não todos os dados disponíveis.

### 21.1 Interface principal

A tela inicial mostra somente informações relevantes: identidade e caixa da empresa, nível e dia atual, visão geral (receita, custos, lucro), os negócios ativos e as próximas atividades pendentes.

```
┌─────────────────────────────┐
│ AgroVale          R$ 512.430│
│ Nível 7             Dia 48  │
├─────────────────────────────┤
│ VISÃO GERAL                 │
│ Receita   Custos   Lucro    │
├─────────────────────────────┤
│ NEGÓCIOS                    │
│ Matriz     Poedeira         │
├─────────────────────────────┤
│ PRÓXIMAS ATIVIDADES         │
│ ⚠ Ração atrasada            │
│ 💰 Pagamento amanhã         │
│ 🚚 Entrega às 08:00         │
├─────────────────────────────┤
│ 🏠   🏢   💰   📊   ☰       │
└─────────────────────────────┘
```

### 21.2 Navegação

Menu inferior fixo: Início · Negócios · Finanças · Relatórios · Mais. A complexidade aparece dentro de cada contexto, nunca todas de uma vez na tela inicial.

### 21.3 Dashboard

O dashboard deve responder rapidamente a quatro perguntas: Como estou? (caixa, receita, custos, lucro, margem) · O que está acontecendo? (eventos, pendências, produção, estoque) · O que preciso fazer? (pagar, comprar, negociar, vender, resolver eventos) · O que posso fazer depois? (expandir, investir, contratar, financiar).

### 21.4 Relatórios

Relatórios servem para decisões, não para preencher telas: DRE, fluxo de caixa, rentabilidade por negócio, desempenho por lote, custo por unidade, estoque, contratos, endividamento e produtividade. Evitar relatórios que existam apenas porque "um ERP possui".

### 21.5 Progressive disclosure

Caixa/produção/estoque/compras/vendas primeiro; contratos/crédito/DRE/logística depois; mentores/clientes/relacionamentos ao longo do prólogo; mercado competitivo, concorrentes e verticalização por último.

---

## 22. Realismo e Prioridades de Escopo

> Realismo de decisão, não realismo burocrático.

O objetivo não é reproduzir cada campo de um ERP, e sim relações, incentivos, riscos, consequências, restrições e trade-offs. Uma simplificação é boa quando mantém a essência da decisão.

### O que NÃO é prioridade

Não são prioridades iniciais: gráficos 3D complexos, controle manual de máquinas, animação individual de animais, mapas enormes, multiplayer, realidade virtual, reprodução integral de um ERP real, ou dezenas de verticais simultâneas.

> O foco inicial é: motor de decisão + simulação + progressão.

---

## 23. Domain Bible e Princípios de Modelagem

Documento complementar ao GDD onde cada conceito de negócio é registrado com definição real, funcionamento prático, fonte, representação no jogo, simplificação aplicada e impacto no gameplay.

> Regra: não abstrair antes de entender a regra de negócio real.

### Princípios de modelagem

- O domínio não deve depender da interface.
- O motor de simulação não deve depender de React.
- Regras de negócio devem ser testáveis isoladamente.
- Verticais devem reutilizar módulos corporativos.
- Diferenças entre verticais devem ser parametrizadas quando fizer sentido.
- A camada de mundo econômico e relações é transversal a todas as verticais.

---

## 24. Arquitetura Conceitual

A arquitetura já pensada para reutilização entre verticais é preservada. Adiciona-se uma camada transversal de mundo econômico, relações e narrativa emergente:

```
MUNDO ECONÔMICO          RELAÇÕES                 EMPRESA
├── Mercado               ├── Reputação             ├── Produção · Financeiro
├── Clientes               ├── Relacionamento        ├── Compras · Vendas
├── Fornecedores          ├── Confiança              ├── Contratos · Pessoas
├── Concorrentes          └── Poder de negociação    ├── Estoque · Ativos
├── Bancos                                           └── Logística
└── Transportadoras

JOGADOR                              NARRATIVA EMERGENTE
├── Conhecimento                       ├── Herança · Eventos
├── Experiência                        ├── Conquistas · Crises
├── Histórico de decisões               ├── Relacionamentos
└── Codex / Lições                      └── Legado
```

---

## 25. Roadmap de Desenvolvimento e Prioridades

A recomendação é não aumentar imediatamente a quantidade de verticais produtivas — primeiro, aprofundar o mundo econômico e humano em torno da vertical de lançamento.

| Sistema | Prioridade | Função |
|---|---|---|
| Herança / Origem | Alta | Dar contexto e motivação |
| Mentores / NPCs | Alta | Ensinar organicamente |
| Clientes persistentes | Alta | Criar relações |
| Mercado competitivo | Alta | Dar vida ao mundo |
| Concorrentes estratégicos | Média/Alta | Criar competição real |
| Histórico / Legado | Média | Transformar progresso em narrativa |
| Novas verticais | Depois | Expandir o mundo já consolidado |

| Fase | Entrega |
|---|---|
| 0 — Fundação | Empresa, dinheiro, tempo, ativos, financeiro básico, motor de simulação, eventos básicos, dashboard |
| 1 — Vertical slice narrativo | Herança, prólogo, funcionário veterano, Matriz + Poedeira, do capital inicial ao fechamento do ciclo |
| 2 — Empresa e mundo econômico | Mentores completos, clientes persistentes, relacionamentos, crédito, contratos complexos, reputação, IA concorrente |
| 3 — Frango de Corte | MotorCorte reaproveitando financeiro, ativos, estoque, contratos, mercado e logística já existentes |
| 4 — Integração vertical | Incubatório, fábrica de ração, logística própria; "comprar ou produzir", "terceirizar ou internalizar" |
| 5+ — Diversificação e legado | Grãos, suinocultura, piscicultura, bovinocultura; histórico consolidado e legado de longo prazo |

---

## 26. Impacto no MVP

Para não inflar o escopo inicial, a primeira campanha jogável (MVP) contém:

- Propriedade herdada, com um funcionário veterano e um contador/mentor financeiro
- Uma unidade produtiva, poucos fornecedores e 2–4 clientes
- 1–2 concorrentes simples e contratos básicos
- Reputação e relacionamento individual com clientes
- Caixa, produção, estoque, primeiro ciclo produtivo completo
- Eventos e fechamento financeiro

O mercado competitivo mais sofisticado (múltiplos agentes, concorrentes complexos, oportunidades comerciais elaboradas) entra em fases posteriores, sobre essa base já jogável. A primeira experiência jogável deve ser pequena, aproximadamente uma campanha de 120 dias.

---

## 27. Arquitetura Técnica (Resumo)

- **Frontend:** React + Next.js + TypeScript, PWA, UI mobile-first.
- **Backend:** Node.js + TypeScript + NestJS.
- **Banco de dados:** PostgreSQL + Prisma.
- **Processamento:** direto no backend inicialmente; Redis/BullMQ e workers de simulação quando necessário.
- **Comunicação:** tRPC preferencialmente; REST quando exigido por compatibilidade.

Princípios de modelagem: o domínio não depende da interface; o motor de simulação não depende de React; regras de negócio são testáveis isoladamente; verticais reutilizam módulos corporativos; a camada de mundo econômico e relações é transversal a todas as verticais; nunca abstrair antes de entender a regra de negócio.

---

## 28. Exemplo de Progressão Empresarial e Visão de Longo Prazo

| Período | Marco |
|---|---|
| Ano 1 | Pequena operação de postura, herdada e recém-assumida |
| Ano 2 | Mais galpões |
| Ano 3 | Primeiro grande contrato |
| Ano 4 | Financiamento para expansão |
| Ano 5 | Incubatório próprio |
| Ano 6 | Fábrica de ração |
| Ano 7 | Logística própria |
| Ano 8+ | Grupo agroindustrial |

A linha do tempo real depende inteiramente das decisões do jogador — a tabela acima é uma referência, não um roteiro fixo.

### Visão de longo prazo

O objetivo final do AgroGestão é um simulador de gestão agroindustrial em que o jogador possa herdar uma pequena operação e, através de decisões de produção, finanças, compras, contratos, logística, mercado e relacionamentos, construir um grupo agroindustrial completo.

> Comecei com uma pequena granja herdada. → Muitas horas depois: agora eu tenho minhas próprias matrizes, incubatório, fábrica de ração, granjas de corte, transportadora e distribuição — e uma reputação que construí sozinho.

---

## 29. Critérios de Sucesso e Identidade do Projeto

O projeto será considerado bem-sucedido quando:

- O jogador pode começar pequeno (herdando, não fundando) e operar uma unidade produtiva completa.
- Ele precisa tomar decisões constantemente — a operação nunca "roda sozinha" por muito tempo.
- O tempo acelerado gera situações inesperadas, e as decisões geram consequências rastreáveis.
- Clientes, mentores e concorrentes têm memória: duas empresas podem chegar ao mesmo tamanho por caminhos completamente diferentes.
- Novos negócios se incorporam sem quebrar a coerência das regras.
- O jogo continua interessante mesmo depois que o jogador domina a primeira vertical, porque o mundo em torno dele segue reagindo.

### Identidade do projeto

O AgroGestão não é um Farming Simulator, um ERP tradicional, um jogo de clicar em animais, um tycoon genérico nem uma planilha gamificada. Ele é um simulador de decisões empresariais aplicado ao agronegócio.

> A herança cria o ponto de partida. Os mentores ensinam. Os clientes criam relações. Os fornecedores criam dependências. Os funcionários criam confiança e risco. Os concorrentes criam pressão. O mercado cria oportunidades. As decisões criam consequências. E o histórico transforma tudo isso em uma história única.

---

## 30. Próxima Etapa Recomendada

O próximo passo não é implementar todas as funcionalidades descritas neste documento. A prioridade recomendada é transformar o GDD em um MVP extremamente concreto:

1. **Domain Bible — Avicultura de Postura:** estudar e documentar as regras reais.
2. **Game Economy v0.1:** definir capital inicial, custos, receitas, preços, crédito, prazos e fórmulas.
3. **Simulation Design:** definir exatamente o que acontece em cada tick diário/semanal.
4. **First Vertical Slice:** herança → prólogo → operação → produção → venda → recebimento → fechamento.
5. **UI/UX:** transformar o fluxo em uma interface mobile limpa.

> Se esse pequeno ciclo for divertido, o restante do jogo terá uma fundação muito mais segura.
